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
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('app_deleted_all') === 'true';
  }
  return false;
}

export function setAppDeletedAll(val: boolean) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('app_deleted_all', String(val));
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

export function isClientRecordDeleted(r: any): boolean {
  if (isAppDeletedAll()) return true;

  const id = String(r.id || (r.id_kegiatan ? `keg_${r.id_kegiatan}` : ''));
  const deleted = getDeletedIds();
  if (id && deleted.has(id)) return true;
  if (r.id_kegiatan && deleted.has(String(r.id_kegiatan))) return true;

  const tgl = r.tanggal || r.tanggalMulai;
  const pelapor = (r.namaPelapor || r.nama_pelapor || '').trim().toLowerCase();
  const rhk = (r.rhkKategori || r.rhk_kategori || r.rhkNomor || '').trim().toLowerCase();

  // Check riwayat key
  if (tgl && pelapor) {
    const deletedKeys = getDeletedRiwayatKeys();
    if (deletedKeys.has(`${tgl}___${r.namaPelapor || r.nama_pelapor}`)) return true;
  }

  // Check ranges
  const ranges = getDeletedRanges();
  for (const range of ranges) {
    const rangePelapor = (range.namaPelapor || '').trim().toLowerCase();
    if (rangePelapor && pelapor && rangePelapor !== pelapor) continue;

    const start = range.tanggalMulai;
    const end = range.tanggalSelesai || range.tanggalMulai;

    if (tgl && start && end) {
      if (tgl >= start && tgl <= end) {
        if (!range.rhkKategori) return true;
        const targetRhk = range.rhkKategori.toLowerCase();
        if (rhk && (rhk.includes(targetRhk) || targetRhk.includes(rhk))) {
          return true;
        }
      }
    }
  }

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

/**
 * Directly purges records from browser localStorage tables (zite_table_KegiatanHarian / zite_table_RiwayatFile)
 */
export function purgeLocalStorageTable(tableName: 'KegiatanHarian' | 'RiwayatFile', shouldRemove: (record: any) => boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = `zite_table_${tableName}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;
    const list = JSON.parse(stored);
    if (!Array.isArray(list)) return;
    const filtered = list.filter(item => !shouldRemove(item));
    localStorage.setItem(key, JSON.stringify(filtered));
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
    const kDate = item.tanggal;
    if (namaPelapor && item.namaPelapor === namaPelapor && kDate && start && end) {
      if (kDate >= start && kDate <= end) {
        if (!rhkNomor) return true;
        const target = rhkNomor.toLowerCase();
        const kRhk = (item.rhkKategori || '').toLowerCase();
        if (kRhk.includes(target) || target.includes(kRhk)) return true;
      }
    }
    return false;
  });

  // 3. Mark in deleted sets & ranges
  if (start) {
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
 * Delete activity from cPanel MySQL API permanently
 */
export async function deleteCpanelKegiatan(params: string | {
  id?: string;
  id_numeric?: string;
  tanggal?: string;
  namaPelapor?: string;
}): Promise<boolean> {
  const payload = typeof params === 'string' ? { id: params } : params;
  if (payload.id) markDeletedId(payload.id);

  const { url, key } = getCpanelConfig();
  if (!url) return true;

  try {
    const targetUrl = `${url}${url.includes('?') ? '&' : '?'}&action=delete_kegiatan`;
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
    const targetUrl = `${url}${url.includes('?') ? '&' : '?'}&action=delete_kegiatan`;
    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-API-KEY': key } : {}),
      },
      body: JSON.stringify({
        ids: ids.length > 0 ? ids : undefined,
        tanggal,
        namaPelapor,
      }),
    });
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
    const targetUrl = `${url}${url.includes('?') ? '&' : '?'}&action=delete_riwayat`;
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
      for (const r of data.records) {
        const nama = String(r.nama_pelapor || r.namaPelapor || '').trim();
        if (!nama) continue;

        let signatureUrl = '';
        if (Array.isArray(r.foto_kegiatan) && r.foto_kegiatan.length > 0) {
          const item = r.foto_kegiatan[0];
          signatureUrl = typeof item === 'string' ? item : (item?.url || '');
        } else if (Array.isArray(r.fotoKegiatan) && r.fotoKegiatan.length > 0) {
          const item = r.fotoKegiatan[0];
          signatureUrl = typeof item === 'string' ? item : (item?.url || '');
        }

        if (!signatureUrl) {
          if (Array.isArray(r.tanda_tangan) && r.tanda_tangan.length > 0) {
            const item = r.tanda_tangan[0];
            signatureUrl = typeof item === 'string' ? item : (item?.url || '');
          } else if (Array.isArray(r.tandaTangan) && r.tandaTangan.length > 0) {
            const item = r.tandaTangan[0];
            signatureUrl = typeof item === 'string' ? item : (item?.url || '');
          }
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


