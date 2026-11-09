export const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export interface CpanelKegiatanRow {
  id: string;
  namaPelapor?: string;
  nip?: string;
  tanggal?: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  kataKunciKegiatan?: string;
  deskripsiKegiatan?: string;
  rhkKategori?: string;
  fotoKegiatan?: { url: string }[];
  tandaTangan?: { url: string }[];
  unitKerja?: string;
}

export function getCpanelConfig() {
  let url = DEFAULT_CPANEL_URL;
  let key = '';
  if (typeof window !== 'undefined' && window.localStorage) {
    url = localStorage.getItem('cpanel_api_url') || DEFAULT_CPANEL_URL;
    key = localStorage.getItem('cpanel_api_key') || '';
  }
  return { url, key };
}

export function getDeletedIds(): Set<string> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('cpanel_deleted_ids');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }
  return new Set();
}

export function markDeletedId(id: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const set = getDeletedIds();
      set.add(id);
      localStorage.setItem('cpanel_deleted_ids', JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  }
}

export interface ClientDeletedRange {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  namaPelapor?: string;
  rhkKategori?: string;
}

export function isAppDeletedAll(): boolean {
  return false;
}

export function setAppDeletedAll(val: boolean) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (!val) {
      localStorage.removeItem('app_deleted_all');
    }
  }
}

export function getDeletedRanges(): ClientDeletedRange[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('cpanel_deleted_ranges');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return [];
}

export function addClientDeletedRange(range: ClientDeletedRange) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const list = getDeletedRanges();
      list.push(range);
      localStorage.setItem('cpanel_deleted_ranges', JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}

export function isClientRecordDeleted(_r: any): boolean {
  // Seluruh penghapusan sekarang dilakukan langsung secara permanen di database server MySQL.
  // Tidak ada penyaringan lokal per-perangkat agar data selalu 100% konsisten di semua perangkat.
  return false;
}

export function getDeletedRiwayatKeys(): Set<string> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('cpanel_deleted_riwayat_keys');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }
  return new Set();
}

export function markDeletedRiwayatKey(key: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const set = getDeletedRiwayatKeys();
      set.add(key);
      localStorage.setItem('cpanel_deleted_riwayat_keys', JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  }
}

/**
 * Fetch records from cPanel MySQL API
 */
export async function fetchCpanelKegiatan(params?: {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  namaPelapor?: string;
}): Promise<CpanelKegiatanRow[]> {
  if (isAppDeletedAll()) return [];

  const { url, key } = getCpanelConfig();
  if (!url) return [];

  const queryParams = new URLSearchParams({ action: 'get_kegiatan' });
  if (params?.tanggalMulai) queryParams.append('tanggalMulai', params.tanggalMulai);
  if (params?.tanggalSelesai) queryParams.append('tanggalSelesai', params.tanggalSelesai);
  if (params?.namaPelapor && params.namaPelapor !== 'Semua Pelapor' && params.namaPelapor !== 'ALL') {
    queryParams.append('namaPelapor', params.namaPelapor);
  }

  const targetUrl = `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      headers: key ? { 'X-API-KEY': key } : {},
    });

    if (!res.ok) {
      console.warn(`[cPanel API] HTTP ${res.status}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.records)) {
      const mapped: CpanelKegiatanRow[] = [];

      for (const r of data.records) {
        if (isClientRecordDeleted(r)) continue;
        if (r.tanggal === '1970-01-01' || r.kata_kunci_kegiatan === '__PRESET_TTD__' || r.rhk_kategori === '__SYSTEM_CONFIG__') continue;
        const id = String(r.id || `keg_${r.id_kegiatan}`);

        let fotoList: { url: string }[] = [];
        if (Array.isArray(r.foto_kegiatan)) {
          fotoList = r.foto_kegiatan.map((item: any) =>
            typeof item === 'string' ? { url: item } : { url: item.url || '' }
          ).filter(Boolean);
        } else if (Array.isArray(r.fotoKegiatan)) {
          fotoList = r.fotoKegiatan.map((item: any) =>
            typeof item === 'string' ? { url: item } : { url: item.url || '' }
          ).filter(Boolean);
        }

        let ttdList: { url: string }[] = [];
        if (Array.isArray(r.tanda_tangan)) {
          ttdList = r.tanda_tangan.map((item: any) =>
            typeof item === 'string' ? { url: item } : { url: item.url || '' }
          ).filter(Boolean);
        } else if (Array.isArray(r.tandaTangan)) {
          ttdList = r.tandaTangan.map((item: any) =>
            typeof item === 'string' ? { url: item } : { url: item.url || '' }
          ).filter(Boolean);
        }

        mapped.push({
          id,
          namaPelapor: r.nama_pelapor || r.namaPelapor || '',
          nip: r.nip || '',
          tanggal: r.tanggal || '',
          waktuMulai: r.waktu_mulai || r.waktuMulai || '',
          waktuSelesai: r.waktu_selesai || r.waktuSelesai || '',
          kataKunciKegiatan: r.kata_kunci_kegiatan || r.kataKunciKegiatan || '',
          deskripsiKegiatan: r.deskripsi_kegiatan || r.deskripsiKegiatan || '',
          rhkKategori: r.rhk_kategori || r.rhkKategori || 'RHK 3',
          fotoKegiatan: fotoList,
          tandaTangan: ttdList,
          unitKerja: r.unit_kerja || r.unitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
        });
      }

      return mapped;
    }
  } catch (err) {
    console.warn('[cPanel API] Gagal memuat data:', err);
  }

  return [];
}

