import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Badge } from '@project/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { Sparkles, Image as ImageIcon, X, Trash2, ArrowUp, ArrowDown, Loader2, Eye, ShieldCheck } from 'lucide-react';
import { generateDeskripsi } from 'zitejs/api';
import { uploadFile } from 'zitejs/upload';
import { toast } from 'sonner';
import TimePicker from '@/components/TimePicker';
import { compressDocumentImage, formatBytes } from '@/lib/compress-image';

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
  const [uploading, setUploading] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

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

    setUploading(true);
    const uploaded: string[] = [];
    let totalOrig = 0;
    let totalComp = 0;

    try {
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        try {
          // Kompresi cerdas dokumen & foto (mengurangi ukuran s/d 95% dengan resolusi tajam)
          const compResult = await compressDocumentImage(file, {
            maxDimension: 1024,
            targetMaxKB: 80,
            initialQuality: 0.78,
          });

          totalOrig += compResult.originalSize;
          totalComp += compResult.compressedSize;

          const { fileUrl } = await uploadFile({
            data: compResult.file,
            filename: compResult.file.name,
          });
          if (fileUrl) {
            uploaded.push(fileUrl);
          }
        } catch (err) {
          console.error(`Gagal memproses ${file.name}:`, err);
          toast.error(`Gagal upload ${file.name}`);
        }
      }

      if (uploaded.length > 0) {
        onChange(item.id, { photos: [...item.photos, ...uploaded] });
        const savedPercent = totalOrig > totalComp
          ? Math.round(((totalOrig - totalComp) / totalOrig) * 100)
          : 0;

        if (savedPercent > 0) {
          toast.success(
            `${uploaded.length} foto berhasil dikompres & diunggah! Hemat ${savedPercent}% (${formatBytes(totalOrig)} → ${formatBytes(totalComp)}). Dokumen tetap tajam & jernih.`,
            { duration: 4000 }
          );
        } else {
          toast.success(`${uploaded.length} foto berhasil diunggah.`);
        }
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
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
          <div className="flex items-center gap-1.5">
            <Label>Foto Dokumen / Kegiatan</Label>
            <span className="text-xs text-muted-foreground font-normal">({item.photos.length}/100)</span>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />

          {item.photos.length < 100 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="gap-1.5 text-xs font-medium"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span>Mengompresi Dokumen...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={14} />
                  <span>Unggah Foto Dokumen</span>
                </>
              )}
            </Button>
          )}

          {item.photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 mt-2">
              {item.photos.map((url, i) => (
                <div
                  key={i}
                  className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm aspect-video sm:aspect-square flex items-center justify-center cursor-pointer"
                  onClick={() => setPreviewPhotoUrl(url)}
                  title="Klik untuk melihat foto penuh (memeriksa ketajaman dokumen)"
                >
                  <img
                    src={url}
                    alt={`Foto dokumen ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Eye size={18} className="text-white drop-shadow" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(item.id, { photos: item.photos.filter((_, j) => j !== i) });
                    }}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-destructive/90 transition-colors"
                    title="Hapus foto ini"
                  >
                    <X size={11} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 py-0.2 rounded font-mono pointer-events-none">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Lightbox Dialog untuk Pratinjau Foto Penuh & Memeriksa Ketajaman */}
      <Dialog open={!!previewPhotoUrl} onOpenChange={(open) => !open && setPreviewPhotoUrl(null)}>
        <DialogContent className="max-w-3xl p-3 bg-slate-900 border-slate-800 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-semibold flex items-center justify-between text-slate-100 pr-6">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Pemeriksaan Ketajaman Dokumen
              </span>
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Terkonversi Ringan & Resolusi Tajam
              </span>
            </DialogTitle>
          </DialogHeader>
          {previewPhotoUrl && (
            <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={previewPhotoUrl}
                alt="Pratinjau Dokumen Penuh"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
