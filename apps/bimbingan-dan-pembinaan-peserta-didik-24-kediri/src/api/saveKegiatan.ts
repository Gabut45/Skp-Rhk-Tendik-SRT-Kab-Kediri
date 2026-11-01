import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

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
    return { success: true, id: record.id };
  },
});
