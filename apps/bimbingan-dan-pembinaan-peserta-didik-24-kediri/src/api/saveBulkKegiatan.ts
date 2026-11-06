import { z } from 'zod';
import { zite, setDeletedAll } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({
    namaPelapor: z.string(),
    nip: z.string(),
    tanggal: z.string(),
    tandaTangan: z.string().optional(),
    cpanelUrl: z.string().optional(),
    cpanelKey: z.string().optional(),
    kegiatan: z.array(z.object({
      id: z.string().optional(),
      waktuMulai: z.string(),
      waktuSelesai: z.string(),
      kataKunciKegiatan: z.string().optional(),
      deskripsiKegiatan: z.string(),
      rhkKategori: z.string(),
      fotoKegiatan: z.array(z.string()).optional(),
    })),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    count: z.number(),
    cpanelSynced: z.boolean().optional(),
    message: z.string().optional(),
  }),
  async execute({ input }) {
    setDeletedAll(false);
    // Siapkan list kegiatan dengan ID konsisten
    const preparedKegiatan = input.kegiatan.map((k, idx) => ({
      id: k.id || `keg_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      waktuMulai: k.waktuMulai,
      waktuSelesai: k.waktuSelesai,
      kataKunciKegiatan: k.kataKunciKegiatan || '',
      deskripsiKegiatan: k.deskripsiKegiatan,
      rhkKategori: k.rhkKategori || 'RHK 3',
      fotoKegiatan: k.fotoKegiatan,
    }));

    // 1. Simpan ke database lokal dengan ID konsisten
    await zite.kegiatanHarian.bulkCreate({
      records: preparedKegiatan.map(k => ({
        id: k.id,
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

    // 2. Simpan ke server cPanel MySQL secara aman per item/chunk
    // Mengirim per-kegiatan mencegah error 413 (Request Entity Too Large) dari web server
    let cpanelSynced = false;
    let savedCpanelCount = 0;
    let syncError: string | null = null;
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=save_bulk`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    try {
      for (let i = 0; i < preparedKegiatan.length; i++) {
        const item = preparedKegiatan[i];
        const chunkPayload = {
          namaPelapor: input.namaPelapor,
          nip: input.nip,
          tanggal: input.tanggal,
          tandaTangan: input.tandaTangan,
          unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
          kegiatan: [item],
        };

        let itemSuccess = false;
        let lastErr = '';

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const res = await fetch(targetUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(chunkPayload),
            });

            if (res.ok) {
              const json = await res.json();
              if (json.success) {
                itemSuccess = true;
                break;
              } else {
                lastErr = json.message || 'Server MySQL menolak penyimpanan';
              }
            } else {
              lastErr = `HTTP ${res.status}: ${res.statusText}`;
            }
          } catch (e: any) {
            lastErr = e.message || 'Koneksi ke server terputus';
          }
          await new Promise(r => setTimeout(r, 250));
        }

        if (itemSuccess) {
          savedCpanelCount++;
        } else {
          syncError = `Kegiatan ke-${i + 1} (${item.waktuMulai}): ${lastErr}`;
          break;
        }
      }

      cpanelSynced = (savedCpanelCount === preparedKegiatan.length);
    } catch (err: any) {
      console.warn('[saveBulkKegiatan] cPanel sync warning:', err);
      syncError = err.message || 'Gagal tersambung ke server';
    }

    return {
      success: true,
      count: preparedKegiatan.length,
      cpanelSynced,
      message: cpanelSynced
        ? `${savedCpanelCount} kegiatan berhasil tersimpan permanen di Database Server!`
        : (syncError || 'Tersimpan lokal, sinkronisasi server belum selesai.'),
    };
  },
});
