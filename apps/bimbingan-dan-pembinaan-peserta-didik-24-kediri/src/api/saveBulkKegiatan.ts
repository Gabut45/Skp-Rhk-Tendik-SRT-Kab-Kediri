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
      copiedPhotoUrls: z.array(z.string()).optional(),
      urutan: z.number().optional(),
    })),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    count: z.number(),
    cpanelSynced: z.boolean().optional(),
    message: z.string().optional(),
    savedItems: z.array(z.object({
      id: z.string(),
      fotoKegiatan: z.array(z.string()),
    })).optional(),
  }),
  async execute({ input }) {
    setDeletedAll(false);
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=save_bulk`;
    const uploadPhotoUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=upload_foto`;
    const clonePhotoUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=clone_foto`;
    const getImageUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=get_image`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    // Helper: pastikan foto base64 diupload ke File Manager cPanel sehingga database hanya menyimpan URL singkat
    const ensureUploadedPhoto = async (photoStr: string, _fallbackName: string): Promise<string> => {
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

    // Helper: duplikasi file fisik foto hasil salinan agar berdiri sendiri dan tidak ikut terhapus jika pemilik asli menghapus miliknya
    const cloneExistingPhoto = async (photoUrl: string, fallbackName: string): Promise<string> => {
      if (!photoUrl || typeof photoUrl !== 'string') return '';
      if (photoUrl.startsWith('data:image/')) {
        return ensureUploadedPhoto(photoUrl, fallbackName);
      }

      // 1. Duplikasi langsung di server cPanel via action=clone_foto (instan)
      try {
        const res = await fetch(clonePhotoUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: photoUrl, subfolder: 'uploads' }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.url && typeof json.url === 'string' && json.url !== photoUrl) {
            return json.url;
          }
        }
      } catch (e) {
        console.warn('[saveBulkKegiatan] clone_foto warning:', e);
      }

      // 2. Fallback: unduh blob foto (langsung atau via proxy get_image) lalu unggah ulang sebagai file baru
      if (typeof window !== 'undefined' && typeof FileReader !== 'undefined') {
        const tryFetchBlob = async (urlToFetch: string): Promise<Blob | null> => {
          try {
            const r = await fetch(urlToFetch);
            if (r.ok) {
              const b = await r.blob();
              if (b && b.size > 0 && b.type.startsWith('image/')) return b;
            }
          } catch {}
          return null;
        };

        let blob = await tryFetchBlob(photoUrl);
        if (!blob) {
          blob = await tryFetchBlob(`${getImageUrl}&file=${encodeURIComponent(photoUrl)}`);
        }
        if (blob) {
          try {
            const base64Data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(blob as Blob);
            });
            const uploadedNewUrl = await ensureUploadedPhoto(base64Data, fallbackName);
            if (uploadedNewUrl && uploadedNewUrl.startsWith('http') && uploadedNewUrl !== photoUrl) {
              return uploadedNewUrl;
            }
          } catch (e) {
            console.warn('[saveBulkKegiatan] Fallback clone upload warning:', e);
          }
        }
      }

      return photoUrl;
    };

    // 1. Pastikan tanda tangan jika berupa base64 tersimpan di File Manager
    let finalTtd = input.tandaTangan;
    if (finalTtd && finalTtd.startsWith('data:image/')) {
      finalTtd = await ensureUploadedPhoto(finalTtd, 'ttd');
    }

    // 2. Siapkan list kegiatan dengan semua foto terunggah/terduplikasi ke File Manager
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
      const copiedSet = new Set((k.copiedPhotoUrls || []).filter(Boolean));
      const uploadedPhotos: string[] = [];
      for (const p of rawPhotos) {
        if (!p || typeof p !== 'string' || p.trim().length < 5 || p.startsWith('data:,')) continue;
        const resolved = copiedSet.has(p)
          ? await cloneExistingPhoto(p, `keg_${idx}`)
          : await ensureUploadedPhoto(p, `keg_${idx}`);
        if (resolved) uploadedPhotos.push(resolved);
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
      savedItems: preparedKegiatan.map(k => ({
        id: k.id,
        fotoKegiatan: k.fotoKegiatan,
      })),
      message: cpanelSynced
        ? `${savedCpanelCount} kegiatan & seluruh foto dokumentasi berhasil tersimpan permanen di Database Server cPanel!`
        : (savedCpanelCount > 0
            ? `${savedCpanelCount} dari ${preparedKegiatan.length} kegiatan tersimpan di cPanel (${syncError})`
            : `Gagal menyimpan ke Database Server cPanel: ${syncError || 'Koneksi ke server cPanel gagal'}`),
    };
  },
});
