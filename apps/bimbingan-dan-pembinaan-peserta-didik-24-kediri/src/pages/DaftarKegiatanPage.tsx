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

type Activity = GetKegiatanOutputType['records'][0];

export default function DaftarKegiatanPage() {
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();
  const [records, setRecords] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalSelesai, setTanggalSelesai] = useState(today);
  const [namaPelapor, setNamaPelapor] = useState(DEFAULT_PELAPOR.nama);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      // 1. Data dari storage lokal
      const localData = await getKegiatan({ tanggalMulai, tanggalSelesai, namaPelapor });
      let combined = [...localData.records];

      // 2. Data dari cPanel MySQL
      const cpanelUrl = localStorage.getItem('cpanel_api_url') || 'https://game.gabutgame.my.id/skp/api_kegiatan.php';
      if (cpanelUrl) {
        try {
          const params = new URLSearchParams({ action: 'get_kegiatan' });
          if (tanggalMulai) params.append('tanggalMulai', tanggalMulai);
          if (tanggalSelesai) params.append('tanggalSelesai', tanggalSelesai);
          if (namaPelapor) params.append('namaPelapor', namaPelapor);

          const cpanelKey = localStorage.getItem('cpanel_api_key') || '';
          const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}${params.toString()}`;

          const res = await fetch(targetUrl, {
            headers: cpanelKey ? { 'X-API-KEY': cpanelKey } : {},
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.records)) {
              const remoteRecords: Activity[] = json.records.map((r: any) => ({
                id: r.id || `keg_${r.id_kegiatan}`,
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

              // Gabungkan tanpa duplikat ID
              const remoteMap = new Map(remoteRecords.map(r => [r.id, r]));
              combined.forEach(loc => {
                if (!remoteMap.has(loc.id)) {
                  remoteRecords.push(loc);
                }
              });
              combined = remoteRecords;
            }
          }
        } catch (cpanelErr) {
          console.warn('Gagal memuat cPanel, menggunakan data lokal:', cpanelErr);
        }
      }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Daftar Kegiatan Harian</h2>
          <p className="text-sm text-muted-foreground">Lihat dan kelola semua kegiatan yang sudah diinput</p>
        </div>
        {selectedIds.size > 0 && (
          <Button onClick={handleCopyToInput} className="gap-2">
            <Copy size={14} /> Salin {selectedIds.size} Kegiatan ke Input
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <PelaporSelect
              value={namaPelapor}
              onChange={(nama) => setNamaPelapor(nama)}
              label="Pelapor"
              className="min-w-[200px]"
            />
            <div className="space-y-1">
              <Label className="text-xs">Dari Tanggal</Label>
              <Input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sampai Tanggal</Label>
              <Input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)} className="w-40" />
            </div>
            <Button onClick={fetchData} className="gap-2">
              <Search size={14} /> Cari
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
            <p className="text-center text-muted-foreground py-12">Belum ada kegiatan di rentang tanggal ini</p>
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
                    <TableHead>Waktu</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>RHK</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead className="w-10"></TableHead>
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
                      <TableCell className="whitespace-nowrap">{formatDate(r.tanggal)}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{r.waktuMulai}-{r.waktuSelesai}</TableCell>
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
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Trash2 size={14} className="text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Kegiatan?</AlertDialogTitle>
                              <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(r.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
