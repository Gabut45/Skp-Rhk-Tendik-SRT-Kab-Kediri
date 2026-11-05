import fs from 'fs';
import path from 'path';

export interface DeletedDateRange {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  namaPelapor?: string;
  rhkKategori?: string;
}

interface DeletedStoreData {
  deletedAll: boolean;
  deletedIds: string[];
  deletedRiwayatKeys: string[];
  deletedRanges: DeletedDateRange[];
}

const STORE_PATH = path.resolve(process.cwd(), '.zite', 'deleted_records.json');

function loadStore(): DeletedStoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return {
        deletedAll: Boolean(data.deletedAll),
        deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : [],
        deletedRiwayatKeys: Array.isArray(data.deletedRiwayatKeys) ? data.deletedRiwayatKeys : [],
        deletedRanges: Array.isArray(data.deletedRanges) ? data.deletedRanges : [],
      };
    }
  } catch (err) {
    console.warn('[deleted_store] Gagal membaca deleted_records.json:', err);
  }
  return {
    deletedAll: false,
    deletedIds: [],
    deletedRiwayatKeys: [],
    deletedRanges: [],
  };
}

let storeMemory: DeletedStoreData = loadStore();

function saveStore(): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeMemory, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[deleted_store] Gagal menyimpan deleted_records.json:', err);
  }
}

export function isDeletedAll(): boolean {
  return storeMemory.deletedAll;
}

export function setDeletedAll(value: boolean): void {
  storeMemory.deletedAll = value;
  if (value) {
    storeMemory.deletedIds = [];
    storeMemory.deletedRiwayatKeys = [];
    storeMemory.deletedRanges = [];
  }
  saveStore();
}

export function addDeletedIds(ids: string[]): void {
  if (ids.length === 0) return;
  const set = new Set(storeMemory.deletedIds);
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
  storeMemory.deletedIds = Array.from(set);
  saveStore();
}

export function addDeletedRange(range: DeletedDateRange): void {
  if (!range.tanggalMulai && !range.tanggalSelesai) return;
  storeMemory.deletedRanges.push(range);
  saveStore();
}

export function addDeletedRiwayatKey(key: string): void {
  if (!key) return;
  const set = new Set(storeMemory.deletedRiwayatKeys);
  set.add(key);
  storeMemory.deletedRiwayatKeys = Array.from(set);
  saveStore();
}

export function getDeletedStore(): DeletedStoreData {
  return {
    deletedAll: storeMemory.deletedAll,
    deletedIds: [...storeMemory.deletedIds],
    deletedRiwayatKeys: [...storeMemory.deletedRiwayatKeys],
    deletedRanges: [...storeMemory.deletedRanges],
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
  if (storeMemory.deletedAll) return true;

  const idStr = String(r.id || '');
  if (idStr && storeMemory.deletedIds.includes(idStr)) return true;
  if (idStr.startsWith('keg_')) {
    const num = idStr.replace('keg_', '');
    if (storeMemory.deletedIds.includes(num)) return true;
  }

  const recDate = r.tanggal || r.tanggalMulai;
  const recPelapor = (r.namaPelapor || '').trim().toLowerCase();
  const recRhk = (r.rhkKategori || r.rhkNomor || '').trim().toLowerCase();

  // Check riwayat key
  if (recDate && r.namaPelapor) {
    const rKey = `${recDate}___${r.namaPelapor}`;
    if (storeMemory.deletedRiwayatKeys.includes(rKey)) return true;
  }

  // Check date ranges
  for (const range of storeMemory.deletedRanges) {
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
