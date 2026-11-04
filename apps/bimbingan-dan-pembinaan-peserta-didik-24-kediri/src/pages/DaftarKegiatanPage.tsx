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
import { getKegiatan, deleteKegiatan, type GetKegiatanOutputType } from 'zitejs/api';
import { toast } from 'sonner';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR } from '@/lib/pelapor-data';

import { deleteCpanelBulkKegiatan } from '@/lib/cpanel-client';

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
      // 1. Data dari storage lokal & backend cPanel merge
      const data = await getKegiatan({
        tanggalMulai: tanggalMulai || undefined,
        tanggalSelesai: tanggalSelesai || undefined,
        namaPelapor: (namaPelapor && namaPelapor !== 'Semua Pelapor') ? namaPelapor : undefined,
      });

      // 2. Fetch cPanel langsung untuk memastikan data paling segar
      const cpanelUrl = localStorage.getItem('cpanel_api_url') || 'https://game.gabutgame.my.id/skp/api_kegiatan.php';
      let combined = [...data.records];

      if (cpanelUrl) {
        try {
          const params = new URLSearchParams({ action: 'get_kegiatan' });
          if (tanggalMulai) params.append('tanggalMulai', tanggalMulai);
          if (tanggalSelesai) params.append('tanggalSelesai', tanggalSelesai);
          if (namaPelapor && namaPelapor !== 'Semua Pelapor') params.append('namaPelapor', namaPelapor);

          const cpanelKey = localStorage.getItem('cpanel_api_key') || '';
          const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}${params.toString()}`;

          const res = await fetch(targetUrl, {
            headers: cpanelKey ? { 'X-API-KEY': cpanelKey } : {},
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.records)) {
              const remoteRecords: Activity[] = json.records.map((r: any) => ({
                id: String(r.id || `keg_${r.id_kegiatan}`),
                namaPelapor: r.nama_pelapor || r.namaPelapor,
                nip: r.nip,
                tanggal: r.tanggal,
                waktuMulai: r.waktu_mulai || r.waktuMulai,
                waktuSelesai: r.waktu_selesai || r.waktuSelesai,
                kataKunciKegiatan: r.kata_kunci_kegiatan || r.kataKunciKegiatan,
                deskripsiKegiatan: r.deskripsi_kegiatan || r.deskripsiKegiatan,
                rhkKategori: r.rhk_kategori || r.rhkKategori,
                fotoKegiatan: Array.isArray(r.foto_kegiatan) ? r.foto_kegiatan : (r.fotoKegiatan || []),
                tandaTangan: Array.isArray(r.tanda_tangan) ? r.tanda_tangan : (r.tandaTangan || []),
                unitKerja: r.unit_kerja || r.unitKerja,
              }));

              const map = new Map<string, Activity>();
              for (const r of remoteRecords) map.set(r.id, r);
              for (const r of combined) {
                if (!map.has(r.id)) map.set(r.id, r);
              }
              combined = Array.from(map.values());
            }
          }
        } catch (cpanelErr) {
          console.warn('Direct cPanel fetch fallback:', cpanelErr);
        }
      }

      // Filter out manually deleted IDs
      try {
        const deletedRaw = localStorage.getItem('cpanel_deleted_ids');
        if (deletedRaw) {
          const deletedSet = new Set(JSON.parse(deletedRaw));
          combined = combined.filter(r => !deletedSet.has(r.id));
        }
      } catch {
        // ignore
      }

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
      await deleteKegiatan({ id });

      // Mark in local deleted store
      try {
        const deletedRaw = localStorage.getItem('cpanel_deleted_ids');
        const deletedArr: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedArr.includes(id)) {
          deletedArr.push(id);
          localStorage.setItem('cpanel_deleted_ids', JSON.stringify(deletedArr));
        }
      } catch {
        // ignore
      }

      setRecords(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });

      // Hapus juga di cPanel jika endpoint tersedia
      const cpanelUrl = localStorage.getItem('cpanel_api_url') || 'https://game.gabutgame.my.id/skp/api_kegiatan.php';
      if (cpanelUrl) {
        const cpanelKey = localStorage.getItem('cpanel_api_key') || '';
        fetch(`${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}&action=delete_kegiatan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cpanelKey ? { 'X-API-KEY': cpanelKey } : {}),
          },
          body: JSON.stringify({ id }),
        }).catch(() => {});
      }

      toast.success('Kegiatan berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus');
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
      toast.info(`Menghapus ${ids.length} kegiatan secara permanen dari server...`);
      await Promise.allSettled(ids.map(id => deleteKegiatan({ id })));
      await deleteCpanelBulkKegiatan(ids);

      setRecords(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      toast.success(`${ids.length} kegiatan berhasil dihapus permanen dari server`);
    } catch {
      toast.error('Gagal menghapus beberapa kegiatan');
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
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
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
          </div>
        )}
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
