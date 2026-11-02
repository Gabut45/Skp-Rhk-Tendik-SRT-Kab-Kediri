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
import { Trash2, ExternalLink, Loader2, Pencil, Copy, Search, X, ArrowUpDown, ArrowUp, ArrowDown, FileDown, FileText, Eye } from 'lucide-react';
import { getRiwayat, deleteRiwayat, getKegiatan, type GetRiwayatOutputType, type GetKegiatanOutputType } from 'zitejs/api';
import { toast } from 'sonner';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR } from '@/lib/pelapor-data';
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

export default function RiwayatPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const [filterPelapor, setFilterPelapor] = useState(DEFAULT_PELAPOR.nama);
  const [filterTanggalMulai, setFilterTanggalMulai] = useState(startOfMonth);
  const [filterTanggalSelesai, setFilterTanggalSelesai] = useState(endOfMonth);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const getHtmlFromRecord = async (r: FileRecord): Promise<string> => {
    if (!r.pdfUrl) throw new Error('URL file tidak tersedia');
    if (r.pdfUrl.startsWith('data:text/html;charset=utf-8,')) {
      return decodeURIComponent(r.pdfUrl.slice('data:text/html;charset=utf-8,'.length));
    }
    if (r.pdfUrl.startsWith('data:')) {
      const commaIndex = r.pdfUrl.indexOf(',');
      return decodeURIComponent(r.pdfUrl.slice(commaIndex + 1));
    }
    const res = await fetch(r.pdfUrl);
    return await res.text();
  };

  const handleViewPreview = async (r: FileRecord) => {
    try {
      const html = await getHtmlFromRecord(r);
      const fname = (r.namaFile || 'laporan').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      setPreviewState({
        open: true,
        title: r.namaFile || 'Preview Laporan',
        pdfHtml: html,
        wordHtml: html,
        filename: fname,
      });
    } catch (err: any) {
      toast.error('Gagal membuka preview: ' + (err?.message || 'Error'));
    }
  };

  const handleDownloadPdfRecord = async (r: FileRecord) => {
    try {
      toast.info('Menyiapkan unduhan PDF...');
      const html = await getHtmlFromRecord(r);
      const fname = (r.namaFile || 'laporan').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      await downloadPdfFromHtml(html, `${fname}.pdf`);
      toast.success('File PDF berhasil diunduh!');
    } catch (err: any) {
      toast.error('Gagal mengunduh PDF: ' + (err?.message || 'Error'));
    }
  };

  const handleDownloadWordRecord = async (r: FileRecord) => {
    try {
      const html = await getHtmlFromRecord(r);
      const fname = (r.namaFile || 'laporan').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      downloadWordFromHtml(html, `${fname}.doc`);
      toast.success('File Word (.doc) berhasil diunduh!');
    } catch (err: any) {
      toast.error('Gagal mengunduh Word: ' + (err?.message || 'Error'));
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRiwayat({
        namaPelapor: filterPelapor,
        tanggalMulai: filterTanggalMulai || undefined,
        tanggalSelesai: filterTanggalSelesai || undefined,
      });
      setRecords(data.records);
    } catch {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  }, [filterPelapor, filterTanggalMulai, filterTanggalSelesai]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      await deleteRiwayat({ id });
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('File berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const handleEdit = async (record: FileRecord) => {
    setEditRecord(record);
    setLoadingEdit(true);
    try {
      // Fetch kegiatan for this record's date range and pelapor
      const data = await getKegiatan({
        tanggalMulai: record.tanggalMulai || undefined,
        tanggalSelesai: record.tanggalSelesai || undefined,
        namaPelapor: record.namaPelapor || undefined,
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

    // Store edited items in sessionStorage to be picked up by Input Kegiatan
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
    // Sort by tanggalMulai (report date), not dibuatPada (creation timestamp)
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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Riwayat File</h2>
        <p className="text-sm text-muted-foreground">Semua file PDF yang telah dibuat tersimpan di sini</p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <PelaporSelect
              value={filterPelapor}
              onChange={(nama) => setFilterPelapor(nama)}
              label="Filter Pelapor"
              className="min-w-[200px]"
            />
            <div className="space-y-2">
              <Label className="text-sm">Tanggal Mulai</Label>
              <Input
                type="date"
                value={filterTanggalMulai}
                onChange={e => setFilterTanggalMulai(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Tanggal Akhir</Label>
              <Input
                type="date"
                value={filterTanggalSelesai}
                onChange={e => setFilterTanggalSelesai(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Button onClick={fetchData} className="gap-2">
              <Search size={14} /> Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar File ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : records.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Belum ada file yang dibuat</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>
                      <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Tanggal
                        {sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                      </button>
                    </TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm font-medium line-clamp-1">{r.namaFile || '-'}</p>
                        {r.rhkNomor && <Badge variant="outline" className="text-xs mt-1">{r.rhkNomor}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={(r.jenisLaporan === 'Kinerja Harian' ? 'default' : 'secondary') as 'default' | 'secondary'} className="text-xs">
                          {r.jenisLaporan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.namaPelapor}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {r.tanggalMulai
                          ? new Date(r.tanggalMulai + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatDateTime(r.dibuatPada)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {r.pdfUrl && (
                            <>
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
                            </>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(r)} title="Edit & Salin" className="h-8 w-8 p-0">
                            <Pencil size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Hapus File">
                                <Trash2 size={14} className="text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus File?</AlertDialogTitle>
                                <AlertDialogDescription>File akan dihapus dari riwayat.</AlertDialogDescription>
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
                  ))}
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
              Edit deskripsi kegiatan lalu simpan sebagai salinan baru di Input Kegiatan. File asli tidak berubah.
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
