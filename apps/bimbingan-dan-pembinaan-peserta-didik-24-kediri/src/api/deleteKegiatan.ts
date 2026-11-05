import { z } from 'zod';
import {
  zite,
  setDeletedAll,
  addDeletedIds,
  addDeletedRange,
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
  outputSchema: z.object({ success: z.boolean(), cpanelDeleted: z.boolean().optional() }),
  async execute({ input }) {
    // 1. Jika deleteAll
    if (input.deleteAll) {
      setDeletedAll(true);
      try {
        const { records: allKeg } = await zite.kegiatanHarian.findAll({ limit: 1000 });
        for (const k of allKeg) await zite.kegiatanHarian.delete({ id: k.id });
      } catch (e) {
        console.warn('[deleteKegiatan deleteAll] Warning:', e);
      }
      return { success: true, cpanelDeleted: true };
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
    }

    // 2. Hapus dari database lokal zite
    try {
      if (input.id) {
        await zite.kegiatanHarian.delete({ id: input.id });
      }
      if (input.ids && input.ids.length > 0) {
        for (const id of input.ids) {
          await zite.kegiatanHarian.delete({ id });
        }
      }
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

        const { records } = await zite.kegiatanHarian.findAll({
          filters: filterKeg,
          limit: 500,
        });
        for (const r of records) {
          await zite.kegiatanHarian.delete({ id: r.id });
        }
      }
    } catch (e) {
      console.warn('[deleteKegiatan] Catatan lokal tidak ditemukan atau gagal dihapus:', e);
    }

    // 3. Hapus secara permanen dari server MySQL cPanel
    let cpanelDeleted = false;
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}&action=delete_kegiatan`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    try {
      let numericId: string | null = null;
      if (input.id) {
        if (/^\d+$/.test(input.id)) numericId = input.id;
        else if (input.id.startsWith('keg_')) {
          const num = input.id.replace('keg_', '');
          if (/^\d+$/.test(num)) numericId = num;
        }
      }

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: input.id,
          ids: input.ids,
          id_numeric: numericId,
          tanggal: tglStart,
          tanggalMulai: tglStart,
          tanggalSelesai: tglEnd,
          namaPelapor: input.namaPelapor,
          rhkKategori: input.rhkNomor,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        cpanelDeleted = Boolean(json.success);
      }
    } catch (err) {
      console.warn('[deleteKegiatan] Gagal hapus di cPanel MySQL:', err);
    }

    return { success: true, cpanelDeleted };
  },
});
