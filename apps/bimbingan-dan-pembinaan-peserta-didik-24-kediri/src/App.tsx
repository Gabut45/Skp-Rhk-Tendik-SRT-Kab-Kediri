import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@project/components/ui/sonner';
import { useEffect } from 'react';
import { useAuth } from '@project/components/lib/legacyAuth';
import Layout from './components/Layout';
import KegiatanHarianPage from './pages/KegiatanHarianPage';
import LaporanRHKPage from './pages/LaporanRHKPage';
import RiwayatPage from './pages/RiwayatPage';
import DaftarKegiatanPage from './pages/DaftarKegiatanPage';
import JadwalShiftPage from './pages/JadwalShiftPage';
import { Loader2 } from 'lucide-react';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, loginWithRedirect } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      loginWithRedirect();
    }
  }, [isLoading, user, loginWithRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <AuthGate>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/kegiatan-harian" replace />} />
            <Route path="/kegiatan-harian" element={<KegiatanHarianPage />} />
            <Route path="/daftar-kegiatan" element={<DaftarKegiatanPage />} />
            <Route path="/laporan-rhk" element={<LaporanRHKPage />} />
            <Route path="/riwayat" element={<RiwayatPage />} />
            <Route path="/jadwal-shift" element={<JadwalShiftPage />} />
          </Route>
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}
