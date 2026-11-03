import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Input } from '@project/components/ui/input';
import { Trash2, Loader2, Pencil, Copy, Search, ArrowUp, ArrowDown, FileDown, FileText, Eye, Database, X } from 'lucide-react';
import { getRiwayat, deleteRiwayat, getKegiatan, previewHarian, type GetRiwayatOutputType, type GetKegiatanOutputType } from 'zitejs/api';
import { toast } from 'sonner';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR, getSavedTtd } from '@/lib/pelapor-data';
import PreviewDialog from '@/components/PreviewDialog';
import { downloadPdfFromHtml, downloadWordFromHtml } from '@/lib/download-helper';

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
   * Jika record berasal dari cPanel atau pdfUrl lokal belum ada,
   * secara otomatis mengambil kegiatan dari cPanel MySQL dan membuat HTML preview resmi.
   */
  const getRecordHtml = async (r: FileRecord, isWord: boolean = false): Promise<string> => {
    // 1. Jika file lokal/cached memiliki pdfUrl valid dan bukan permintaan Word
    if (!isWord && r.pdfUrl && !r.id.startsWith('cpanel_')) {
      if (r.pdfUrl.startsWith('data:text/html;charset=utf-8,')) {
        return decodeURIComponent(r.pdfUrl.slice('data:text/html;charset=utf-8,'.length));
      }
      if (r.pdfUrl.startsWith('data:')) {
        const commaIndex = r.pdfUrl.indexOf(',');
        return decodeURIComponent(r.pdfUrl.slice(commaIndex + 1));
      }
      try {
        const res = await fetch(r.pdfUrl);
        if (res.ok) return await res.text();
      } catch (e) {
        console.warn('Fetch pdfUrl gagal, membuat on-the-fly:', e);
      }
    }

    // 2. Ambil data kegiatan live dari cPanel MySQL
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
      const html = await getRecordHtml(r, false);
      const fname = (r.namaFile || `laporan-${r.tanggalMulai || 'harian'}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
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
      // 1. Ambil data riwayat yang sudah di-generate sebelumnya
      const riwayatData = await getRiwayat({
        namaPelapor: filterPelapor !== 'Semua Pelapor' ? filterPelapor : undefined,
        tanggalMulai: filterTanggalMulai || undefined,
        tanggalSelesai: filterTanggalSelesai || undefined,
      });

      // 2. Ambil data kegiatan harian live dari cPanel MySQL
      const kegiatanData = await getKegiatan({
        namaPelapor: filterPelapor !== 'Semua Pelapor' ? filterPelapor : undefined,
        tanggalMulai: filterTanggalMulai || undefined,
        tanggalSelesai: filterTanggalSelesai || undefined,
      });

      // 3. Kelompokkan kegiatan cPanel berdasarkan tanggal & namaPelapor
      const groups = new Map<string, { tanggal: string; namaPelapor: string; items: Activity[] }>();
      for (const k of kegiatanData.records) {
        if (!k.tanggal) continue;
        const key = `${k.tanggal}___${k.namaPelapor || 'Wali Asuh'}`;
        if (!groups.has(key)) {
          groups.set(key, { tanggal: k.tanggal, namaPelapor: k.namaPelapor || 'Wali Asuh', items: [] });
        }
        groups.get(key)!.items.push(k);
      }

      // 4. Merge: pastikan setiap hari yang memiliki kegiatan di cPanel muncul di Riwayat File
      const mergedRecords: FileRecord[] = [...riwayatData.records];
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

          mergedRecords.push({
            id: `cpanel_harian_${g.tanggal}_${encodeURIComponent(g.namaPelapor)}`,
            namaFile: `Kinerja Harian - ${dateFormatted} (${g.items.length} Kegiatan)`,
            jenisLaporan: 'Kinerja Harian',
            namaPelapor: g.namaPelapor,
            pdfUrl: '', // Dinamis di-generate saat klik
            dibuatPada: `${g.tanggal}T12:00:00.000Z`,
            tanggalMulai: g.tanggal,
            tanggalSelesai: g.tanggal,
            rhkNomor: g.items[0]?.rhkKategori || 'RHK 3',
          });
          existingKeys.add(key);
        }
      }

      setRecords(mergedRecords);
    } catch {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  }, [filterPelapor, filterTanggalMulai, filterTanggalSelesai]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      if (id.startsWith('cpanel_')) {
        // Record dinamis dari kegiatan cPanel
        setRecords(prev => prev.filter(r => r.id !== id));
        toast.success('Entri dihapus dari tampilan');
      } else {
        await deleteRiwayat({ id });
        setRecords(prev => prev.filter(r => r.id !== id));
        toast.success('File berhasil dihapus dari riwayat');
      }
    } catch {
      toast.error('Gagal menghapus');
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

  const formatDateTime = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-bold text-foreground">Riwayat File & Laporan</h2>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300 gap-1.5 py-1 px-2.5 font-medium">
              <Database size={13} className="text-emerald-600" />
              Tersinkronisasi Realtime dengan MySQL cPanel
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Semua laporan PDF/Word yang dibuat di HP maupun PC dapat langsung dipratinjau, diunduh, dan diedit
          </p>
        </div>
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
          <CardTitle className="text-base flex items-center justify-between">
            <span>Daftar File ({records.length})</span>
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
          ) : records.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground">Belum ada file atau kegiatan di rentang tanggal ini</p>
              <p className="text-xs text-muted-foreground">Gunakan tombol &quot;Bulan Ini&quot; atau &quot;Semua Tanggal&quot; untuk menampilkan semua data cPanel.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No</TableHead>
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
                    <TableHead>Sumber / Status</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map((r, i) => {
                    const isCpanelLive = r.id.startsWith('cpanel_') || !r.pdfUrl;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-center">{i + 1}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm font-medium line-clamp-1">{r.namaFile || '-'}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {r.rhkNomor && <Badge variant="outline" className="text-[10px]">{r.rhkNomor}</Badge>}
                            {isCpanelLive && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                                Live cPanel
                              </span>
                            )}
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
                          {isCpanelLive ? 'Siap Dicetak / Unduh' : formatDateTime(r.dibuatPada)}
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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Hapus Entri">
                                  <Trash2 size={14} className="text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Entri Laporan?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Entri ini akan dihapus dari daftar riwayat.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(r.id)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
                      <div className="grid grid-cols-5 gap-1.5">
                        {item.photos.map((url, pi) => (
                          <div key={pi} className="relative rounded overflow-hidden border bg-muted">
                            <img src={url} alt={`Foto ${pi + 1}`} className="w-full h-12 object-cover" />
                            <button
                              onClick={() => {
                                const newPhotos = item.photos.filter((_, j) => j !== pi);
                                setEditItems(prev => prev.map(ei => ei.id === item.id ? { ...ei, photos: newPhotos } : ei));
                              }}
                              className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRecord(null)}>Batal</Button>
            <Button onClick={handleSaveAsCopy} disabled={editItems.length === 0} className="gap-2">
              <Copy size={14} /> Salin ke Input Kegiatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewState && (
        <PreviewDialog
          open={previewState.open}
          onClose={() => setPreviewState(null)}
          pdfHtml={previewState.pdfHtml}
          wordHtml={previewState.wordHtml}
          filename={previewState.filename}
          title={previewState.title}
        />
      )}
    </div>
  );
}
