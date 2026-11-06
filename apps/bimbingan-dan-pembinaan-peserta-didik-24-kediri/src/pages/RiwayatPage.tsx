import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Input } from '@project/components/ui/input';
import { Trash2, Loader2, Pencil, Search, ArrowUp, ArrowDown, FileDown, FileText, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getRiwayat, deleteRiwayat, getKegiatan, deleteKegiatan, previewHarian, generatePdfRhk, type GetRiwayatOutputType, type GetKegiatanOutputType } from 'zitejs/api';
import { toast } from 'sonner';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR, getSavedTtd, syncServerPresets } from '@/lib/pelapor-data';
import { useAuth } from '@/lib/auth-context';
import PreviewDialog from '@/components/PreviewDialog';
import { downloadPdfFromHtml, downloadWordFromHtml } from '@/lib/download-helper';
import {
  deleteCpanelBulkKegiatan,
  deleteCpanelRiwayat,
  getDeletedRiwayatKeys,
  markDeletedRiwayatKey,
  purgeLocalDataForRiwayat,
  purgeAllLocalData,
  getCpanelConfig,
  isAppDeletedAll,
  getDeletedIds,
  isClientRecordDeleted,
} from '@/lib/cpanel-client';

type FileRecord = GetRiwayatOutputType['records'][0];
type Activity = GetKegiatanOutputType['records'][0];

interface EditItem {
  id: string;
  waktuMulai: string;
  waktuSelesai: string;
  deskripsi: string;
  rhk: string;
  photos: string[];
}

