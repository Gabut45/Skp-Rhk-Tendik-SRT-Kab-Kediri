// IndexedDB + localStorage helper for autosaving Input Kegiatan Harian drafts safely

export interface KegiatanDraftItem {
  id: string;
  waktuMulai: string;
  waktuSelesai: string;
  kataKunci: string;
  deskripsi: string;
  rhk: string;
  photos: string[];
  copiedPhotoUrls?: string[];
}

export interface KegiatanDraftPayload {
  userKey: string;
  tanggal: string;
  namaPelapor: string;
  nip: string;
  kegiatanList: KegiatanDraftItem[];
  updatedAt: string;
}

const DRAFT_DB_NAME = 'skp_draft_storage_v1';
const DRAFT_STORE = 'drafts';

function openDraftDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DRAFT_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DRAFT_STORE)) {
          db.createObjectStore(DRAFT_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function getDraftKey(userKey?: string): string {
  const clean = (userKey || 'guest').toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `draft_kegiatan_${clean}`;
}

export async function saveKegiatanDraft(payload: KegiatanDraftPayload): Promise<void> {
  if (typeof window === 'undefined') return;
  const key = getDraftKey(payload.userKey);

  try {
    const db = await openDraftDb();
    if (db) {
      const tx = db.transaction(DRAFT_STORE, 'readwrite');
      tx.objectStore(DRAFT_STORE).put(payload, key);
      await new Promise<void>((res) => {
        tx.oncomplete = () => res();
        tx.onerror = () => res();
        tx.onabort = () => res();
      });
    }
  } catch {}

  // Simpan versi metadata/ringan ke localStorage sebagai cadangan cepat
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    try {
      const lightList = payload.kegiatanList.map((k) => ({
        ...k,
        photos: k.photos.filter((p) => p.startsWith('http')),
      }));
      localStorage.setItem(key, JSON.stringify({ ...payload, kegiatanList: lightList }));
    } catch {}
  }
}

export async function loadKegiatanDraft(userKey?: string): Promise<KegiatanDraftPayload | null> {
  if (typeof window === 'undefined') return null;
  const key = getDraftKey(userKey);

  try {
    const db = await openDraftDb();
    if (db) {
      const tx = db.transaction(DRAFT_STORE, 'readonly');
      const req = tx.objectStore(DRAFT_STORE).get(key);
      const result = await new Promise<KegiatanDraftPayload | null>((res) => {
        req.onsuccess = () => res((req.result as KegiatanDraftPayload) || null);
        req.onerror = () => res(null);
      });
      if (result && Array.isArray(result.kegiatanList)) {
        return result;
      }
    }
  } catch {}

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as KegiatanDraftPayload;
      if (parsed && Array.isArray(parsed.kegiatanList)) {
        return parsed;
      }
    }
  } catch {}

  return null;
}

export async function clearKegiatanDraft(userKey?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const key = getDraftKey(userKey);

  try {
    const db = await openDraftDb();
    if (db) {
      const tx = db.transaction(DRAFT_STORE, 'readwrite');
      tx.objectStore(DRAFT_STORE).delete(key);
    }
  } catch {}

  try {
    localStorage.removeItem(key);
  } catch {}
}