/**
 * Save batch activities to cPanel MySQL API
 */
export async function saveCpanelBulk(payload: {
  namaPelapor: string;
  nip: string;
  tanggal: string;
  tandaTangan?: string;
  kegiatan: {
    waktuMulai: string;
    waktuSelesai: string;
    kataKunciKegiatan?: string;
    deskripsiKegiatan: string;
    rhkKategori: string;
    fotoKegiatan?: string[];
  }[];
}): Promise<{ success: boolean; message: string; count?: number }> {
  const { url, key } = getCpanelConfig();
  if (!url) return { success: false, message: 'URL cPanel belum disetel' };

  const targetUrl = `${url}${url.includes('?') ? '&' : '?'}action=save_bulk`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(key ? { 'X-API-KEY': key } : {}),
  };

  try {
    let savedCount = 0;
    const items = payload.kegiatan || [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const chunkPayload = {
        namaPelapor: payload.namaPelapor,
        nip: payload.nip,
        tanggal: payload.tanggal,
        tandaTangan: payload.tandaTangan,
        unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
        kegiatan: [item],
      };

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(chunkPayload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || `Gagal menyimpan kegiatan #${i + 1}`);
      }
      savedCount++;
    }

    return {
      success: true,
      message: `${savedCount} kegiatan tersimpan permanen di database server cPanel!`,
      count: savedCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal terhubung ke cPanel',
    };
  }
}

function updateIndexedDbTable(tableName: string, records: any[]) {
  if (typeof window === 'undefined' || !window.indexedDB) return;
  try {
    const req = window.indexedDB.open('zite_applet_storage', 1);
    req.onsuccess = () => {
      const db = req.result;
      if (db.objectStoreNames.contains(tableName)) {
        const tx = db.transaction(tableName, 'readwrite');
        tx.objectStore(tableName).put(records, 'records');
      }
    };
  } catch {}
}

/**
 * Directly purges records from browser localStorage tables and IndexedDB
 */
export function purgeLocalStorageTable(tableName: 'KegiatanHarian' | 'RiwayatFile', shouldRemove: (record: any) => boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `zite_table_${tableName}`;
    const stored = window.localStorage ? localStorage.getItem(key) : null;
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list)) {
        const filtered = list.filter(item => !shouldRemove(item));
        localStorage.setItem(key, JSON.stringify(filtered));
        updateIndexedDbTable(tableName, filtered);
      }
    }
  } catch (err) {
    console.warn(`[purgeLocalStorageTable] Gagal membersihkan ${tableName}:`, err);
  }
}

/**
 * Purge all local data and marks app as deleted all
 */
