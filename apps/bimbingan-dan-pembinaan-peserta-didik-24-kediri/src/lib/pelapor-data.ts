export interface PelaporInfo {
  nama: string;
  nip: string;
}

export const INITIAL_PELAPOR_LIST: PelaporInfo[] = [
  { nama: 'A. Zainudin Sholeh, S.A.P.', nip: '198810082026221001' },
  { nama: 'Abisarwan Rafif, S.T', nip: '199312012026211003' },
  { nama: 'Ahmad Fadkhurriza Ivakhudin, S.Gz', nip: '199212162026221001' },
  { nama: "Amirul Mu'minin Rofico Putra Kurnia, S.Pd", nip: '200012312026221001' },
  { nama: 'Dwi Chusnul Mufid, S.Kom', nip: '199404182026221001' },
  { nama: 'Eko Wahyudi, S.Pd', nip: '198801112026221001' },
  { nama: 'Deni Furitrinofi, S.Pd', nip: '199012282026222001' },
  { nama: 'Muji Santoso, S.Pd', nip: '199309092026221001' },
  { nama: 'Nanang Arifin, S.Kom.', nip: '199708212026221001' },
  { nama: 'Teguh Cahyono, S.Pd', nip: '198907142026221001' },
  { nama: 'Adi Yusuf, S. Sos.', nip: '200107212026211021' },
];

const CUSTOM_PELAPOR_STORAGE_KEY = '__customWaliAsuhList';

export function getCustomPelaporList(): PelaporInfo[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PELAPOR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPelapor(pelapor: PelaporInfo): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const list = getCustomPelaporList();
    const existing = list.findIndex(p => p.nama.toLowerCase() === pelapor.nama.toLowerCase());
    if (existing >= 0) {
      list[existing] = pelapor;
    } else {
      list.push(pelapor);
    }
    localStorage.setItem(CUSTOM_PELAPOR_STORAGE_KEY, JSON.stringify(list));
    refreshPelaporList();
  } catch {}
}

export function removeCustomPelapor(nama: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const list = getCustomPelaporList();
    const filtered = list.filter(p => p.nama.toLowerCase() !== nama.toLowerCase());
    localStorage.setItem(CUSTOM_PELAPOR_STORAGE_KEY, JSON.stringify(filtered));
    refreshPelaporList();
  } catch {}
}

export function getAllPelaporList(): PelaporInfo[] {
  const nameMap = new Map<string, PelaporInfo>();
  const nipMap = new Map<string, string>(); // nip -> nameKey

  const addOrUpdate = (p: PelaporInfo) => {
    if (!p || !p.nama) return;
    const cleanNama = p.nama.trim();
    const nameKey = cleanNama.toLowerCase();
    const cleanNip = (p.nip || '').trim();

    // Jika NIP sama dan valid (>= 8 karakter), gabungkan/perbarui dengan nama yang lebih lengkap
    if (cleanNip && cleanNip.length >= 8 && nipMap.has(cleanNip)) {
      const existingKey = nipMap.get(cleanNip)!;
      const existing = nameMap.get(existingKey);
      if (existing) {
        if (cleanNama.length > existing.nama.length) {
          nameMap.delete(existingKey);
          nameMap.set(nameKey, { nama: cleanNama, nip: cleanNip });
          nipMap.set(cleanNip, nameKey);
        }
        return;
      }
    }

    if (!nameMap.has(nameKey)) {
      nameMap.set(nameKey, { nama: cleanNama, nip: cleanNip });
      if (cleanNip && cleanNip.length >= 8) {
        nipMap.set(cleanNip, nameKey);
      }
    } else {
      // Perbarui NIP jika sebelumnya kosong
      const existing = nameMap.get(nameKey)!;
      if (!existing.nip && cleanNip) {
        existing.nip = cleanNip;
        if (cleanNip.length >= 8) {
          nipMap.set(cleanNip, nameKey);
        }
      }
    }
  };

  INITIAL_PELAPOR_LIST.forEach(addOrUpdate);
  getCustomPelaporList().forEach(addOrUpdate);

  // Ambil juga dari accounts store jika ada di browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('skp_accounts_store_v2');
      if (raw) {
        const accounts = JSON.parse(raw);
        if (Array.isArray(accounts)) {
          accounts.forEach((a: any) => {
            if (a.role === 'wali_asuh' && a.nama) {
              addOrUpdate({ nama: a.nama, nip: a.nip || '' });
            }
          });
        }
      }
    } catch {}
  }

  return Array.from(nameMap.values());
}

