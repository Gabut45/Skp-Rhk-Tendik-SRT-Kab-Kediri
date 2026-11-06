import { z } from 'zod';
import {
  zite,
  setDeletedAll,
  addDeletedIds,
  addDeletedRange,
  addDeletedRiwayatKey,
} from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

function buildUrl(baseUrl: string, action: string, queryParams?: Record<string, string>): string {
  const clean = baseUrl.trim();
  const sep = clean.includes('?') ? '&' : '?';
  let url = `${clean}${sep}action=${action}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams).toString();
    if (params) url += `&${params}`;
  }
  return url;
}

export default createEndpoint({
  inputSchema: z.object({
    id: z.string().optional(),
    ids: z.array(z.string()).optional(),
    tanggal: z.string().optional(),
    tanggalMulai: z.string().optional(),
    tanggalSelesai: z.string().optional(),
    namaPelapor: z.string().optional(),
    rhkNomor: z.string().optional(),
    deleteAll: z.boolean().optional(),
    cpanelUrl: z.string().optional(),
    cpanelKey: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    cpanelDeleted: z.boolean().optional(),
    deletedActivitiesCount: z.number().optional(),
  }),
  async execute({ input }) {
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    // 1. Jika pengguna meminta Hapus Semua Data secara total
    if (input.deleteAll) {
      setDeletedAll(true);

      // A. Bersihkan lokal
      try {
        const { records: allRiw } = await zite.riwayatFile.findAll({ limit: 1000 });
        for (const r of allRiw) await zite.riwayatFile.delete({ id: r.id });

        const { records: allKeg } = await zite.kegiatanHarian.findAll({ limit: 1000 });
        for (const k of allKeg) await zite.kegiatanHarian.delete({ id: k.id });

        const { records: allLaporan } = await zite.laporanRhk.findAll({ limit: 1000 });
        for (const l of allLaporan) await zite.laporanRhk.delete({ id: l.id });
      } catch (e) {
        console.warn('[deleteRiwayat deleteAll] Local clean warning:', e);
      }

      // B. Hapus massal di cPanel MySQL untuk kegiatan dan riwayat file
      try {
        // Hapus riwayat file di cPanel
        const delRiwUrl = buildUrl(cpanelUrl, 'delete_riwayat');
        await fetch(delRiwUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ delete_all: true }),
        }).catch(() => {});

        // Ambil semua ID kegiatan non-preset di cPanel dan hapus per chunk
        const fetchUrl = buildUrl(cpanelUrl, 'get_kegiatan');
        const res = await fetch(fetchUrl, { headers: input.cpanelKey ? { 'X-API-KEY': input.cpanelKey } : {} });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.records)) {
            const targetIds = json.records
              .filter((r: any) => r.kata_kunci_kegiatan !== '__PRESET_TTD__' && r.rhk_kategori !== '__SYSTEM_CONFIG__')
              .map((r: any) => String(r.id || `keg_${r.id_kegiatan}`))
              .filter(Boolean);

            const delKegUrl = buildUrl(cpanelUrl, 'delete_kegiatan');
            for (let i = 0; i < targetIds.length; i += 50) {
              const chunk = targetIds.slice(i, i + 50);
              await fetch(delKegUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ ids: chunk }),
              }).catch(() => {});
            }
          }
        }

        const delKegAllUrl = buildUrl(cpanelUrl, 'delete_kegiatan');
        await fetch(delKegAllUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ delete_all: true }),
        }).catch(() => {});
      } catch (err) {
        console.warn('[deleteRiwayat deleteAll] cPanel bulk clean warning:', err);
      }

      return { success: true, cpanelDeleted: true, deletedActivitiesCount: 999 };
    }

    const tglStart = input.tanggalMulai || input.tanggal;
    const tglEnd = input.tanggalSelesai || input.tanggalMulai || input.tanggal;

    // Catat ke server deleted store
    if (input.id) addDeletedIds([input.id]);
    if (input.ids && input.ids.length > 0) addDeletedIds(input.ids);
    if (tglStart) {
      addDeletedRange({
        tanggalMulai: tglStart,
        tanggalSelesai: tglEnd,
        namaPelapor: input.namaPelapor,
        rhkKategori: input.rhkNomor,
      });
      if (input.namaPelapor) {
        addDeletedRiwayatKey(`${tglStart}___${input.namaPelapor}`);
      }
    }

    // 2. Hapus dari riwayatFile di zite
    try {
      if (input.id && !input.id.startsWith('cpanel_')) {
        await zite.riwayatFile.delete({ id: input.id });
      }

      if (input.ids && input.ids.length > 0) {
        for (const id of input.ids) {
          if (!id.startsWith('cpanel_')) {
            await zite.riwayatFile.delete({ id });
          }
        }
      }

      if (tglStart && input.namaPelapor) {
        const { records: recs } = await zite.riwayatFile.findAll({
          filters: { namaPelapor: input.namaPelapor },
          limit: 200,
        });
        for (const r of recs) {
          const rDate = r.tanggalMulai || r.tanggalSelesai;
          if (rDate && rDate >= tglStart && (!tglEnd || rDate <= tglEnd)) {
            await zite.riwayatFile.delete({ id: r.id });
          }
        }
      }
    } catch (e) {
      console.warn('[deleteRiwayat] Hapus riwayatFile:', e);
    }

    // 3. Hapus seluruh kegiatan yang berelasi di rentang tanggal/pelapor/RHK tersebut
    let deletedKegCount = 0;
    const collectedKegIds = new Set<string>();
    if (input.ids && input.ids.length > 0) {
      input.ids.forEach(id => collectedKegIds.add(id));
    }

    try {
      if (tglStart) {
        const filterKeg: any = { tanggal: { gte: tglStart } };
        if (tglEnd) filterKeg.tanggal.lte = tglEnd;
        if (input.namaPelapor && input.namaPelapor !== 'Semua Pelapor') {
          filterKeg.namaPelapor = input.namaPelapor;
        }
        if (input.rhkNomor) {
          filterKeg.rhkKategori = { contains: input.rhkNomor };
        }

        const { records: kegsToDelete } = await zite.kegiatanHarian.findAll({
          filters: filterKeg,
          limit: 500,
        });

        for (const k of kegsToDelete) {
          collectedKegIds.add(k.id);
          await zite.kegiatanHarian.delete({ id: k.id });
          deletedKegCount++;
        }
      }
    } catch (e) {
      console.warn('[deleteRiwayat] Hapus kegiatan terkait:', e);
    }

    // 4. Cari juga ID kegiatan yang ada di cPanel MySQL pada rentang tersebut
    if (tglStart && input.namaPelapor) {
      try {
        const checkUrl = buildUrl(cpanelUrl, 'get_kegiatan', {
          tanggalMulai: tglStart,
          tanggalSelesai: tglEnd || tglStart,
          namaPelapor: input.namaPelapor !== 'Semua Pelapor' ? input.namaPelapor : '',
        });
        const res = await fetch(checkUrl, { headers: input.cpanelKey ? { 'X-API-KEY': input.cpanelKey } : {} });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.records)) {
            json.records
              .filter((r: any) => r.kata_kunci_kegiatan !== '__PRESET_TTD__')
              .forEach((r: any) => {
                const kid = String(r.id || `keg_${r.id_kegiatan}`);
                if (kid) collectedKegIds.add(kid);
              });
          }
        }
      } catch (e) {
        console.warn('[deleteRiwayat] Fetch cPanel related kegiatan warning:', e);
      }
    }

    const allKegIdsArray = Array.from(collectedKegIds);
    if (allKegIdsArray.length > 0) {
      addDeletedIds(allKegIdsArray);
    }

    // 5. Kirim sinyal hapus ke server MySQL cPanel
    let cpanelDeleted = false;
    try {
      // A. Hapus riwayat file di cPanel
      const targetUrlRiw = buildUrl(cpanelUrl, 'delete_riwayat');
      await fetch(targetUrlRiw, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: input.id,
          ids: input.ids,
          tanggal: tglStart,
          tanggalMulai: tglStart,
          tanggalSelesai: tglEnd,
          namaPelapor: input.namaPelapor,
        }),
      }).catch(() => {});

      // B. Hapus kegiatan harian terkait di cPanel via array IDs dan tanggal/pelapor
      const targetUrlKeg = buildUrl(cpanelUrl, 'delete_kegiatan');
      if (allKegIdsArray.length > 0) {
        for (let i = 0; i < allKegIdsArray.length; i += 50) {
          const chunk = allKegIdsArray.slice(i, i + 50);
          await fetch(targetUrlKeg, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: chunk }),
          }).catch(() => {});
        }
      }

      if (tglStart && input.namaPelapor) {
        await fetch(targetUrlKeg, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tanggal: tglStart,
            tanggalMulai: tglStart,
            tanggalSelesai: tglEnd,
            namaPelapor: input.namaPelapor,
            rhkKategori: input.rhkNomor,
          }),
        }).catch(() => {});
      }

      cpanelDeleted = true;
    } catch (err) {
      console.warn('[deleteRiwayat] Gagal sync cPanel MySQL:', err);
    }

    return { success: true, cpanelDeleted, deletedActivitiesCount: deletedKegCount };
  },
});
