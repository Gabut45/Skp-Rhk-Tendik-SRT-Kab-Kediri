import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  saveLearnedVocabularyServer,
  lookupServerVocabulary,
} from './vocabularyService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca langsung file .env untuk memastikan kunci permanen pengguna selalu digunakan
function loadKeyFromEnvFile(): string | null {
  try {
    const paths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../../../../.env'),
      path.resolve(__dirname, '../../.env'),
      path.resolve(__dirname, '.env'),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf-8');
        const match = text.match(/^\s*GEMINI_API_KEY\s*=\s*([^\r\n#]+)/m);
        if (match && match[1]) {
          const val = match[1].trim();
          if (val && val !== 'TODO' && !val.includes('MY_GEMINI_API_KEY') && !val.includes('AIzaSyDummy')) {
            return val;
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

const envFileKey = loadKeyFromEnvFile();
if (envFileKey) {
  process.env.GEMINI_API_KEY = envFileKey;
}

let _aiInstance: GoogleGenAI | null = null;
let _apiKeyBlacklisted = false;
let _lastTestedKey = '';

/**
 * Validasi apakah API key Gemini tersedia dan bukan dummy / invalid
 */
export function hasValidGeminiKey(): boolean {
  // Selalu periksa kunci terbaru dari file .env jika ada
  const permanentKey = loadKeyFromEnvFile() || process.env.GEMINI_API_KEY;
  if (!permanentKey || typeof permanentKey !== 'string') return false;
  const trimmed = permanentKey.trim();

  // Reset status blacklist jika API key baru dimasukkan
  if (trimmed !== _lastTestedKey) {
    _lastTestedKey = trimmed;
    _apiKeyBlacklisted = false;
    _aiInstance = null;
    process.env.GEMINI_API_KEY = trimmed;
  }

  if (_apiKeyBlacklisted) return false;
  if (trimmed.length < 20) return false;
  if (
    trimmed === 'AIzaSyDummyKeyForInitializationOnly' ||
    trimmed === 'TODO' ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === 'MY_GEMINI_API_KEY'
  ) {
    return false;
  }
  return true;
}

export function getAi(): GoogleGenAI {
  if (!_aiInstance) {
    const key = hasValidGeminiKey()
      ? (process.env.GEMINI_API_KEY as string)
      : 'AIzaSyDummyKeyForInitializationOnly';

    _aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return _aiInstance;
}

// Proxy export for backwards compatibility
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    const instance = getAi() as any;
    return instance[prop];
  },
});

export interface GenerateDeskripsiPayload {
  kataKunci: string;
}

export interface GenerateDeskripsiResult {
  deskripsi: string;
  rhk: string;
}

/**
 * Server-side core generation function using Gemini 3.8 Flash
 * Dilengkapi proteksi bertingkat: jika API key tidak tersedia atau bermasalah,
 * sistem secara instan dan mulus beralih ke Bank Kosakata Server tanpa melempar error.
 */
export async function handleGenerateDeskripsiServer(rawKeyword: string): Promise<GenerateDeskripsiResult> {
  const trimmed = rawKeyword.trim();
  if (!trimmed) {
    return { deskripsi: '', rhk: 'RHK 3' };
  }

  // 1. Coba gunakan Gemini API jika key valid
  if (hasValidGeminiKey()) {
    try {
      const prompt = `Anda adalah sistem AI perumus deskripsi Sasaran Kinerja Pegawai (SKP) / Rencana Hasil Kerja (RHK) Tenaga Kependidikan / Wali Asuh di Sekolah Rakyat Terintegrasi 1 Kabupaten Kediri (SRT 1 Kediri / SRMA 24 Kediri).
Kata Kunci Kegiatan: "${trimmed}"

Instruksi:
1. Buat kalimat deskripsi kegiatan formal PNS/PPPK yang SANGAT PERSIS DAN RELEVAN dengan kata kunci.
   - PENTING: Perhatikan kata waktu (pagi, sarapan, siang, sore, malam, subuh). JANGAN PERNAH tertukar! Jika kata kunci berisi "makan malam", deskripsi WAJIB tentang makan malam (JANGAN menyebut makan pagi/sarapan). Jika kata kunci "makan pagi" atau "sarapan", deskripsi WAJIB tentang makan pagi (JANGAN menyebut makan malam). Begitu pula sholat, apel, piket, dan kegiatan lainnya.
2. Gunakan kalimat kerja operasional kedinasan (contoh: "Melaksanakan pendampingan...", "Membimbing dan mengawasi...", "Mendampingi peserta didik..."). Panjang 1-2 kalimat padat berkualitas.
3. Tentukan RHK yang paling sesuai:
   - RHK 1: Bimbingan dan Pengajaran Peserta Didik (belajar, tugas sekolah, review pelajaran, laptop belajar, refleksi harian, jurnal)
   - RHK 2: Kemandirian Peserta Didik (cuci pakaian/laundry, cuci piring, piket kebersihan, merapikan kamar/kasur, memasak mandiri)
   - RHK 3: Pendampingan, Bimbingan, Motivasi, dan Pembinaan Peserta Didik (membangunkan tidur, persiapan sekolah, antar-jemput, penyambutan pulang sekolah, makan pagi/siang/malam, sholat berjamaah, istirahat siang, tidur malam, upacara bendera)
   - RHK 4: Bimbingan Spiritual dan Emosional (mengaji/tadarus Al-Quran, kajian agama, setoran hafalan, apel pagi/malam, kedisiplinan/tata tertib, konseling, kesehatan/merawat siswa sakit, olahraga/senam pagi/sore, kunjungan ortu)
   - RHK 5: Pendampingan Peserta Didik Berkebutuhan Khusus
   - RHK 6: Pengembangan Kompetensi Tenaga Kependidikan
   - RHK 7: Tugas Tambahan dari Kepala Sekolah`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              deskripsi: {
                type: Type.STRING,
                description: 'Deskripsi kegiatan kedinasan formal yang presisi sesuai waktu dan kata kunci',
              },
              rhk: {
                type: Type.STRING,
                description: 'Kategori RHK yang sesuai, contoh: RHK 1, RHK 2, RHK 3, RHK 4',
              },
            },
            required: ['deskripsi', 'rhk'],
          },
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (parsed.deskripsi && parsed.rhk) {
        const deskripsiStr = String(parsed.deskripsi);
        const rhkStr = String(parsed.rhk);

        // Auto-save generated description to the persistent vocabulary bank
        try {
          saveLearnedVocabularyServer(trimmed, deskripsiStr, rhkStr, 'gemini');
        } catch {
          // ignore
        }

        return {
          deskripsi: deskripsiStr,
          rhk: rhkStr,
        };
      }
    } catch (err: any) {
      // Jika key tidak valid atau quota habis, tandai blacklist agar tidak berulang kali memanggil network
      const errMsg = String(err?.message || err || '');
      if (
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('API key not valid') ||
        err?.status === 400 ||
        err?.status === 403
      ) {
        _apiKeyBlacklisted = true;
      }
      // Beralih secara senyap & mulus ke Bank Kosakata Server
    }
  }

  // 2. Fallback instan & realistis ke Bank Kosakata Server (66+ Template Resmi SKP Kediri + Sintesis Cerdas)
  const lookup = lookupServerVocabulary(trimmed);
  return {
    deskripsi: lookup.deskripsi,
    rhk: lookup.rhk,
  };
}

/**
 * Server-side generic text generation with graceful retry
 */
export async function handleGenerateTextServer(prompt: string, systemInstruction?: string): Promise<string> {
  if (!hasValidGeminiKey()) {
    return 'Layanan sistem SKP Sekolah Rakyat Terintegrasi 1 Kediri aktif menggunakan bank kosakata lokal berstandar kedinasan.';
  }

  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      return response.text ?? '';
    } catch (err: any) {
      const errMsg = String(err?.message || err || '');
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
        _apiKeyBlacklisted = true;
        return 'Layanan sistem SKP Sekolah Rakyat Terintegrasi 1 Kediri aktif menggunakan bank kosakata lokal berstandar kedinasan.';
      }
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      return 'Layanan sistem SKP Sekolah Rakyat Terintegrasi 1 Kediri aktif menggunakan bank kosakata lokal berstandar kedinasan.';
    }
  }
  return '';
}

/**
 * Server-side streaming text generation with graceful error handling
 */
export async function handleStreamTextServer(
  prompt: string,
  onChunk: (textChunk: string) => void,
  systemInstruction?: string
): Promise<void> {
  if (!hasValidGeminiKey()) {
    onChunk('Layanan sistem SKP Sekolah Rakyat Terintegrasi 1 Kediri aktif menggunakan bank kosakata lokal berstandar kedinasan.');
    return;
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (err: any) {
    const errMsg = String(err?.message || err || '');
    if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
      _apiKeyBlacklisted = true;
    }
    onChunk('Layanan sistem SKP Sekolah Rakyat Terintegrasi 1 Kediri aktif menggunakan bank kosakata lokal berstandar kedinasan.');
  }
}
