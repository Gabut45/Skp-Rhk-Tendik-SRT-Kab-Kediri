import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Badge } from '@project/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { Eye, Loader2, Upload, X, FileDown, FileText, Trash2, AlertCircle } from 'lucide-react';
import {
  generatePdfRhk,
  previewRhk,
  getRiwayat,
  deleteRiwayat,
  getKegiatan,
  deleteKegiatan,
  type GetRiwayatOutputType,
} from 'zitejs/api';
import { uploadFile } from 'zitejs/upload';
import { toast } from 'sonner';
import { RHK_DATA } from '@/lib/rhk-data';
import PreviewDialog from '@/components/PreviewDialog';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR, getSavedTtd, getSavedTtdAsync, saveTtd, removeTtd, matchPelapor, syncServerPresets } from '@/lib/pelapor-data';
import { downloadPdfFromHtml, downloadWordFromHtml } from '@/lib/download-helper';
import { useAuth } from '@/lib/auth-context';
import { compressSignature } from '@/lib/compress-image';
import {
  isAppDeletedAll,
  getDeletedIds,
  isClientRecordDeleted,
  purgeLocalDataForRiwayat,
  deleteCpanelRiwayat,
  deleteCpanelBulkKegiatan,
  getCpanelConfig,
} from '@/lib/cpanel-client';

type FileRecord = GetRiwayatOutputType['records'][0];

