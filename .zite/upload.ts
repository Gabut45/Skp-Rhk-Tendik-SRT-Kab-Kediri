import { useCallback, useState } from 'react';

export async function uploadFile({ data, filename }: { data: any; filename?: string }) {
  if (typeof data === 'string') {
    return { fileUrl: data };
  }
  if (typeof window !== 'undefined' && data instanceof Blob) {
    return new Promise<{ fileUrl: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ fileUrl: reader.result as string });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(data);
    });
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
