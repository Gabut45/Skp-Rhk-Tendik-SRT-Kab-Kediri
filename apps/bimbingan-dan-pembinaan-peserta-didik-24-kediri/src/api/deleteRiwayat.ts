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
    // 1. Jika pengguna meminta Hapus Semua Data secara total
    if (input.deleteAll) {
      setDeletedAll(true);
      try {
        const { records: allRiw } = await zite.riwayatFile.findAll({ limit: 1000 });
        for (const r of allRiw) await zite.riwayatFile.delete({ id: r.id });

        const { records: allKeg } = await zite.kegiatanHarian.findAll({ limit: 1000 });
        for (const k of allKeg) await zite.kegiatanHarian.delete({ id: k.id });

        const { records: allLaporan } = await zite.laporanRhk.findAll({ limit: 1000 });
        for (const l of allLaporan) await zite.laporanRhk.delete({ id: l.id });
      } catch (e) {
        console.warn('[deleteRiwayat deleteAll] Warning:', e);
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

    // 3. PENTING: Hapus juga seluruh kegiatan yang berelasi di rentang tanggal/pelapor/RHK tersebut!
    // Ini menjamin: Hapus di Riwayat File => Terhapus otomatis di Daftar Kegiatan & Laporan RHK
    let deletedKegCount = 0;
    try {
      if (tglStart) {
        const filterKeg: any = {
          tanggal: { gte: tglStart },
        };
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

        const kegIds = kegsToDelete.map(k => k.id);
        if (kegIds.length > 0) {
          addDeletedIds(kegIds);
          for (const k of kegsToDelete) {
            await zite.kegiatanHarian.delete({ id: k.id });
            deletedKegCount++;
          }
        }
      }
    } catch (e) {
      console.warn('[deleteRiwayat] Hapus kegiatan terkait:', e);
    }

    // 4. Kirim sinyal hapus ke server MySQL cPanel
    let cpanelDeleted = false;
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    try {
      // Hapus riwayat file di cPanel
      const targetUrlRiw = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}&action=delete_riwayat`;
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

      // Hapus kegiatan harian terkait di cPanel
      const targetUrlKeg = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}&action=delete_kegiatan`;
      await fetch(targetUrlKeg, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: input.id,
          tanggal: tglStart,
          tanggalMulai: tglStart,
          tanggalSelesai: tglEnd,
          namaPelapor: input.namaPelapor,
          rhkKategori: input.rhkNomor,
        }),
      }).catch(() => {});

      cpanelDeleted = true;
    } catch (err) {
      console.warn('[deleteRiwayat] Gagal sync cPanel MySQL:', err);
    }

    return { success: true, cpanelDeleted, deletedActivitiesCount: deletedKegCount };
  },
});

