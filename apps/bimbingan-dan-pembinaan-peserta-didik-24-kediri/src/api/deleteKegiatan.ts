import { z } from 'zod';
import {
  zite,
  setDeletedAll,
  addDeletedIds,
  addDeletedRange,
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
    waktuMulai: z.string().optional(),
    tanggal: z.string().optional(),
    tanggalMulai: z.string().optional(),
    tanggalSelesai: z.string().optional(),
    namaPelapor: z.string().optional(),
    rhkNomor: z.string().optional(),
    deleteAll: z.boolean().optional(),
    cpanelUrl: z.string().optional(),
    cpanelKey: z.string().optional(),
  }),
  outputSchema: z.object({ success: z.boolean(), cpanelDeleted: z.boolean().optional() }),
  async execute({ input }) {
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    // 1. Jika Hapus Semua (deleteAll)
    if (input.deleteAll) {
      setDeletedAll(true);

      // A. Bersihkan database lokal zite
      try {
        const { records: allKeg } = await zite.kegiatanHarian.findAll({ limit: 1000 });
        for (const k of allKeg) await zite.kegiatanHarian.delete({ id: k.id });
      } catch (e) {
        console.warn('[deleteKegiatan deleteAll] Local clear warning:', e);
      }

      // B. Ambil semua ID yang ada di server cPanel MySQL dan hapus sampai tuntas
      try {
        const fetchUrl = buildUrl(cpanelUrl, 'get_kegiatan');
        const res = await fetch(fetchUrl, { headers: input.cpanelKey ? { 'X-API-KEY': input.cpanelKey } : {} });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.records)) {
            // Kecualikan preset tanda tangan sistem (__PRESET_TTD__)
            const targetIds = json.records
              .filter((r: any) => r.kata_kunci_kegiatan !== '__PRESET_TTD__' && r.rhk_kategori !== '__SYSTEM_CONFIG__')
              .map((r: any) => String(r.id || `keg_${r.id_kegiatan}`))
              .filter(Boolean);

            const delUrl = buildUrl(cpanelUrl, 'delete_kegiatan');
            for (let i = 0; i < targetIds.length; i += 50) {
              const chunk = targetIds.slice(i, i + 50);
              await fetch(delUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ ids: chunk }),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.warn('[deleteKegiatan deleteAll] Gagal hapus massal cPanel:', err);
      }

      // Kirim juga flag delete_all langsung ke cPanel
      try {
        const delUrl = buildUrl(cpanelUrl, 'delete_kegiatan');
        await fetch(delUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ delete_all: true }),
        }).catch(() => {});
      } catch {}

      return { success: true, cpanelDeleted: true };
    }

    const tglStart = input.tanggalMulai || input.tanggal;
    const tglEnd = input.tanggalSelesai || input.tanggalMulai || input.tanggal;

    // Kumpulkan seluruh ID yang ingin dihapus
    const idsToDeleteSet = new Set<string>();
    if (input.id) idsToDeleteSet.add(input.id);
    if (input.ids && input.ids.length > 0) {
      input.ids.forEach(id => idsToDeleteSet.add(id));
    }

    // 2. Jika penghapusan spesifik berdasarkan ID (bukan range)
    if (input.id) {
      addDeletedIds([input.id]);

      // Cari apakah ada duplikat kegiatan di cPanel atau lokal untuk waktu/tanggal/pelapor yang sama
      if (tglStart && input.namaPelapor) {
        try {
          const checkUrl = buildUrl(cpanelUrl, 'get_kegiatan', {
            tanggalMulai: tglStart,
            tanggalSelesai: tglEnd || tglStart,
            namaPelapor: input.namaPelapor,
          });
          const res = await fetch(checkUrl, { headers: input.cpanelKey ? { 'X-API-KEY': input.cpanelKey } : {} });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.records)) {
              for (const r of data.records) {
                const matchId = String(r.id || `keg_${r.id_kegiatan}`);
                if (r.id === input.id) {
                  idsToDeleteSet.add(matchId);
                  if (r.id_kegiatan) idsToDeleteSet.add(String(r.id_kegiatan));
                } else if (
                  input.waktuMulai &&
                  (r.waktu_mulai === input.waktuMulai || r.waktuMulai === input.waktuMulai)
                ) {
                  idsToDeleteSet.add(matchId);
                  if (r.id_kegiatan) idsToDeleteSet.add(String(r.id_kegiatan));
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // Hapus dari database lokal
      try {
        for (const targetId of idsToDeleteSet) {
          await zite.kegiatanHarian.delete({ id: targetId });
        }
      } catch (e) {
        console.warn('[deleteKegiatan] Hapus lokal gagal:', e);
      }

      // Hapus dari cPanel MySQL
      let cpanelDeleted = false;
      try {
        const delUrl = buildUrl(cpanelUrl, 'delete_kegiatan');
        let numericId: string | null = null;
        if (/^\d+$/.test(input.id)) numericId = input.id;
        else if (input.id.startsWith('keg_')) {
          const num = input.id.replace('keg_', '');
          if (/^\d+$/.test(num)) numericId = num;
        }

        const idsArray = Array.from(idsToDeleteSet);
        const res = await fetch(delUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: input.id,
            ids: idsArray.length > 0 ? idsArray : undefined,
            id_numeric: numericId,
            waktu_mulai: input.waktuMulai,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          cpanelDeleted = Boolean(json.success);
        }
      } catch (err) {
        console.warn('[deleteKegiatan] Hapus cPanel gagal:', err);
      }

      return { success: true, cpanelDeleted };
    }

    // 3. Jika penghapusan bulk IDs
    if (input.ids && input.ids.length > 0) {
      addDeletedIds(input.ids);
      try {
        for (const id of input.ids) {
          await zite.kegiatanHarian.delete({ id });
        }
      } catch {}

      let cpanelDeleted = false;
      try {
        const delUrl = buildUrl(cpanelUrl, 'delete_kegiatan');
        for (let i = 0; i < input.ids.length; i += 50) {
          const chunk = input.ids.slice(i, i + 50);
          const res = await fetch(delUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: chunk }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success) cpanelDeleted = true;
          }
        }
      } catch {}

      return { success: true, cpanelDeleted };
    }

    // 4. Jika penghapusan rentang tanggal / pelapor (tanpa spesifik ID)
    if (tglStart) {
      addDeletedRange({
        tanggalMulai: tglStart,
        tanggalSelesai: tglEnd,
        namaPelapor: input.namaPelapor,
        rhkKategori: input.rhkNomor,
      });

      // Hapus lokal
      try {
        const filterKeg: any = { tanggal: { gte: tglStart } };
        if (tglEnd) filterKeg.tanggal.lte = tglEnd;
        if (input.namaPelapor && input.namaPelapor !== 'Semua Pelapor') {
          filterKeg.namaPelapor = input.namaPelapor;
        }
        if (input.rhkNomor) {
          filterKeg.rhkKategori = { contains: input.rhkNomor };
        }

        const { records } = await zite.kegiatanHarian.findAll({
          filters: filterKeg,
          limit: 500,
        });
        for (const r of records) {
          await zite.kegiatanHarian.delete({ id: r.id });
        }
      } catch (e) {
        console.warn('[deleteKegiatan] Hapus range lokal:', e);
      }

      // Hapus cPanel MySQL
      let cpanelDeleted = false;
      try {
        // Ambil ID kegiatan di cPanel pada rentang tersebut
        const checkUrl = buildUrl(cpanelUrl, 'get_kegiatan', {
          tanggalMulai: tglStart,
          tanggalSelesai: tglEnd || tglStart,
          namaPelapor: input.namaPelapor && input.namaPelapor !== 'Semua Pelapor' ? input.namaPelapor : '',
        });
        const resCheck = await fetch(checkUrl, { headers: input.cpanelKey ? { 'X-API-KEY': input.cpanelKey } : {} });
        let idsFound: string[] = [];
        if (resCheck.ok) {
          const json = await resCheck.json();
          if (json.success && Array.isArray(json.records)) {
            idsFound = json.records
              .filter((r: any) => r.kata_kunci_kegiatan !== '__PRESET_TTD__')
              .map((r: any) => String(r.id || `keg_${r.id_kegiatan}`))
              .filter(Boolean);
          }
        }

        const delUrl = buildUrl(cpanelUrl, 'delete_kegiatan');
        if (idsFound.length > 0) {
          for (let i = 0; i < idsFound.length; i += 50) {
            const chunk = idsFound.slice(i, i + 50);
            await fetch(delUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({ ids: chunk }),
            }).catch(() => {});
          }
        }

        // Kirim juga delete by tanggal & namaPelapor
        const res = await fetch(delUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tanggal: tglStart,
            tanggalMulai: tglStart,
            tanggalSelesai: tglEnd,
            namaPelapor: input.namaPelapor,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          cpanelDeleted = Boolean(json.success);
        }
      } catch (err) {
        console.warn('[deleteKegiatan] Hapus range cPanel:', err);
      }

      return { success: true, cpanelDeleted };
    }

    return { success: true };
  },
});