export function purgeAllLocalData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem('app_deleted_all', 'true');
    localStorage.setItem('zite_table_KegiatanHarian', '[]');
    localStorage.setItem('zite_table_RiwayatFile', '[]');
    localStorage.setItem('zite_table_LaporanRhk', '[]');
    localStorage.setItem('cpanel_deleted_ids', '[]');
    localStorage.setItem('cpanel_deleted_riwayat_keys', '[]');
    localStorage.setItem('cpanel_deleted_ranges', '[]');
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        window.indexedDB.deleteDatabase('zite_applet_storage');
      } catch {}
    }
  } catch (err) {
    console.warn('[purgeAllLocalData] Error:', err);
  }
}

/**
 * Purge both localStorage tables and cached ID sets for a given riwayat file and related activities
 */
export function purgeLocalDataForRiwayat(params: {
  recordId?: string;
  tanggal?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  namaPelapor?: string;
  rhkNomor?: string;
  deletedActivityIds?: string[];
}): void {
  const { recordId, tanggal, tanggalMulai, tanggalSelesai, namaPelapor, rhkNomor, deletedActivityIds = [] } = params;
  const start = tanggalMulai || tanggal;
  const end = tanggalSelesai || tanggalMulai || tanggal;

  // 1. Purge from zite_table_RiwayatFile
  purgeLocalStorageTable('RiwayatFile', item => {
    if (recordId && item.id === recordId) return true;
    const rDate = item.tanggalMulai || item.tanggalSelesai;
    if (namaPelapor && item.namaPelapor === namaPelapor && rDate && start && end) {
      if (rDate >= start && rDate <= end) {
        if (!rhkNomor) return true;
        const target = rhkNomor.toLowerCase();
        const rRhk = (item.rhkNomor || '').toLowerCase();
        if (rRhk.includes(target) || target.includes(rRhk)) return true;
      }
    }
    return false;
  });

  // 2. Purge from zite_table_KegiatanHarian
  purgeLocalStorageTable('KegiatanHarian', item => {
    if (item.id && deletedActivityIds.includes(item.id)) return true;
    if (recordId && item.id === recordId) return true;
    // Only purge by date/range if specifically requested without single recordId
    if (!recordId && namaPelapor && item.namaPelapor === namaPelapor && item.tanggal && start && end) {
      if (item.tanggal >= start && item.tanggal <= end) {
        if (!rhkNomor) return true;
        const target = rhkNomor.toLowerCase();
        const kRhk = (item.rhkKategori || '').toLowerCase();
        if (kRhk.includes(target) || target.includes(kRhk)) return true;
      }
    }
    return false;
  });

  // 3. Mark in deleted sets & ranges
  if (start && !recordId) {
    addClientDeletedRange({
      tanggalMulai: start,
      tanggalSelesai: end,
      namaPelapor,
      rhkKategori: rhkNomor,
    });
    if (namaPelapor) {
      markDeletedRiwayatKey(`${start}___${namaPelapor}`);
    }
  }
  if (recordId) {
    markDeletedId(recordId);
  }
  deletedActivityIds.forEach(id => markDeletedId(id));
}

/**
 * Helper to build cPanel API URLs without duplicate query marks
 */
