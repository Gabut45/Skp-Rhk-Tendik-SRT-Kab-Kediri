import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({
    namaPelapor: z.string(),
    nip: z.string(),
    tanggal: z.string(),
    waktuMulai: z.string(),
    waktuSelesai: z.string(),
    kataKunciKegiatan: z.string(),
    deskripsiKegiatan: z.string(),
    rhkKategori: z.string(),
    fotoKegiatan: z.array(z.string()).optional(),
    tandaTangan: z.string().optional(),
    unitKerja: z.string().optional(),
  }),
  outputSchema: z.object({ success: z.boolean(), id: z.string() }),
  async execute({ input }) {
    const record = await zite.kegiatanHarian.create({
      record: {
        namaPelapor: input.namaPelapor,
        nip: input.nip,
        tanggal: input.tanggal,
        waktuMulai: input.waktuMulai,
        waktuSelesai: input.waktuSelesai,
        kataKunciKegiatan: input.kataKunciKegiatan,
        deskripsiKegiatan: input.deskripsiKegiatan,
        rhkKategori: input.rhkKategori,
        fotoKegiatan: input.fotoKegiatan?.map(url => ({ url })),
        tandaTangan: input.tandaTangan ? [{ url: input.tandaTangan }] : undefined,
        unitKerja: input.unitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
      },
    });

    // Sync to cPanel
    try {
      await fetch(`${DEFAULT_CPANEL_URL}?action=save_bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaPelapor: input.namaPelapor,
          nip: input.nip,
          tanggal: input.tanggal,
          tandaTangan: input.tandaTangan,
          kegiatan: [{
            id: record.id,
            waktuMulai: input.waktuMulai,
            waktuSelesai: input.waktuSelesai,
            kataKunciKegiatan: input.kataKunciKegiatan,
            deskripsiKegiatan: input.deskripsiKegiatan,
            rhkKategori: input.rhkKategori,
            fotoKegiatan: input.fotoKegiatan,
          }],
        }),
      });
    } catch (err) {
      console.warn('[saveKegiatan] cPanel sync warning:', err);
    }

    return { success: true, id: record.id };
  },
});
