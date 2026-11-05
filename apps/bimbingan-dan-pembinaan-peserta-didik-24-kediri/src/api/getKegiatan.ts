import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

function getKegiatanFingerprint(r: any): string {
  const tgl = String(r.tanggal || '').trim();
  const pelapor = String(r.namaPelapor || r.nama_pelapor || '').trim().toLowerCase();
  const mulai = String(r.waktuMulai || r.waktu_mulai || '').trim();
  const selesai = String(r.waktuSelesai || r.waktu_selesai || '').trim();
  const desc = String(r.deskripsiKegiatan || r.deskripsi_kegiatan || r.kataKunciKegiatan || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  return `${tgl}::${pelapor}::${mulai}::${selesai}::${desc}`;
}

async function fetchFromCpanel(input: {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  rhkKategori?: string;
  namaPelapor?: string;
  cpanelUrl?: string;
  cpanelKey?: string;
}) {
  try {
    const baseUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const params = new URLSearchParams({ action: 'get_kegiatan' });
    if (input.tanggalMulai) params.append('tanggalMulai', input.tanggalMulai);
    if (input.tanggalSelesai) params.append('tanggalSelesai', input.tanggalSelesai);
    if (input.namaPelapor && input.namaPelapor !== 'Semua Pelapor') {
      params.append('namaPelapor', input.namaPelapor);
    }
    const targetUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
    const headers: Record<string, string> = {};
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    const res = await fetch(targetUrl, { headers });
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

import { isRecordDeleted, isDeletedAll, addDeletedIds } from 'zitejs/db';

export default createEndpoint({
  inputSchema: z.object({
    tanggalMulai: z.string().optional(),
    tanggalSelesai: z.string().optional(),
    rhkKategori: z.string().optional(),
    namaPelapor: z.string().optional(),
    deletedIds: z.array(z.string()).optional(),
    cpanelUrl: z.string().optional(),
    cpanelKey: z.string().optional(),
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
    if (isDeletedAll()) {
      return { records: [] };
    }

    if (input.deletedIds && input.deletedIds.length > 0) {
      addDeletedIds(input.deletedIds);
    }

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

    // 3. Gabungkan secara deduplikasi ketat berdasarkan ID dan Konten (Fingerprint)
    const byFingerprint = new Map<string, any>();
    const seenIds = new Set<string>();

    // Masukkan cPanel records terlebih dahulu (server authoritative)
    for (const r of cpanelRecords) {
      if (isRecordDeleted(r)) continue;
      if (input.rhkKategori && !r.rhkKategori?.includes(input.rhkKategori)) continue;
      const id = String(r.id || '');
      const fp = getKegiatanFingerprint(r);

      if (id && seenIds.has(id)) continue;

      if (!byFingerprint.has(fp)) {
        if (id) seenIds.add(id);
        byFingerprint.set(fp, r);
      } else {
        // Jika duplikat di cPanel, prioritaskan yang memiliki foto lebih lengkap
        const existing = byFingerprint.get(fp);
        const existingPhotos = existing.fotoKegiatan || [];
        const rPhotos = r.fotoKegiatan || [];
        if (rPhotos.length > existingPhotos.length) {
          byFingerprint.set(fp, r);
        }
      }
    }

    // Masukkan local records, hindari duplikasi jika sudah ada di cPanel dengan fingerprint yang sama
    for (const r of localRecords) {
      if (isRecordDeleted(r)) continue;
      if (input.rhkKategori && !r.rhkKategori?.includes(input.rhkKategori)) continue;
      const id = String(r.id || '');
      const fp = getKegiatanFingerprint(r);

      if (id && seenIds.has(id)) continue;

      if (!byFingerprint.has(fp)) {
        if (id) seenIds.add(id);
        byFingerprint.set(fp, r);
      } else {
        // Perkaya rekaman yang ada jika foto atau ttd di lokal lebih lengkap
        const existing = byFingerprint.get(fp);
        const existingPhotos = existing.fotoKegiatan || [];
        const rPhotos = r.fotoKegiatan || [];
        if (existingPhotos.length === 0 && rPhotos.length > 0) {
          existing.fotoKegiatan = rPhotos;
        }
        if ((!existing.tandaTangan || existing.tandaTangan.length === 0) && r.tandaTangan?.length) {
          existing.tandaTangan = r.tandaTangan;
        }
      }
    }

    const merged = Array.from(byFingerprint.values());

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
