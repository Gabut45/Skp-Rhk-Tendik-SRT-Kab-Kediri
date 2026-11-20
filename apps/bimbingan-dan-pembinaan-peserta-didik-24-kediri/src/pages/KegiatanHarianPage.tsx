import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Plus, Upload, X, Eye, Save, Loader2, PlusCircle, FileDown, Edit3 } from 'lucide-react';
import { saveBulkKegiatan, previewHarian, generatePdfHarian, getKegiatan } from 'zitejs/api';
import { uploadFile } from 'zitejs/upload';
import { toast } from 'sonner';
import KegiatanForm, { KegiatanItem } from '@/components/KegiatanForm';
import PreviewDialog from '@/components/PreviewDialog';
import PelaporSelect from '@/components/PelaporSelect';
import { DEFAULT_PELAPOR, getSavedTtd, getSavedTtdAsync, saveTtd, removeTtd, matchPelapor, findPelaporByNama } from '@/lib/pelapor-data';
import { downloadPdfFromHtml, downloadWordFromHtml } from '@/lib/download-helper';

import { useAuth } from '@/lib/auth-context';
import { compressSignature } from '@/lib/compress-image';
import { setAppDeletedAll } from '@/lib/cpanel-client';

interface EditContext {
  originTanggal: string;
  originNamaPelapor: string;
  originRecordId?: string;
  originIds: string[];
}

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
  const [editContext, setEditContext] = useState<EditContext | null>(null);
  const editContextRef = useRef<EditContext | null>(null);

  useEffect(() => {
    if (editContextRef.current) return;
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
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfHtml, setPreviewPdfHtml] = useState('');
  const [previewWordHtml, setPreviewWordHtml] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [quickPdf, setQuickPdf] = useState(false);
  const ttdRef = useRef<HTMLInputElement>(null);

  // Pick up copied kegiatan from Daftar Kegiatan or Riwayat (including Edit & Replace mode)
  useEffect(() => {
    const stored = sessionStorage.getItem('__copiedKegiatan');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          editContextRef.current = null;
          setEditContext(null);
          setKegiatanList(parsed as KegiatanItem[]);
          toast.success(`${parsed.length} kegiatan berhasil dimuat`);
        } else if (parsed && parsed.mode === 'edit' && Array.isArray(parsed.items) && parsed.items.length > 0) {
          const ctx: EditContext = {
            originTanggal: parsed.originTanggal || today,
            originNamaPelapor: parsed.originNamaPelapor || initialNama,
            originRecordId: parsed.originRecordId,
            originIds: Array.isArray(parsed.originIds) ? parsed.originIds : parsed.items.map((i: any) => i.id).filter(Boolean),
          };
          editContextRef.current = ctx;
          setEditContext(ctx);
          setTanggal(ctx.originTanggal);
          setNamaPelapor(ctx.originNamaPelapor);
          const matchedPel = findPelaporByNama(ctx.originNamaPelapor) || matchPelapor(ctx.originNamaPelapor);
          if (matchedPel?.nip) setNip(matchedPel.nip);
          const localTtd = getSavedTtd(ctx.originNamaPelapor);
          setTandaTangan(localTtd || null);
          if (!localTtd) {
            getSavedTtdAsync(ctx.originNamaPelapor).then(t => {
              if (t) setTandaTangan(t);
            });
          }
          setKegiatanList(parsed.items as KegiatanItem[]);
          toast.info(`Mode Edit Laporan (${ctx.originTanggal} — ${ctx.originNamaPelapor}) aktif. Ubah kegiatan/foto lalu klik Simpan.`);
        }
      } catch { /* ignore */ }
      sessionStorage.removeItem('__copiedKegiatan');
    }
  }, []);

  const cancelEditMode = () => {
    editContextRef.current = null;
    setEditContext(null);
    setKegiatanList(prev => prev.map(k => ({
      ...k,
      id: crypto.randomUUID(),
      copiedPhotoUrls: k.photos.length > 0 ? [...k.photos] : undefined,
    })));
    toast.info('Mode Edit dibatalkan — disimpan sebagai laporan baru');
  };

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
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) setTandaTangan(effectiveTtd);
      }

      const result = await previewHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: effectiveTtd || undefined,
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

  const syncKegiatanToCpanelAndGetUrls = async (filled: KegiatanItem[]): Promise<KegiatanItem[]> => {
    try {
      const cpanelUrl = localStorage.getItem('cpanel_api_url') || undefined;
      const cpanelKey = localStorage.getItem('cpanel_api_key') || undefined;

      // Auto-resolve preset tanda tangan dari server database jika belum terisi di form
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) {
          setTandaTangan(effectiveTtd);
        }
      }

      // 0. Pastikan foto berformat base64 diunggah ke cPanel File Manager terlebih dahulu
      const preparedList: KegiatanItem[] = [];
      for (const item of filled) {
        const uploadedPhotos: string[] = [];
        for (const p of item.photos) {
          if (p.startsWith('http')) {
            uploadedPhotos.push(p);
          } else if (p.startsWith('data:image/')) {
            try {
              const res = await uploadFile({ data: p, filename: `keg_${item.id}.jpg` });
              uploadedPhotos.push(res.fileUrl || p);
            } catch {
              uploadedPhotos.push(p);
            }
          }
        }
        preparedList.push({ ...item, photos: uploadedPhotos });
      }

      const payloadKegiatan = preparedList.map((k, idx) => ({
        id: k.id,
        waktuMulai: k.waktuMulai,
        waktuSelesai: k.waktuSelesai,
        kataKunciKegiatan: k.kataKunci,
        deskripsiKegiatan: k.deskripsi,
        rhkKategori: k.rhk || 'RHK 3',
        fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        copiedPhotoUrls: k.copiedPhotoUrls && k.copiedPhotoUrls.length > 0 ? k.copiedPhotoUrls : undefined,
        urutan: idx,
      }));

      const activeEditCtx = editContextRef.current || editContext;

      // 1. Simpan ke database MySQL & upload/duplikasi foto ke File Manager cPanel (uploads/YYYY/MM/...)
      const saveRes = await saveBulkKegiatan({
        namaPelapor,
        nip,
        tanggal,
        tandaTangan: effectiveTtd || undefined,
        cpanelUrl,
        cpanelKey,
        replaceExisting: Boolean(activeEditCtx),
        replaceOriginTanggal: activeEditCtx?.originTanggal,
        replaceOriginNamaPelapor: activeEditCtx?.originNamaPelapor,
        replaceOriginIds: activeEditCtx?.originIds,
        kegiatan: payloadKegiatan,
      });

      if (!saveRes.success || saveRes.cpanelSynced === false) {
        throw new Error(saveRes.message || 'Gagal tersinkron ke server cPanel MySQL');
      }

      setAppDeletedAll(false);

      // Bersihkan cache sesi agar halaman Riwayat & Daftar Kegiatan langsung memuat versi terbaru
      try {
        Object.keys(sessionStorage).forEach(k => {
          if (k.startsWith('__cache_riwayat_') || k.startsWith('__cache_keg_')) {
            sessionStorage.removeItem(k);
          }
        });
      } catch {}

      const savedMap = new Map<string, string[]>();
      if (Array.isArray(saveRes.savedItems)) {
        for (const si of saveRes.savedItems) {
          savedMap.set(si.id, si.fotoKegiatan);
        }
      }

      // 2. Ambil data tersimpan dari savedItems terlebih dahulu (presisi 1:1 per ID, termasuk jika semua foto dihapus menjadi [])
      let updatedList = preparedList.map((localItem) => {
        const clonedOrSavedUrls = savedMap.get(localItem.id);
        return {
          ...localItem,
          photos: clonedOrSavedUrls !== undefined ? clonedOrSavedUrls : localItem.photos,
          copiedPhotoUrls: undefined,
        };
      });

      // Verifikasi ulang dari server HANYA mencocokkan berdasarkan exact ID (r.id === localItem.id),
      // JANGAN pernah mencocokkan berdasarkan waktuMulai/waktuSelesai agar baris lama tidak menimpa foto baru
      try {
        const kegData = await getKegiatan({
          tanggalMulai: tanggal,
          tanggalSelesai: tanggal,
          namaPelapor: namaPelapor,
          cpanelUrl,
          cpanelKey,
        });

        if (kegData && Array.isArray(kegData.records) && kegData.records.length > 0) {
          const serverById = new Map<string, any>();
          for (const rec of kegData.records) {
            if (rec?.id) serverById.set(String(rec.id), rec);
          }

          updatedList = updatedList.map((localItem) => {
            const matched = serverById.get(String(localItem.id));
            if (matched) {
              const urls = (matched.fotoKegiatan || [])
                .map((p: any) => (typeof p === 'string' ? p : p?.url || ''))
                .filter((u: string) => Boolean(u && u.startsWith('http')));
              return { ...localItem, photos: urls, copiedPhotoUrls: undefined };
            }
            return localItem;
          });
        }
      } catch { /* fallback ke savedItems */ }

      // Jika sedang dalam Mode Edit, perbarui editContext dengan ID & tanggal/pelapor terbaru agar penyimpanan/cetak ulang berikutnya tetap konsisten menggantikan versi ini
      if (activeEditCtx) {
        const nextCtx: EditContext = {
          originTanggal: tanggal,
          originNamaPelapor: namaPelapor,
          originRecordId: activeEditCtx.originRecordId,
          originIds: updatedList.map(u => u.id),
        };
        editContextRef.current = nextCtx;
        setEditContext(nextCtx);
      }

      // Update state form agar memegang URL foto File Manager yang baru & berdiri sendiri
      setKegiatanList((prev) =>
        prev.map((item) => {
          const up = updatedList.find((u) => u.id === item.id);
          return up || item;
        })
      );

      return updatedList;
    } catch (err: any) {
      console.warn('Sync kegiatan ke cPanel warning:', err);
      throw err;
    }
  };

  const handleSaveAll = async () => {
    const filled = getFilledKegiatan();
    if (filled.length === 0) return toast.error('Isi minimal 1 kegiatan lengkap');
    setSaving(true);
    try {
      const isEditReplace = Boolean(editContextRef.current || editContext);
      const totalPhotos = filled.reduce((acc, k) => acc + (k.photos?.length || 0), 0);
      toast.info(
        isEditReplace
          ? `Memperbarui laporan & mengganti ${totalPhotos} foto dokumentasi terbaru ke cPanel...`
          : `Menyimpan kegiatan & mengunggah ${totalPhotos} foto ke File Manager cPanel...`,
        { duration: 2500 }
      );

      const updated = await syncKegiatanToCpanelAndGetUrls(filled);

      toast.success(
        isEditReplace
          ? `Laporan berhasil diperbarui! ${updated.length} kegiatan & foto dokumentasi terbaru menggantikan data lama.`
          : `${updated.length} kegiatan & foto dokumentasi berhasil tersimpan di File Manager cPanel dan database!`,
        { duration: 4000 }
      );
    } catch (err: any) {
      toast.error('Gagal menyimpan kegiatan: ' + (err?.message || 'Kesalahan sistem'));
    } finally {
      setSaving(false);
    }
  };

  const getSafePelapor = () => (namaPelapor || '').replace(/[/\\:*?"<>|]/g, '').trim();
  const getReportFileName = (ext: 'pdf' | 'doc') => {
    const safe = getSafePelapor();
    return safe ? `kinerja-harian-${tanggal}-${safe}.${ext}` : `kinerja-harian-${tanggal}.${ext}`;
  };
  const getReportFileBase = () => {
    const safe = getSafePelapor();
    return safe ? `kinerja-harian-${tanggal}-${safe}` : `kinerja-harian-${tanggal}`;
  };

  const handleDownloadPdf = async () => {
    const filled = getFilledKegiatan();
    if (filled.length === 0) return toast.error('Isi minimal 1 kegiatan lengkap');
    setDownloadingPdf(true);
    try {
      // Auto-resolve preset tanda tangan jika belum terisi di form
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) setTandaTangan(effectiveTtd);
      }

      // 1. Pastikan foto terupload ke File Manager cPanel dahulu
      toast.info('Menyiapkan foto dokumentasi di File Manager server...');
      const readyKegiatan = await syncKegiatanToCpanelAndGetUrls(filled);

      const result = await generatePdfHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: effectiveTtd || undefined,
        format: 'pdf',
        kegiatan: readyKegiatan.map(k => ({
          waktuMulai: k.waktuMulai,
          waktuSelesai: k.waktuSelesai,
          deskripsiKegiatan: k.deskripsi,
          rhkKategori: k.rhk || undefined,
          fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        })),
      });
      await downloadPdfFromHtml(result.pdfHtml || previewPdfHtml, getReportFileName('pdf'));
      toast.success('File PDF berhasil dibuat & diunduh, lengkap dengan foto dokumentasi!');
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
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) setTandaTangan(effectiveTtd);
      }

      toast.info('Menyiapkan dokumen Word...');
      const readyKegiatan = await syncKegiatanToCpanelAndGetUrls(filled);

      const result = await generatePdfHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: effectiveTtd || undefined,
        format: 'word',
        kegiatan: readyKegiatan.map(k => ({
          waktuMulai: k.waktuMulai,
          waktuSelesai: k.waktuSelesai,
          deskripsiKegiatan: k.deskripsi,
          rhkKategori: k.rhk || undefined,
          fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        })),
      });
      downloadWordFromHtml(result.wordHtml || previewWordHtml, getReportFileName('doc'));
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
      let effectiveTtd = tandaTangan;
      if (!effectiveTtd) {
        effectiveTtd = (await getSavedTtdAsync(namaPelapor)) || null;
        if (effectiveTtd) setTandaTangan(effectiveTtd);
      }

      toast.info('Memproses cetak PDF & mengunggah foto ke server...');
      const readyKegiatan = await syncKegiatanToCpanelAndGetUrls(filled);

      const result = await generatePdfHarian({
        tanggal, namaPelapor, nip,
        tandaTangan: effectiveTtd || undefined,
        format: 'pdf',
        kegiatan: readyKegiatan.map(k => ({
          waktuMulai: k.waktuMulai,
          waktuSelesai: k.waktuSelesai,
          deskripsiKegiatan: k.deskripsi,
          rhkKategori: k.rhk || undefined,
          fotoKegiatan: k.photos.length > 0 ? k.photos : undefined,
        })),
      });
      await downloadPdfFromHtml(result.pdfHtml || previewPdfHtml, getReportFileName('pdf'));
      toast.success('File PDF berhasil dibuat & diunduh, lengkap dengan foto dokumentasi!');
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
            {editContext ? 'Simpan Perubahan' : 'Simpan Semua'}
          </Button>
        </div>
      </div>

      {editContext && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-sm">
            <Edit3 size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Mode Edit & Perbarui Laporan Aktif</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Anda sedang mengedit laporan tanggal <strong>{editContext.originTanggal}</strong> ({editContext.originNamaPelapor}).
                Saat Anda menekan <strong>Simpan Perubahan</strong> atau <strong>Cetak PDF</strong>, seluruh data, urutan, dan foto lama akan digantikan dengan versi terbaru ini.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cancelEditMode}
            className="shrink-0 border-amber-400 bg-white hover:bg-amber-100 text-amber-950 text-xs"
          >
            Batal Mode Edit
          </Button>
        </div>
      )}

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
          {editContext ? `Simpan Perubahan (${getFilledKegiatan().length})` : `Simpan (${getFilledKegiatan().length})`}
        </Button>
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        pdfHtml={previewPdfHtml}
        wordHtml={previewWordHtml}
        filename={getReportFileBase()}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        downloadingPdf={downloadingPdf}
        downloadingWord={downloadingWord}
        title="Preview Kinerja Harian"
      />
    </div>
  );
}
