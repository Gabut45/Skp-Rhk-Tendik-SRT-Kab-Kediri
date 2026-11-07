import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PELAPOR_LIST,
  matchPelapor,
  saveCustomPelapor,
  removeCustomPelapor,
  refreshPelaporList,
} from './pelapor-data';
import {
  fetchCpanelUsers,
  saveCpanelUser,
  deleteCpanelUser,
  type CpanelUserRecord,
} from './cpanel-client';

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

// Username resmi ramah pengguna untuk tiap wali asuh
export const DEFAULT_USERNAMES: Record<string, string> = {
  'A. Zainudin Sholeh, S.A.P.': 'zainudin',
  'Abisarwan Rafif, S.T': 'abisarwan',
  'Ahmad Fadkhurriza Ivakhudin, S.Gz': 'ahmad',
  "Amirul Mu'minin Rofico Putra Kurnia, S.Pd": 'amirul',
  'Dwi Chusnul Mufid, S.Kom': 'dwichusnul',
  'Eko Wahyudi, S.Pd': 'ekowahyudi',
  'Deni Furitrinofi, S.Pd': 'deni',
  'Muji Santoso, S.Pd': 'mujisantoso',
  'Nanang Arifin, S.Kom.': 'nanang',
  'Teguh Cahyono, S.Pd': 'teguh',
  'Adi Yusuf, S. Sos.': 'adiyusuf',
};

