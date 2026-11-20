import { getKegiatan, getRiwayat, saveBulkKegiatan } from 'zitejs/api';
import {
  getCpanelConfig,
  fetchCpanelPresetTtd,
  fetchCpanelRiwayat,
  fetchCpanelUsers,
  saveCpanelPresetTtd,
  saveCpanelRiwayat,
  saveCpanelUser,
  setAppDeletedAll,
  type CpanelRiwayatRecord,
  type CpanelUserRecord,
} from './cpanel-client';

export interface SkpBackupPayload {
  version: string;
  exportedAt: string;
  appName: string;
  includeImages: boolean;
  stats: {
    kegiatanCount: number;
    riwayatRhkCount: number;
    presetTtdCount: number;
    usersCount: number;
    mediaCount: number;
  };
  kegiatan: any[];
  riwayatRhk: CpanelRiwayatRecord[];
  presetTtd: Record<string, string>;
  users: CpanelUserRecord[];
  mediaArchive: Record<string, string>;
}

const BACKUP_DB_NAME = 'skp_auto_backup_v1';
const BACKUP_STORE = 'snapshots';

function openBackupDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(BACKUP_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(BACKUP_STORE)) {
          db.createObjectStore(BACKUP_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function fetchImageAsDataUrl(url: string, cpanelUrl: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;
  if (!url.startsWith('http')) return null;

  const toDataUrl = (blob: Blob): Promise<string | null> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });

  // 1. Direct CORS
  try {
    const res = await fetch(url, { mode: 'cors' });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && (ct.startsWith('image/') || ct.includes('octet-stream'))) {
      const blob = await res.blob();
      if (blob.size > 50) return await toDataUrl(blob);
    }
  } catch {}

  // 2. cPanel get_image proxy
  try {
    const proxyUrl = `${cpanelUrl.split('?')[0]}?action=get_image&file=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && (ct.startsWith('image/') || ct.includes('octet-stream'))) {
      const blob = await res.blob();
      if (blob.size > 50) return await toDataUrl(blob);
    }
  } catch {}

  // 3. Server proxy
  try {
    const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.startsWith('image/')) {
      const blob = await res.blob();
      if (blob.size > 50) return await toDataUrl(blob);
    }
  } catch {}

  return null;
}

export async function saveAutoBackupSnapshot(payload: SkpBackupPayload): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await openBackupDb();
    if (db) {
      const tx = db.transaction(BACKUP_STORE, 'readwrite');
      tx.objectStore(BACKUP_STORE).put(payload, 'latest');
    }
    localStorage.setItem('skp_last_auto_backup', JSON.stringify({
      exportedAt: payload.exportedAt,
      stats: payload.stats,
    }));
  } catch {}
}

export async function getLatestAutoBackupMeta(): Promise<{ exportedAt: string; stats: SkpBackupPayload['stats'] } | null> {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('skp_last_auto_backup');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export async function loadAutoBackupSnapshot(): Promise<SkpBackupPayload | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openBackupDb();
    if (db) {
      const tx = db.transaction(BACKUP_STORE, 'readonly');
      const req = tx.objectStore(BACKUP_STORE).get('latest');
      return await new Promise((res) => {
        req.onsuccess = () => res((req.result as SkpBackupPayload) || null);
        req.onerror = () => res(null);
      });
    }
  } catch {}
  return null;
}

export async function runAutoDailyBackupSnapshot(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const meta = await getLatestAutoBackupMeta();
    const todayPrefix = new Date().toISOString().slice(0, 10);
    if (meta && meta.exportedAt && meta.exportedAt.startsWith(todayPrefix)) {
      return; // Sudah ada snapshot hari ini
    }
    const snapshot = await createFullBackup({ includeImages: false });
    if (snapshot.stats.kegiatanCount > 0 || snapshot.stats.riwayatRhkCount > 0) {
      await saveAutoBackupSnapshot(snapshot);
    }
  } catch {}
}

export async function createFullBackup(options: {
  includeImages: boolean;
  onProgress?: (msg: string) => void;
}): Promise<SkpBackupPayload> {
  const { includeImages, onProgress } = options;
  const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();

  onProgress?.('Mengambil seluruh data kegiatan dari server...');
  const kegRes = await getKegiatan({
    summaryOnly: false,
    cpanelUrl,
    cpanelKey,
  });
  const kegiatan = (kegRes.records || []).filter(
    (k) => k.tanggal && k.tanggal !== '1970-01-01'
  );

  onProgress?.('Mengambil daftar riwayat Laporan RHK...');
  const [remoteRiw, localRiw] = await Promise.all([
    fetchCpanelRiwayat().catch(() => []),
    getRiwayat({}).then((r) => r.records).catch(() => []),
  ]);
  const riwMap = new Map<string, CpanelRiwayatRecord>();
  for (const r of [...remoteRiw, ...localRiw]) {
    if (!r || r.jenisLaporan !== 'Laporan RHK') continue;
    const key = `${r.namaPelapor || ''}::${r.rhkNomor || ''}::${r.tanggalMulai || ''}::${r.tanggalSelesai || ''}`;
    if (!riwMap.has(key)) {
      riwMap.set(key, {
        id: r.id,
        namaFile: r.namaFile || 'Laporan RHK',
        jenisLaporan: 'Laporan RHK',
        namaPelapor: r.namaPelapor || '',
        pdfUrl: '',
        tanggalMulai: r.tanggalMulai,
        tanggalSelesai: r.tanggalSelesai,
        rhkNomor: r.rhkNomor,
        dibuatPada: r.dibuatPada,
      });
    }
  }
  const riwayatRhk = Array.from(riwMap.values());

  onProgress?.('Mengambil preset tanda tangan dan akun pengguna...');
  const presetTtd = await fetchCpanelPresetTtd().catch(() => ({}));
  const users = await fetchCpanelUsers().catch(() => []);

  const mediaArchive: Record<string, string> = {};
  if (includeImages) {
    const urlsSet = new Set<string>();
    for (const k of kegiatan) {
      for (const f of k.fotoKegiatan || []) {
        const u = typeof f === 'string' ? f : f?.url || '';
        if (u && u.startsWith('http')) urlsSet.add(u);
      }
      for (const t of k.tandaTangan || []) {
        const u = typeof t === 'string' ? t : t?.url || '';
        if (u && u.startsWith('http')) urlsSet.add(u);
      }
    }
    for (const u of Object.values(presetTtd)) {
      if (u && u.startsWith('http')) urlsSet.add(u);
    }

    const urls = Array.from(urlsSet);
    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      onProgress?.(`Mengarsipkan foto & tanda tangan (${i + 1}/${urls.length})...`);
      const dataUrl = await fetchImageAsDataUrl(u, cpanelUrl);
      if (dataUrl) {
        mediaArchive[u] = dataUrl;
      }
    }
  }

  const payload: SkpBackupPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'SR Terintegrasi 1 Kab. Kediri - Sistem Pelaporan Kinerja',
    includeImages,
    stats: {
      kegiatanCount: kegiatan.length,
      riwayatRhkCount: riwayatRhk.length,
      presetTtdCount: Object.keys(presetTtd).length,
      usersCount: users.length,
      mediaCount: Object.keys(mediaArchive).length,
    },
    kegiatan,
    riwayatRhk,
    presetTtd,
    users,
    mediaArchive,
  };

  await saveAutoBackupSnapshot(payload);
  return payload;
}

export function downloadBackupJson(payload: SkpBackupPayload): void {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const datePart = new Date().toISOString().split('T')[0];
  const suffix = payload.includeImages ? 'lengkap-dengan-foto' : 'ringan';
  a.href = url;
  a.download = `backup-kinerja-srt1-kediri-${datePart}-${suffix}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function restoreFromBackup(
  payload: SkpBackupPayload,
  onProgress?: (msg: string) => void
): Promise<{
  restoredKegiatan: number;
  restoredRiwayat: number;
  restoredPresets: number;
  restoredMedia: number;
}> {
  if (!payload || !Array.isArray(payload.kegiatan)) {
    throw new Error('Format file backup tidak valid');
  }

  const { url: cpanelUrl, key: cpanelKey } = getCpanelConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cpanelKey ? { 'X-API-KEY': cpanelKey } : {}),
  };

  // 1. Restore media archive ke File Manager jika ada base64 tersimpan
  const urlRemap = new Map<string, string>();
  const mediaEntries = Object.entries(payload.mediaArchive || {});
  let restoredMedia = 0;

  for (let i = 0; i < mediaEntries.length; i++) {
    const [origUrl, base64Data] = mediaEntries[i];
    if (!base64Data || !base64Data.startsWith('data:image/')) continue;
    onProgress?.(`Mengembalikan file gambar ke File Manager (${i + 1}/${mediaEntries.length})...`);
    try {
      const subfolder = origUrl.includes('/ttd/') ? 'uploads/ttd' : 'uploads';
      const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}action=upload_foto`;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ foto: base64Data, subfolder }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) {
          urlRemap.set(origUrl, json.url);
          restoredMedia++;
        }
      }
    } catch {}
  }

  const remapUrl = (u: string): string => urlRemap.get(u) || payload.mediaArchive?.[u] || u;

  // 2. Restore preset TTD
  let restoredPresets = 0;
  const presetEntries = Object.entries(payload.presetTtd || {});
  for (let i = 0; i < presetEntries.length; i++) {
    const [namaPelapor, ttdUrl] = presetEntries[i];
    if (!namaPelapor || !ttdUrl) continue;
    onProgress?.(`Memulihkan preset TTD (${i + 1}/${presetEntries.length})...`);
    const res = await saveCpanelPresetTtd({ namaPelapor, url: remapUrl(ttdUrl) });
    if (res.success) restoredPresets++;
  }

  // 3. Restore akun pengguna jika ada
  for (const u of payload.users || []) {
    if (!u || !u.username || !u.nama) continue;
    await saveCpanelUser(u).catch(() => {});
  }

  // 4. Restore kegiatan dikelompokkan berdasarkan tanggal & pelapor
  const groups = new Map<string, any[]>();
  for (const k of payload.kegiatan) {
    if (!k || !k.tanggal || k.tanggal === '1970-01-01') continue;
    const key = `${k.tanggal}___${k.namaPelapor || 'Pelapor'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(k);
  }

  let restoredKegiatan = 0;
  const groupArr = Array.from(groups.entries());
  for (let i = 0; i < groupArr.length; i++) {
    const [gKey, items] = groupArr[i];
    const [tanggal, namaPelapor] = gKey.split('___');
    onProgress?.(`Memulihkan data kegiatan ${tanggal} (${i + 1}/${groupArr.length})...`);

    const first = items[0] || {};
    const ttdRaw = first.tandaTangan?.[0]?.url || first.tandaTangan?.[0] || '';
    const ttdUrl = typeof ttdRaw === 'string' && ttdRaw ? remapUrl(ttdRaw) : undefined;

    const res = await saveBulkKegiatan({
      namaPelapor,
      nip: first.nip || '',
      tanggal,
      tandaTangan: ttdUrl,
      cpanelUrl,
      cpanelKey,
      kegiatan: items.map((it: any, idx: number) => ({
        id: it.id,
        waktuMulai: it.waktuMulai || '08:00',
        waktuSelesai: it.waktuSelesai || '09:00',
        kataKunciKegiatan: it.kataKunciKegiatan || '',
        deskripsiKegiatan: it.deskripsiKegiatan || '',
        rhkKategori: it.rhkKategori || 'RHK 3',
        urutan: typeof it.urutan === 'number' ? it.urutan : idx,
        fotoKegiatan: (it.fotoKegiatan || [])
          .map((f: any) => (typeof f === 'string' ? f : f?.url || ''))
          .filter(Boolean)
          .map((u: string) => remapUrl(u)),
      })),
    });

    if (res.success) {
      restoredKegiatan += items.length;
    }
  }

  // 5. Restore riwayat RHK
  let restoredRiwayat = 0;
  for (let i = 0; i < (payload.riwayatRhk || []).length; i++) {
    const r = payload.riwayatRhk[i];
    onProgress?.(`Memulihkan riwayat Laporan RHK (${i + 1}/${payload.riwayatRhk.length})...`);
    const ok = await saveCpanelRiwayat(r);
    if (ok) restoredRiwayat++;
  }

  setAppDeletedAll(false);

  return {
    restoredKegiatan,
    restoredRiwayat,
    restoredPresets,
    restoredMedia,
  };
}
