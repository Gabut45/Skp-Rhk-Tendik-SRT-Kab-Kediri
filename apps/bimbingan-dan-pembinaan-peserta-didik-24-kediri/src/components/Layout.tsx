import { Outlet, NavLink } from 'react-router-dom';
import { ClipboardList, FileText, History, CalendarDays, Menu, X, LogOut, Calendar, Database } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@project/components/lib/legacyAuth';
import CpanelModal from './CpanelModal';

const navItems = [
  { to: '/kegiatan-harian', label: 'Input Kegiatan', icon: ClipboardList },
  { to: '/daftar-kegiatan', label: 'Daftar Kegiatan', icon: CalendarDays },
  { to: '/laporan-rhk', label: 'Laporan RHK', icon: FileText },
  { to: '/riwayat', label: 'Riwayat File', icon: History },
  { to: '/jadwal-shift', label: 'Jadwal Shift', icon: Calendar },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cpanelOpen, setCpanelOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center text-xs font-bold">SR</div>
            <div>
              <h1 className="text-sm font-bold leading-tight">SR TERINTEGRASI 1 KEDIRI</h1>
              <p className="text-[10px] opacity-80">Sistem Pelaporan Kinerja</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-primary-foreground/20 font-semibold' : 'hover:bg-primary-foreground/10 opacity-90'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={() => setCpanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors shadow-sm"
              title="Konfigurasi Database MySQL cPanel"
            >
              <Database size={15} />
              <span>Database cPanel</span>
            </button>
            {user && (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-primary-foreground/10 opacity-90 transition-colors ml-1"
                title={`Logout (${user.email})`}
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Logout</span>
              </button>
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
          <button
            onClick={() => {
              setMobileOpen(false);
              setCpanelOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm bg-amber-50 text-amber-900 font-semibold border-b border-amber-200"
          >
            <Database size={18} className="text-amber-700" />
            Integrasi Database cPanel
          </button>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <CpanelModal open={cpanelOpen} onOpenChange={setCpanelOpen} />
    </div>
  );
}
