import { useCallback, useState } from 'react';

export async function uploadFile({ data, filename }: { data: any; filename?: string }): Promise<{ fileUrl: string }> {
  if (!data) return { fileUrl: '' };

  const cpanelUrl = (typeof window !== 'undefined' ? localStorage.getItem('cpanel_api_url') : null) || 'https://game.gabutgame.my.id/skp/api_kegiatan.php';
  const cpanelKey = (typeof window !== 'undefined' ? localStorage.getItem('cpanel_api_key') : null) || '';

  // 1. Jika data sudah berupa URL online (https://...), langsung kembalikan
  if (typeof data === 'string' && (data.startsWith('http://') || data.startsWith('https://'))) {
    return { fileUrl: data };
  }

  // Helper untuk upload Blob via FormData ke cPanel File Manager
  const uploadBlobToCpanel = async (blob: Blob, fname: string): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('foto', blob, fname);
      fd.append('subfolder', 'uploads');

      const headers: Record<string, string> = {};
      if (cpanelKey) headers['X-API-KEY'] = cpanelKey;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(cpanelUrl, {
        method: 'POST',
        headers,
        body: fd,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url && typeof json.url === 'string' && json.url.startsWith('http')) {
          return json.url;
        }
      }
    } catch (e) {
      console.warn('[uploadBlobToCpanel] FormData upload warning:', e);
    }
    return null;
  };

  // 2. Jika data adalah Blob / File
  if (typeof window !== 'undefined' && data instanceof Blob) {
    const fname = filename || (data instanceof File ? data.name : 'foto.jpg');
    const uploadedUrl = await uploadBlobToCpanel(data, fname);
    if (uploadedUrl) return { fileUrl: uploadedUrl };

    // Fallback: konversi ke base64 jika cPanel offline
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(data);
    });

    return { fileUrl: base64Data };
  }

  // 3. Jika data berupa Base64 Data URL, coba upload ke cPanel File Manager agar tersimpan sebagai file permanen
  if (typeof data === 'string' && data.startsWith('data:image/')) {
    try {
      // Decode data URL to Blob
      const arr = data.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const ext = mime.split('/')[1] || 'jpg';
      const fname = filename || `foto_${Date.now()}.${ext}`;

      const uploadedUrl = await uploadBlobToCpanel(blob, fname);
      if (uploadedUrl) return { fileUrl: uploadedUrl };
    } catch (e) {
      console.warn('[uploadFile] Gagal decode base64:', e);
    }
    return { fileUrl: data };
  }

  return { fileUrl: '' };
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const upload = useCallback(async (file: File, filename?: string) => {
    setIsUploading(true);
    try {
      const res = await uploadFile({ data: file, filename });
      return { url: res.fileUrl };
    } finally {
      setIsUploading(false);
    }
  }, []);
  return { upload, isUploading };
}
