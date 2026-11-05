import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Badge } from '@project/components/ui/badge';
import { Checkbox } from '@project/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { Trash2, Search, Loader2, ImageIcon, Copy } from 'lucide-react';
import { getKegiatan, deleteKegiatan, deleteRiwayat, type GetKegiatanOutputType } from 'zitejs/api';
import { toast } from 'sonner';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR } from '@/lib/pelapor-data';

import {
  deleteCpanelBulkKegiatan,
  deleteCpanelKegiatan,
  purgeLocalStorageTable,
  getCpanelConfig,
  isAppDeletedAll,
  getDeletedIds,
  isClientRecordDeleted,
  purgeAllLocalData,
  purgeLocalDataForRiwayat,
} from '@/lib/cpanel-client';

type Activity = GetKegiatanOutputType['records'][0];

function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DaftarKegiatanPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const startOfMonth = `${year}-${month}-01`;
  const endOfMonth = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  const today = getLocalDateString(now);

  const navigate = useNavigate();
  const [records, setRecords] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tanggalMulai, setTanggalMulai] = useState(startOfMonth);
  const [tanggalSelesai, setTanggalSelesai] = useState(endOfMonth);
  const [namaPelapor, setNamaPelapor] = useState('Semua Pelapor');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      if (isAppDeletedAll()) {
        setRecords([]);
        setLoading(false);
        return;
      }

      const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();
      const deletedIdsArr = Array.from(getDeletedIds());

      // 1. Data dari storage lokal & backend cPanel dengan deduplikasi terpusat
      const data = await getKegiatan({
        tanggalMulai: tanggalMulai || undefined,
        tanggalSelesai: tanggalSelesai || undefined,
        namaPelapor: (namaPelapor && namaPelapor !== 'Semua Pelapor') ? namaPelapor : undefined,
        deletedIds: deletedIdsArr,
        cpanelUrl,
        cpanelKey,
      });

      // 2. Terapkan deduplikasi ketat berdasarkan ID dan Konten (Fingerprint)
      const byFingerprint = new Map<string, Activity>();
      const seenIds = new Set<string>();

      for (const r of data.records) {
        if (!r || isClientRecordDeleted(r)) continue;

        const id = String(r.id || '');
        if (id && seenIds.has(id)) continue;

        const tgl = String(r.tanggal || '').trim();
        const pelapor = String(r.namaPelapor || '').trim().toLowerCase();
        const mulai = String(r.waktuMulai || '').trim();
        const selesai = String(r.waktuSelesai || '').trim();
        const desc = String(r.deskripsiKegiatan || r.kataKunciKegiatan || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const fp = `${tgl}::${pelapor}::${mulai}::${selesai}::${desc}`;

        if (!byFingerprint.has(fp)) {
          if (id) seenIds.add(id);
          byFingerprint.set(fp, r);
        } else {
          // Jika ada rekaman yang sama, simpan yang memiliki foto lebih banyak
          const existing = byFingerprint.get(fp)!;
          if ((r.fotoKegiatan?.length || 0) > (existing.fotoKegiatan?.length || 0)) {
            byFingerprint.set(fp, r);
          }
        }
      }

      let combined = Array.from(byFingerprint.values()).filter(r => !isClientRecordDeleted(r));

      // Sort by date DESC then time DESC for comfortable overview
      combined.sort((a, b) => {
        const dateA = a.tanggal || '';
        const dateB = b.tanggal || '';
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        const timeA = a.waktuMulai || '';
        const timeB = b.waktuMulai || '';
        return timeB.localeCompare(timeA);
      });

      setRecords(combined);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [tanggalMulai, tanggalSelesai, namaPelapor]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();
      const targetRecord = records.find(r => r.id === id);

      // 1. Hapus dari backend zite & server MySQL cPanel
      await deleteKegiatan({
        id,
        tanggal: targetRecord?.tanggal,
        namaPelapor: targetRecord?.namaPelapor,
        rhkNomor: targetRecord?.rhkKategori,
        cpanelUrl,
        cpanelKey,
      });

      // 2. Hapus langsung via client cPanel
      await deleteCpanelKegiatan({
        id,
        tanggal: targetRecord?.tanggal,
        namaPelapor: targetRecord?.namaPelapor,
      });

      // 3. Purge dari browser localStorage dan tandai cascade
      purgeLocalDataForRiwayat({
        recordId: id,
        tanggal: targetRecord?.tanggal,
        namaPelapor: targetRecord?.namaPelapor,
        rhkNomor: targetRecord?.rhkKategori,
        deletedActivityIds: [id],
      });

      // 4. Update UI
      setRecords(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });

      toast.success('Kegiatan berhasil dihapus secara permanen dari daftar, riwayat, dan laporan RHK');
    } catch {
      toast.error('Gagal menghapus kegiatan');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map(r => r.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      toast.info(`Menghapus ${ids.length} kegiatan secara permanen dari server dan penyimpanan...`);
      const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();

      // 1. Hapus di backend
      await deleteKegiatan({ ids, cpanelUrl, cpanelKey });

      // 2. Hapus di cPanel MySQL
      await deleteCpanelBulkKegiatan({ ids });

      // 3. Purge dari browser localStorage dan tandai cascade
      purgeLocalDataForRiwayat({ deletedActivityIds: ids });

      // 4. Update UI
      setRecords(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      toast.success(`${ids.length} kegiatan berhasil dihapus permanen`);
    } catch {
      toast.error('Gagal menghapus beberapa kegiatan');
    }
  };

  const handleDeleteAll = async () => {
    try {
      toast.info('Menghapus SEMUA kegiatan harian secara permanen...');
      const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();

      await deleteKegiatan({ deleteAll: true, cpanelUrl, cpanelKey });
      await deleteRiwayat({ deleteAll: true, cpanelUrl, cpanelKey });

      purgeAllLocalData();
      setRecords([]);
      setSelectedIds(new Set());

      toast.success('Semua kegiatan harian dan berkas riwayat telah terhapus bersih selamanya!');
    } catch (err: any) {
      toast.error('Gagal menghapus semua kegiatan: ' + (err?.message || 'Error'));
    }
  };

  const handleCopyToInput = () => {
    const selected = records.filter(r => selectedIds.has(r.id));
    if (selected.length === 0) return toast.error('Pilih minimal 1 kegiatan');

    const items = selected.map(r => ({
      id: crypto.randomUUID(),
      waktuMulai: r.waktuMulai || '',
      waktuSelesai: r.waktuSelesai || '',
      kataKunci: r.kataKunciKegiatan || '',
      deskripsi: r.deskripsiKegiatan || '',
      rhk: r.rhkKategori || '',
      photos: (r.fotoKegiatan || []).map(f => f.url),
    }));

    // Store in sessionStorage for the input page to pick up
    sessionStorage.setItem('__copiedKegiatan', JSON.stringify(items));
    toast.success(`${items.length} kegiatan disalin ke Input Kegiatan`);
    navigate('/kegiatan-harian');
  };

  const formatDate = (d?: string) => {
    if (!d) return '-';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleCopySingle = (r: Activity) => {
    const item = {
      id: crypto.randomUUID(),
      waktuMulai: r.waktuMulai || '',
      waktuSelesai: r.waktuSelesai || '',
      kataKunci: r.kataKunciKegiatan || '',
      deskripsi: r.deskripsiKegiatan || '',
      rhk: r.rhkKategori || '',
      photos: (r.fotoKegiatan || []).map(f => f.url),
    };
    sessionStorage.setItem('__copiedKegiatan', JSON.stringify([item]));
    toast.success('1 kegiatan disalin ke form Input Kegiatan');
    navigate('/kegiatan-harian');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-bold text-foreground">Daftar Kegiatan Harian</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lihat, kelola, dan salin kegiatan yang sudah diinput dari semua perangkat secara langsung
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <>
              <Button onClick={handleCopyToInput} size="sm" className="gap-1.5 text-xs">
                <Copy size={14} /> Salin {selectedIds.size} Kegiatan
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1.5 text-xs">
                    <Trash2 size={14} /> Hapus {selectedIds.size} Kegiatan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">Hapus {selectedIds.size} Kegiatan Terpilih?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Kegiatan yang dipilih akan dihapus secara permanen dari server dan database. Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
                      Hapus Permanen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30">
                <Trash2 size={14} /> Hapus Semua Kegiatan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">Hapus SEMUA Kegiatan Harian?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Tindakan ini akan menghapus <strong>seluruh kegiatan harian</strong> dan berkas riwayat secara permanen dari server database dan perangkat lokal.
                    </p>
                    <p className="text-xs text-destructive font-semibold">
                      PERINGATAN: Seluruh kegiatan akan terhapus bersih dan tidak dapat dipulihkan!
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
                  Ya, Bersihkan Semua Kegiatan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <PelaporSelect
              value={namaPelapor}
              onChange={(nama) => setNamaPelapor(nama)}
              label="Pelapor"
              className="min-w-[240px]"
              allowAll
            />
            <div className="space-y-1">
              <Label className="text-xs">Dari Tanggal</Label>
              <Input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sampai Tanggal</Label>
              <Input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)} className="w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchData} className="gap-2">
                <Search size={14} /> Cari
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">Preset Cepat:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setTanggalMulai(startOfMonth);
                setTanggalSelesai(endOfMonth);
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
                setTanggalMulai(today);
                setTanggalSelesai(today);
              }}
            >
              Hari Ini ({formatDate(today)})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setTanggalMulai('');
                setTanggalSelesai('');
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
            <span>Hasil ({records.length} kegiatan)</span>
            {selectedIds.size > 0 && (
              <span className="text-sm font-normal text-muted-foreground">{selectedIds.size} dipilih</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground">Belum ada kegiatan di rentang tanggal ini</p>
              <p className="text-xs text-muted-foreground">Coba ubah tanggal atau klik tombol &quot;Bulan Ini&quot; / &quot;Semua Tanggal&quot; di atas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.size === records.length && records.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>RHK</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, i) => (
                    <TableRow key={r.id} className={selectedIds.has(r.id) ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(r.id)}
                          onCheckedChange={() => toggleSelect(r.id)}
                        />
                      </TableCell>
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">{formatDate(r.tanggal)}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground max-w-[140px] truncate" title={r.namaPelapor}>
                        {r.namaPelapor || '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">{r.waktuMulai}-{r.waktuSelesai}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm line-clamp-2">{r.deskripsiKegiatan}</p>
                      </TableCell>
                      <TableCell>{r.rhkKategori && <Badge variant="outline" className="text-xs">{r.rhkKategori}</Badge>}</TableCell>
                      <TableCell>
                        {(r.fotoKegiatan?.length || 0) > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ImageIcon size={14} />
                            <span className="text-xs">{r.fotoKegiatan?.length}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopySingle(r)}
                            title="Salin kegiatan ke Form Input"
                            className="h-8 w-8 p-0"
                          >
                            <Copy size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Hapus Kegiatan">
                                <Trash2 size={14} className="text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Kegiatan?</AlertDialogTitle>
                                <AlertDialogDescription>Tindakan ini akan menghapus kegiatan dari database.</AlertDialogDescription>
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
    </div>
  );
}