export default function LaporanRHKPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const startOfMonth = `${year}-${month}-01`;
  const endOfMonth = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  
  const matchedUserPelapor = user ? (matchPelapor(user.nama) || matchPelapor(user.username)) : undefined;
  const initialNama = matchedUserPelapor?.nama || (user && user.role === 'wali_asuh' && user.nama ? user.nama : DEFAULT_PELAPOR.nama);
  const initialNip = matchedUserPelapor?.nip || (user && user.role === 'wali_asuh' && user.nip ? user.nip : DEFAULT_PELAPOR.nip);

  const [rhkNomor, setRhkNomor] = useState('1');
  const [tanggalMulai, setTanggalMulai] = useState(startOfMonth);
  const [tanggalSelesai, setTanggalSelesai] = useState(endOfMonth);
  const [namaPelapor, setNamaPelapor] = useState(initialNama);
  const [nip, setNip] = useState(initialNip);
  const [tandaTangan, setTandaTangan] = useState<string | null>(() => getSavedTtd(initialNama));

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
    getSavedTtdAsync(namaPelapor).then(preset => {
      if (preset) {
        setTandaTangan(prev => prev || preset);
      }
    });
  }, [namaPelapor]);

  const [previewing, setPreviewing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfHtml, setPreviewPdfHtml] = useState('');
  const [previewWordHtml, setPreviewWordHtml] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [rhkRecords, setRhkRecords] = useState<FileRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const ttdRef = useRef<HTMLInputElement>(null);

  const selectedRhk = RHK_DATA.find(r => r.nomor === rhkNomor);

  const handlePelaporChange = async (nama: string, nipVal: string) => {
    setNamaPelapor(nama);
    setNip(nipVal);
    const saved = getSavedTtd(nama);
    if (saved) {
      setTandaTangan(saved);
    } else {
      setTandaTangan(null);
      const asyncSaved = await getSavedTtdAsync(nama);
      if (asyncSaved) {
        setTandaTangan(asyncSaved);
      }
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
      toast.success('Tanda tangan dioptimalkan & disimpan untuk ' + namaPelapor);
    } catch {
      toast.error('Gagal upload tanda tangan');
    }
  };

  const handleRemoveTtd = () => {
    removeTtd(namaPelapor);
    setTandaTangan(null);
  };

  // Muat berkas laporan RHK yang ada dan pastikan tersinkronisasi dengan status hapus
  const fetchRhkFiles = useCallback(async () => {
    if (isAppDeletedAll()) {
      setRhkRecords([]);
      return;
    }

    setLoadingRecords(true);
    try {
      const deletedIdsArr = Array.from(getDeletedIds());
      const res = await getRiwayat({
        namaPelapor: namaPelapor && namaPelapor !== 'Semua Pelapor' ? namaPelapor : undefined,
        deletedIds: deletedIdsArr,
      });

      // Filter khusus berkas Laporan RHK yang belum dihapus
      const filtered = res.records.filter(r => {
        if (isClientRecordDeleted(r)) return false;
        const isRhk = r.jenisLaporan === 'Laporan RHK' || (r.namaFile && r.namaFile.includes('RHK'));
        return isRhk;
      });

      setRhkRecords(filtered);
    } catch (err) {
      console.warn('Gagal memuat berkas RHK:', err);
    } finally {
      setLoadingRecords(false);
    }
  }, [namaPelapor]);

  useEffect(() => {
    fetchRhkFiles();
  }, [fetchRhkFiles]);

  const handlePreview = async () => {
    if (isAppDeletedAll()) {
      return toast.error('Tidak ada data kegiatan. Seluruh data telah dibersihkan/dihapus secara permanen.');
    }
    if (!rhkNomor) return toast.error('Pilih RHK terlebih dahulu');
    setPreviewing(true);
    try {
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) setTandaTangan(effectiveTtd);
      }

      const deletedIdsArr = Array.from(getDeletedIds());
      const result = await previewRhk({
        rhkNomor,
        tanggalMulai,
        tanggalSelesai,
        namaPelapor,
        nip,
        tandaTangan: effectiveTtd || undefined,
        deletedIds: deletedIdsArr,
      });

      if ((result as any).kegiatanCount === 0) {
        toast.warning('Peringatan: Tidak ada kegiatan atau bukti foto ditemukan untuk RHK ini pada periode tersebut.');
      }

      setPreviewPdfHtml(result.pdfHtml);
      setPreviewWordHtml(result.wordHtml);
      setShowPreview(true);
    } catch (err: any) {
      toast.error('Gagal membuat preview: ' + (err?.message || 'Error'));
    } finally {
      setPreviewing(false);
    }
  };

  const reportFilename = `laporan-rhk${rhkNomor || '1'}-${tanggalMulai}-${tanggalSelesai}`;

  const handleDownloadPdf = async () => {
    if (isAppDeletedAll()) {
      return toast.error('Tidak ada data kegiatan. Seluruh data telah dibersihkan/dihapus secara permanen.');
    }
    if (!rhkNomor) return toast.error('Pilih RHK terlebih dahulu');
    setDownloadingPdf(true);
    try {
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) setTandaTangan(effectiveTtd);
      }

      const deletedIdsArr = Array.from(getDeletedIds());
      const result = await generatePdfRhk({
        rhkNomor,
        tanggalMulai,
        tanggalSelesai,
        namaPelapor,
        nip,
        tandaTangan: effectiveTtd || undefined,
        format: 'pdf',
        deletedIds: deletedIdsArr,
      });
      await downloadPdfFromHtml(result.pdfHtml || previewPdfHtml, `${reportFilename}.pdf`);
      toast.success('File PDF berhasil dibuat & diunduh, dan tersimpan di Riwayat!');
      fetchRhkFiles();
    } catch (err: any) {
      toast.error('Gagal membuat PDF: ' + (err?.message || 'Error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadWord = async () => {
    if (isAppDeletedAll()) {
      return toast.error('Tidak ada data kegiatan. Seluruh data telah dibersihkan/dihapus secara permanen.');
    }
    if (!rhkNomor) return toast.error('Pilih RHK terlebih dahulu');
    setDownloadingWord(true);
    try {
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) setTandaTangan(effectiveTtd);
      }

      const deletedIdsArr = Array.from(getDeletedIds());
      const result = await generatePdfRhk({
        rhkNomor,
        tanggalMulai,
        tanggalSelesai,
        namaPelapor,
        nip,
        tandaTangan: effectiveTtd || undefined,
        format: 'word',
        deletedIds: deletedIdsArr,
      });
      downloadWordFromHtml(result.wordHtml || previewWordHtml, `${reportFilename}.doc`);
      toast.success('File Word (.doc) berhasil dibuat & diunduh, dan tersimpan di Riwayat!');
      fetchRhkFiles();
    } catch (err: any) {
      toast.error('Gagal membuat Word: ' + (err?.message || 'Error'));
    } finally {
      setDownloadingWord(false);
    }
  };

  /**
   * Menghapus berkas Laporan RHK dan kegiatan terkait secara permanen selamanya
   */
  const handleDeleteRhkRecord = async (record: FileRecord) => {
    try {
      toast.info('Menghapus berkas Laporan RHK dan data terkait secara permanen...');
      const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();
      const targetTanggalMulai = record.tanggalMulai;
      const targetTanggalSelesai = record.tanggalSelesai || record.tanggalMulai;
      const targetPelapor = record.namaPelapor;
      const targetRhk = record.rhkNomor;

      // 1. Ambil ID seluruh kegiatan terkait
      let idsToDelete: string[] = [];
      if (targetTanggalMulai) {
        try {
          const kegData = await getKegiatan({
            tanggalMulai: targetTanggalMulai,
            tanggalSelesai: targetTanggalSelesai,
            namaPelapor: targetPelapor && targetPelapor !== 'Semua Pelapor' ? targetPelapor : undefined,
            deletedIds: Array.from(getDeletedIds()),
            summaryOnly: true,
          });
          idsToDelete = kegData.records.map(k => k.id);
        } catch (e) {
          console.warn('Gagal ambil kegiatan terkait:', e);
        }
      }

      // 2. Hapus riwayat di backend server (zite & cPanel)
      await deleteRiwayat({
        id: record.id,
        ids: idsToDelete.length > 0 ? idsToDelete : undefined,
        tanggalMulai: targetTanggalMulai,
        tanggalSelesai: targetTanggalSelesai,
        namaPelapor: targetPelapor,
        rhkNomor: targetRhk,
        cpanelUrl,
        cpanelKey,
      });

      // 3. Hapus kegiatan terkait di backend
      await deleteKegiatan({
        ids: idsToDelete.length > 0 ? idsToDelete : undefined,
        tanggalMulai: targetTanggalMulai,
        tanggalSelesai: targetTanggalSelesai,
        namaPelapor: targetPelapor,
        rhkNomor: targetRhk,
        cpanelUrl,
        cpanelKey,
      });

      // 4. Hapus di cPanel MySQL client
      await deleteCpanelRiwayat({
        id: record.id,
        tanggal: targetTanggalMulai,
        namaPelapor: targetPelapor,
      });
      if (idsToDelete.length > 0 || targetTanggalMulai) {
        await deleteCpanelBulkKegiatan({
          ids: idsToDelete,
          tanggal: targetTanggalMulai,
          namaPelapor: targetPelapor,
        });
      }

      // 5. Bersihkan lokal storage
      purgeLocalDataForRiwayat({
        recordId: record.id,
        tanggalMulai: targetTanggalMulai,
        tanggalSelesai: targetTanggalSelesai,
        namaPelapor: targetPelapor,
        rhkNomor: targetRhk,
        deletedActivityIds: idsToDelete,
      });

      // 6. Update UI
      setRhkRecords(prev => prev.filter(r => r.id !== record.id));
      toast.success('Berkas Laporan RHK dan data terkait berhasil dihapus permanen dari server dan riwayat!');
    } catch (err: any) {
      toast.error('Gagal menghapus berkas: ' + (err?.message || 'Error'));
    }
  };

  const handleDirectPreview = async (r: FileRecord) => {
    try {
      toast.info('Memuat preview berkas...');
      const rhkMatch = (r.rhkNomor || r.namaFile || '').match(/(\d+)/);
      const targetRhkNomor = rhkMatch ? rhkMatch[1] : '1';
      const targetTanggalMulai = r.tanggalMulai || tanggalMulai;
      const targetTanggalSelesai = r.tanggalSelesai || r.tanggalMulai || tanggalSelesai;
      const pelaporNama = r.namaPelapor || namaPelapor;
      const savedTtd = getSavedTtd(pelaporNama);

      const res = await previewRhk({
        rhkNomor: targetRhkNomor,
        namaPelapor: pelaporNama,
        nip: DEFAULT_PELAPOR.nip,
        tanggalMulai: targetTanggalMulai,
        tanggalSelesai: targetTanggalSelesai,
        tandaTangan: savedTtd || undefined,
        deletedIds: Array.from(getDeletedIds()),
      });

      setPreviewPdfHtml(res.pdfHtml);
      setPreviewWordHtml(res.wordHtml);
      setShowPreview(true);
    } catch (err: any) {
      toast.error('Gagal membuka preview: ' + (err?.message || 'Error'));
    }
  };

  const handleDirectDownloadPdf = async (r: FileRecord) => {
    try {
      toast.info('Menyiapkan file PDF...');
      const rhkMatch = (r.rhkNomor || r.namaFile || '').match(/(\d+)/);
      const targetRhkNomor = rhkMatch ? rhkMatch[1] : '1';
      const fname = (r.namaFile || `laporan-rhk-${r.tanggalMulai || 'periode'}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');

      const res = await generatePdfRhk({
        rhkNomor: targetRhkNomor,
        namaPelapor: r.namaPelapor || namaPelapor,
        nip: DEFAULT_PELAPOR.nip,
        tanggalMulai: r.tanggalMulai || tanggalMulai,
        tanggalSelesai: r.tanggalSelesai || tanggalSelesai,
        format: 'pdf',
        deletedIds: Array.from(getDeletedIds()),
      });

      await downloadPdfFromHtml(res.pdfHtml, `${fname}.pdf`);
      toast.success('File PDF berhasil diunduh!');
    } catch (err: any) {
      toast.error('Gagal mengunduh PDF: ' + (err?.message || 'Error'));
    }
  };

  const handleDirectDownloadWord = async (r: FileRecord) => {
    try {
      toast.info('Menyiapkan file Word (.doc)...');
      const rhkMatch = (r.rhkNomor || r.namaFile || '').match(/(\d+)/);
      const targetRhkNomor = rhkMatch ? rhkMatch[1] : '1';
      const fname = (r.namaFile || `laporan-rhk-${r.tanggalMulai || 'periode'}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');

      const res = await generatePdfRhk({
        rhkNomor: targetRhkNomor,
        namaPelapor: r.namaPelapor || namaPelapor,
        nip: DEFAULT_PELAPOR.nip,
        tanggalMulai: r.tanggalMulai || tanggalMulai,
        tanggalSelesai: r.tanggalSelesai || tanggalSelesai,
        format: 'word',
        deletedIds: Array.from(getDeletedIds()),
      });

      downloadWordFromHtml(res.wordHtml, `${fname}.doc`);
      toast.success('File Word (.doc) berhasil diunduh!');
    } catch (err: any) {
      toast.error('Gagal mengunduh Word: ' + (err?.message || 'Error'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Buat & Kelola Laporan RHK</h2>
        <p className="text-sm text-muted-foreground">
          Generate dan cetak laporan per RHK dengan data kegiatan harian yang tersinkronisasi otomatis
        </p>
      </div>

      {isAppDeletedAll() && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive">
          <AlertCircle size={20} className="shrink-0" />
          <div className="text-sm">
            <strong>Semua data telah dibersihkan secara permanen.</strong>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tidak ada data kegiatan atau berkas laporan yang aktif. Silakan input kegiatan baru di menu Input Kegiatan Harian jika ingin membuat laporan baru.
            </p>
          </div>
        </div>
      )}

      {/* Form Pembuatan Laporan RHK */}
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

      {/* Daftar Berkas Laporan RHK yang Dibuat / Tersimpan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Daftar Berkas Laporan RHK ({rhkRecords.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Tersinkronisasi langsung dengan Riwayat File & Kegiatan
            </span>
          </CardTitle>
          {isSuperAdmin && (
            <CardDescription>
              Menghapus berkas di sini akan otomatis menghapus kegiatan dan berkas di Riwayat File serta Daftar Kegiatan.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {loadingRecords ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : rhkRecords.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-muted-foreground">Belum ada berkas Laporan RHK tersimpan</p>
              {isSuperAdmin && (
                <p className="text-xs text-muted-foreground">
                  Jika Anda telah menghapus berkas di Riwayat File, seluruh berkas di halaman ini otomatis terhapus bersih selamanya.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">No</TableHead>
                    <TableHead>Nama Berkas / Laporan</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rhkRecords.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm font-medium line-clamp-1">{r.namaFile || '-'}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {r.rhkNomor && <Badge variant="outline" className="text-[10px]">{r.rhkNomor}</Badge>}
                          <Badge variant="secondary" className="text-[10px]">{r.jenisLaporan}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{r.namaPelapor}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {r.tanggalMulai ? `${r.tanggalMulai} s/d ${r.tanggalSelesai || r.tanggalMulai}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDirectPreview(r)}
                            title="Preview Laporan"
                            className="h-8 gap-1 px-2 text-xs font-medium"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDirectDownloadPdf(r)}
                            title="Unduh PDF"
                            className="h-8 gap-1 px-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <FileDown size={13} />
                            <span>PDF</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDirectDownloadWord(r)}
                            title="Unduh Word"
                            className="h-8 gap-1 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <FileText size={13} />
                            <span>Word</span>
                          </Button>
                          {isSuperAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  title="Hapus Permanen"
                                >
                                  <Trash2 size={14} className="text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-destructive">Hapus Berkas Laporan RHK?</AlertDialogTitle>
                                  <AlertDialogDescription asChild>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                      <p>
                                        Berkas <strong>{r.namaFile}</strong> dan seluruh data kegiatan terkait pada periode{' '}
                                        <strong className="text-foreground">{r.tanggalMulai || '-'} s/d {r.tanggalSelesai || '-'}</strong> ({r.namaPelapor}) akan dihapus permanen dari server database, riwayat file, dan daftar kegiatan.
                                      </p>
                                      <p className="text-xs text-muted-foreground font-medium">
                                        Tindakan ini permanen dan tidak dapat dipulihkan.
                                      </p>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteRhkRecord(r)}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  >
                                    Hapus Permanen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
