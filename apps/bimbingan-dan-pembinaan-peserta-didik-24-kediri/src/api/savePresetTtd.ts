import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({
    namaPelapor: z.string(),
    nip: z.string().optional(),
    url: z.string(), // string base64 / url gambar atau kosong untuk menghapus
    cpanelUrl: z.string().optional(),
    cpanelKey: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    cpanelSynced: z.boolean().optional(),
  }),
  async execute({ input }) {
    const rawName = input.namaPelapor.trim();
    if (!rawName) {
      return { success: false, message: 'Nama pelapor wajib diisi' };
    }

    // Generate safe unique deterministic ID for this pelapor preset
    const cleanId = `preset_ttd_${rawName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}`;

    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=save_bulk`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    const payload = {
      namaPelapor: rawName,
      nip: input.nip || '',
      tanggal: '1970-01-01',
      tandaTangan: input.url || undefined,
      unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
      kegiatan: [
        {
          id: cleanId,
          waktuMulai: '00:00',
          waktuSelesai: '00:00',
          kataKunciKegiatan: '__PRESET_TTD__',
          deskripsiKegiatan: input.url ? 'PRESET_SIGNATURE' : 'EMPTY_PRESET',
          rhkKategori: '__SYSTEM_CONFIG__',
          fotoKegiatan: input.url ? [input.url] : [],
        },
      ],
    };

    // 1. Simpan ke database lokal
    try {
      await zite.kegiatanHarian.bulkCreate({
        records: [
          {
            id: cleanId,
            namaPelapor: rawName,
            nip: input.nip || '',
            tanggal: '1970-01-01',
            waktuMulai: '00:00',
            waktuSelesai: '00:00',
            kataKunciKegiatan: '__PRESET_TTD__',
            deskripsiKegiatan: input.url ? 'PRESET_SIGNATURE' : 'EMPTY_PRESET',
            rhkKategori: '__SYSTEM_CONFIG__',
            fotoKegiatan: input.url ? [{ url: input.url }] : [],
            tandaTangan: input.url ? [{ url: input.url }] : undefined,
            unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
          },
        ],
      });
    } catch (err) {
      console.warn('[savePresetTtd] Local db warning:', err);
    }

    // 2. Simpan ke MySQL Server cPanel dengan auto-retry
    let cpanelSynced = false;
    let errorMsg = '';

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            cpanelSynced = true;
            break;
          } else {
            errorMsg = json.message || 'Server menolak penyimpanan';
          }
        } else {
          errorMsg = `HTTP ${res.status}: ${res.statusText}`;
        }
      } catch (e: any) {
        errorMsg = e.message || 'Koneksi ke server gagal';
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    return {
      success: true,
      cpanelSynced,
      message: cpanelSynced
        ? `Preset tanda tangan untuk ${rawName} berhasil disimpan permanen di database server!`
        : `Tersimpan di perangkat lokal, namun server: ${errorMsg}`,
    };
  },
});
