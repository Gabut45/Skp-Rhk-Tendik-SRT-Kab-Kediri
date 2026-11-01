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

// --- Pre-configured TTD URLs per pelapor ---
const PRESET_TTD: Record<string, string> = {
  'A. Zainudin Sholeh, S.A.P.': 'https://images.fillout.com/orgid-722247/flowpublicid-j9anpelbvb/widgetid-default/iScw8GkACqaf89MJQhsZDZ/pasted-image-1785765839992-22iezw3b.png',
};

// --- Saved TTD per pelapor (localStorage) ---

const TTD_STORAGE_KEY = '__savedTtdPerPelapor';

function getTtdMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TTD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
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
