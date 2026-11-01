import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

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
  outputSchema: z.object({ success: z.boolean(), count: z.number() }),
  async execute({ input }) {
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
    return { success: true, count: input.kegiatan.length };
  },
});
