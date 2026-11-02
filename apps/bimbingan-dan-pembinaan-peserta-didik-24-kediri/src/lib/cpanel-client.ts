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

/**
 * Fetch records from cPanel MySQL API
 */
export async function fetchCpanelKegiatan(params?: {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  namaPelapor?: string;
}): Promise<CpanelKegiatanRow[]> {
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
      const deleted = getDeletedIds();
      const mapped: CpanelKegiatanRow[] = [];

      for (const r of data.records) {
        const id = String(r.id || `keg_${r.id_kegiatan}`);
        if (deleted.has(id)) continue;

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

  const targetUrl = `${url}${url.includes('?') ? '&' : '?'}&action=save_bulk`;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-API-KEY': key } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return {
      success: Boolean(data.success),
      message: data.message || 'Tersimpan ke cPanel',
      count: data.count,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal terhubung ke cPanel',
    };
  }
}

/**
 * Delete activity from cPanel MySQL API
 */
export async function deleteCpanelKegiatan(id: string): Promise<boolean> {
  markDeletedId(id);
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
      body: JSON.stringify({ id }),
    });
  } catch {
    // ignore
  }
  return true;
}
