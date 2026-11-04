import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PELAPOR_LIST } from './pelapor-data';

export type UserRole = 'super_admin' | 'wali_asuh';

export interface AuthUser {
  id: string;
  username: string;
  nama: string;
  nip?: string;
  role: UserRole;
  email?: string;
}

export interface StoredAccount {
  id: string;
  username: string;
  password: string;
  nama: string;
  nip?: string;
  role: UserRole;
  createdAt: string;
}

const STORAGE_USERS_KEY = 'skp_accounts_store_v2';
const STORAGE_SESSION_KEY = 'skp_current_session_v2';

// Kredensial default awal sesuai permintaan pengguna
const INITIAL_SUPERADMIN: StoredAccount = {
  id: 'usr_superadmin_01',
  username: 'adminskp',
  password: 'SkpSelamanya12#',
  nama: 'Super Administrator SKP',
  nip: '198810082026221001',
  role: 'super_admin',
  createdAt: new Date().toISOString(),
};

// Seed awal akun Wali Asuh dari daftar pelapor resmi
function generateInitialWaliAsuh(): StoredAccount[] {
  const accounts: StoredAccount[] = [INITIAL_SUPERADMIN];
  
  PELAPOR_LIST.forEach((p, idx) => {
    // Generate username unik ramah pengguna (contoh: zainudin, abisarwan, dll)
    const rawFirst = p.nama.split(/[\s,.]+/).filter(Boolean)[0] || `wali${idx + 1}`;
    const cleanUser = rawFirst.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = cleanUser.length >= 3 ? cleanUser : `wali_${idx + 1}`;

    accounts.push({
      id: `usr_wali_${idx + 1}`,
      username: username,
      password: `Wali${idx + 1}#2026`,
      nama: p.nama,
      nip: p.nip,
      role: 'wali_asuh',
      createdAt: new Date().toISOString(),
    });
  });

  return accounts;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  // Super admin functions
  updateSuperAdminCredentials: (newUsername: string, newPassword?: string, newNama?: string) => { success: boolean; message: string };
  createWaliAsuh: (data: { username: string; password: string; nama: string; nip?: string }) => { success: boolean; message: string };
  updateWaliAsuh: (id: string, updates: { username?: string; password?: string; nama?: string; nip?: string }) => { success: boolean; message: string };
  deleteWaliAsuh: (id: string) => { success: boolean; message: string };
  getAccountsList: () => StoredAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load or initialize accounts store
  const getStoredAccounts = useCallback((): StoredAccount[] => {
    if (typeof window === 'undefined') return [INITIAL_SUPERADMIN];
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Pastikan superadmin selalu ada jika belum ada
          const hasSuper = parsed.some(a => a.role === 'super_admin');
          if (!hasSuper) {
            parsed.unshift(INITIAL_SUPERADMIN);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    const initial = generateInitialWaliAsuh();
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  }, []);

  const saveStoredAccounts = (accounts: StoredAccount[]) => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Gagal menyimpan akun ke localStorage:', e);
    }
  };

  // Restore session on boot
  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (sessionRaw) {
        const sessionUser = JSON.parse(sessionRaw) as AuthUser;
        // Verifikasi akun masih valid di store
        const accounts = getStoredAccounts();
        const found = accounts.find(a => a.id === sessionUser.id && a.username === sessionUser.username);
        if (found) {
          setUser({
            id: found.id,
            username: found.username,
            nama: found.nama,
            nip: found.nip,
            role: found.role,
            email: `${found.username}@srma24kediri.sch.id`,
          });
        } else {
          localStorage.removeItem(STORAGE_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [getStoredAccounts]);

  const login = (usernameInput: string, passwordInput: string): { success: boolean; message: string } => {
    const trimmedUser = usernameInput.trim();
    const accounts = getStoredAccounts();

    const matched = accounts.find(
      a => a.username.toLowerCase() === trimmedUser.toLowerCase() && a.password === passwordInput
    );

    if (!matched) {
      return { success: false, message: 'Username atau Password salah. Silakan periksa kembali.' };
    }

    const authUser: AuthUser = {
      id: matched.id,
      username: matched.username,
      nama: matched.nama,
      nip: matched.nip,
      role: matched.role,
      email: `${matched.username}@srma24kediri.sch.id`,
    };

    setUser(authUser);
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(authUser));
    } catch {
      // ignore
    }

    return {
      success: true,
      message: matched.role === 'super_admin' ? 'Selamat datang Super Admin SKP' : `Selamat datang, ${matched.nama}`,
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }
  };

  const updateSuperAdminCredentials = (
    newUsername: string,
    newPassword?: string,
    newNama?: string
  ): { success: boolean; message: string } => {
    const cleanUser = newUsername.trim();
    if (!cleanUser) {
      return { success: false, message: 'Username tidak boleh kosong' };
    }

    const accounts = getStoredAccounts();
    const superIdx = accounts.findIndex(a => a.role === 'super_admin');
    if (superIdx === -1) {
      return { success: false, message: 'Akun Super Admin tidak ditemukan' };
    }

    // Periksa apakah username bentrok dengan akun lain
    const conflict = accounts.find(
      (a, idx) => idx !== superIdx && a.username.toLowerCase() === cleanUser.toLowerCase()
    );
    if (conflict) {
      return { success: false, message: `Username "${cleanUser}" sudah digunakan oleh pengguna lain` };
    }

    accounts[superIdx].username = cleanUser;
    if (newPassword && newPassword.trim()) {
      accounts[superIdx].password = newPassword.trim();
    }
    if (newNama && newNama.trim()) {
      accounts[superIdx].nama = newNama.trim();
    }

    saveStoredAccounts(accounts);

    // Update active user session jika super admin sedang login
    if (user && user.role === 'super_admin') {
      const updatedUser: AuthUser = {
        ...user,
        username: accounts[superIdx].username,
        nama: accounts[superIdx].nama,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
    }

    return { success: true, message: 'Kredensial Super Admin berhasil diperbarui' };
  };

  const createWaliAsuh = (data: {
    username: string;
    password: string;
    nama: string;
    nip?: string;
  }): { success: boolean; message: string } => {
    const cleanUser = data.username.trim();
    const cleanPass = data.password.trim();
    const cleanNama = data.nama.trim();

    if (!cleanUser || !cleanPass || !cleanNama) {
      return { success: false, message: 'Nama, Username, dan Password wajib diisi' };
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(a => a.username.toLowerCase() === cleanUser.toLowerCase());
    if (existing) {
      return { success: false, message: `Username "${cleanUser}" sudah terdaftar` };
    }

    const newAccount: StoredAccount = {
      id: `usr_wali_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUser,
      password: cleanPass,
      nama: cleanNama,
      nip: data.nip?.trim() || '',
      role: 'wali_asuh',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    return { success: true, message: `Akun Wali Asuh "${cleanNama}" berhasil dibuat` };
  };

  const updateWaliAsuh = (
    id: string,
    updates: { username?: string; password?: string; nama?: string; nip?: string }
  ): { success: boolean; message: string } => {
    const accounts = getStoredAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) {
      return { success: false, message: 'Akun Wali Asuh tidak ditemukan' };
    }

    if (updates.username) {
      const cleanUser = updates.username.trim();
      const conflict = accounts.find(
        (a, i) => i !== idx && a.username.toLowerCase() === cleanUser.toLowerCase()
      );
      if (conflict) {
        return { success: false, message: `Username "${cleanUser}" sudah digunakan akun lain` };
      }
      accounts[idx].username = cleanUser;
    }

    if (updates.password && updates.password.trim()) {
      accounts[idx].password = updates.password.trim();
    }
    if (updates.nama && updates.nama.trim()) {
      accounts[idx].nama = updates.nama.trim();
    }
    if (updates.nip !== undefined) {
      accounts[idx].nip = updates.nip.trim();
    }

    saveStoredAccounts(accounts);

    // Update active session jika user yang sedang login adalah user yang diedit
    if (user && user.id === id) {
      const updatedUser: AuthUser = {
        ...user,
        username: accounts[idx].username,
        nama: accounts[idx].nama,
        nip: accounts[idx].nip,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
    }

    return { success: true, message: 'Data akun Wali Asuh berhasil diperbarui' };
  };

  const deleteWaliAsuh = (id: string): { success: boolean; message: string } => {
    const accounts = getStoredAccounts();
    const target = accounts.find(a => a.id === id);
    if (!target) {
      return { success: false, message: 'Akun tidak ditemukan' };
    }
    if (target.role === 'super_admin') {
      return { success: false, message: 'Akun Super Admin tidak dapat dihapus' };
    }

    const filtered = accounts.filter(a => a.id !== id);
    saveStoredAccounts(filtered);

    // Jika yang dihapus sedang login, logout
    if (user && user.id === id) {
      logout();
    }

    return { success: true, message: `Akun Wali Asuh "${target.nama}" berhasil dihapus` };
  };

  const getAccountsList = (): StoredAccount[] => {
    return getStoredAccounts();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateSuperAdminCredentials,
        createWaliAsuh,
        updateWaliAsuh,
        deleteWaliAsuh,
        getAccountsList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
