import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { ShieldCheck, KeyRound, User, Eye, EyeOff, Loader2, School } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Mohon isi username dan password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 shadow-xl backdrop-blur-sm">
            <School size={36} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              SR TERINTEGRASI 1 KEDIRI
            </h1>
            <p className="text-xs text-indigo-200/80">
              Sistem Pelaporan Kinerja Harian & Bimbingan Peserta Didik
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700/60 bg-slate-900/80 backdrop-blur-md shadow-2xl text-slate-100">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
              <KeyRound size={18} className="text-indigo-400" />
              Masuk ke Aplikasi
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Silakan masukkan kredensial akun Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Username</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    required
                    className="pl-9 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-300">Password</Label>
                </div>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                    className="pl-9 pr-10 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk Sekarang'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 flex items-center justify-center border-t border-slate-800/80 mt-2 py-3 bg-slate-950/40 rounded-b-lg">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-emerald-400" />
              Sistem Terproteksi &bull; Akses Terbatas untuk Petugas
            </span>
          </CardFooter>
        </Card>

        <p className="text-center text-[11px] text-slate-500">
          Sekolah Rakyat Terintegrasi 1 Kabupaten Kediri &bull; SRMA 24 Kediri
        </p>
      </div>
    </div>
  );
}
