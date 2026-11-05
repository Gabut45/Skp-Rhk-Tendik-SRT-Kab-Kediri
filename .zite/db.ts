// LocalStorage & In-memory backed database implementation for AI Studio environment
export type ZiteAttachment = {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
};

export type ZiteAttachmentInput =
  | string
  | { url: string; filename?: string }
  | ZiteAttachment;

export type KegiatanHarianRecordType = {
  id: string;
  idKegiatan?: number;
  namaPelapor?: string;
  nip?: string;
  tanggal?: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  kataKunciKegiatan?: string;
  deskripsiKegiatan?: string;
  rhkKategori?: string;
  fotoKegiatan?: ZiteAttachment[];
  tandaTangan?: ZiteAttachment[];
  unitKerja?: string;
};

export type KegiatanHarianRecordInput = {
  namaPelapor: string | null;
  nip: string | null;
  tanggal: string | Date | null;
  waktuMulai: string | null;
  waktuSelesai: string | null;
  kataKunciKegiatan: string | null;
  deskripsiKegiatan: string | null;
  rhkKategori: string | null;
  fotoKegiatan: ZiteAttachmentInput[] | ZiteAttachmentInput | null;
  tandaTangan: ZiteAttachmentInput[] | ZiteAttachmentInput | null;
  unitKerja: string | null;
};

export type LaporanRhkRecordType = {
  id: string;
  idLaporan?: number;
  judulLaporan?: string;
  rhkNomor?: string;
  namaPelapor?: string;
  nip?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  isiLaporan?: string;
  pdfUrl?: string;
  dibuatPada?: string;
  tandaTangan?: ZiteAttachment[];
};

export type LaporanRhkRecordInput = {
  judulLaporan: string | null;
  rhkNomor: string | null;
  namaPelapor: string | null;
  nip: string | null;
  tanggalMulai: string | Date | null;
  tanggalSelesai: string | Date | null;
  isiLaporan: string | null;
  pdfUrl: string | null;
  dibuatPada: string | Date | null;
  tandaTangan: ZiteAttachmentInput[] | ZiteAttachmentInput | null;
};

export type RiwayatFileRecordType = {
  id: string;
  idFile?: number;
  namaFile?: string;
  jenisLaporan?: 'Kinerja Harian' | 'Laporan RHK' | string;
  namaPelapor?: string;
  pdfUrl?: string;
  dibuatPada?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  rhkNomor?: string;
};

export type RiwayatFileRecordInput = {
  namaFile: string | null;
  jenisLaporan: 'Kinerja Harian' | 'Laporan RHK' | string | null;
  namaPelapor: string | null;
  pdfUrl: string | null;
  dibuatPada: string | Date | null;
  tanggalMulai: string | Date | null;
  tanggalSelesai: string | Date | null;
  rhkNomor: string | null;
};

export interface ZiteAuthUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image: string | null;
}

import SEED_KEGIATAN from './seed_kegiatan.json';
import SEED_RIWAYAT from './seed_riwayat.json';

const INITIAL_KEGIATAN: KegiatanHarianRecordType[] = SEED_KEGIATAN as unknown as KegiatanHarianRecordType[];

const INITIAL_RIWAYAT: RiwayatFileRecordType[] = SEED_RIWAYAT as unknown as RiwayatFileRecordType[];

const memoryStore: Record<string, any[]> = {};

