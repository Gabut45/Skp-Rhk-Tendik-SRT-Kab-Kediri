import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Badge } from '@project/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@project/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@project/components/ui/alert-dialog';
import { Shield, ShieldCheck, UserPlus, Users, Key, Pencil, Trash2, Eye, EyeOff, Copy, Check, Database, Search } from 'lucide-react';
import { useAuth, StoredAccount } from '@/lib/auth-context';
import { PELAPOR_LIST } from '@/lib/pelapor-data';
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

  // State untuk hapus akun
  const [deleteTarget, setDeleteTarget] = useState<StoredAccount | null>(null);

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
  const handleSaveSuperAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim()) {
      toast.error('Username Super Admin tidak boleh kosong');
      return;
    }

    setSavingAdmin(true);
    const res = updateSuperAdminCredentials(adminUsername, adminPassword || undefined, adminNama);
    setSavingAdmin(false);

    if (res.success) {
      toast.success(res.message);
      setAdminPassword('');
    } else {
      toast.error(res.message);
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
  const handleSaveWaliAsuh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formUsername.trim() || !formPassword.trim()) {
      toast.error('Nama, Username, dan Password wajib diisi');
      return;
    }

    if (editingWaliId) {
      // Mode Edit
      const res = updateWaliAsuh(editingWaliId, {
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
      const res = createWaliAsuh({
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
  };

  // Konfirmasi hapus akun
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const res = deleteWaliAsuh(deleteTarget.id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setDeleteTarget(null);
  };

  // Filter daftar wali asuh
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
              <div className="relative w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau username..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
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
                  {PELAPOR_LIST.map(p => (
                    <option key={p.nama} value={p.nama}>{p.nama}</option>
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
