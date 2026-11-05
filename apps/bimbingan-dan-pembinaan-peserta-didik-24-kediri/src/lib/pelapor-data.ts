export interface PelaporInfo {
  nama: string;
  nip: string;
}

export const PELAPOR_LIST: PelaporInfo[] = [
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
];

export const DEFAULT_PELAPOR = PELAPOR_LIST[0];

export function findPelaporByNama(nama: string): PelaporInfo | undefined {
  return PELAPOR_LIST.find(p => p.nama === nama);
}

/**
 * Mencocokkan data user akun yang sedang login (wali asuh) dengan daftar resmi PELAPOR_LIST
 * sehingga dropdown form pelapor otomatis langsung memilih nama lengkap dan NIP pengguna bersangkutan.
 */
export function findMatchingPelapor(user?: { username?: string; nama?: string; nip?: string; role?: string } | null): PelaporInfo {
  if (!user) return DEFAULT_PELAPOR;

  // Jika super_admin dan bukan wali asuh, kembalikan default
  if (user.role === 'super_admin' && !user.nama?.includes('S.P') && !user.nama?.includes('S.T') && !user.nama?.includes('S.Gz') && !user.nama?.includes('S.Kom')) {
    return DEFAULT_PELAPOR;
  }

  // 1. Cocokkan persis nama lengkap (case-insensitive)
  if (user.nama) {
    const trimmed = user.nama.trim().toLowerCase();
    const exact = PELAPOR_LIST.find(p => p.nama.trim().toLowerCase() === trimmed);
    if (exact) return exact;
  }

  // 2. Cocokkan persis NIP
  if (user.nip && user.nip.trim()) {
    const nipTrim = user.nip.trim();
    const nipMatch = PELAPOR_LIST.find(p => p.nip === nipTrim);
    if (nipMatch) return nipMatch;
  }

  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const uNameClean = user.nama ? clean(user.nama) : '';
  const uUserClean = user.username ? clean(user.username) : '';

  // 3. Cocokkan substring nama yang telah dibersihkan
  if (uNameClean.length >= 3) {
    const nameMatch = PELAPOR_LIST.find(p => {
      const pClean = clean(p.nama);
      return pClean.includes(uNameClean) || uNameClean.includes(pClean);
    });
    if (nameMatch) return nameMatch;
  }

  // 4. Cocokkan username dengan nama pelapor (contoh: 'ekowahyudi' -> 'Eko Wahyudi, S.Pd', 'zainudin' -> 'A. Zainudin Sholeh, S.A.P.')
  if (uUserClean.length >= 3) {
    const userMatch = PELAPOR_LIST.find(p => {
      const pClean = clean(p.nama);
      return pClean.includes(uUserClean) || uUserClean.includes(pClean);
    });
    if (userMatch) return userMatch;
  }

  // 5. Cocokkan kata-kata dalam nama (misal: "Eko Wahyudi" cocok dengan "Eko Wahyudi, S.Pd")
  if (user.nama) {
    const words = user.nama.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    let bestMatch: PelaporInfo | null = null;
    let maxMatches = 0;
    for (const p of PELAPOR_LIST) {
      const pWords = p.nama.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      const matches = words.filter(w => pWords.includes(w)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = p;
      }
    }
    if (bestMatch && maxMatches > 0) return bestMatch;
  }

  // 6. Token match on username (misal 'eko' atau 'wahyudi')
  if (uUserClean.length >= 3) {
    const matched = PELAPOR_LIST.find(p => {
      const words = p.nama.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
      return words.some(w => uUserClean.includes(w) || w.includes(uUserClean));
    });
    if (matched) return matched;
  }

  // 7. Jika akun wali asuh kustom yang baru dibuat di luar daftar standar
  if (user.nama && user.role === 'wali_asuh') {
    return {
      nama: user.nama,
      nip: user.nip || '',
    };
  }

  return DEFAULT_PELAPOR;
}

import { TTD_AHMAD_FADKHURRIZA, TTD_EKO_WAHYUDI } from './ttd-preset-data';

// --- Pre-configured TTD URLs per pelapor ---
const PRESET_TTD: Record<string, string> = {
  'Ahmad Fadkhurriza Ivakhudin, S.Gz': TTD_AHMAD_FADKHURRIZA,
  'Eko Wahyudi, S.Pd': TTD_EKO_WAHYUDI,
};

// --- Saved TTD per pelapor (localStorage) ---

const TTD_STORAGE_KEY = '__savedTtdPerPelapor';

function getTtdMap(): Record<string, string> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = localStorage.getItem(TTD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Pastikan tanda tangan A. Zainudin Sholeh, S.A.P. bersih terhapus dari sistem
    if (parsed) {
      let modified = false;
      for (const k of Object.keys(parsed)) {
        if (k.toLowerCase().includes('zainudin')) {
          delete parsed[k];
          modified = true;
        }
      }
      if (modified) {
        localStorage.setItem(TTD_STORAGE_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

export function getSavedTtd(namaPelapor: string): string | null {
  if (!namaPelapor) return null;

  // Pastikan nama Zainudin selalu kosong kecuali jika baru diupload sendiri
  if (namaPelapor.toLowerCase().includes('zainudin')) {
    const map = getTtdMap();
    return map[namaPelapor] || null;
  }

  const map = getTtdMap();

  // Khusus Ahmad Fadkhurriza Ivakhudin, S.Gz: Preset tanda tangan bawaan selalu siap digunakan
  if (namaPelapor.toLowerCase().includes('fadkhurriza') || namaPelapor.toLowerCase().includes('ivakhudin')) {
    return map[namaPelapor] || PRESET_TTD['Ahmad Fadkhurriza Ivakhudin, S.Gz'] || TTD_AHMAD_FADKHURRIZA;
  }

  // Khusus Eko Wahyudi, S.Pd: Preset tanda tangan bawaan selalu siap digunakan
  if (namaPelapor.toLowerCase().includes('eko') || namaPelapor.toLowerCase().includes('wahyudi')) {
    return map[namaPelapor] || PRESET_TTD['Eko Wahyudi, S.Pd'] || TTD_EKO_WAHYUDI;
  }

  // Check localStorage first (user-uploaded overrides), then preset
  return map[namaPelapor] || PRESET_TTD[namaPelapor] || null;
}

export function saveTtd(namaPelapor: string, url: string): void {
  const map = getTtdMap();
  map[namaPelapor] = url;
  localStorage.setItem(TTD_STORAGE_KEY, JSON.stringify(map));
}

export function removeTtd(namaPelapor: string): void {
  const map = getTtdMap();
  delete map[namaPelapor];
  localStorage.setItem(TTD_STORAGE_KEY, JSON.stringify(map));
}

