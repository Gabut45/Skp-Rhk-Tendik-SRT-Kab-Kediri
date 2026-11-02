import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

async function fetchFromCpanel(input: {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  rhkKategori?: string;
  namaPelapor?: string;
}) {
  try {
    const params = new URLSearchParams({ action: 'get_kegiatan' });
    if (input.tanggalMulai) params.append('tanggalMulai', input.tanggalMulai);
    if (input.tanggalSelesai) params.append('tanggalSelesai', input.tanggalSelesai);
    if (input.namaPelapor && input.namaPelapor !== 'Semua Pelapor') {
      params.append('namaPelapor', input.namaPelapor);
    }
    const res = await fetch(`${DEFAULT_CPANEL_URL}?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        return data.records.map((r: any) => ({
          id: String(r.id || `keg_${r.id_kegiatan}`),
          namaPelapor: r.nama_pelapor || r.namaPelapor,
          nip: r.nip,
          tanggal: r.tanggal,
          waktuMulai: r.waktu_mulai || r.waktuMulai,
          waktuSelesai: r.waktu_selesai || r.waktuSelesai,
          kataKunciKegiatan: r.kata_kunci_kegiatan || r.kataKunciKegiatan,
          deskripsiKegiatan: r.deskripsi_kegiatan || r.deskripsiKegiatan,
          rhkKategori: r.rhk_kategori || r.rhkKategori || 'RHK 3',
          fotoKegiatan: Array.isArray(r.foto_kegiatan) ? r.foto_kegiatan : (r.fotoKegiatan || []),
          tandaTangan: Array.isArray(r.tanda_tangan) ? r.tanda_tangan : (r.tandaTangan || []),
          unitKerja: r.unit_kerja || r.unitKerja,
        }));
      }
    }
  } catch (err) {
    console.warn('[getKegiatan] Gagal fetch dari cPanel:', err);
  }
  return [];
}

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
    if (input.namaPelapor && input.namaPelapor !== 'Semua Pelapor') {
      filters.namaPelapor = input.namaPelapor;
    }

    // 1. Ambil dari cPanel MySQL
    const cpanelRecords = await fetchFromCpanel(input);

    // 2. Ambil dari local db
    const { records: localRecords } = await zite.kegiatanHarian.findAll({ filters, limit: 500 });

    // 3. Gabungkan secara deduplikasi berdasarkan ID (cPanel diutamakan)
    const combinedMap = new Map<string, any>();
    for (const r of cpanelRecords) {
      if (input.rhkKategori && !r.rhkKategori?.includes(input.rhkKategori)) continue;
      combinedMap.set(r.id, r);
    }
    for (const r of localRecords) {
      if (!combinedMap.has(r.id)) {
        combinedMap.set(r.id, r);
      }
    }

    const merged = Array.from(combinedMap.values());

    // Sort by tanggal ASC then waktuMulai ASC
    const sorted = merged.sort((a, b) => {
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
