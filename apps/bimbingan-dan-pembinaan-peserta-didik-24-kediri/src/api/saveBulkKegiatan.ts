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
      urutan: z.number().optional(),
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
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=save_bulk`;
    const uploadPhotoUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=upload_foto`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    // Helper: pastikan foto base64 diupload ke File Manager cPanel sehingga database hanya menyimpan URL singkat
    const ensureUploadedPhoto = async (photoStr: string, fallbackName: string): Promise<string> => {
      if (!photoStr || typeof photoStr !== 'string') return '';
      if (photoStr.startsWith('http://') || photoStr.startsWith('https://')) return photoStr;
      if (photoStr.startsWith('data:image/')) {
        try {
          const res = await fetch(uploadPhotoUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ foto: photoStr, subfolder: 'uploads' }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.url) {
              return json.url;
            }
          }
        } catch (e) {
          console.warn('[saveBulkKegiatan] Upload base64 foto warning:', e);
        }
      }
      return photoStr;
    };

    // 1. Pastikan tanda tangan jika berupa base64 tersimpan di File Manager
    let finalTtd = input.tandaTangan;
    if (finalTtd && finalTtd.startsWith('data:image/')) {
      finalTtd = await ensureUploadedPhoto(finalTtd, 'ttd');
    }

    // 2. Siapkan list kegiatan dengan semua foto terunggah ke File Manager
    const preparedKegiatan: Array<{
      id: string;
      waktuMulai: string;
      waktuSelesai: string;
      kataKunciKegiatan: string;
      deskripsiKegiatan: string;
      rhkKategori: string;
      fotoKegiatan: string[];
      urutan: number;
    }> = [];
    for (let idx = 0; idx < input.kegiatan.length; idx++) {
      const k = input.kegiatan[idx];
      const rawPhotos = k.fotoKegiatan || [];
      const uploadedPhotos: string[] = [];
      for (const p of rawPhotos) {
        if (!p || typeof p !== 'string' || p.trim().length < 5 || p.startsWith('data:,')) continue;
        const uploaded = await ensureUploadedPhoto(p, `keg_${idx}`);
        if (uploaded) uploadedPhotos.push(uploaded);
      }

      preparedKegiatan.push({
        id: k.id || `keg_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        waktuMulai: k.waktuMulai,
        waktuSelesai: k.waktuSelesai,
        kataKunciKegiatan: k.kataKunciKegiatan || '',
        deskripsiKegiatan: k.deskripsiKegiatan,
        rhkKategori: k.rhkKategori || 'RHK 3',
        fotoKegiatan: uploadedPhotos,
        urutan: k.urutan ?? idx,
      });
    }

    // 3. Simpan ke server cPanel MySQL secara aman per item/chunk
    let cpanelSynced = false;
    let savedCpanelCount = 0;
    let syncError: string | null = null;

    try {
      for (let i = 0; i < preparedKegiatan.length; i++) {
        const item = preparedKegiatan[i];
        const chunkPayload = {
          namaPelapor: input.namaPelapor,
          nip: input.nip,
          tanggal: input.tanggal,
          tandaTangan: finalTtd,
          unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
          kegiatan: [{
            ...item,
            fotoKegiatan: item.fotoKegiatan.length > 0 ? item.fotoKegiatan : undefined,
          }],
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
          await new Promise(r => setTimeout(r, 200));
        }

        if (itemSuccess) {
          savedCpanelCount++;
        } else {
          syncError = `Kegiatan ke-${i + 1} (${item.waktuMulai}): ${lastErr}`;
        }
      }

      cpanelSynced = (savedCpanelCount === preparedKegiatan.length);
    } catch (err: any) {
      console.warn('[saveBulkKegiatan] cPanel sync warning:', err);
      syncError = err.message || 'Gagal tersambung ke server';
    }

    // 4. Sinkronkan juga mirror lokal
    if (cpanelSynced || savedCpanelCount > 0) {
      try {
        await zite.kegiatanHarian.bulkCreate({
          records: preparedKegiatan.map((k, idx) => ({
            id: k.id,
            idKegiatan: k.urutan ?? idx,
            namaPelapor: input.namaPelapor,
            nip: input.nip,
            tanggal: input.tanggal,
            waktuMulai: k.waktuMulai,
            waktuSelesai: k.waktuSelesai,
            kataKunciKegiatan: k.kataKunciKegiatan,
            deskripsiKegiatan: k.deskripsiKegiatan,
            rhkKategori: k.rhkKategori,
            fotoKegiatan: k.fotoKegiatan.length > 0 ? k.fotoKegiatan.map(url => ({ url })) : undefined,
            tandaTangan: finalTtd ? [{ url: finalTtd }] : undefined,
            unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
          })),
        });
      } catch (err) {
        console.warn('[saveBulkKegiatan] Mirror local save warning:', err);
      }
    }

    const isSuccess = cpanelSynced || savedCpanelCount > 0;
    return {
      success: isSuccess,
      count: savedCpanelCount,
      cpanelSynced,
      message: cpanelSynced
        ? `${savedCpanelCount} kegiatan & seluruh foto dokumentasi berhasil tersimpan permanen di Database Server cPanel!`
        : (savedCpanelCount > 0
            ? `${savedCpanelCount} dari ${preparedKegiatan.length} kegiatan tersimpan di cPanel (${syncError})`
            : `Gagal menyimpan ke Database Server cPanel: ${syncError || 'Koneksi ke server cPanel gagal'}`),
    };
  },
});
