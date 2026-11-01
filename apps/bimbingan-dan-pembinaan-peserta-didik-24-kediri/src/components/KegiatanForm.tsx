import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Badge } from '@project/components/ui/badge';
import { Sparkles, Image, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { generateDeskripsi } from 'zitejs/api';
import { uploadFile } from 'zitejs/upload';
import { toast } from 'sonner';
import TimePicker from '@/components/TimePicker';
import { compressImage } from '@/lib/compress-image';

export interface KegiatanItem {
  id: string;
  waktuMulai: string;
  waktuSelesai: string;
  kataKunci: string;
  deskripsi: string;
  rhk: string;
  photos: string[];
}

interface KegiatanFormProps {
  index: number;
  item: KegiatanItem;
  onChange: (id: string, updates: Partial<KegiatanItem>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function KegiatanForm({ index, item, onChange, onRemove, canRemove, onMoveUp, onMoveDown }: KegiatanFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGenerateAI = async () => {
    if (!item.kataKunci.trim()) return toast.error('Masukkan kata kunci terlebih dahulu');
    onChange(item.id, { _generating: true } as any);
    try {
      const result = await generateDeskripsi({ kataKunci: item.kataKunci });
      onChange(item.id, { deskripsi: result.deskripsi, rhk: result.rhk });
      toast.success(`Deskripsi kegiatan ${index + 1} berhasil di-generate!`);
    } catch {
      toast.error('Gagal generate deskripsi');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 100 - item.photos.length;
    if (remaining <= 0) return toast.error('Maksimal 100 foto per kegiatan');
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length < Array.from(files).length) {
      toast.warning(`Hanya ${remaining} foto lagi yang bisa diunggah (maks 100)`);
    }

    const uploaded: string[] = [];
    for (const file of toUpload) {
      try {
        const compressed = await compressImage(file);
        const { fileUrl } = await uploadFile({ data: compressed, filename: compressed.name });
        uploaded.push(fileUrl);
      } catch {
        toast.error(`Gagal upload ${file.name}`);
      }
    }
    if (uploaded.length > 0) {
      onChange(item.id, { photos: [...item.photos, ...uploaded] });
      toast.success(`${uploaded.length} foto berhasil diunggah`);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Kegiatan {index + 1}</CardTitle>
            {/* Reorder buttons */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={!onMoveUp}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Pindah ke atas"
              >
                <ArrowUp size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={!onMoveDown}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Pindah ke bawah"
              >
                <ArrowDown size={14} />
              </Button>
            </div>
          </div>
          {canRemove && (
            <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)} className="text-destructive hover:text-destructive gap-1 h-8">
              <Trash2 size={14} /> Hapus
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TimePicker label="Waktu Mulai" value={item.waktuMulai} onChange={v => onChange(item.id, { waktuMulai: v })} />
          <TimePicker label="Waktu Selesai" value={item.waktuSelesai} onChange={v => onChange(item.id, { waktuSelesai: v })} />
        </div>

        <div className="space-y-2">
          <Label>Kata Kunci</Label>
          <div className="flex gap-2">
            <Input
              placeholder="contoh: sholat, makan, belajar..."
              value={item.kataKunci}
              onChange={e => onChange(item.id, { kataKunci: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
            />
            <Button onClick={handleGenerateAI} size="sm" className="gap-1.5 shrink-0">
              <Sparkles size={14} /> AI
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Deskripsi</Label>
            {item.rhk && <Badge variant="secondary" className="text-[10px]">{item.rhk}</Badge>}
          </div>
          <Textarea
            rows={3}
            value={item.deskripsi}
            onChange={e => onChange(item.id, { deskripsi: e.target.value })}
            placeholder="Deskripsi kegiatan..."
          />
        </div>

        <div className="space-y-2">
          <Label>RHK</Label>
          <Input
            value={item.rhk}
            onChange={e => onChange(item.id, { rhk: e.target.value })}
            placeholder="RHK 1, RHK 2, dst..."
          />
        </div>

        <div className="space-y-2">
          <Label>Foto <span className="text-muted-foreground font-normal">({item.photos.length}/100)</span></Label>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          {item.photos.length < 100 && (
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
              <Image size={14} /> Unggah Foto
            </Button>
          )}
          {item.photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {item.photos.map((url, i) => (
                <div key={i} className="relative rounded-md overflow-hidden border bg-muted">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-16 object-cover" />
                  <button
                    onClick={() => onChange(item.id, { photos: item.photos.filter((_, j) => j !== i) })}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
