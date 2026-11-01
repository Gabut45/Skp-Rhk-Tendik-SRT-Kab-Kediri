import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

export default createEndpoint({
  inputSchema: z.object({
    tanggalMulai: z.string().optional(),
    tanggalSelesai: z.string().optional(),
    rhkKategori: z.string().optional(),
    namaPelapor: z.string().optional(),
  }),
  outputSchema: z.object({
    records: z.array(z.object({
      id: z.string(),
      namaPelapor: z.string().optional(),
      nip: z.string().optional(),
      tanggal: z.string().optional(),
      waktuMulai: z.string().optional(),
      waktuSelesai: z.string().optional(),
      kataKunciKegiatan: z.string().optional(),
      deskripsiKegiatan: z.string().optional(),
      rhkKategori: z.string().optional(),
      fotoKegiatan: z.array(z.object({ url: z.string() })).optional(),
      tandaTangan: z.array(z.object({ url: z.string() })).optional(),
      unitKerja: z.string().optional(),
    })),
  }),
  async execute({ input }) {
    const filters: any = {};
    if (input.tanggalMulai) filters.tanggal = { gte: input.tanggalMulai };
    if (input.tanggalSelesai) {
      filters.tanggal = { ...filters.tanggal, lte: input.tanggalSelesai };
    }
    if (input.rhkKategori) filters.rhkKategori = { contains: input.rhkKategori };
    if (input.namaPelapor) filters.namaPelapor = input.namaPelapor;

    const { records } = await zite.kegiatanHarian.findAll({ filters, limit: 500 });

    // Sort by tanggal ASC then waktuMulai ASC
    const sorted = records.sort((a, b) => {
      const dateA = a.tanggal || '';
      const dateB = b.tanggal || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const timeA = a.waktuMulai || '99:99';
      const timeB = b.waktuMulai || '99:99';
      return timeA.localeCompare(timeB);
    });

    return {
      records: sorted.map(r => ({
        id: r.id,
        namaPelapor: r.namaPelapor,
        nip: r.nip,
        tanggal: r.tanggal,
        waktuMulai: r.waktuMulai,
        waktuSelesai: r.waktuSelesai,
        kataKunciKegiatan: r.kataKunciKegiatan,
        deskripsiKegiatan: r.deskripsiKegiatan,
        rhkKategori: r.rhkKategori,
        fotoKegiatan: r.fotoKegiatan,
        tandaTangan: r.tandaTangan,
        unitKerja: r.unitKerja,
      })),
    };
  },
});