function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function RiwayatPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const navigate = useNavigate();
  const [records, setRecords] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(curYear, now.getMonth() + 1, 0).getDate();
  const startOfMonth = `${curYear}-${curMonth}-01`;
  const endOfMonth = `${curYear}-${curMonth}-${String(lastDay).padStart(2, '0')}`;
  const today = getLocalDateString(now);

  const [filterPelapor, setFilterPelapor] = useState('Semua Pelapor');
  const [filterTanggalMulai, setFilterTanggalMulai] = useState(startOfMonth);
  const [filterTanggalSelesai, setFilterTanggalSelesai] = useState(endOfMonth);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination state (50 berkas per halaman sesuai permintaan)
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  // Edit dialog state
  const [editRecord, setEditRecord] = useState<FileRecord | null>(null);
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Preview and direct download dialog state
  const [previewState, setPreviewState] = useState<{
    open: boolean;
    title: string;
    pdfHtml: string;
    wordHtml: string;
    filename: string;
  } | null>(null);

  /**
   * Mengambil atau membuat HTML dokumen secara on-demand.
   */
  const getRecordHtml = async (r: FileRecord, isWord: boolean = false): Promise<string> => {
    // 1. Jika file lokal/cached memiliki HTML tersimpan (bukan binary PDF data URL)
    if (!isWord && r.pdfUrl && !r.id.startsWith('cpanel_')) {
      if (r.pdfUrl.startsWith('data:text/html;charset=utf-8,')) {
        return decodeURIComponent(r.pdfUrl.slice('data:text/html;charset=utf-8,'.length));
      }
      if (r.pdfUrl.startsWith('data:text/html,')) {
        return decodeURIComponent(r.pdfUrl.slice('data:text/html,'.length));
      }
      if (r.pdfUrl.startsWith('blob:') || (r.pdfUrl.startsWith('http') && !r.pdfUrl.endsWith('.pdf'))) {
        try {
          const res = await fetch(r.pdfUrl);
          if (res.ok) {
            const text = await res.text();
            if (text && (text.includes('<html') || text.includes('<table') || text.includes('KINERJA HARIAN') || text.includes('LAPORAN'))) {
              return text;
            }
          }
        } catch (e) {
          console.warn('Fetch pdfUrl gagal, membuat on-the-fly:', e);
        }
      }
    }

    // 2. Jika laporan adalah Laporan RHK
    if (r.jenisLaporan === 'Laporan RHK' || r.namaFile?.includes('RHK')) {
      const rhkMatch = (r.rhkNomor || r.namaFile || '').match(/(\d+)/);
      const rhkNomor = rhkMatch ? rhkMatch[1] : '1';
      const targetTanggalMulai = r.tanggalMulai || today;
      const targetTanggalSelesai = r.tanggalSelesai || r.tanggalMulai || today;
      const pelaporNama = r.namaPelapor || DEFAULT_PELAPOR.nama;
      const savedTtd = getSavedTtd(pelaporNama);

      const rhkRes = await generatePdfRhk({
        rhkNomor: rhkNomor as any,
        namaPelapor: pelaporNama,
        nip: DEFAULT_PELAPOR.nip,
        tanggalMulai: targetTanggalMulai,
        tanggalSelesai: targetTanggalSelesai,
        tandaTangan: savedTtd || undefined,
        format: isWord ? 'word' : 'pdf',
      });
      return isWord ? rhkRes.wordHtml : rhkRes.pdfHtml;
    }

    // 3. Ambil data kegiatan dari database untuk merekonstruksi HTML laporan secara akurat
    const targetTanggal = r.tanggalMulai || today;
    const kegData = await getKegiatan({
      tanggalMulai: targetTanggal,
      tanggalSelesai: r.tanggalSelesai || targetTanggal,
      namaPelapor: r.namaPelapor && r.namaPelapor !== 'Semua Pelapor' ? r.namaPelapor : undefined,
    });

    if (kegData.records.length === 0) {
      throw new Error(`Tidak ada data kegiatan di tanggal ${targetTanggal}`);
    }

    const first = kegData.records[0];
    const pelaporNama = r.namaPelapor || first.namaPelapor || DEFAULT_PELAPOR.nama;
    const savedTtd = getSavedTtd(pelaporNama);
    const ttdUrl = first.tandaTangan?.[0]?.url || savedTtd || undefined;

    const preview = await previewHarian({
      tanggal: targetTanggal,
      namaPelapor: pelaporNama,
      nip: first.nip || DEFAULT_PELAPOR.nip,
      tandaTangan: ttdUrl,
      kegiatan: kegData.records.map(k => ({
        waktuMulai: k.waktuMulai || '',
        waktuSelesai: k.waktuSelesai || '',
        deskripsiKegiatan: k.deskripsiKegiatan || '',
        rhkKategori: k.rhkKategori || undefined,
        fotoKegiatan: (k.fotoKegiatan || []).map(f => f.url),
      })),
    });

    return isWord ? preview.wordHtml : preview.pdfHtml;
  };

  const handleViewPreview = async (r: FileRecord) => {
    try {
      toast.info('Memuat preview laporan...');
      const html = await getRecordHtml(r, false);
      const wordHtml = await getRecordHtml(r, true);
      const fname = (r.namaFile || 'laporan').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      setPreviewState({
        open: true,
        title: r.namaFile || 'Preview Laporan',
        pdfHtml: html,
        wordHtml: wordHtml,
        filename: fname,
      });
    } catch (err: any) {
      toast.error('Gagal membuka preview: ' + (err?.message || 'Error'));
    }
  };

  const handleDownloadPdfRecord = async (r: FileRecord) => {
    try {
      toast.info('Menyiapkan unduhan PDF...');
      const fname = (r.namaFile || `laporan-${r.tanggalMulai || 'harian'}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');

      // Hanya unduh langsung JIKA r.pdfUrl adalah binary PDF murni data URL
      if (r.pdfUrl && r.pdfUrl.startsWith('data:application/pdf')) {
        const a = document.createElement('a');
        a.href = r.pdfUrl;
        a.download = `${fname}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('File PDF berhasil diunduh!');
        return;
      }

      // Ambil HTML laporan lengkap
      const html = await getRecordHtml(r, false);
      // Konversi HTML ke file PDF biner asli
      await downloadPdfFromHtml(html, `${fname}.pdf`);
      toast.success('File PDF berhasil diunduh!');
    } catch (err: any) {
      toast.error('Gagal mengunduh PDF: ' + (err?.message || 'Error'));
    }
  };

  const handleDownloadWordRecord = async (r: FileRecord) => {
    try {
      toast.info('Menyiapkan unduhan Word (.doc)...');
      const html = await getRecordHtml(r, true);
      const fname = (r.namaFile || `laporan-${r.tanggalMulai || 'harian'}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      downloadWordFromHtml(html, `${fname}.doc`);
      toast.success('File Word (.doc) berhasil diunduh!');
    } catch (err: any) {
      toast.error('Gagal mengunduh Word: ' + (err?.message || 'Error'));
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAppDeletedAll()) {
        setRecords([]);
        setLoading(false);
        return;
      }

      const deletedIdsArr = Array.from(getDeletedIds());
      syncServerPresets().catch(() => {});

      // 1. Ambil data riwayat file tersimpan
      const riwayatData = await getRiwayat({
        namaPelapor: filterPelapor !== 'Semua Pelapor' ? filterPelapor : undefined,
        tanggalMulai: filterTanggalMulai || undefined,
        tanggalSelesai: filterTanggalSelesai || undefined,
        deletedIds: deletedIdsArr,
      });

      // Filter yang sudah ditandai dihapus permanen
      const validRiwayat = riwayatData.records.filter(r => !isClientRecordDeleted(r));

      // 2. Ambil data kegiatan harian dari backend
      const kegiatanData = await getKegiatan({
        namaPelapor: filterPelapor !== 'Semua Pelapor' ? filterPelapor : undefined,
        tanggalMulai: filterTanggalMulai || undefined,
        tanggalSelesai: filterTanggalSelesai || undefined,
        deletedIds: deletedIdsArr,
      });

      // Filter yang sudah dihapus permanen
      const validKegiatan = kegiatanData.records.filter(k => !isClientRecordDeleted(k));

      // 3. Kelompokkan kegiatan berdasarkan tanggal & namaPelapor
      const groups = new Map<string, { tanggal: string; namaPelapor: string; items: Activity[] }>();
      for (const k of validKegiatan) {
        if (!k.tanggal) continue;
        const key = `${k.tanggal}___${k.namaPelapor || 'Wali Asuh'}`;

        if (!groups.has(key)) {
          groups.set(key, { tanggal: k.tanggal, namaPelapor: k.namaPelapor || 'Wali Asuh', items: [] });
        }
        groups.get(key)!.items.push(k);
      }

      // 4. Merge: pastikan setiap hari yang memiliki kegiatan muncul di Riwayat File
      const mergedRecords: FileRecord[] = [...validRiwayat];
      const existingKeys = new Set(
        mergedRecords.map(r => `${r.tanggalMulai}___${r.namaPelapor}`)
      );

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      for (const [key, g] of groups.entries()) {
        if (!existingKeys.has(key)) {
          const dateObj = new Date(g.tanggal + 'T00:00:00');
          const dateFormatted = !isNaN(dateObj.getTime())
            ? `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`
            : g.tanggal;

          const syntheticRecord: FileRecord = {
            id: `cpanel_harian_${g.tanggal}_${encodeURIComponent(g.namaPelapor)}`,
            namaFile: `Kinerja Harian - ${dateFormatted} (${g.items.length} Kegiatan)`,
            jenisLaporan: 'Kinerja Harian',
            namaPelapor: g.namaPelapor,
            pdfUrl: '',
            dibuatPada: `${g.tanggal}T12:00:00.000Z`,
            tanggalMulai: g.tanggal,
            tanggalSelesai: g.tanggal,
            rhkNomor: g.items[0]?.rhkKategori || 'RHK 3',
          };

          if (!isClientRecordDeleted(syntheticRecord)) {
            mergedRecords.push(syntheticRecord);
            existingKeys.add(key);
          }
        }
      }

      setRecords(mergedRecords.filter(r => !isClientRecordDeleted(r)));
    } catch {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  }, [filterPelapor, filterTanggalMulai, filterTanggalSelesai]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * Menghapus laporan dan seluruh data kegiatan terkait secara permanen selamanya
   * baik di penyimpanan lokal (localStorage) maupun di database server (cPanel MySQL & zite)
   */
  const handleDelete = async (record: FileRecord) => {
    try {
      toast.info('Menghapus data secara permanen dari server dan penyimpanan...');

      const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();
      const targetTanggalMulai = record.tanggalMulai;
      const targetTanggalSelesai = record.tanggalSelesai || record.tanggalMulai;
      const targetPelapor = record.namaPelapor;
      const targetRhk = record.rhkNomor;

      // 1. Ambil ID seluruh kegiatan pada tanggal/rentang tanggal dan pelapor terkait
      let idsToDelete: string[] = [];
      if (targetTanggalMulai) {
        try {
          const kegData = await getKegiatan({
            tanggalMulai: targetTanggalMulai,
            tanggalSelesai: targetTanggalSelesai,
            namaPelapor: targetPelapor && targetPelapor !== 'Semua Pelapor' ? targetPelapor : undefined,
            deletedIds: Array.from(getDeletedIds()),
          });
          idsToDelete = kegData.records.map(k => k.id);
        } catch (err) {
          console.warn('Gagal mengambil daftar kegiatan untuk dihapus:', err);
        }
      }

      // 2. Hapus file riwayat di backend server (zite & cPanel)
      try {
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
      } catch (e) {
        console.warn('deleteRiwayat backend warning:', e);
      }

      // 3. Hapus kegiatan di backend server (zite & cPanel)
      try {
        await deleteKegiatan({
          id: record.id,
          ids: idsToDelete.length > 0 ? idsToDelete : undefined,
          tanggalMulai: targetTanggalMulai,
          tanggalSelesai: targetTanggalSelesai,
          namaPelapor: targetPelapor,
          rhkNomor: targetRhk,
          cpanelUrl,
          cpanelKey,
        });
      } catch (e) {
        console.warn('deleteKegiatan backend warning:', e);
      }

      // 4. Hapus langsung via client API cPanel MySQL (agar pasti terhapus di remote server)
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

      // 5. Bersihkan tuntas selamanya dari penyimpanan lokal (localStorage) browser
      purgeLocalDataForRiwayat({
        recordId: record.id,
        tanggalMulai: targetTanggalMulai,
        tanggalSelesai: targetTanggalSelesai,
        namaPelapor: targetPelapor,
        rhkNomor: targetRhk,
        deletedActivityIds: idsToDelete,
      });

      // 6. Update state UI langsung
      setRecords(prev =>
        prev.filter(item => {
          if (item.id === record.id) return false;
          const iDate = item.tanggalMulai;
          if (targetTanggalMulai && targetTanggalSelesai && iDate && item.namaPelapor === targetPelapor) {
            if (iDate >= targetTanggalMulai && iDate <= targetTanggalSelesai) {
              if (!targetRhk || item.rhkNomor === targetRhk) return false;
            }
          }
          return true;
        })
      );

      toast.success('Laporan dan data kegiatan berhasil dihapus permanen dari riwayat, daftar kegiatan, dan laporan RHK!');
    } catch (err: any) {
      toast.error('Gagal menghapus data: ' + (err?.message || 'Error'));
    }
  };

  /**
   * Menghapus semua berkas riwayat, kegiatan, dan laporan RHK secara bersih menyeluruh
   */
  const handleDeleteAll = async () => {
    try {
      toast.info('Menghapus SEMUA berkas riwayat dan kegiatan secara permanen...');
      const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();

      await deleteRiwayat({ deleteAll: true, cpanelUrl, cpanelKey });
      await deleteKegiatan({ deleteAll: true, cpanelUrl, cpanelKey });

      purgeAllLocalData();
      setRecords([]);

      toast.success('Semua berkas riwayat, kegiatan harian, dan laporan RHK telah terhapus bersih selamanya!');
    } catch (err: any) {
      toast.error('Gagal menghapus semua data: ' + (err?.message || 'Error'));
    }
  };

  const handleEdit = async (record: FileRecord) => {
    setEditRecord(record);
    setLoadingEdit(true);
    try {
      const data = await getKegiatan({
        tanggalMulai: record.tanggalMulai || undefined,
        tanggalSelesai: record.tanggalSelesai || record.tanggalMulai || undefined,
        namaPelapor: record.namaPelapor && record.namaPelapor !== 'Semua Pelapor' ? record.namaPelapor : undefined,
      });
      setEditItems(data.records.map(r => ({
        id: r.id,
        waktuMulai: r.waktuMulai || '',
        waktuSelesai: r.waktuSelesai || '',
        deskripsi: r.deskripsiKegiatan || '',
        rhk: r.rhkKategori || '',
        photos: (r.fotoKegiatan || []).map(f => f.url),
      })));
    } catch {
      toast.error('Gagal memuat kegiatan');
      setEditRecord(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  const updateEditItem = (id: string, field: keyof EditItem, value: string) => {
    setEditItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveAsCopy = () => {
    if (editItems.length === 0) return toast.error('Tidak ada kegiatan');

    const items = editItems.map(item => ({
      id: crypto.randomUUID(),
      waktuMulai: item.waktuMulai,
      waktuSelesai: item.waktuSelesai,
      kataKunci: '',
      deskripsi: item.deskripsi,
      rhk: item.rhk,
      photos: item.photos,
    }));

    sessionStorage.setItem('__copiedKegiatan', JSON.stringify(items));
    toast.success(`${items.length} kegiatan disalin ke Input Kegiatan — silakan ganti pelapor & upload foto baru`);
    setEditRecord(null);
    navigate('/kegiatan-harian');
  };

  const sortedRecords = [...records].sort((a, b) => {
    const dateA = a.tanggalMulai || '';
    const dateB = b.tanggalMulai || '';
    return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
  });

  const totalRecords = sortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedRecords = sortedRecords.slice(startIndex, startIndex + PAGE_SIZE);

  const formatDateTime = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Riwayat File & Laporan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Semua laporan PDF/Word yang dibuat dapat langsung dipratinjau, diunduh, dan diedit
          </p>
        </div>
        {isSuperAdmin && (
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5 text-xs font-semibold">
                  <Trash2 size={14} /> Hapus Semua Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">Hapus SEMUA Data Secara Permanen?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        Tindakan ini akan menghapus <strong>seluruh berkas riwayat</strong>, <strong>semua kegiatan harian</strong>, dan <strong>laporan RHK</strong> secara permanen dari server database dan perangkat lokal.
                      </p>
                      <p className="text-xs text-destructive font-semibold">
                        PERINGATAN: Semua data akan terhapus bersih selamanya dan tidak dapat dipulihkan!
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAll}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                  >
                    Ya, Bersihkan Semua Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <PelaporSelect
              value={filterPelapor}
              onChange={(nama) => setFilterPelapor(nama)}
              label="Filter Pelapor"
              className="min-w-[220px]"
              allowAll
            />
            <div className="space-y-1">
              <Label className="text-xs">Tanggal Mulai</Label>
              <Input
                type="date"
                value={filterTanggalMulai}
                onChange={e => setFilterTanggalMulai(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tanggal Akhir</Label>
              <Input
                type="date"
                value={filterTanggalSelesai}
                onChange={e => setFilterTanggalSelesai(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={fetchData} className="gap-2">
              <Search size={14} /> Cari
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">Preset Cepat:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setFilterTanggalMulai(startOfMonth);
                setFilterTanggalSelesai(endOfMonth);
              }}
            >
              Bulan Ini (1 - {lastDay} {now.toLocaleString('id-ID', { month: 'short' })})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setFilterTanggalMulai(today);
                setFilterTanggalSelesai(today);
              }}
            >
              Hari Ini ({today})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setFilterTanggalMulai('');
                setFilterTanggalSelesai('');
              }}
            >
              Semua Tanggal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Daftar File ({totalRecords})</span>
              {totalPages > 1 && (
                <Badge variant="outline" className="text-xs text-primary font-medium">
                  Halaman {validCurrentPage} dari {totalPages}
                </Badge>
              )}
            </div>
            <span className="text-xs font-normal text-muted-foreground">
              Klik &quot;Preview&quot;, &quot;PDF&quot;, atau &quot;Word&quot; pada baris manapun untuk mencetak/mengunduh
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : totalRecords === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground">Belum ada file atau kegiatan di rentang tanggal ini</p>
              <p className="text-xs text-muted-foreground">Gunakan tombol &quot;Bulan Ini&quot; atau &quot;Semua Tanggal&quot; untuk menampilkan semua data.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">No</TableHead>
                      <TableHead>Nama File / Laporan</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Pelapor</TableHead>
                      <TableHead>
                        <button
                          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
                        >
                          Tanggal
                          {sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                        </button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((r, i) => {
                      const rowNumber = startIndex + i + 1;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-center font-mono text-xs">{rowNumber}</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm font-medium line-clamp-1">{r.namaFile || '-'}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {r.rhkNomor && <Badge variant="outline" className="text-[10px]">{r.rhkNomor}</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={(r.jenisLaporan === 'Kinerja Harian' ? 'default' : 'secondary') as 'default' | 'secondary'} className="text-xs">
                              {r.jenisLaporan}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{r.namaPelapor}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {r.tanggalMulai
                              ? new Date(r.tanggalMulai + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                            {formatDateTime(r.dibuatPada)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPreview(r)}
                                title="Buka Preview & Cetak Laporan"
                                className="h-8 gap-1 px-2.5 text-xs font-medium"
                              >
                                <Eye size={13} />
                                <span>Preview</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdfRecord(r)}
                                title="Unduh File PDF (.pdf)"
                                className="h-8 gap-1 px-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <FileDown size={13} />
                                <span>PDF</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadWordRecord(r)}
                                title="Unduh File Word (.doc)"
                                className="h-8 gap-1 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <FileText size={13} />
                                <span>Word</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(r)}
                                title="Edit & Salin Kegiatan"
                                className="h-8 w-8 p-0"
                              >
                                <Pencil size={14} />
                              </Button>
                              {isSuperAdmin && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" title="Hapus Permanen">
                                      <Trash2 size={14} className="text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-destructive">Hapus Permanen Dari Server?</AlertDialogTitle>
                                      <AlertDialogDescription asChild>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                          <p>
                                            Laporan ini beserta seluruh data kegiatan terkait pada tanggal{' '}
                                            <strong className="text-foreground">{r.tanggalMulai || '-'}</strong> ({r.namaPelapor}) akan dihapus secara permanen dari server dan database.
                                          </p>
                                          <p className="text-xs text-muted-foreground font-medium">
                                            Data yang dihapus tidak akan dapat dipulihkan kembali.
                                          </p>
                                        </div>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(r)}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controller (50 data per halaman/tab) */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t mt-4 text-xs">
                  <div className="text-muted-foreground">
                    Menampilkan <span className="font-semibold text-foreground">{startIndex + 1}</span> -{' '}
                    <span className="font-semibold text-foreground">
                      {Math.min(startIndex + PAGE_SIZE, totalRecords)}
                    </span>{' '}
                    dari <span className="font-semibold text-foreground">{totalRecords}</span> berkas (50 per halaman)
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled={validCurrentPage <= 1}
                      onClick={() => setCurrentPage(1)}
                      title="Halaman Pertama"
                    >
                      <ChevronsLeft size={14} />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Awal</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled={validCurrentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft size={14} />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Sebelumnya</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                        .filter(p => {
                          return p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 2;
                        })
                        .map((p, idx, arr) => {
                          const prevPageNum = arr[idx - 1];
                          const showEllipsis = prevPageNum && p - prevPageNum > 1;
                          return (
                            <span key={p} className="flex items-center">
                              {showEllipsis && <span className="px-1 text-muted-foreground select-none">...</span>}
                              <Button
                                variant={validCurrentPage === p ? 'default' : 'outline'}
                                size="sm"
                                className={`h-8 min-w-8 px-2 text-xs font-semibold ${
                                  validCurrentPage === p ? 'pointer-events-none' : ''
                                }`}
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </Button>
                            </span>
                          );
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled={validCurrentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      title="Halaman Selanjutnya"
                    >
                      <span className="sr-only sm:not-sr-only sm:mr-1">Selanjutnya</span>
                      <ChevronRight size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled={validCurrentPage >= totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      title="Halaman Terakhir"
                    >
                      <span className="sr-only sm:not-sr-only sm:mr-1">Akhir</span>
                      <ChevronsRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editRecord} onOpenChange={open => !open && setEditRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit & Salin Kegiatan</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Edit kegiatan dari tanggal ini lalu salin ke Form Input untuk kebutuhan modifikasi atau pelaporan baru.
            </p>
          </DialogHeader>

          {loadingEdit ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : editItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Tidak ada kegiatan ditemukan untuk file ini</p>
          ) : (
            <div className="space-y-4 py-2">
              {editItems.map((item, i) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                    <span className="text-xs text-muted-foreground">{item.waktuMulai} - {item.waktuSelesai}</span>
                    {item.rhk && <Badge variant="outline" className="text-[10px]">{item.rhk}</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Mulai</Label>
                      <Input value={item.waktuMulai} onChange={e => updateEditItem(item.id, 'waktuMulai', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Selesai</Label>
                      <Input value={item.waktuSelesai} onChange={e => updateEditItem(item.id, 'waktuSelesai', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">RHK</Label>
                      <Input value={item.rhk} onChange={e => updateEditItem(item.id, 'rhk', e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Deskripsi</Label>
                    <Textarea
                      rows={2}
                      value={item.deskripsi}
                      onChange={e => updateEditItem(item.id, 'deskripsi', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {item.photos.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs">Foto ({item.photos.length})</Label>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {item.photos.map((url, pi) => (
                          <img key={pi} src={url} alt={`Foto ${pi + 1}`} className="w-16 h-16 object-cover rounded border shrink-0" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditRecord(null)}>Tutup</Button>
                <Button onClick={handleSaveAsCopy} className="bg-primary text-primary-foreground">
                  Salin ke Input Kegiatan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewState && (
        <PreviewDialog
          open={previewState.open}
          onClose={() => setPreviewState(null)}
          pdfHtml={previewState.pdfHtml}
          wordHtml={previewState.wordHtml}
          title={previewState.title}
          filename={previewState.filename}
        />
      )}
    </div>
  );
}
