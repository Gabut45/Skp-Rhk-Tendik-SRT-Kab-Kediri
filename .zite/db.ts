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

const memoryStore: Record<string, any[]> = {};

const INITIAL_KEGIATAN: KegiatanHarianRecordType[] = [
  {
    id: 'keg-01',
    idKegiatan: 1,
    namaPelapor: 'A. Zainudin Sholeh, S.A.P.',
    nip: '198810082026221001',
    tanggal: '2026-09-01',
    waktuMulai: '07:00',
    waktuSelesai: '08:30',
    kataKunciKegiatan: 'pembiasaan',
    deskripsiKegiatan: 'Melaksanakan pendampingan kegiatan pembiasaan pagi yang meliputi serangkaian aktivitas rutin seperti merapikan tempat tidur, membersihkan kamar, dan mempersiapkan kebutuhan harian secara mandiri di lingkungan asrama SRMA 24 Kediri.',
    rhkKategori: 'RHK 3',
    unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
  },
  {
    id: 'keg-02',
    idKegiatan: 2,
    namaPelapor: 'A. Zainudin Sholeh, S.A.P.',
    nip: '198810082026221001',
    tanggal: '2026-09-01',
    waktuMulai: '15:30',
    waktuSelesai: '17:00',
    kataKunciKegiatan: 'olahraga',
    deskripsiKegiatan: 'Melaksanakan pendampingan kegiatan olahraga pagi bersama peserta didik yang meliputi senam dan permainan tim guna menjaga kebugaran jasmani dan semangat positif di lingkungan asrama SRMA 24 Kediri.',
    rhkKategori: 'RHK 4',
    unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
  },
  {
    id: 'keg-03',
    idKegiatan: 3,
    namaPelapor: 'A. Zainudin Sholeh, S.A.P.',
    nip: '198810082026221001',
    tanggal: '2026-09-01',
    waktuMulai: '18:30',
    waktuSelesai: '19:30',
    kataKunciKegiatan: 'sholat',
    deskripsiKegiatan: 'Melaksanakan pendampingan ibadah sholat berjamaah bersama peserta didik di mushola asrama, memastikan ketertiban shaf, kekhusyukan pelaksanaan, serta ketepatan waktu dimulainya sholat.',
    rhkKategori: 'RHK 3',
    unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
  },
  {
    id: 'keg-04',
    idKegiatan: 4,
    namaPelapor: 'A. Zainudin Sholeh, S.A.P.',
    nip: '198810082026221001',
    tanggal: '2026-09-01',
    waktuMulai: '19:30',
    waktuSelesai: '21:00',
    kataKunciKegiatan: 'belajar',
    deskripsiKegiatan: 'Melaksanakan pendampingan kegiatan belajar bersama peserta didik dengan menekankan penguasaan materi pelajaran serta teknik belajar yang efektif dan efisien di lingkungan asrama SRMA 24 Kediri.',
    rhkKategori: 'RHK 1',
    unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
  },
];

const INITIAL_RIWAYAT: RiwayatFileRecordType[] = [
  {
    id: 'riw-01',
    idFile: 1,
    namaFile: 'Kinerja Harian - Selasa, 1 September 2026 (PDF)',
    jenisLaporan: 'Kinerja Harian',
    namaPelapor: 'A. Zainudin Sholeh, S.A.P.',
    dibuatPada: '2026-09-01T21:30:00.000Z',
    tanggalMulai: '2026-09-01',
    tanggalSelesai: '2026-09-01',
  },
];

function getTableRecords(tableName: string): any[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = `zite_table_${tableName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // parse error, fallback
      }
    }
    // initialize defaults
    let initial: any[] = [];
    if (tableName === 'KegiatanHarian') initial = INITIAL_KEGIATAN;
    if (tableName === 'RiwayatFile') initial = INITIAL_RIWAYAT;
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  if (!memoryStore[tableName]) {
    if (tableName === 'KegiatanHarian') memoryStore[tableName] = [...INITIAL_KEGIATAN];
    else if (tableName === 'RiwayatFile') memoryStore[tableName] = [...INITIAL_RIWAYAT];
    else memoryStore[tableName] = [];
  }
  return memoryStore[tableName];
}

function setTableRecords(tableName: string, records: any[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(`zite_table_${tableName}`, JSON.stringify(records));
  }
  memoryStore[tableName] = records;
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
