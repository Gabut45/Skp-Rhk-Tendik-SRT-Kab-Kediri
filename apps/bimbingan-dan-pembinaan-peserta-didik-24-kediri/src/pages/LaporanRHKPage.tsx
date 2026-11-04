import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Eye, Loader2, Upload, X, FileDown, FileText } from 'lucide-react';
import { generatePdfRhk, previewRhk } from 'zitejs/api';
import { uploadFile } from 'zitejs/upload';
import { toast } from 'sonner';
import { RHK_DATA } from '@/lib/rhk-data';
import PreviewDialog from '@/components/PreviewDialog';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR, getSavedTtd, saveTtd, removeTtd } from '@/lib/pelapor-data';
import { downloadPdfFromHtml, downloadWordFromHtml } from '@/lib/download-helper';
import { useAuth } from '@/lib/auth-context';

export default function LaporanRHKPage() {
  const { user } = useAuth();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const startOfMonth = `${year}-${month}-01`;
  const endOfMonth = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  const initialNama = (user && user.role === 'wali_asuh' && user.nama) ? user.nama : DEFAULT_PELAPOR.nama;
  const initialNip = (user && user.role === 'wali_asuh' && user.nip) ? user.nip : DEFAULT_PELAPOR.nip;

  const [rhkNomor, setRhkNomor] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(startOfMonth);
  const [tanggalSelesai, setTanggalSelesai] = useState(endOfMonth);
  const [namaPelapor, setNamaPelapor] = useState(initialNama);
  const [nip, setNip] = useState(initialNip);
  const [tandaTangan, setTandaTangan] = useState<string | null>(() => getSavedTtd(initialNama));
  const [previewing, setPreviewing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfHtml, setPreviewPdfHtml] = useState('');
  const [previewWordHtml, setPreviewWordHtml] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const ttdRef = useRef<HTMLInputElement>(null);

  const selectedRhk = RHK_DATA.find(r => r.nomor === rhkNomor);

  const handlePelaporChange = (nama: string, nipVal: string) => {
    setNamaPelapor(nama);
    setNip(nipVal);
    setTandaTangan(getSavedTtd(nama));
  };

  const handleTtdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { fileUrl } = await uploadFile({ data: file, filename: `ttd-${file.name}` });
      setTandaTangan(fileUrl);
      saveTtd(namaPelapor, fileUrl);
      toast.success('Tanda tangan disimpan untuk ' + namaPelapor);
    } catch {
      toast.error('Gagal upload tanda tangan');
    }
  };

  const handleRemoveTtd = () => {
    removeTtd(namaPelapor);
    setTandaTangan(null);
  };

  const handlePreview = async () => {
    if (!rhkNomor) return toast.error('Pilih RHK terlebih dahulu');
    setPreviewing(true);
    try {
      const result = await previewRhk({
        rhkNomor, tanggalMulai, tanggalSelesai,
        namaPelapor, nip,
        tandaTangan: tandaTangan || undefined,
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

  const reportFilename = `laporan-rhk${rhkNomor || '1'}-${tanggalMulai}-${tanggalSelesai}`;

  const handleDownloadPdf = async () => {
    if (!rhkNomor) return toast.error('Pilih RHK terlebih dahulu');
    setDownloadingPdf(true);
    try {
      const result = await generatePdfRhk({
        rhkNomor, tanggalMulai, tanggalSelesai,
        namaPelapor, nip,
        tandaTangan: tandaTangan || undefined,
        format: 'pdf',
      });
      await downloadPdfFromHtml(result.pdfHtml || previewPdfHtml, `${reportFilename}.pdf`);
      toast.success('File PDF berhasil dibuat & diunduh, dan tersimpan di Riwayat File!');
    } catch (err: any) {
      toast.error('Gagal membuat PDF: ' + (err?.message || 'Error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!rhkNomor) return toast.error('Pilih RHK terlebih dahulu');
    setDownloadingWord(true);
    try {
      const result = await generatePdfRhk({
        rhkNomor, tanggalMulai, tanggalSelesai,
        namaPelapor, nip,
        tandaTangan: tandaTangan || undefined,
        format: 'word',
      });
      downloadWordFromHtml(result.wordHtml || previewWordHtml, `${reportFilename}.doc`);
      toast.success('File Word (.doc) berhasil dibuat & diunduh, dan tersimpan di Riwayat File!');
    } catch (err: any) {
      toast.error('Gagal membuat Word: ' + (err?.message || 'Error'));
    } finally {
      setDownloadingWord(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Buat Laporan RHK</h2>
        <p className="text-sm text-muted-foreground">
          Generate laporan per RHK dengan data dari kegiatan harian
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pilih RHK & Rentang Waktu</CardTitle>
          <CardDescription>Data dokumentasi diambil otomatis dari kegiatan harian yang sudah diinput berdasarkan nama pelapor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori RHK</Label>
            <Select value={rhkNomor} onValueChange={setRhkNomor}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih RHK..." />
              </SelectTrigger>
              <SelectContent>
                {RHK_DATA.map(r => (
                  <SelectItem key={r.nomor} value={r.nomor}>
                    RHK {r.nomor} - {r.judul}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRhk && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p className="font-medium">{selectedRhk.label}: {selectedRhk.judul}</p>
              <p className="text-muted-foreground text-xs">{selectedRhk.maksudTujuan}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dari Tanggal</Label>
              <Input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sampai Tanggal</Label>
              <Input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Pelapor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PelaporSelect
              value={namaPelapor}
              onChange={handlePelaporChange}
            />
            <div className="space-y-2">
              <Label>NIP</Label>
              <Input value={nip} readOnly className="bg-muted/50" />
            </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button onClick={handlePreview} disabled={previewing} variant="outline" className="gap-2 h-12 text-sm sm:text-base">
          {previewing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
          Preview Laporan
        </Button>
        <Button onClick={handleDownloadPdf} disabled={downloadingPdf} className="gap-2 h-12 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground">
          {downloadingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          Unduh PDF (.pdf)
        </Button>
        <Button onClick={handleDownloadWord} disabled={downloadingWord} variant="secondary" className="gap-2 h-12 text-sm sm:text-base border">
          {downloadingWord ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Unduh Word (.doc)
        </Button>
      </div>

      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        pdfHtml={previewPdfHtml}
        wordHtml={previewWordHtml}
        filename={reportFilename}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        downloadingPdf={downloadingPdf}
        downloadingWord={downloadingWord}
        title="Preview Laporan RHK"
      />
    </div>
  );
}