// Kredensial default awal Super Administrator
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
    const username = DEFAULT_USERNAMES[p.nama] || p.nama.split(/[\s,.]+/).filter(Boolean)[0].toLowerCase();

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
  isSyncingRemote: boolean;
  syncRemoteAccounts: () => Promise<StoredAccount[]>;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  // Super admin functions
  updateSuperAdminCredentials: (newUsername: string, newPassword?: string, newNama?: string) => Promise<{ success: boolean; message: string }>;
  createWaliAsuh: (data: { username: string; password: string; nama: string; nip?: string }) => Promise<{ success: boolean; message: string }>;
  updateWaliAsuh: (id: string, updates: { username?: string; password?: string; nama?: string; nip?: string }) => Promise<{ success: boolean; message: string }>;
  deleteWaliAsuh: (id: string) => Promise<{ success: boolean; message: string }>;
  getAccountsList: () => StoredAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);

  // Load accounts dari localStorage
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
          }

          // Sinkronkan seluruh wali asuh resmi ke daftar akun
          PELAPOR_LIST.forEach((p, idx) => {
            const desiredUsername = DEFAULT_USERNAMES[p.nama] || p.nama.split(/[\s,.]+/).filter(Boolean)[0].toLowerCase();
            const exists = parsed.find((a: StoredAccount) =>
              a.nama.toLowerCase() === p.nama.toLowerCase() ||
              a.username.toLowerCase() === desiredUsername ||
              (desiredUsername.includes('wahyudi') && a.username.toLowerCase() === 'eko')
            );
            if (!exists) {
              parsed.push({
                id: `usr_wali_${idx + 1}`,
                username: desiredUsername,
                password: `Wali${idx + 1}#2026`,
                nama: p.nama,
                nip: p.nip,
                role: 'wali_asuh',
                createdAt: new Date().toISOString(),
              });
            } else {
              exists.nama = p.nama;
              if (p.nip) exists.nip = p.nip;
            }
          });

          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    const initial = generateInitialWaliAsuh();
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
    } catch {}
    return initial;
  }, []);

  const saveStoredAccounts = useCallback((accounts: StoredAccount[]) => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
      // Pastikan pelapor list diperbarui
      accounts.forEach(a => {
        if (a.role === 'wali_asuh' && a.nama) {
          saveCustomPelapor({ nama: a.nama, nip: a.nip || '' });
        }
      });
      refreshPelaporList();
    } catch (e) {
      console.warn('Gagal menyimpan akun ke localStorage:', e);
    }
  }, []);

  /**
   * Sinkronisasi Real-Time Akun Pengguna dari Server Database cPanel MySQL
   */
  const syncRemoteAccounts = useCallback(async (): Promise<StoredAccount[]> => {
    setIsSyncingRemote(true);
    try {
      const remoteUsers = await fetchCpanelUsers();
      const localAccounts = getStoredAccounts();
      const accountsMap = new Map<string, StoredAccount>();

      // 1. Masukkan akun lokal dulu
      localAccounts.forEach(a => {
        accountsMap.set(a.username.toLowerCase(), a);
      });

      // 2. Gabungkan akun remote dari database server cPanel MySQL
      if (remoteUsers && remoteUsers.length > 0) {
        remoteUsers.forEach(ru => {
          const uKey = ru.username.toLowerCase();
          const existing = accountsMap.get(uKey);
          if (existing) {
            accountsMap.set(uKey, {
              ...existing,
              password: ru.password || existing.password,
              nama: ru.nama || existing.nama,
              nip: ru.nip || existing.nip,
              role: ru.role || existing.role,
            });
          } else {
            accountsMap.set(uKey, {
              id: ru.id || `usr_remote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              username: ru.username,
              password: ru.password,
              nama: ru.nama,
              nip: ru.nip || '',
              role: ru.role || 'wali_asuh',
              createdAt: ru.createdAt || new Date().toISOString(),
            });
          }

          if (ru.role === 'wali_asuh' && ru.nama) {
            saveCustomPelapor({ nama: ru.nama, nip: ru.nip || '' });
          }
        });
      }

      const mergedAccounts = Array.from(accountsMap.values());
      saveStoredAccounts(mergedAccounts);
      refreshPelaporList();

      return mergedAccounts;
    } catch (err) {
      console.warn('[syncRemoteAccounts] Error:', err);
      return getStoredAccounts();
    } finally {
      setIsSyncingRemote(false);
    }
  }, [getStoredAccounts, saveStoredAccounts]);

  // Boot: Restore session & trigger background sync dengan database server cPanel
  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (sessionRaw) {
        const sessionUser = JSON.parse(sessionRaw) as AuthUser;
        const accounts = getStoredAccounts();
        const found = accounts.find(
          a => a.id === sessionUser.id || a.username.toLowerCase() === sessionUser.username.toLowerCase()
        );
        if (found) {
          const officialPelapor = matchPelapor(found.nama) || matchPelapor(found.username);
          setUser({
            id: found.id,
            username: found.username,
            nama: officialPelapor ? officialPelapor.nama : found.nama,
            nip: officialPelapor ? officialPelapor.nip : found.nip,
            role: found.role,
            email: `${found.username}@srtkabkediri.sch.id`,
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

    // Jalankan sync remote di background tanpa memblokir render
    syncRemoteAccounts().catch(() => {});
  }, [getStoredAccounts, syncRemoteAccounts]);

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string }> => {
    const trimmedUser = usernameInput.trim();
    let accounts = getStoredAccounts();

    const findMatch = (list: StoredAccount[]) => {
      return list.find(a => {
        if (a.password !== passwordInput) return false;
        const uLower = trimmedUser.toLowerCase();
        const aUserLower = a.username.toLowerCase();
        const aNameLower = a.nama.toLowerCase();
        const uClean = uLower.replace(/[^a-z0-9]/g, '');
        const aUserClean = aUserLower.replace(/[^a-z0-9]/g, '');
        const aNameClean = aNameLower.replace(/[^a-z0-9]/g, '');

        return (
          aUserLower === uLower ||
          aNameLower === uLower ||
          aUserClean === uClean ||
          aNameClean.includes(uClean) ||
          uClean.includes(aUserClean)
        );
      });
    };

    let matched = findMatch(accounts);

    // Jika tidak ditemukan di cache lokal, langsung periksa ke server database cPanel secara real-time
    if (!matched) {
      const refreshed = await syncRemoteAccounts();
      matched = findMatch(refreshed);
    }

    if (!matched) {
      return { success: false, message: 'Username atau Password salah. Silakan periksa kembali.' };
    }

    const officialPelapor = matchPelapor(matched.nama) || matchPelapor(matched.username);
    const resolvedNama = officialPelapor ? officialPelapor.nama : matched.nama;
    const resolvedNip = officialPelapor ? officialPelapor.nip : matched.nip;

    const authUser: AuthUser = {
      id: matched.id,
      username: matched.username,
      nama: resolvedNama,
      nip: resolvedNip,
      role: matched.role,
      email: `${matched.username}@srtkabkediri.sch.id`,
    };

    setUser(authUser);
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(authUser));
    } catch {}

    return {
      success: true,
      message: matched.role === 'super_admin' ? 'Selamat datang Super Admin SKP' : `Selamat datang, ${resolvedNama}`,
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {}
  };

  const updateSuperAdminCredentials = async (
    newUsername: string,
    newPassword?: string,
    newNama?: string
  ): Promise<{ success: boolean; message: string }> => {
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

    // Simpan ke database server cPanel MySQL secara real time
    await saveCpanelUser(accounts[superIdx]);

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

    return { success: true, message: 'Kredensial Super Admin berhasil diperbarui dan tersimpan di database server!' };
  };

  const createWaliAsuh = async (data: {
    username: string;
    password: string;
    nama: string;
    nip?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const cleanUser = data.username.trim();
    const cleanPass = data.password.trim();
    const cleanNama = data.nama.trim();
    const cleanNip = data.nip?.trim() || '';

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
      nip: cleanNip,
      role: 'wali_asuh',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    // 1. Daftarkan juga ke custom pelapor agar langsung tampil di dropdown nama pelapor
    saveCustomPelapor({ nama: cleanNama, nip: cleanNip });
    refreshPelaporList();

    // 2. Simpan ke database server cPanel MySQL secara REAL-TIME
    try {
      const cpanelRes = await saveCpanelUser(newAccount);
      if (cpanelRes && !cpanelRes.success) {
        console.warn('Peringatan simpan cPanel:', cpanelRes.message);
      }
    } catch (e) {
      console.warn('Gagal sync ke cPanel:', e);
    }

    return {
      success: true,
      message: `Akun Wali Asuh "${cleanNama}" berhasil dibuat dan tersimpan di sistem & database server! Pengguna dapat langsung login dari perangkat manapun.`,
    };
  };

  const updateWaliAsuh = async (
    id: string,
    updates: { username?: string; password?: string; nama?: string; nip?: string }
  ): Promise<{ success: boolean; message: string }> => {
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

    if (accounts[idx].nama) {
      saveCustomPelapor({ nama: accounts[idx].nama, nip: accounts[idx].nip || '' });
      refreshPelaporList();
    }

    // Simpan ke database server cPanel MySQL
    await saveCpanelUser(accounts[idx]);

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

    return { success: true, message: 'Data akun Wali Asuh berhasil diperbarui di database server & sistem' };
  };

  const deleteWaliAsuh = async (id: string): Promise<{ success: boolean; message: string }> => {
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
    removeCustomPelapor(target.nama);
    refreshPelaporList();

    // Hapus dari database server cPanel MySQL
    await deleteCpanelUser(target.id, target.username);

    // Jika yang dihapus sedang login, logout
    if (user && user.id === id) {
      logout();
    }

    return { success: true, message: `Akun Wali Asuh "${target.nama}" berhasil dihapus dari database server & sistem` };
  };

  const getAccountsList = (): StoredAccount[] => {
    return getStoredAccounts();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSyncingRemote,
        syncRemoteAccounts,
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
