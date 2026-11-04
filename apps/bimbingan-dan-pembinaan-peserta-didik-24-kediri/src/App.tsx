import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@project/components/ui/sonner';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import KegiatanHarianPage from './pages/KegiatanHarianPage';
import LaporanRHKPage from './pages/LaporanRHKPage';
import RiwayatPage from './pages/RiwayatPage';
import DaftarKegiatanPage from './pages/DaftarKegiatanPage';
import JadwalShiftPage from './pages/JadwalShiftPage';
import KelolaPenggunaPage from './pages/KelolaPenggunaPage';
import LoginPage from './pages/LoginPage';
import { Loader2 } from 'lucide-react';

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'super_admin') {
    return <Navigate to="/kegiatan-harian" replace />;
  }
  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-400" size={32} />
          <p className="text-xs text-slate-400">Memverifikasi sesi pengguna...</p>
        </div>
      </div>
    );
  }

  // Jika belum login, tampilkan halaman Login
  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} durationMs={2200} />}
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <AuthGate>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/kegiatan-harian" replace />} />
              <Route path="/kegiatan-harian" element={<KegiatanHarianPage />} />
              <Route path="/daftar-kegiatan" element={<DaftarKegiatanPage />} />
              <Route path="/laporan-rhk" element={<LaporanRHKPage />} />
              <Route path="/riwayat" element={<RiwayatPage />} />
              <Route path="/jadwal-shift" element={<JadwalShiftPage />} />
              <Route
                path="/kelola-pengguna"
                element={
                  <SuperAdminRoute>
                    <KelolaPenggunaPage />
                  </SuperAdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/kegiatan-harian" replace />} />
            </Route>
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AuthProvider>
  );
}
