/**
 * Utilitas Kompresi Gambar Dokumen & Tanda Tangan Cerdas
 * 
 * Mengoptimalkan foto dokumen dan kegiatan agar:
 * 1. Ukuran file berkurang drastis (85% - 95% lebih ringan), mencegah beban server/database & error 413.
 * 2. Teks dokumen, tulisan tangan, stempel, dan detail foto tetap tajam & mudah dibaca.
 * 3. Orientasi EXIF otomatis diperbaiki (tidak terbalik saat diunggah dari kamera smartphone).
 */

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
  dimensions: { width: number; height: number };
}

export interface CompressOptions {
  maxDimension?: number;   // default: 1280px (sangat tajam untuk teks & dokumen cetak)
  targetMaxKB?: number;    // default: 220KB (ideal untuk database & PDF generator)
  initialQuality?: number; // default: 0.82 (kualitas visual optimal)
  minQuality?: number;     // default: 0.65 (batas bawah agar teks tidak pecah)
}

/**
 * Format ukuran byte ke string terbaca (KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Helper untuk memuat gambar dengan orientasi EXIF yang benar
 */
async function loadImageElement(file: File): Promise<{
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  // 1. Coba gunakan createImageBitmap dengan auto-orientasi EXIF (modern browser)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close?.(),
      };
    } catch {
      // Fallback ke Image biasa jika bitmap gagal
    }
  }

  // 2. Fallback standar HTMLImageElement
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Kompresi gambar dokumen kegiatan secara cerdas
 */
export async function compressDocumentImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const originalSize = file.size;

  // Jika bukan gambar, kembalikan apa adanya
  if (!file.type.startsWith('image/')) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedPercent: 0,
      dimensions: { width: 0, height: 0 },
    };
  }

  const {
    maxDimension = 1100,
    targetMaxKB = 110,
    initialQuality = 0.80,
    minQuality = 0.60,
  } = options;

  try {
    const { source, width: origW, height: origH, cleanup } = await loadImageElement(file);

    let targetW = origW;
    let targetH = origH;

    // Skalakan resolusi jika melebihi batas maksimum
    if (targetW > maxDimension || targetH > maxDimension) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH / targetW) * maxDimension);
        targetW = maxDimension;
      } else {
        targetW = Math.round((targetW / targetH) * maxDimension);
        targetH = maxDimension;
      }
    }

    // Buat canvas berpresisi tinggi untuk merender teks dokumen secara tajam
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      cleanup();
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        savedPercent: 0,
        dimensions: { width: origW, height: origH },
      };
    }

    // Aktifkan smoothing berkualitas tinggi agar teks dokumen tajam
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Berikan latar belakang putih untuk dokumen jika ada transparansi
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Render gambar ke canvas
    ctx.drawImage(source, 0, 0, targetW, targetH);
    cleanup();

    // Fungsi konversi canvas ke blob JPEG
    const toBlobPromise = (quality: number): Promise<Blob | null> => {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      });
    };

    // Kompresi bertingkat adaptif: coba initialQuality, jika masih > targetMaxKB, turunkan bertahap
    let currentQuality = initialQuality;
    let blob = await toBlobPromise(currentQuality);

    if (blob && blob.size > targetMaxKB * 1024 && currentQuality > minQuality) {
      currentQuality = 0.74;
      const secondBlob = await toBlobPromise(currentQuality);
      if (secondBlob) blob = secondBlob;
    }

    if (blob && blob.size > targetMaxKB * 1024 && currentQuality > minQuality) {
      currentQuality = minQuality;
      const thirdBlob = await toBlobPromise(currentQuality);
      if (thirdBlob) blob = thirdBlob;
    }

    if (!blob) {
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        savedPercent: 0,
        dimensions: { width: targetW, height: targetH },
      };
    }

    const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
    const compressedFile = new File([blob], `${cleanBaseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const compressedSize = compressedFile.size;
    const savedPercent = originalSize > compressedSize
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      savedPercent,
      dimensions: { width: targetW, height: targetH },
    };
  } catch (err) {
    console.warn('Gagal kompresi gambar, menggunakan file asli:', err);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedPercent: 0,
      dimensions: { width: 0, height: 0 },
    };
  }
}

/**
 * Kompresi khusus tanda tangan (mempertahankan ketajaman garis dan transparansi jika PNG)
 */
export async function compressSignature(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const { source, width: origW, height: origH, cleanup } = await loadImageElement(file);
    const maxDim = 500; // Tanda tangan hanya perlu max 500px

    let targetW = origW;
    let targetH = origH;

    if (targetW > maxDim || targetH > maxDim) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH / targetW) * maxDim);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW / targetH) * maxDim);
        targetH = maxDim;
      }
    }

    const isPng = file.type === 'image/png';
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: isPng });

    if (!ctx) {
      cleanup();
      return file;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (!isPng) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    ctx.drawImage(source, 0, 0, targetW, targetH);
    cleanup();

    const mime = isPng ? 'image/png' : 'image/jpeg';
    const quality = isPng ? undefined : 0.85;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(file);
        const ext = isPng ? '.png' : '.jpg';
        const cleanBase = file.name.replace(/\.[^/.]+$/, '');
        resolve(new File([blob], `${cleanBase}${ext}`, { type: mime, lastModified: Date.now() }));
      }, mime, quality);
    });
  } catch (err) {
    console.warn('Gagal kompres tanda tangan:', err);
    return file;
  }
}

/**
 * Kompatibilitas mundur dengan fungsi lama compressImage
 */
export async function compressImage(file: File, maxSize = 1280, quality = 0.78): Promise<File> {
  const res = await compressDocumentImage(file, {
    maxDimension: maxSize,
    initialQuality: quality,
  });
  return res.file;
}