function deduplicateKegiatanList(list: any[]): any[] {
  const byFp = new Map<string, any>();
  const seenIds = new Set<string>();
  for (const r of list) {
    if (!r) continue;
    const id = String(r.id || '');
    if (id && seenIds.has(id)) continue;
    const tgl = String(r.tanggal || '').trim();
    const pelapor = String(r.namaPelapor || r.nama_pelapor || '').trim().toLowerCase();
    const mulai = String(r.waktuMulai || r.waktu_mulai || '').trim();
    const selesai = String(r.waktuSelesai || r.waktu_selesai || '').trim();
    const desc = String(r.deskripsiKegiatan || r.deskripsi_kegiatan || r.kataKunciKegiatan || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const fp = `${tgl}::${pelapor}::${mulai}::${selesai}::${desc}`;

    if (!byFp.has(fp)) {
      if (id) seenIds.add(id);
      byFp.set(fp, r);
    } else {
      const existing = byFp.get(fp);
      const existingPhotos = existing.fotoKegiatan || [];
      const rPhotos = r.fotoKegiatan || [];
      if (rPhotos.length > existingPhotos.length) {
        byFp.set(fp, r);
      }
    }
  }
  return Array.from(byFp.values());
}

import {
  isRecordDeleted,
  isDeletedAll,
  setDeletedAll,
  addDeletedIds,
  addDeletedRange,
  addDeletedRiwayatKey,
} from './deleted_store';

export {
  isRecordDeleted,
  isDeletedAll,
  setDeletedAll,
  addDeletedIds,
  addDeletedRange,
  addDeletedRiwayatKey,
};

function getTableRecords(tableName: string): any[] {
  if (isDeletedAll()) {
    return [];
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    const key = `zite_table_${tableName}`;
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Hanya upgrade jika data awal adalah placeholder demo dummy 'keg-0'
          if (tableName === 'KegiatanHarian' && parsed.length > 0 && parsed.length <= 4 && parsed[0]?.id?.startsWith('keg-0')) {
            localStorage.setItem(key, JSON.stringify(INITIAL_KEGIATAN));
            return INITIAL_KEGIATAN.filter(r => !isRecordDeleted(r));
          }
          if (tableName === 'KegiatanHarian') {
            const deduped = deduplicateKegiatanList(parsed);
            if (deduped.length !== parsed.length) {
              localStorage.setItem(key, JSON.stringify(deduped));
            }
            return deduped.filter(r => !isRecordDeleted(r));
          }
          return parsed.filter(r => !isRecordDeleted(r));
        }
      } catch {
        // parse error, fallback
      }
    }
    // Inisialisasi awal hanya jika localStorage sama sekali belum diset (pertama kali dibuka)
    let initial: any[] = [];
    if (tableName === 'KegiatanHarian') initial = INITIAL_KEGIATAN;
    if (tableName === 'RiwayatFile') initial = INITIAL_RIWAYAT;
    localStorage.setItem(key, JSON.stringify(initial));
    return initial.filter(r => !isRecordDeleted(r));
  }

  if (!memoryStore[tableName]) {
    if (tableName === 'KegiatanHarian') memoryStore[tableName] = deduplicateKegiatanList([...INITIAL_KEGIATAN]);
    else if (tableName === 'RiwayatFile') memoryStore[tableName] = [...INITIAL_RIWAYAT];
    else memoryStore[tableName] = [];
  }
  return memoryStore[tableName].filter(r => !isRecordDeleted(r));
}

function setTableRecords(tableName: string, records: any[]) {
  const toSave = tableName === 'KegiatanHarian' ? deduplicateKegiatanList(records) : records;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(`zite_table_${tableName}`, JSON.stringify(toSave));
  }
  memoryStore[tableName] = toSave;
}

function matchesFilter(val: any, filter: any): boolean {
  if (filter === undefined || filter === null) return true;
  if (typeof filter === 'object') {
    let ok = true;
    if (filter.contains !== undefined) {
      ok = ok && String(val || '').toLowerCase().includes(String(filter.contains).toLowerCase());
    }
    if (filter.gte !== undefined) {
      ok = ok && (val !== undefined && val !== null && String(val) >= String(filter.gte));
    }
    if (filter.lte !== undefined) {
      ok = ok && (val !== undefined && val !== null && String(val) <= String(filter.lte));
    }
    if (filter.gt !== undefined) {
      ok = ok && (val !== undefined && val !== null && String(val) > String(filter.gt));
    }
    if (filter.lt !== undefined) {
      ok = ok && (val !== undefined && val !== null && String(val) < String(filter.lt));
    }
    if (filter.not !== undefined) {
      if (filter.not === null) ok = ok && val !== null && val !== undefined;
      else ok = ok && val !== filter.not;
    }
    if (filter.in !== undefined && Array.isArray(filter.in)) {
      ok = ok && filter.in.includes(val);
    }
    return ok;
  }
  return String(val || '').toLowerCase() === String(filter).toLowerCase();
}

