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
  const map = new Map<string, PelaporInfo>();
  INITIAL_PELAPOR_LIST.forEach(p => map.set(p.nama.toLowerCase(), p));
  getCustomPelaporList().forEach(p => map.set(p.nama.toLowerCase(), p));

  // Ambil juga dari accounts store jika ada di browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('skp_accounts_store_v2');
      if (raw) {
        const accounts = JSON.parse(raw);
        if (Array.isArray(accounts)) {
          accounts.forEach((a: any) => {
            if (a.role === 'wali_asuh' && a.nama) {
              const key = a.nama.toLowerCase();
              if (!map.has(key)) {
                map.set(key, { nama: a.nama, nip: a.nip || '' });
              }
            }
          });
        }
      }
    } catch {}
  }

  return Array.from(map.values());
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

export function getSavedTtd(namaPelapor: string): string | null {
  if (!namaPelapor) return null;
  // 1. Cek unggahan lokal sesi saat ini
  const userMap = getTtdMap();
  if (userMap[namaPelapor]) return userMap[namaPelapor];

  // 2. Cek preset terpusat dari database server yang ditambahkan oleh Super Admin
  const serverMap = getServerPresetMap();
  if (serverMap[namaPelapor]) return serverMap[namaPelapor];

  // 3. Fallback ke preset default sistem
  return PRESET_TTD[namaPelapor] || null;
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

