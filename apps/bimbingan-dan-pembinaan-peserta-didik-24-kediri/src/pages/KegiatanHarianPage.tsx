import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Plus, Upload, X, Eye, Save, Loader2, ArrowUp, ArrowDown, PlusCircle, FileDown } from 'lucide-react';
import { saveBulkKegiatan, previewHarian, generatePdfHarian } from 'zitejs/api';
import { uploadFile } from 'zitejs/upload';
import { toast } from 'sonner';
import KegiatanForm, { KegiatanItem } from '@/components/KegiatanForm';
import PreviewDialog from '@/components/PreviewDialog';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR, getSavedTtd, saveTtd, removeTtd, matchPelapor, syncServerPresets } from '@/lib/pelapor-data';
import { downloadPdfFromHtml, downloadWordFromHtml } from '@/lib/download-helper';

import { useAuth } from '@/lib/auth-context';
import { compressSignature } from '@/lib/compress-image';
import { setAppDeletedAll } from '@/lib/cpanel-client';

function createKegiatan(): KegiatanItem {
  return { id: crypto.randomUUID(), waktuMulai: '', waktuSelesai: '', kataKunci: '', deskripsi: '', rhk: '', photos: [] };
}

function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function KegiatanHarianPage() {
  const { user } = useAuth();
  const today = getLocalDateString(new Date());

  // Otomatis deteksi wali asuh yang sedang login (misal 'ekowahyudi' -> 'Eko Wahyudi, S.Pd')
  const matchedUserPelapor = user ? (matchPelapor(user.nama) || matchPelapor(user.username)) : undefined;
  const initialNama = matchedUserPelapor?.nama || (user && user.role === 'wali_asuh' && user.nama ? user.nama : DEFAULT_PELAPOR.nama);
  const initialNip = matchedUserPelapor?.nip || (user && user.role === 'wali_asuh' && user.nip ? user.nip : DEFAULT_PELAPOR.nip);

  const [namaPelapor, setNamaPelapor] = useState(initialNama);
  const [nip, setNip] = useState(initialNip);
  const [tanggal, setTanggal] = useState(today);
  const [tandaTangan, setTandaTangan] = useState<string | null>(() => getSavedTtd(initialNama));
  const [kegiatanList, setKegiatanList] = useState<KegiatanItem[]>(() =>
    Array.from({ length: 4 }, createKegiatan)
  );

  useEffect(() => {
    if (user) {
      const matched = matchPelapor(user.nama) || matchPelapor(user.username);
      if (matched) {
        setNamaPelapor(matched.nama);
        setNip(matched.nip);
        const saved = getSavedTtd(matched.nama);
        setTandaTangan(saved || null);
      } else if (user.role === 'wali_asuh' && user.nama) {
        setNamaPelapor(user.nama);
        if (user.nip) setNip(user.nip);
        const saved = getSavedTtd(user.nama);
        setTandaTangan(saved || null);
      }
    }
  }, [user]);

  // Sinkronkan preset tanda tangan dari database server cPanel saat halaman dimuat
  useEffect(() => {
    syncServerPresets().then(presets => {
      if (presets && presets[namaPelapor]) {
        setTandaTangan(presets[namaPelapor]);
      }
    });
  }, [namaPelapor]);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfHtml, setPreviewPdfHtml] = useState('');
  const [previewWordHtml, setPreviewWordHtml] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [quickPdf, setQuickPdf] = useState(false);
  const ttdRef = useRef<HTMLInputElement>(null);

  // Pick up copied kegiatan from Daftar Kegiatan or Riwayat
  useEffect(() => {
    const stored = sessionStorage.getItem('__copiedKegiatan');
    if (stored) {
      try {
        const items = JSON.parse(stored) as KegiatanItem[];
        if (items.length > 0) {
          setKegiatanList(items);
          toast.success(`${items.length} kegiatan berhasil dimuat`);
        }
      } catch { /* ignore */ }
      sessionStorage.removeItem('__copiedKegiatan');
    }
  }, []);

  const handlePelaporChange = (nama: string, nipVal: string) => {
    setNamaPelapor(nama);
    setNip(nipVal);
    const saved = getSavedTtd(nama);
    if (saved) {
      setTandaTangan(saved);
    } else {
      setTandaTangan(null);
      syncServerPresets().then(presets => {
        if (presets && presets[nama]) {
          setTandaTangan(presets[nama]);
        }
      });
    }
  };

  const handleTtdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressSignature(file);
      const { fileUrl } = await uploadFile({ data: compressed, filename: `ttd-${compressed.name}` });
      setTandaTangan(fileUrl);
      saveTtd(namaPelapor, fileUrl);
      toast.success('Tanda tangan berhasil dioptimalkan & disimpan untuk ' + namaPelapor);
    } catch {
      toast.error('Gagal upload tanda tangan');
    }
  };

  const handleRemoveTtd = () => {
    removeTtd(namaPelapor);
    setTandaTangan(null);
  };

  const handleChange = useCallback((id: string, updates: Partial<KegiatanItem>) => {
    setKegiatanList(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setKegiatanList(prev => prev.filter(k => k.id !== id));
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setKegiatanList(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setKegiatanList(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleInsertAfter = useCallback((index: number) => {
    setKegiatanList(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, createKegiatan());
      return next;
    });
  }, []);

  const addKegiatan = () => setKegiatanList(prev => [...prev, createKegiatan()]);

  const getFilledKegiatan = () => kegiatanList.filter(k => k.waktuMulai && k.waktuSelesai && k.deskripsi);

  const handlePreview = async () => {
    const filled = getFilledKegiatan();
    if (filled.length === 0) return toast.error('Isi minimal 1 kegiatan lengkap (waktu + deskripsi)');
    setPreviewing(true);
    try {
      const result = await previewHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: tandaTangan || undefined,
        kegiatan: filled.map(k => ({
          waktuMulai: k.waktuMulai,
          waktuSelesai: k.waktuSelesai,
          deskripsiKegiatan: k.deskripsi,
          rhkKategori: k.rhk || undefined,
          fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        })),
      });
      setPreviewPdfHtml(result.pdfHtml);
      setPreviewWordHtml(result.wordHtml);
      setShowPreview(true);
    } catch {
      toast.error('Gagal membuat preview');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSaveAll = async () => {
    const filled = getFilledKegiatan();
    if (filled.length === 0) return toast.error('Isi minimal 1 kegiatan lengkap');
    setSaving(true);
    try {
      const cpanelUrl = localStorage.getItem('cpanel_api_url') || undefined;
      const cpanelKey = localStorage.getItem('cpanel_api_key') || undefined;

      const payloadKegiatan = filled.map(k => ({
        id: k.id,
        waktuMulai: k.waktuMulai,
        waktuSelesai: k.waktuSelesai,
        kataKunciKegiatan: k.kataKunci,
        deskripsiKegiatan: k.deskripsi,
        rhkKategori: k.rhk || 'RHK 3',
        fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
      }));

      // Simpan via endpoint yang otomatis menyinkronkan ke database lokal & cPanel secara aman sekali saja
      const result = await saveBulkKegiatan({
        namaPelapor,
        nip,
        tanggal,
        tandaTangan: tandaTangan || undefined,
        cpanelUrl,
        cpanelKey,
        kegiatan: payloadKegiatan,
      });

      setAppDeletedAll(false);

      if (result?.cpanelSynced) {
        toast.success(
          `${filled.length} kegiatan & foto bukti berhasil disimpan ke Database Server cPanel dan tersinkronisasi ke semua perangkat!`,
          { duration: 4000 }
        );
      } else {
        toast.warning(
          `Kegiatan tersimpan lokal, namun sinkronisasi server: ${result?.message || 'terkendala koneksi'}`
        );
      }
    } catch (err: any) {
      toast.error('Gagal menyimpan kegiatan: ' + (err?.message || 'Kesalahan sistem'));
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    const filled = getFilledKegiatan();
    if (filled.length === 0) return toast.error('Isi minimal 1 kegiatan lengkap');
    setDownloadingPdf(true);
    try {
      const result = await generatePdfHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: tandaTangan || undefined,
        format: 'pdf',
        kegiatan: filled.map(k => ({
          waktuMulai: k.waktuMulai,
          waktuSelesai: k.waktuSelesai,
          deskripsiKegiatan: k.deskripsi,
          rhkKategori: k.rhk || undefined,
          fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        })),
      });
      await downloadPdfFromHtml(result.pdfHtml || previewPdfHtml, `kinerja-harian-${tanggal}.pdf`);
      toast.success('File PDF berhasil dibuat & diunduh, dan tersimpan di Riwayat File!');
    } catch (err: any) {
      toast.error('Gagal membuat PDF: ' + (err?.message || 'Error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadWord = async () => {
    const filled = getFilledKegiatan();
    if (filled.length === 0) return toast.error('Isi minimal 1 kegiatan lengkap');
    setDownloadingWord(true);
    try {
      const result = await generatePdfHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: tandaTangan || undefined,
        format: 'word',
        kegiatan: filled.map(k => ({
          waktuMulai: k.waktuMulai,
          waktuSelesai: k.waktuSelesai,
          deskripsiKegiatan: k.deskripsi,
          rhkKategori: k.rhk || undefined,
          fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        })),
      });
      downloadWordFromHtml(result.wordHtml || previewWordHtml, `kinerja-harian-${tanggal}.doc`);
      toast.success('File Word (.doc) berhasil dibuat & diunduh, dan tersimpan di Riwayat File!');
    } catch (err: any) {
      toast.error('Gagal membuat Word: ' + (err?.message || 'Error'));
    } finally {
      setDownloadingWord(false);
    }
  };

  const handleQuickPdf = async () => {
    const filled = getFilledKegiatan();
    if (filled.length === 0) return toast.error('Isi minimal 1 kegiatan lengkap (waktu + deskripsi)');
    setQuickPdf(true);
    try {
      const result = await generatePdfHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: tandaTangan || undefined,
        format: 'pdf',
        kegiatan: filled.map(k => ({
          waktuMulai: k.waktuMulai,
          waktuSelesai: k.waktuSelesai,
          deskripsiKegiatan: k.deskripsi,
          rhkKategori: k.rhk || undefined,
          fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        })),
      });
      await downloadPdfFromHtml(result.pdfHtml || previewPdfHtml, `kinerja-harian-${tanggal}.pdf`);
      toast.success('File PDF berhasil dibuat & diunduh, dan tersimpan di Riwayat File!');
    } catch (err: any) {
      toast.error('Gagal membuat PDF: ' + (err?.message || 'Error'));
    } finally {
      setQuickPdf(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Input Kegiatan Harian</h2>
          <p className="text-sm text-muted-foreground">
            Catat kegiatan harian — {kegiatanList.length} kegiatan
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleQuickPdf} disabled={quickPdf} variant="outline" size="sm" className="gap-2">
            {quickPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            Cetak PDF
          </Button>
          <Button onClick={handlePreview} disabled={previewing} variant="outline" size="sm" className="gap-2">
            {previewing ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            Preview
          </Button>
          <Button onClick={handleSaveAll} disabled={saving} size="sm" className="gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Simpan Semua
          </Button>
        </div>
      </div>

      {/* Identity Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Pelapor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PelaporSelect
            value={namaPelapor}
            onChange={handlePelaporChange}
          />
          <div className="space-y-2">
            <Label>NIP</Label>
            <Input value={nip} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tanda Tangan</Label>
            <input ref={ttdRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleTtdUpload} />
            <div className="flex items-center gap-2 flex-wrap">
              {tandaTangan ? (
                <div className="flex items-center gap-2">
                  <img src={tandaTangan} alt="TTD" className="h-10 bg-white rounded border p-0.5" />
                  <span className="text-xs text-muted-foreground">Tersimpan</span>
                  <Button variant="outline" size="sm" onClick={() => ttdRef.current?.click()} className="gap-1.5 text-xs h-7">
                    <Upload size={12} /> Ganti
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRemoveTtd} className="h-7 w-7 p-0">
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => ttdRef.current?.click()} className="gap-2">
                  <Upload size={14} /> Upload TTD
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Forms with reorder controls */}
      {kegiatanList.map((item, i) => (
        <div key={item.id} className="space-y-0">
          <KegiatanForm
            index={i}
            item={item}
            onChange={handleChange}
            onRemove={handleRemove}
            canRemove={kegiatanList.length > 1}
            onMoveUp={i > 0 ? () => handleMoveUp(i) : undefined}
            onMoveDown={i < kegiatanList.length - 1 ? () => handleMoveDown(i) : undefined}
          />
          {/* Insert between button */}
          {i < kegiatanList.length - 1 && (
            <div className="flex justify-center -my-2 relative z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInsertAfter(i)}
                className="gap-1.5 h-7 text-xs rounded-full bg-background shadow-sm border-dashed hover:border-primary hover:text-primary"
              >
                <PlusCircle size={12} /> Sisipkan Kegiatan
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Add button */}
      <Button onClick={addKegiatan} variant="outline" className="w-full gap-2 border-dashed h-12">
        <Plus size={16} /> Tambah Kegiatan
      </Button>

      {/* Bottom actions */}
      <div className="flex gap-3 pb-6 flex-wrap">
        <Button onClick={handleQuickPdf} disabled={quickPdf} variant="outline" className="flex-1 gap-2 h-12 min-w-[140px]">
          {quickPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          Cetak PDF
        </Button>
        <Button onClick={handlePreview} disabled={previewing} variant="outline" className="flex-1 gap-2 h-12 min-w-[140px]">
          {previewing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
          Preview
        </Button>
        <Button onClick={handleSaveAll} disabled={saving} className="flex-1 gap-2 h-12 min-w-[140px]">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan ({getFilledKegiatan().length})
        </Button>
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        pdfHtml={previewPdfHtml}
        wordHtml={previewWordHtml}
        filename={`kinerja-harian-${tanggal}`}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        downloadingPdf={downloadingPdf}
        downloadingWord={downloadingWord}
        title="Preview Kinerja Harian"
      />
    </div>
  );
}
