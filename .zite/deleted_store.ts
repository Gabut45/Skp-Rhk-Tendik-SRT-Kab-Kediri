export interface DeletedDateRange {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  namaPelapor?: string;
  rhkKategori?: string;
}

export interface DeletedStoreData {
  deletedAll: boolean;
  deletedIds: string[];
  deletedRiwayatKeys: string[];
  deletedRanges: DeletedDateRange[];
}

const LOCAL_STORAGE_KEY = 'zite_deleted_records';

function getDefaultStore(): DeletedStoreData {
  return {
    deletedAll: false,
    deletedIds: [],
    deletedRiwayatKeys: [],
    deletedRanges: [],
  };
}

let memoryFallback: DeletedStoreData = getDefaultStore();

function loadStore(): DeletedStoreData {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        return {
          deletedAll: Boolean(data.deletedAll),
          deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : [],
          deletedRiwayatKeys: Array.isArray(data.deletedRiwayatKeys) ? data.deletedRiwayatKeys : [],
          deletedRanges: Array.isArray(data.deletedRanges) ? data.deletedRanges : [],
        };
      }
    } catch (err) {
      console.warn('[deleted_store] Gagal membaca deleted records dari localStorage:', err);
    }
    return getDefaultStore();
  }
  return memoryFallback;
}

function saveStore(data: DeletedStoreData): void {
  memoryFallback = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('[deleted_store] Gagal menyimpan deleted records ke localStorage:', err);
    }
  }
}

export function isDeletedAll(): boolean {
  const store = loadStore();
  return store.deletedAll;
}

export function setDeletedAll(value: boolean): void {
  const store = loadStore();
  store.deletedAll = value;
  if (value) {
    store.deletedIds = [];
    store.deletedRiwayatKeys = [];
    store.deletedRanges = [];
  }
  saveStore(store);
}

export function addDeletedIds(ids: string[]): void {
  if (ids.length === 0) return;
  const store = loadStore();
  const set = new Set(store.deletedIds);
  ids.forEach(id => {
    if (id) {
      set.add(String(id));
      // Also add numeric version if starts with keg_
      if (id.startsWith('keg_')) {
        const num = id.replace('keg_', '');
        if (num) set.add(num);
      }
    }
  });
  store.deletedIds = Array.from(set);
  saveStore(store);
}

export function addDeletedRange(range: DeletedDateRange): void {
  if (!range.tanggalMulai && !range.tanggalSelesai) return;
  const store = loadStore();
  store.deletedRanges.push(range);
  saveStore(store);
}

export function addDeletedRiwayatKey(key: string): void {
  if (!key) return;
  const store = loadStore();
  const set = new Set(store.deletedRiwayatKeys);
  set.add(key);
  store.deletedRiwayatKeys = Array.from(set);
  saveStore(store);
}

export function getDeletedStore(): DeletedStoreData {
  const store = loadStore();
  return {
    deletedAll: store.deletedAll,
    deletedIds: [...store.deletedIds],
    deletedRiwayatKeys: [...store.deletedRiwayatKeys],
    deletedRanges: [...store.deletedRanges],
  };
}

export function isRecordDeleted(r: {
  id?: string | number;
  tanggal?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  namaPelapor?: string;
  rhkKategori?: string;
  rhkNomor?: string;
}): boolean {
  const store = loadStore();
  if (store.deletedAll) return true;

  const idStr = String(r.id || '');
  if (idStr && store.deletedIds.includes(idStr)) return true;
  if (idStr.startsWith('keg_')) {
    const num = idStr.replace('keg_', '');
    if (store.deletedIds.includes(num)) return true;
  }

  const recDate = r.tanggal || r.tanggalMulai;
  const recPelapor = (r.namaPelapor || '').trim().toLowerCase();
  const recRhk = (r.rhkKategori || r.rhkNomor || '').trim().toLowerCase();

  // Check riwayat key
  if (recDate && r.namaPelapor) {
    const rKey = `${recDate}___${r.namaPelapor}`;
    if (store.deletedRiwayatKeys.includes(rKey)) return true;
  }

  // Check date ranges
  for (const range of store.deletedRanges) {
    const rangePelapor = (range.namaPelapor || '').trim().toLowerCase();
    if (rangePelapor && recPelapor && rangePelapor !== recPelapor) {
      continue;
    }

    const start = range.tanggalMulai;
    const end = range.tanggalSelesai || range.tanggalMulai;

    if (recDate && start && end) {
      if (recDate >= start && recDate <= end) {
        if (!range.rhkKategori) return true;
        const targetRhk = range.rhkKategori.toLowerCase();
        if (recRhk && (recRhk.includes(targetRhk) || targetRhk.includes(recRhk))) {
          return true;
        }
      }
    }
  }

  return false;
}
