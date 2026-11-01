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
      const data = await getKegiatan({ tanggalMulai, tanggalSelesai, namaPelapor });
      setRecords(data.records);
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
