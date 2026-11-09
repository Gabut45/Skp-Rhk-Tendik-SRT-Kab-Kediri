import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Badge } from '@project/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@project/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@project/components/ui/alert-dialog';
import { Shield, ShieldCheck, UserPlus, Users, Key, Pencil, Trash2, Eye, EyeOff, Copy, Check, Database, Search, PenTool, UploadCloud, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth, StoredAccount } from '@/lib/auth-context';
import { PELAPOR_LIST, getServerPresetMap, saveServerPresetLocalCache, syncServerPresets, findInMapFuzzy } from '@/lib/pelapor-data';
import { saveCpanelPresetTtd } from '@/lib/cpanel-client';
import { compressSignature } from '@/lib/compress-image';
import { uploadFile } from 'zitejs/upload';
import { toast } from 'sonner';
import CpanelModal from '@/components/CpanelModal';

export default function KelolaPenggunaPage() {
  const {
    user,
    getAccountsList,
    updateSuperAdminCredentials,
    createWaliAsuh,
    updateWaliAsuh,
    deleteWaliAsuh,
    syncRemoteAccounts,
    isSyncingRemote,
  } = useAuth();

  const accounts = getAccountsList();
  const superAdminAccount = accounts.find(a => a.role === 'super_admin');
  const waliAsuhAccounts = accounts.filter(a => a.role === 'wali_asuh');

  // State untuk form edit Super Admin
  const [adminUsername, setAdminUsername] = useState(superAdminAccount?.username || 'adminskp');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminNama, setAdminNama] = useState(superAdminAccount?.nama || 'Super Administrator SKP');
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);

  // State untuk Tambah / Edit Wali Asuh
  const [waliDialogOpen, setWaliDialogOpen] = useState(false);
  const [editingWaliId, setEditingWaliId] = useState<string | null>(null);
  const [formNama, setFormNama] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showDialogPass, setShowDialogPass] = useState(false);
  const [savingWali, setSavingWali] = useState(false);
  const [loadingSyncAccounts, setLoadingSyncAccounts] = useState(false);

  // State untuk Preset Tanda Tangan Wali Asuh (Database Server)
  const [serverPresets, setServerPresets] = useState<Record<string, string>>(() => getServerPresetMap());
  const [loadingSyncPresets, setLoadingSyncPresets] = useState(false);
  const [uploadingTargetNama, setUploadingTargetNama] = useState<string | null>(null);
  const [activePresetTarget, setActivePresetTarget] = useState<{ nama: string; nip?: string } | null>(null);
  const [searchPresetQuery, setSearchPresetQuery] = useState('');
  const [deletePresetTarget, setDeletePresetTarget] = useState<{ nama: string } | null>(null);
  const presetFileInputRef = useRef<HTMLInputElement>(null);

  // State untuk hapus akun
  const [deleteTarget, setDeleteTarget] = useState<StoredAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // State filter pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [cpanelModalOpen, setCpanelModalOpen] = useState(false);

  // Toggle show password per baris
  const toggleRowPassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard`);
  };

  // Simpan perubahan kredensial Super Admin
  const handleSaveSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim()) {
      toast.error('Username Super Admin tidak boleh kosong');
      return;
    }

    setSavingAdmin(true);
    try {
      const res = await updateSuperAdminCredentials(adminUsername, adminPassword || undefined, adminNama);
      if (res.success) {
        toast.success(res.message);
        setAdminPassword('');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan kredensial Super Admin');
    } finally {
      setSavingAdmin(false);
    }
  };

  // Buka dialog tambah akun baru
  const handleOpenAddDialog = () => {
    setEditingWaliId(null);
    setFormNama('');
    setFormNip('');
    setFormUsername('');
    setFormPassword('');
    setShowDialogPass(false);
    setWaliDialogOpen(true);
  };

  // Buka dialog edit akun wali asuh
  const handleOpenEditDialog = (account: StoredAccount) => {
    setEditingWaliId(account.id);
    setFormNama(account.nama);
    setFormNip(account.nip || '');
    setFormUsername(account.username);
    setFormPassword(account.password);
    setShowDialogPass(false);
    setWaliDialogOpen(true);
  };

  // Pilih dari template nama pelapor resmi
  const handleSelectPresetPelapor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const found = PELAPOR_LIST.find(p => p.nama === val);
    if (found) {
      setFormNama(found.nama);
      setFormNip(found.nip);
      if (!formUsername) {
        const clean = found.nama.split(/[\s,.]+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        setFormUsername(clean);
      }
    }
  };

  // Simpan akun Wali Asuh (tambah atau edit)
  const handleSaveWaliAsuh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formUsername.trim() || !formPassword.trim()) {
      toast.error('Nama, Username, dan Password wajib diisi');
      return;
    }

    setSavingWali(true);
    try {
      if (editingWaliId) {
        // Mode Edit
        const res = await updateWaliAsuh(editingWaliId, {
          nama: formNama,
          nip: formNip,
          username: formUsername,
          password: formPassword,
        });
        if (res.success) {
          toast.success(res.message);
          setWaliDialogOpen(false);
        } else {
          toast.error(res.message);
        }
      } else {
        // Mode Tambah
        const res = await createWaliAsuh({
          nama: formNama,
          nip: formNip,
          username: formUsername,
          password: formPassword,
        });
        if (res.success) {
          toast.success(res.message);
          setWaliDialogOpen(false);
        } else {
          toast.error(res.message);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan akun Wali Asuh');
    } finally {
      setSavingWali(false);
    }
  };

  // Konfirmasi hapus akun
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingAccount(true);
    try {
      const res = await deleteWaliAsuh(deleteTarget.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus akun');
    } finally {
      setDeletingAccount(false);
      setDeleteTarget(null);
    }
  };

  // Manual trigger sinkronisasi akun dengan database cPanel
  const handleManualSyncAccounts = async () => {
    setLoadingSyncAccounts(true);
    try {
      const synced = await syncRemoteAccounts();
      toast.success(`Berhasil menyinkronkan ${synced.length} akun pengguna dengan server database cPanel!`);
    } catch {
      toast.error('Gagal menyinkronkan akun dengan server database');
    } finally {
      setLoadingSyncAccounts(false);
    }
  };

  // Sinkronkan preset tanda tangan dari MySQL server saat halaman dibuka
  useEffect(() => {
    syncServerPresets().then(map => {
      if (map) setServerPresets(map);
    });
  }, []);

  const handleManualSyncPresets = async () => {
    setLoadingSyncPresets(true);
    try {
      const map = await syncServerPresets();
      setServerPresets(map);
      toast.success(`Berhasil menyinkronkan ${Object.keys(map).length} preset tanda tangan dari server database!`);
    } catch {
      toast.error('Gagal menyinkronkan preset tanda tangan');
    } finally {
      setLoadingSyncPresets(false);
    }
  };

  const handleTriggerUploadPreset = (target: { nama: string; nip?: string }) => {
    setActivePresetTarget(target);
    if (presetFileInputRef.current) {
      presetFileInputRef.current.value = '';
      presetFileInputRef.current.click();
    }
  };

  const handlePresetFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePresetTarget) return;

    const targetNama = activePresetTarget.nama;
    const targetNip = activePresetTarget.nip || '';
    setUploadingTargetNama(targetNama);

    try {
      // 1. Kompres tanda tangan agar tajam dan ringan
      const compressed = await compressSignature(file);

      // 2. Upload file ke data URL
      const { fileUrl } = await uploadFile({
        data: compressed,
        filename: `ttd-preset-${compressed.name}`,
      });

      if (!fileUrl) throw new Error('Gagal memproses gambar');

      // 3. Simpan ke database server cPanel
      const res = await saveCpanelPresetTtd({
        namaPelapor: targetNama,
        nip: targetNip,
        url: fileUrl,
      });

      if (!res.success) {
        throw new Error(res.message || 'Server menolak penyimpanan');
      }

      saveServerPresetLocalCache(targetNama, fileUrl);
      setServerPresets(prev => ({ ...prev, [targetNama]: fileUrl }));

      toast.success(`Preset tanda tangan untuk "${targetNama}" berhasil disimpan ke server database!`);
    } catch (err: any) {
      toast.error(`Gagal menyimpan preset: ${err?.message || 'Error'}`);
    } finally {
      setUploadingTargetNama(null);
      setActivePresetTarget(null);
    }
  };

  const handleConfirmDeletePreset = async () => {
    if (!deletePresetTarget) return;
    const targetNama = deletePresetTarget.nama;
    setUploadingTargetNama(targetNama);

    try {
      const delRes = await saveCpanelPresetTtd({
        namaPelapor: targetNama,
        url: '',
      });

      if (!delRes.success) {
        throw new Error(delRes.message || 'Server menolak penghapusan');
      }

      saveServerPresetLocalCache(targetNama, '');
      setServerPresets(prev => {
        const next = { ...prev };
        delete next[targetNama];
        return next;
      });

      toast.success(`Preset tanda tangan untuk "${targetNama}" telah dihapus dari server database.`);
    } catch (err: any) {
      toast.error(`Gagal menghapus tanda tangan: ${err?.message || 'Error'}`);
    } finally {
      setUploadingTargetNama(null);
      setDeletePresetTarget(null);
    }
  };

  // Gabungkan daftar seluruh Wali Asuh resmi dari sistem dan akun login
  const allWaliAsuhList = useMemo(() => {
    const map = new Map<string, { nama: string; nip?: string; username?: string }>();
    for (const p of PELAPOR_LIST) {
      map.set(p.nama, { nama: p.nama, nip: p.nip });
    }
    for (const a of waliAsuhAccounts) {
      if (!map.has(a.nama)) {
        map.set(a.nama, { nama: a.nama, nip: a.nip, username: a.username });
      } else {
        const existing = map.get(a.nama)!;
        map.set(a.nama, { ...existing, username: a.username });
      }
    }
    return Array.from(map.values());
  }, [waliAsuhAccounts]);

  const filteredPresetList = allWaliAsuhList.filter(p => {
    if (!searchPresetQuery.trim()) return true;
    const q = searchPresetQuery.toLowerCase();
    return (
      p.nama.toLowerCase().includes(q) ||
      (p.nip && p.nip.includes(q)) ||
      (p.username && p.username.toLowerCase().includes(q))
    );
  });

  const filteredWaliAsuh = waliAsuhAccounts.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.nama.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      (a.nip && a.nip.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kelola Akun & Hak Akses</h1>
              <p className="text-sm text-muted-foreground">
                Panel Super Admin untuk mengubah kredensial sendiri dan membuat akun login untuk Wali Asuh
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCpanelModalOpen(true)}
            className="gap-2 text-xs border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
          >
            <Database size={14} className="text-amber-600" />
            Database cPanel
          </Button>
          <Button onClick={handleOpenAddDialog} className="gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <UserPlus size={15} />
            Buat Akun Wali Asuh
          </Button>
        </div>
      </div>

      {/* Bagian 1: Kredensial Super Admin */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-amber-600" />
              <CardTitle className="text-base text-amber-950 font-bold">
                Kredensial Super Admin (Akun Utama)
              </CardTitle>
            </div>
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
              Super Admin
            </Badge>
          </div>
          <CardDescription className="text-xs text-amber-800/80">
            Super admin berhak mengedit username dan password akunnya sendiri kapan saja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSuperAdmin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Username Super Admin</Label>
                <Input
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  placeholder="adminskp"
                  required
                  className="bg-white"
                />
                <span className="text-[11px] text-muted-foreground">
                  Default: <code className="font-mono bg-muted px-1 py-0.5 rounded">adminskp</code>
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Password Baru (Opsional)</Label>
                <div className="relative">
                  <Input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Biarkan kosong jika tidak diubah"
                    className="bg-white pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAdminPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Default awal: <code className="font-mono bg-muted px-1 py-0.5 rounded">SkpSelamanya12#</code>
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nama Administrator</Label>
                <Input
                  value={adminNama}
                  onChange={e => setAdminNama(e.target.value)}
                  placeholder="Super Administrator SKP"
                  className="bg-white"
                />
                <span className="text-[11px] text-muted-foreground">
                  Tampil pada header aplikasi
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingAdmin}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs"
              >
                <Key size={14} />
                {savingAdmin ? 'Menyimpan...' : 'Simpan Kredensial Super Admin'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bagian 2: Daftar Akun Wali Asuh */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <div>
                <CardTitle className="text-base font-bold">
                  Daftar Akun Login Wali Asuh ({waliAsuhAccounts.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Akun yang dapat digunakan oleh para Wali Asuh untuk login dan mencatat kinerja harian
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56 sm:w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau username..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSyncAccounts}
                disabled={loadingSyncAccounts || isSyncingRemote}
                className="h-8 gap-1.5 text-xs border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
                title="Sinkronkan Akun Pengguna dengan Database Server MySQL"
              >
                <RefreshCw size={13} className={loadingSyncAccounts || isSyncingRemote ? 'animate-spin' : ''} />
                <span>{loadingSyncAccounts || isSyncingRemote ? 'Sinkron...' : 'Sinkron Server'}</span>
              </Button>
              <Button onClick={handleOpenAddDialog} size="sm" className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                <UserPlus size={14} />
                Tambah Akun
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nama Wali Asuh & NIP</TableHead>
                  <TableHead>Username Login</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWaliAsuh.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      Tidak ada akun wali asuh yang cocok dengan pencarian
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWaliAsuh.map((account, index) => {
                    const isPassVisible = visiblePasswords[account.id] || false;
                    return (
                      <TableRow key={account.id} className="hover:bg-muted/20">
                        <TableCell className="text-center font-medium text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-sm text-foreground">{account.nama}</p>
                          <p className="text-xs text-muted-foreground font-mono">NIP: {account.nip || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                              {account.username}
                            </code>
                            <button
                              onClick={() => copyToClipboard(account.username, 'Username')}
                              className="text-muted-foreground hover:text-indigo-600 p-1"
                              title="Salin Username"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {isPassVisible ? account.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => toggleRowPassword(account.id)}
                              className="text-muted-foreground hover:text-foreground p-1"
                              title={isPassVisible ? 'Sembunyikan' : 'Lihat Password'}
                            >
                              {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(account.password, 'Password')}
                              className="text-muted-foreground hover:text-foreground p-1"
                              title="Salin Password"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px] font-normal border-slate-300">
                            Wali Asuh
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditDialog(account)}
                              className="h-7 px-2 text-xs gap-1 text-slate-700 hover:text-slate-900"
                              title="Edit Akun"
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(account)}
                              className="h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Hapus Akun"
                            >
                              <Trash2 size={12} />
                              <span>Hapus</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bagian 3: Preset Tanda Tangan Resmi Wali Asuh (Database Server) */}
      <Card className="border-emerald-200 bg-emerald-50/15 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                <PenTool size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-emerald-950">
                    Preset Tanda Tangan Wali Asuh
                  </CardTitle>
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">
                    Database Server
                  </Badge>
                </div>
                <CardDescription className="text-xs text-emerald-800/80 mt-0.5">
                  Tanda tangan tersimpan permanen di server database MySQL dan otomatis terpasang saat nama wali asuh dipilih di perangkat manapun
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchPresetQuery}
                  onChange={e => setSearchPresetQuery(e.target.value)}
                  placeholder="Cari nama wali asuh..."
                  className="h-8 pl-8 text-xs bg-white"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSyncPresets}
                disabled={loadingSyncPresets}
                className="h-8 gap-1.5 text-xs border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50"
              >
                <RefreshCw size={13} className={loadingSyncPresets ? 'animate-spin' : ''} />
                <span>Sinkronkan Server</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto border border-emerald-100 rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50/50">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nama Wali Asuh & NIP</TableHead>
                  <TableHead className="w-56 text-center">Pratinjau Tanda Tangan</TableHead>
                  <TableHead className="w-40 text-center">Status Server</TableHead>
                  <TableHead className="text-right w-48">Aksi Tanda Tangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPresetList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      Tidak ada wali asuh yang cocok dengan pencarian
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPresetList.map((p, idx) => {
                    const presetUrl = findInMapFuzzy(serverPresets, p.nama);
                    const isUploading = uploadingTargetNama === p.nama;

                    return (
                      <TableRow key={p.nama} className="hover:bg-emerald-50/20">
                        <TableCell className="text-center font-medium text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-sm text-foreground">{p.nama}</p>
                          <p className="text-xs text-muted-foreground font-mono">NIP: {p.nip || '-'}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          {presetUrl ? (
                            <div className="inline-flex items-center justify-center p-1 bg-white border rounded shadow-xs max-h-12">
                              <img
                                src={presetUrl}
                                alt={`TTD ${p.nama}`}
                                className="h-9 max-w-[130px] object-contain"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">- Belum ada -</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isUploading ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1 text-[11px] py-0.5">
                              <Loader2 size={11} className="animate-spin" />
                              Menyimpan...
                            </Badge>
                          ) : presetUrl ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-0.5 gap-1">
                              <Check size={11} />
                              Aktif di Server
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-muted text-[11px] py-0.5">
                              Kosong
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant={presetUrl ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleTriggerUploadPreset({ nama: p.nama, nip: p.nip })}
                              disabled={isUploading}
                              className={
                                presetUrl
                                  ? 'h-7 px-2.5 text-xs gap-1 border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                                  : 'h-7 px-2.5 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }
                            >
                              <UploadCloud size={12} />
                              <span>{presetUrl ? 'Ganti TTD' : 'Unggah TTD'}</span>
                            </Button>

                            {presetUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletePresetTarget({ nama: p.nama })}
                                disabled={isUploading}
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Hapus TTD dari Server"
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input untuk upload preset TTD */}
      <input
        ref={presetFileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handlePresetFileChange}
      />

      {/* Alert Dialog Konfirmasi Hapus Preset TTD */}
      <AlertDialog open={Boolean(deletePresetTarget)} onOpenChange={open => !open && setDeletePresetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Hapus Preset Tanda Tangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus preset tanda tangan untuk <strong>{deletePresetTarget?.nama}</strong> dari database server.
              Setelah dihapus, wali asuh ini tidak akan lagi memiliki tanda tangan otomatis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeletePreset} className="bg-red-600 hover:bg-red-700 text-white">
              Ya, Hapus TTD
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Tambah / Edit Wali Asuh */}
      <Dialog open={waliDialogOpen} onOpenChange={setWaliDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={18} className="text-indigo-600" />
              {editingWaliId ? 'Edit Akun Wali Asuh' : 'Tambah Akun Wali Asuh Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingWaliId
                ? 'Perbarui username, password, atau identitas Wali Asuh'
                : 'Buatkan username dan password agar Wali Asuh dapat login ke aplikasi'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveWaliAsuh} className="space-y-3.5 py-2">
            {!editingWaliId && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Pilih Dari Daftar Wali Asuh (Preset)</Label>
                <select
                  onChange={handleSelectPresetPelapor}
                  className="w-full text-xs border rounded-md px-2.5 py-1.5 bg-background text-foreground"
                  defaultValue=""
                >
                  <option value="" disabled>-- Pilih Wali Asuh untuk otomatis mengisi --</option>
                  {PELAPOR_LIST.map((p, idx) => (
                    <option key={`preset_opt_${p.nama}_${idx}`} value={p.nama}>{p.nama}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-medium">Nama Lengkap & Gelar</Label>
              <Input
                value={formNama}
                onChange={e => setFormNama(e.target.value)}
                placeholder="Contoh: A. Zainudin Sholeh, S.A.P."
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">NIP</Label>
              <Input
                value={formNip}
                onChange={e => setFormNip(e.target.value)}
                placeholder="Contoh: 198810082026221001"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Username Login</Label>
              <Input
                value={formUsername}
                onChange={e => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="Contoh: zainudin"
                required
              />
              <span className="text-[11px] text-muted-foreground">
                Gunakan huruf kecil tanpa spasi untuk memudahkan login
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Password Login</Label>
                <button
                  type="button"
                  onClick={() => setFormPassword(`Wali${Math.floor(100 + Math.random() * 900)}#`)}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Buat Otomatis
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showDialogPass ? 'text' : 'password'}
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="Masukkan password login"
                  required
                  className="pr-9 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowDialogPass(!showDialogPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showDialogPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setWaliDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingWaliId ? 'Perbarui Akun' : 'Simpan Akun'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Konfirmasi Hapus Akun */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Hapus Akun Wali Asuh?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus akun untuk <strong>{deleteTarget?.nama}</strong> (Username: {deleteTarget?.username}).
              Wali asuh ini tidak akan dapat login lagi menggunakan akun tersebut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Ya, Hapus Akun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Database cPanel (Private untuk Super Admin) */}
      <CpanelModal open={cpanelModalOpen} onOpenChange={setCpanelModalOpen} />
    </div>
  );
}
