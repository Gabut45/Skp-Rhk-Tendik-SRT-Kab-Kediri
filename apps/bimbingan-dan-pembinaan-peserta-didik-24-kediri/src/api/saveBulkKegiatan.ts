import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({
    namaPelapor: z.string(),
    nip: z.string(),
    tanggal: z.string(),
    tandaTangan: z.string().optional(),
    kegiatan: z.array(z.object({
      waktuMulai: z.string(),
      waktuSelesai: z.string(),
      kataKunciKegiatan: z.string(),
      deskripsiKegiatan: z.string(),
      rhkKategori: z.string(),
      fotoKegiatan: z.array(z.string()).optional(),
    })),
  }),
  outputSchema: z.object({ success: z.boolean(), count: z.number(), cpanelSynced: z.boolean().optional() }),
  async execute({ input }) {
    // 1. Simpan ke database lokal
    await zite.kegiatanHarian.bulkCreate({
      records: input.kegiatan.map(k => ({
        namaPelapor: input.namaPelapor,
        nip: input.nip,
        tanggal: input.tanggal,
        waktuMulai: k.waktuMulai,
        waktuSelesai: k.waktuSelesai,
        kataKunciKegiatan: k.kataKunciKegiatan,
        deskripsiKegiatan: k.deskripsiKegiatan,
        rhkKategori: k.rhkKategori,
        fotoKegiatan: k.fotoKegiatan?.map(url => ({ url })),
        tandaTangan: input.tandaTangan ? [{ url: input.tandaTangan }] : undefined,
        unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
      })),
    });

    // 2. Simpan langsung ke server cPanel MySQL
    let cpanelSynced = false;
    try {
      const res = await fetch(`${DEFAULT_CPANEL_URL}?action=save_bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaPelapor: input.namaPelapor,
          nip: input.nip,
          tanggal: input.tanggal,
          tandaTangan: input.tandaTangan,
          kegiatan: input.kegiatan,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        cpanelSynced = Boolean(json.success);
      }
    } catch (err) {
      console.warn('[saveBulkKegiatan] cPanel sync warning:', err);
    }

    return { success: true, count: input.kegiatan.length, cpanelSynced };
  },
});