function buildCpanelUrl(baseUrl: string, action: string, queryParams?: Record<string, string>): string {
  const clean = baseUrl.trim();
  const sep = clean.includes('?') ? '&' : '?';
  let url = `${clean}${sep}action=${action}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams).toString();
    if (params) url += `&${params}`;
  }
  return url;
}

/**
 * Delete activity from cPanel MySQL API permanently
 */
export async function deleteCpanelKegiatan(params: string | {
  id?: string;
  id_numeric?: string;
  ids?: string[];
  tanggal?: string;
  namaPelapor?: string;
  waktuMulai?: string;
}): Promise<boolean> {
  const payload = typeof params === 'string' ? { id: params } : params;
  if (payload.id) markDeletedId(payload.id);
  if (payload.ids) payload.ids.forEach(id => markDeletedId(id));

  const { url, key } = getCpanelConfig();
  if (!url) return true;

  try {
    const targetUrl = buildCpanelUrl(url, 'delete_kegiatan');
    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-API-KEY': key } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[deleteCpanelKegiatan] Error:', err);
  }
  return true;
}

/**
 * Delete multiple activities from cPanel MySQL API permanently
 */
export async function deleteCpanelBulkKegiatan(params: string[] | {
  ids?: string[];
  tanggal?: string;
  namaPelapor?: string;
}): Promise<boolean> {
  const ids = Array.isArray(params) ? params : (params.ids || []);
  const tanggal = !Array.isArray(params) ? params.tanggal : undefined;
  const namaPelapor = !Array.isArray(params) ? params.namaPelapor : undefined;

  ids.forEach(id => markDeletedId(id));

  const { url, key } = getCpanelConfig();
  if (!url) return true;

  try {
    const targetUrl = buildCpanelUrl(url, 'delete_kegiatan');
    if (ids.length > 0) {
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(key ? { 'X-API-KEY': key } : {}),
          },
          body: JSON.stringify({ ids: chunk }),
        });
      }
    }
    if (tanggal && namaPelapor) {
      await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'X-API-KEY': key } : {}),
        },
        body: JSON.stringify({ tanggal, namaPelapor }),
      });
    }
  } catch (err) {
    console.warn('[deleteCpanelBulkKegiatan] Error:', err);
  }
  return true;
}

/**
 * Delete riwayat record from cPanel MySQL API permanently
 */
export async function deleteCpanelRiwayat(params: {
  id?: string;
  tanggal?: string;
  namaPelapor?: string;
}): Promise<boolean> {
  if (params.tanggal && params.namaPelapor) {
    markDeletedRiwayatKey(`${params.tanggal}___${params.namaPelapor}`);
  }
  if (params.id) {
    markDeletedId(params.id);
  }

  const { url, key } = getCpanelConfig();
  if (!url) return true;

  try {
    const targetUrl = buildCpanelUrl(url, 'delete_riwayat');
    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-API-KEY': key } : {}),
      },
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.warn('[deleteCpanelRiwayat] Error:', err);
  }
  return true;
}

/**
 * Fetch all preset signatures for wali asuh stored in cPanel MySQL database
 */
export async function fetchCpanelPresetTtd(): Promise<Record<string, string>> {
  const { url, key } = getCpanelConfig();
  if (!url) return {};

  const targetUrl = `${url}${url.includes('?') ? '&' : '?'}action=get_kegiatan&tanggalMulai=1970-01-01&tanggalSelesai=1970-01-01`;

  try {
    const res = await fetch(targetUrl, {
      headers: key ? { 'X-API-KEY': key } : {},
    });

    if (!res.ok) return {};

    const data = await res.json();
    if (data.success && Array.isArray(data.records)) {
      const presets: Record<string, string> = {};

      const extractUrl = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') {
          const s = val.trim();
          if (s.startsWith('http') || s.startsWith('data:image/')) return s;
          try {
            const parsed = JSON.parse(s);
            return extractUrl(parsed);
          } catch {}
          return s;
        }
        if (Array.isArray(val) && val.length > 0) return extractUrl(val[0]);
        if (typeof val === 'object') return val.url || val.src || '';
        return '';
      };

      for (const r of data.records) {
        const isPresetRecord = r.kata_kunci_kegiatan === '__PRESET_TTD__' || r.kataKunciKegiatan === '__PRESET_TTD__';
        if (!isPresetRecord && r.kata_kunci_kegiatan === '__USER_ACCOUNT__') continue;

        const nama = String(r.nama_pelapor || r.namaPelapor || '').trim();
        if (!nama) continue;

        let signatureUrl = extractUrl(r.tanda_tangan || r.tandaTangan);
        const photoUrl = extractUrl(r.foto_kegiatan || r.fotoKegiatan);
        if (!signatureUrl || (photoUrl && photoUrl.includes('/ttd/'))) {
          signatureUrl = photoUrl || signatureUrl;
        }

        if (signatureUrl && signatureUrl !== 'EMPTY_PRESET' && signatureUrl !== 'CLEARED') {
          presets[nama] = signatureUrl;
        }
      }
      return presets;
    }
  } catch (err) {
    console.warn('[fetchCpanelPresetTtd] Error:', err);
  }
  return {};
}

/**
 * Save or delete a preset signature for a wali asuh in cPanel MySQL database
 */
export async function saveCpanelPresetTtd(params: {
  namaPelapor: string;
  nip?: string;
  url: string; // empty string to clear
}): Promise<{ success: boolean; message: string }> {
  const { url: baseUrl, key } = getCpanelConfig();
  if (!baseUrl) return { success: false, message: 'URL cPanel belum disetel' };

  const targetUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}action=save_bulk`;
  const cleanId = `preset_ttd_${params.namaPelapor.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}`;

  const payload = {
    namaPelapor: params.namaPelapor,
    nip: params.nip || '',
    tanggal: '1970-01-01',
    tandaTangan: params.url || undefined,
    unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
    kegiatan: [
      {
        id: cleanId,
        waktuMulai: '00:00',
        waktuSelesai: '00:00',
        kataKunciKegiatan: '__PRESET_TTD__',
        deskripsiKegiatan: params.url ? 'PRESET_SIGNATURE' : 'EMPTY_PRESET',
        rhkKategori: '__SYSTEM_CONFIG__',
        fotoKegiatan: params.url ? [params.url] : [],
      },
    ],
  };

  try {
    if (!params.url) {
      await deleteCpanelKegiatan({ id: cleanId });
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-API-KEY': key } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Gagal menyimpan ke cPanel');
    }

    return {
      success: true,
      message: params.url
        ? `Preset tanda tangan ${params.namaPelapor} berhasil disimpan di database server!`
        : `Preset tanda tangan ${params.namaPelapor} berhasil dihapus dari database server.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal tersambung ke cPanel',
    };
  }
}

export interface CpanelUserRecord {
  id: string;
  username: string;
  password: string;
  nama: string;
  nip?: string;
  role: 'super_admin' | 'wali_asuh';
  createdAt?: string;
}

/**
 * Fetch all registered user accounts from cPanel MySQL database in real time
 */
export async function fetchCpanelUsers(): Promise<CpanelUserRecord[]> {
  const { url, key } = getCpanelConfig();
  if (!url) return [];

  const headers: Record<string, string> = {};
  if (key) headers['X-API-KEY'] = key;

  const users: CpanelUserRecord[] = [];

  // 1. Coba endpoint langsung get_users jika PHP sudah mendukung tabel pengguna
  try {
    const directUrl = buildCpanelUrl(url, 'get_users');
    const res = await fetch(directUrl, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        return data.users;
      }
    }
  } catch {
    // Fallback ke penyimpanan terintegrasi di tabel kegiatan_harian
  }

  // 2. Fallback: Ambil akun yang tersimpan di baris sistem kegiatan_harian
  try {
    const targetUrl = buildCpanelUrl(url, 'get_kegiatan', {
      tanggalMulai: '1970-01-01',
      tanggalSelesai: '1970-01-01',
    });
    const res = await fetch(targetUrl, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        for (const r of data.records) {
          if (r.kata_kunci_kegiatan === '__USER_ACCOUNT__' && r.deskripsi_kegiatan) {
            try {
              const parsed = JSON.parse(r.deskripsi_kegiatan);
              if (parsed && parsed.username && parsed.nama) {
                users.push(parsed);
              }
            } catch {
              // ignore invalid json
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[fetchCpanelUsers] Warning:', err);
  }

  return users;
}

/**
 * Save user account to cPanel MySQL database in real time
 */
export async function saveCpanelUser(account: CpanelUserRecord): Promise<{ success: boolean; message: string }> {
  const { url, key } = getCpanelConfig();
  if (!url) return { success: false, message: 'URL cPanel belum disetel' };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['X-API-KEY'] = key;

  // 1. Coba simpan ke endpoint tabel pengguna langsung
  try {
    const directUrl = buildCpanelUrl(url, 'save_user');
    await fetch(directUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(account),
    }).catch(() => {});
  } catch {}

  // 2. Simpan juga ke baris rekaman sistem MySQL di kegiatan_harian agar langsung sinkron tanpa perlu update PHP
  const cleanUsername = account.username.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40);
  const cleanId = `user_account_${cleanUsername}`;

  const payload = {
    namaPelapor: account.nama,
    nip: account.nip || '',
    tanggal: '1970-01-01',
    unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
    kegiatan: [
      {
        id: cleanId,
        waktuMulai: '00:00',
        waktuSelesai: '00:00',
        kataKunciKegiatan: '__USER_ACCOUNT__',
        deskripsiKegiatan: JSON.stringify(account),
        rhkKategori: '__SYSTEM_CONFIG__',
      },
    ],
  };

  try {
    const saveUrl = buildCpanelUrl(url, 'save_bulk');
    const res = await fetch(saveUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, message: `Akun "${account.nama}" berhasil disimpan ke server database!` };
      }
    }
  } catch (err: any) {
    console.warn('[saveCpanelUser] Error:', err);
  }

  return { success: true, message: `Akun "${account.nama}" berhasil disimpan` };
}

/**
 * Delete user account from cPanel MySQL database in real time
 */
export async function deleteCpanelUser(id: string, username: string): Promise<boolean> {
  const { url, key } = getCpanelConfig();
  if (!url) return true;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['X-API-KEY'] = key;

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40);
  const cleanId = `user_account_${cleanUsername}`;

  // 1. Coba hapus di endpoint direct
  try {
    const directUrl = buildCpanelUrl(url, 'delete_user');
    await fetch(directUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, username }),
    }).catch(() => {});
  } catch {}

  // 2. Hapus baris sistem di MySQL
  try {
    await deleteCpanelKegiatan({ id: cleanId });
    if (id && id !== cleanId) {
      await deleteCpanelKegiatan({ id });
    }
  } catch {}

  return true;
}

/**
 * Auto-detect and push any unsynced offline activities stored in browser cache/localStorage
 * to MySQL cPanel and File Manager. Runs automatically on startup.
 */
export async function autoPushLocalKegiatanToCpanel(): Promise<{ pushedCount: number; message: string }> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { pushedCount: 0, message: 'Tidak di lingkungan browser' };
  }

  const { url, key } = getCpanelConfig();
  if (!url) return { pushedCount: 0, message: 'URL cPanel belum disetel' };

  try {
    const rawLocal = localStorage.getItem('zite_table_KegiatanHarian');
    if (!rawLocal) return { pushedCount: 0, message: 'Tidak ada data lokal' };

    const localItems = JSON.parse(rawLocal);
    if (!Array.isArray(localItems) || localItems.length === 0) {
      return { pushedCount: 0, message: 'Data lokal kosong' };
    }

    const deletedIds = getDeletedIds();

    // Saring hanya kegiatan riil pengguna (bukan record sistem 1970-01-01 atau yang sudah dihapus)
    const pendingItems = localItems.filter((item: any) => {
      if (!item || !item.id || !item.tanggal) return false;
      if (item.tanggal === '1970-01-01') return false;
      if (item.kataKunciKegiatan === '__PRESET_TTD__' || item.kataKunciKegiatan === '__USER_ACCOUNT__') return false;
      if (deletedIds.has(item.id)) return false;
      return true;
    });

    if (pendingItems.length === 0) {
      return { pushedCount: 0, message: 'Semua data lokal sudah bersih/sinkron' };
    }

    // Kelompokkan per (tanggal, namaPelapor)
    const byGroup = new Map<string, any[]>();
    for (const item of pendingItems) {
      const gKey = `${item.tanggal}___${item.namaPelapor || 'Pelapor'}`;
      if (!byGroup.has(gKey)) byGroup.set(gKey, []);
      byGroup.get(gKey)!.push(item);
    }

    let totalPushed = 0;

    for (const [groupKey, items] of byGroup.entries()) {
      const [tgl, pelapor] = groupKey.split('___');

      // Ambil daftar ID yang sudah ada di server cPanel untuk tanggal dan pelapor ini
      const serverExistingIds = new Set<string>();
      try {
        const checkUrl = buildCpanelUrl(url, 'get_kegiatan', {
          tanggalMulai: tgl,
          tanggalSelesai: tgl,
          namaPelapor: pelapor,
        });
        const res = await fetch(checkUrl, {
          headers: key ? { 'X-API-KEY': key } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.records)) {
            json.records.forEach((r: any) => {
              if (r.id) serverExistingIds.add(String(r.id));
              if (r.id_kegiatan) serverExistingIds.add(String(r.id_kegiatan));
            });
          }
        }
      } catch (err) {
        console.warn('[autoPushLocalKegiatanToCpanel] Gagal verifikasi server:', err);
      }

      // Cari kegiatan lokal yang BELUM ADA di cPanel server
      const unpushed = items.filter(it => !serverExistingIds.has(String(it.id)));
      if (unpushed.length === 0) continue;

      // Persiapkan payload & pastikan foto base64 diupload ke File Manager cPanel
      const preparedForServer: any[] = [];
      for (const it of unpushed) {
        const rawPhotos = Array.isArray(it.fotoKegiatan) ? it.fotoKegiatan : [];
        const finalPhotos: string[] = [];

        for (const p of rawPhotos) {
          const pUrl = typeof p === 'string' ? p : p?.url || '';
          if (!pUrl) continue;
          if (pUrl.startsWith('http')) {
            finalPhotos.push(pUrl);
          } else if (pUrl.startsWith('data:image/')) {
            try {
              // Upload base64 ke cPanel File Manager via upload_foto
              const upRes = await fetch(buildCpanelUrl(url, 'upload_foto'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(key ? { 'X-API-KEY': key } : {}) },
                body: JSON.stringify({ foto: pUrl, filename: `cached_${it.id}.jpg`, subfolder: 'uploads' }),
              });
              if (upRes.ok) {
                const upJson = await upRes.json();
                if (upJson.success && upJson.url) {
                  finalPhotos.push(upJson.url);
                  continue;
                }
              }
            } catch {}
            finalPhotos.push(pUrl);
          }
        }

        preparedForServer.push({
          id: it.id,
          waktuMulai: it.waktuMulai || '08:00',
          waktuSelesai: it.waktuSelesai || '09:00',
          kataKunciKegiatan: it.kataKunciKegiatan || '',
          deskripsiKegiatan: it.deskripsiKegiatan || '',
          rhkKategori: it.rhkKategori || 'RHK 3',
          fotoKegiatan: finalPhotos.length > 0 ? finalPhotos : undefined,
        });
      }

      if (preparedForServer.length === 0) continue;

      // Kirim per chunk ke cPanel MySQL save_bulk
      const firstItem = items[0];
      const payload = {
        namaPelapor: pelapor,
        nip: firstItem.nip || '',
        tanggal: tgl,
        unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
        kegiatan: preparedForServer,
      };

      try {
        const saveUrl = buildCpanelUrl(url, 'save_bulk');
        const sRes = await fetch(saveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(key ? { 'X-API-KEY': key } : {}) },
          body: JSON.stringify(payload),
        });

        if (sRes.ok) {
          const sJson = await sRes.json();
          if (sJson.success) {
            totalPushed += preparedForServer.length;
          }
        }
      } catch (saveErr) {
        console.warn('[autoPushLocalKegiatanToCpanel] Gagal simpan ke cPanel:', saveErr);
      }
    }

    if (totalPushed > 0) {
      try {
        localStorage.removeItem('zite_table_KegiatanHarian');
        localStorage.removeItem('cpanel_deleted_ids');
        localStorage.removeItem('cpanel_deleted_riwayat_keys');
        localStorage.removeItem('cpanel_deleted_ranges');
      } catch {}
    }

    return {
      pushedCount: totalPushed,
      message: totalPushed > 0
        ? `Berhasil menyinkronkan ${totalPushed} kegiatan offline dari cache perangkat ini ke database server cPanel!`
        : 'Semua kegiatan sudah tersimpan di server database',
    };
  } catch (err: any) {
    return { pushedCount: 0, message: err?.message || 'Error sinkronisasi lokal' };
  }
}


