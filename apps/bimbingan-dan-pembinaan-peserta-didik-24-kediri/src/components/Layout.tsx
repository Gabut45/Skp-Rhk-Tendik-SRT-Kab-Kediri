import { Outlet, NavLink } from 'react-router-dom';
import {
  ClipboardList,
  FileText,
  History,
  CalendarDays,
  Menu,
  X,
  LogOut,
  Calendar,
  Database,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { autoPushLocalKegiatanToCpanel } from '@/lib/cpanel-client';
import { toast } from 'sonner';
import CpanelModal from './CpanelModal';
import GeminiKeyModal from './GeminiKeyModal';

const baseNavItems = [
  { to: '/kegiatan-harian', label: 'Input Kegiatan', icon: ClipboardList },
  { to: '/daftar-kegiatan', label: 'Daftar Kegiatan', icon: CalendarDays },
  { to: '/laporan-rhk', label: 'Laporan RHK', icon: FileText },
  { to: '/riwayat', label: 'Riwayat File', icon: History },
  { to: '/jadwal-shift', label: 'Jadwal Shift', icon: Calendar },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cpanelOpen, setCpanelOpen] = useState(false);
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    autoPushLocalKegiatanToCpanel().then(res => {
      if (res && res.pushedCount > 0) {
        toast.success(res.message, { duration: 6000 });
      }
    }).catch(() => {});
  }, []);

  const isSuperAdmin = user?.role === 'super_admin';

  const navItems = [
    ...baseNavItems,
    ...(isSuperAdmin ? [{ to: '/kelola-pengguna', label: 'Kelola Akun', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center text-xs font-bold shadow-inner">
              SR
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">SR TERINTEGRASI 1 KEDIRI</h1>
              <p className="text-[10px] opacity-80">Sistem Pelaporan Kinerja</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/20 font-bold shadow-sm'
                        : 'hover:bg-primary-foreground/10 opacity-90'
                    }`
                  }
                >
                  <item.icon size={15} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Menu "Kunci AI Gemini" */}
            <button
              onClick={() => setGeminiModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 transition-colors shadow-sm ml-1 border border-amber-300/30"
              title="Pengaturan Kunci API Gemini AI"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span className="hidden sm:inline">Kunci AI Gemini</span>
            </button>

            {/* Menu "Database cPanel" HANYA tampil untuk Super Admin (Tersembunyi dari publik & wali asuh biasa) */}
            {isSuperAdmin && (
              <button
                onClick={() => setCpanelOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors shadow-sm ml-1"
                title="Konfigurasi Database MySQL cPanel (Khusus Super Admin)"
              >
                <Database size={14} />
                <span>Database cPanel</span>
              </button>
            )}

            {/* User Profile Info & Logout */}
            {user && (
              <div className="flex items-center gap-2 ml-1 pl-2 border-l border-primary-foreground/20">
                <div className="hidden xl:flex flex-col text-right">
                  <span className="text-xs font-semibold leading-none max-w-[150px] truncate">
                    {user.nama}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">
                    {isSuperAdmin ? 'Super Admin' : user.username}
                  </span>
                </div>

                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isSuperAdmin ? 'bg-amber-400 text-amber-950' : 'bg-primary-foreground/20 text-white'
                  }`}
                >
                  {isSuperAdmin ? 'Super Admin' : 'Wali Asuh'}
                </div>

                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs hover:bg-primary-foreground/20 opacity-90 transition-colors text-red-100 hover:text-white"
                  title={`Logout (${user.username})`}
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b shadow-lg z-40">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm border-b last:border-b-0 ${
                  isActive ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {/* Menu Kunci AI Gemini di menu mobile */}
          <button
            onClick={() => {
              setMobileOpen(false);
              setGeminiModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold border-b border-amber-200/50"
          >
            <Sparkles size={18} className="text-amber-600 dark:text-amber-400" />
            Pengaturan Kunci AI Gemini
          </button>

          {/* Akses Database cPanel di menu mobile HANYA untuk Super Admin */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                setMobileOpen(false);
                setCpanelOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm bg-amber-50 text-amber-900 font-semibold border-b border-amber-200"
            >
              <Database size={18} className="text-amber-700" />
              Integrasi Database cPanel (Super Admin)
            </button>
          )}

          {user && (
            <div className="p-4 bg-muted/40 border-t flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">{user.nama}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isSuperAdmin ? 'Super Admin SKP' : `Wali Asuh (${user.username})`}
                </p>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-red-50 text-red-700 border border-red-200 font-medium"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <CpanelModal open={cpanelOpen} onOpenChange={setCpanelOpen} />
      <GeminiKeyModal open={geminiModalOpen} onOpenChange={setGeminiModalOpen} />
    </div>
  );
}
