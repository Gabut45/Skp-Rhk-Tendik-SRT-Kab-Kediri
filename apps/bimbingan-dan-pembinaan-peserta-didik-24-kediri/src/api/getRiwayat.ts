import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

export default createEndpoint({
  inputSchema: z.object({
    namaPelapor: z.string().optional(),
    tanggalMulai: z.string().optional(),
    tanggalSelesai: z.string().optional(),
  }),
  outputSchema: z.object({
    records: z.array(z.object({
      id: z.string(),
      namaFile: z.string().optional(),
      jenisLaporan: z.string().optional(),
      namaPelapor: z.string().optional(),
      pdfUrl: z.string().optional(),
      dibuatPada: z.string().optional(),
      tanggalMulai: z.string().optional(),
      tanggalSelesai: z.string().optional(),
      rhkNomor: z.string().optional(),
    })),
  }),
  async execute({ input }) {
    const filters: any = {};
    if (input.namaPelapor) filters.namaPelapor = input.namaPelapor;
    if (input.tanggalMulai || input.tanggalSelesai) {
      filters.tanggalMulai = {};
      if (input.tanggalMulai) filters.tanggalMulai.gte = input.tanggalMulai;
      if (input.tanggalSelesai) filters.tanggalMulai.lte = input.tanggalSelesai;
    }

    const { records } = await zite.riwayatFile.findAll({ filters, limit: 500 });
    return {
      records: records.map(r => ({
        id: r.id,
        namaFile: r.namaFile,
        jenisLaporan: r.jenisLaporan,
        namaPelapor: r.namaPelapor,
        pdfUrl: r.pdfUrl,
        dibuatPada: r.dibuatPada,
        tanggalMulai: r.tanggalMulai,
        tanggalSelesai: r.tanggalSelesai,
        rhkNomor: r.rhkNomor,
      })),
    };
  },
});