export const PELAPOR_LIST: PelaporInfo[] = [...INITIAL_PELAPOR_LIST];

export function refreshPelaporList(): void {
  const all = getAllPelaporList();
  PELAPOR_LIST.length = 0;
  all.forEach(p => PELAPOR_LIST.push(p));
}

// Inisialisasi daftar gabungan saat startup
if (typeof window !== 'undefined') {
  refreshPelaporList();
}

export const DEFAULT_PELAPOR = INITIAL_PELAPOR_LIST[0];

export function findPelaporByNama(nama: string): PelaporInfo | undefined {
  const list = getAllPelaporList();
  return list.find(p => p.nama.toLowerCase() === nama.toLowerCase()) || list.find(p => p.nama === nama);
}

/**
 * Mencocokkan nama atau username akun login ke Pelapor resmi (misal 'Eko Wahyudi' atau 'ekowahyudi' -> 'Eko Wahyudi, S.Pd')
 */
export function matchPelapor(nameOrUser?: string): PelaporInfo | undefined {
  if (!nameOrUser) return undefined;
  const raw = nameOrUser.trim();
  const q = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!q) return undefined;

  const currentList = getAllPelaporList();

  // 1. Cocok persis nama lengkap
  const exact = currentList.find(p => p.nama.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;

  // 2. Cocok persis alphanumeric
  const cleanMatch = currentList.find(p => p.nama.toLowerCase().replace(/[^a-z0-9]/g, '') === q);
  if (cleanMatch) return cleanMatch;

  // 3. Cocok berdasarkan kata (contoh: "Adi Yusuf" cocok dengan "Adi Yusuf, S. Sos.")
  const words = raw.toLowerCase().split(/[\s,.]+/).filter(w => w.length >= 3);
  if (words.length > 0) {
    const wordMatch = currentList.find(p => {
      const pLower = p.nama.toLowerCase();
      return words.every(w => pLower.includes(w));
    });
    if (wordMatch) return wordMatch;
  }

  // 4. Cocok substring
  const partial = currentList.find(p => {
    const pClean = p.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
    return pClean.includes(q) || q.includes(pClean);
  });
  return partial;
}

/**
 * Mengecek apakah suatu kegiatan atau file laporan dimiliki oleh akun yang sedang login.
 * - Super Admin memiliki hak penuh (true untuk semua record).
 * - Wali Asuh hanya memiliki hak (true) jika nama/NIP pada rekaman cocok dengan akunnya sendiri.
 */
export function isRecordOwnedByUser(
  user: { role?: string; nama?: string; username?: string; nip?: string } | null | undefined,
  recordNamaPelapor?: string,
  recordNipPelapor?: string
): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  const targetNama = (recordNamaPelapor || '').trim();
  const targetNip = (recordNipPelapor || '').trim();
  const userNama = (user.nama || '').trim();
  const userNip = (user.nip || '').trim();
  const userUsername = (user.username || '').trim();

  // 1. Cocok NIP jika ada dan valid
  if (userNip && targetNip && userNip === targetNip) {
    return true;
  }

  // 2. Cocok nama lengkap secara langsung (case-insensitive)
  if (userNama && targetNama && userNama.toLowerCase() === targetNama.toLowerCase()) {
    return true;
  }

  // 3. Cocok via normalisasi matchPelapor (gelar, ejaan resmi, dll)
  const matchedUser = matchPelapor(userNama) || matchPelapor(userUsername);
  const matchedTarget = matchPelapor(targetNama);

  if (matchedUser && matchedTarget && matchedUser.nama.toLowerCase() === matchedTarget.nama.toLowerCase()) {
    return true;
  }

  if (matchedUser && targetNama && matchedUser.nama.toLowerCase() === targetNama.toLowerCase()) {
    return true;
  }

  if (matchedTarget && userNama && matchedTarget.nama.toLowerCase() === userNama.toLowerCase()) {
    return true;
  }

  // 4. Cocok via perbandingan kata (contoh "Ilma Warta Fani" cocok dengan "Ilma Warta Fani, S.Pd")
  if (userNama && targetNama) {
    const userWords = userNama.toLowerCase().split(/[\s,.]+/).filter(w => w.length >= 3);
    const targetWords = targetNama.toLowerCase().split(/[\s,.]+/).filter(w => w.length >= 3);
    if (userWords.length >= 2 && targetWords.length >= 2) {
      const matchAllInTarget = userWords.every(w => targetNama.toLowerCase().includes(w));
      const matchAllInUser = targetWords.every(w => userNama.toLowerCase().includes(w));
      if (matchAllInTarget || matchAllInUser) {
        return true;
      }
    }
  }

  // 5. Cocok via username
  if (userUsername && targetNama) {
    const cleanUser = userUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTarget = targetNama.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanUser && cleanUser.length >= 3 && cleanTarget.includes(cleanUser)) {
      return true;
    }
  }

  return false;
}