function createClient<T extends { id: string }, TInput>(tableName: string) {
  return {
    findAll: async (params?: { filters?: Record<string, any>; sort?: any[]; offset?: number; limit?: number }) => {
      let records = [...getTableRecords(tableName)];
      if (params?.filters) {
        records = records.filter(rec => {
          for (const [key, filter] of Object.entries(params.filters || {})) {
            if (!matchesFilter(rec[key], filter)) return false;
          }
          return true;
        });
      }
      const offset = params?.offset || 0;
      const limit = params?.limit || 500;
      const paged = records.slice(offset, offset + limit);
      return { records: paged as T[], hasMore: records.length > offset + limit };
    },
    findOne: async (params: { id?: string; filters?: Record<string, any> }) => {
      const records = getTableRecords(tableName);
      if (params.id) {
        return (records.find(r => r.id === params.id) || undefined) as T | undefined;
      }
      if (params.filters) {
        return (records.find(rec => {
          for (const [key, filter] of Object.entries(params.filters || {})) {
            if (!matchesFilter(rec[key], filter)) return false;
          }
          return true;
        }) || undefined) as T | undefined;
      }
      return records[0] as T | undefined;
    },
    create: async ({ record }: { record: any }) => {
      const records = getTableRecords(tableName);
      const newId = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const created = {
        ...record,
        id: newId,
        idKegiatan: records.length + 1,
        idLaporan: records.length + 1,
        idFile: records.length + 1,
      };
      records.unshift(created);
      setTableRecords(tableName, records);
      return created as T;
    },
    bulkCreate: async ({ records: items }: { records: any[] }) => {
      const records = getTableRecords(tableName);
      const createdList: any[] = [];
      items.forEach((item, idx) => {
        const newId = item.id || `rec_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
        const created = {
          ...item,
          id: newId,
          idKegiatan: records.length + idx + 1,
          idLaporan: records.length + idx + 1,
          idFile: records.length + idx + 1,
        };
        createdList.push(created);
      });
      records.unshift(...createdList);
      setTableRecords(tableName, records);
      return { success: true, records: createdList as T[] };
    },
    update: async ({ id, record }: { id: string; record: any }) => {
      const records = getTableRecords(tableName);
      const idx = records.findIndex(r => r.id === id);
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...record };
        setTableRecords(tableName, records);
        return { id, fields: record };
      }
      return { id, fields: {} };
    },
    delete: async ({ id }: { id: string }) => {
      const records = getTableRecords(tableName);
      const filtered = records.filter(r => r.id !== id);
      setTableRecords(tableName, filtered);
      return { success: true, id };
    },
  };
}

export const zite = {
  kegiatanHarian: createClient<KegiatanHarianRecordType, KegiatanHarianRecordInput>('KegiatanHarian'),
  laporanRhk: createClient<LaporanRhkRecordType, LaporanRhkRecordInput>('LaporanRhk'),
  riwayatFile: createClient<RiwayatFileRecordType, RiwayatFileRecordInput>('RiwayatFile'),
  sql: async () => ({ rows: [], columns: [], rowCount: 0, truncated: false }),
  auth: {
    findAllUsers: async () => [{
      id: 'usr_wali_01',
      name: 'A. Zainudin Sholeh, S.A.P.',
      email: 'khususmyasn@gmail.com',
      image: null,
    }],
    updateUserProfile: async () => {},
  },
};
