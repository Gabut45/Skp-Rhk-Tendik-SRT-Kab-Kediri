import { useCallback, useState } from 'react';

export async function uploadFile({ data, filename }: { data: any; filename?: string }): Promise<{ fileUrl: string }> {
  if (typeof data === 'string') {
    return { fileUrl: data };
  }
  if (typeof window !== 'undefined' && data instanceof Blob) {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(data);
    });

    // Coba upload langsung ke cPanel File Manager (folder uploads/YYYY/MM/)
    try {
      const cpanelUrl = localStorage.getItem('cpanel_api_url') || 'https://game.gabutgame.my.id/skp/api_kegiatan.php';
      const cpanelKey = localStorage.getItem('cpanel_api_key') || '';
      const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=upload_foto`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (cpanelKey) headers['X-API-KEY'] = cpanelKey;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          foto: base64Data,
          filename: filename || 'foto.jpg',
          subfolder: 'uploads',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url && typeof json.url === 'string' && json.url.startsWith('http')) {
          return { fileUrl: json.url };
        }
      }
    } catch {
      // Fallback ke base64 jika upload langsung belum aktif di cPanel
    }

    return { fileUrl: base64Data };
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