// --- Pre-configured TTD URLs per pelapor (kosong secara default) ---
const PRESET_TTD: Record<string, string> = {};

// --- Saved TTD per pelapor (localStorage & Server Database Presets) ---
const TTD_STORAGE_KEY = '__savedTtdPerPelapor';
const SERVER_PRESET_STORAGE_KEY = '__serverPresetTtdMap';

export function getServerPresetMap(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(SERVER_PRESET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveServerPresetLocalCache(namaPelapor: string, url: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const map = getServerPresetMap();
    if (url) {
      map[namaPelapor] = url;
    } else {
      delete map[namaPelapor];
    }
    localStorage.setItem(SERVER_PRESET_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

import { fetchCpanelPresetTtd } from './cpanel-client';

export async function syncServerPresets(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  try {
    const presets = await fetchCpanelPresetTtd();
    if (presets && Object.keys(presets).length > 0) {
      localStorage.setItem(SERVER_PRESET_STORAGE_KEY, JSON.stringify(presets));
      return presets;
    }
  } catch (err) {
    console.warn('[syncServerPresets] Warning:', err);
  }
  return getServerPresetMap();
}

function getTtdMap(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(TTD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed;
  } catch {
    return {};
  }
}

export function findInMapFuzzy(map: Record<string, string>, targetName: string): string | null {
  if (!targetName || !map || typeof map !== 'object') return null;
  // 1. Exact match
  if (map[targetName]) return map[targetName];

  const targetClean = targetName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!targetClean) return null;

  // 2. Case-insensitive exact match
  for (const [key, val] of Object.entries(map)) {
    if (!val || typeof val !== 'string') continue;
    if (key.toLowerCase() === targetName.toLowerCase()) return val;
  }

  // 3. Alphanumeric clean match (ignores dots, commas, spaces, punctuation)
  for (const [key, val] of Object.entries(map)) {
    if (!val || typeof val !== 'string') continue;
    const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (keyClean === targetClean) return val;
  }

  // 4. Substring / words match (e.g. "Sauca Arsa Dewanta" matches "Sauca Arsa Dewanta, S.Pd.")
  const words = targetName.toLowerCase().split(/[\s,.]+/).filter(w => w.length >= 3);
  if (words.length >= 2) {
    for (const [key, val] of Object.entries(map)) {
      if (!val || typeof val !== 'string') continue;
      const keyLower = key.toLowerCase();
      if (words.every(w => keyLower.includes(w))) {
        return val;
      }
    }
  }

  return null;
}

export function getSavedTtd(namaPelapor: string): string | null {
  if (!namaPelapor) return null;
  // 1. Cek unggahan lokal sesi saat ini
  const userMap = getTtdMap();
  const userTtd = findInMapFuzzy(userMap, namaPelapor);
  if (userTtd) return userTtd;

  // 2. Cek preset terpusat dari database server yang ditambahkan oleh Super Admin
  const serverMap = getServerPresetMap();
  const serverTtd = findInMapFuzzy(serverMap, namaPelapor);
  if (serverTtd) return serverTtd;

  // 3. Fallback ke preset default sistem
  return findInMapFuzzy(PRESET_TTD, namaPelapor) || null;
}

/**
 * Mengambil tanda tangan tersimpan secara asinkron (dengan auto-fetch dari server database cPanel jika belum tercache)
 */
export async function getSavedTtdAsync(namaPelapor: string): Promise<string | null> {
  if (!namaPelapor) return null;
  const cached = getSavedTtd(namaPelapor);
  if (cached) return cached;

  try {
    const freshPresets = await syncServerPresets();
    const serverTtd = findInMapFuzzy(freshPresets, namaPelapor);
    if (serverTtd) return serverTtd;
  } catch (err) {
    console.warn('[getSavedTtdAsync] Sync warning:', err);
  }

  return null;
}

export function saveTtd(namaPelapor: string, url: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const map = getTtdMap();
  map[namaPelapor] = url;
  localStorage.setItem(TTD_STORAGE_KEY, JSON.stringify(map));
}

export function removeTtd(namaPelapor: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const map = getTtdMap();
  delete map[namaPelapor];
  localStorage.setItem(TTD_STORAGE_KEY, JSON.stringify(map));
}


