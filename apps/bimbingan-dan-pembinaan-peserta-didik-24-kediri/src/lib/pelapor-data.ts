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
 * Mencocokkan nama atau username akun login ke Pelapor resmi (misal 'Eko Wahyudi' atau 'ekowahyudi' -> 'Eko Wahyudi, S.Pd')
 */
export function matchPelapor(nameOrUser?: string): PelaporInfo | undefined {
  if (!nameOrUser) return undefined;
  const raw = nameOrUser.trim();
  const q = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!q) return undefined;

  // 1. Cocok persis nama lengkap
  const exact = PELAPOR_LIST.find(p => p.nama.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;

  // 2. Cocok persis alphanumeric
  const cleanMatch = PELAPOR_LIST.find(p => p.nama.toLowerCase().replace(/[^a-z0-9]/g, '') === q);
  if (cleanMatch) return cleanMatch;

  // 3. Cocok berdasarkan kata (contoh: "Eko Wahyudi" cocok dengan "Eko Wahyudi, S.Pd")
  const words = raw.toLowerCase().split(/[\s,.]+/).filter(w => w.length >= 3);
  if (words.length > 0) {
    const wordMatch = PELAPOR_LIST.find(p => {
      const pLower = p.nama.toLowerCase();
      return words.every(w => pLower.includes(w));
    });
    if (wordMatch) return wordMatch;
  }

  // 4. Cocok substring
  const partial = PELAPOR_LIST.find(p => {
    const pClean = p.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
    return pClean.includes(q) || q.includes(pClean);
  });
  return partial;
}

// --- Pre-configured TTD URLs per pelapor (kosong secara default) ---
const PRESET_TTD: Record<string, string> = {};

// --- Saved TTD per pelapor (localStorage) ---

const TTD_STORAGE_KEY = '__savedTtdPerPelapor';

function getTtdMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TTD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // Pastikan tanda tangan A. Zainudin Sholeh terhapus dari sistem sesuai permintaan
    if (parsed['A. Zainudin Sholeh, S.A.P.']) {
      delete parsed['A. Zainudin Sholeh, S.A.P.'];
      localStorage.setItem(TTD_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {};
  }
}

export function getSavedTtd(namaPelapor: string): string | null {
  // Check localStorage first (user-uploaded overrides), then preset
  const map = getTtdMap();
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
