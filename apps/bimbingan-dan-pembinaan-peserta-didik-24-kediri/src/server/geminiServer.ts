import { GoogleGenAI, Type, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
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
let _blacklistTimestamp = 0;

/**
 * Validasi apakah API key Gemini tersedia dan bukan dummy / invalid
 */
export function hasValidGeminiKey(): boolean {
  // Selalu periksa kunci terbaru dari file .env atau environment variable
  const permanentKey = loadKeyFromEnvFile() || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!permanentKey || typeof permanentKey !== 'string') return false;
  const trimmed = permanentKey.trim();

  // Reset status blacklist jika API key baru dimasukkan
  if (trimmed !== _lastTestedKey) {
    _lastTestedKey = trimmed;
    _apiKeyBlacklisted = false;
    _blacklistTimestamp = 0;
    _aiInstance = null;
    process.env.GEMINI_API_KEY = trimmed;
  }

  // Jika pernah blacklist, beri kesempatan coba kembali setelah 30 detik (cooldown)
  if (_apiKeyBlacklisted) {
    if (Date.now() - _blacklistTimestamp > 30000) {
      _apiKeyBlacklisted = false;
      _aiInstance = null;
    } else {
      return false;
    }
  }

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
      const prompt = `Anda adalah sistem AI perumus deskripsi Sasaran Kinerja Pegawai (SKP) / Rencana Hasil Kerja (RHK) Tenaga Kependidikan / Wali Asuh di Sekolah Rakyat Terintegrasi 1 Kabupaten Kediri.
Kata Kunci Kegiatan: "${trimmed}"

Instruksi:
1. Buat kalimat deskripsi kegiatan formal ASN/PPPK/Wali Asuh yang SANGAT PERSIS, NATURAL, PROFESIONAL, DAN RELEVAN dengan kata kunci serta konteks asrama/sekolah di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.
   - PENTING: Perhatikan kata waktu (pagi, sarapan, siang, sore, malam, subuh). JANGAN PERNAH tertukar! Jika kata kunci berisi "makan malam" atau "apel malam", deskripsi WAJIB tentang malam hari. Jika "apel pagi" atau "sarapan", WAJIB tentang pagi hari.
   - Jika terdapat salah ketik ringan pada kata kunci (misalnya "sakut" = sakit, "mendamaikan baris berbaris" = menertibkan & mendampingi kegiatan baris-berbaris, "menjadi ekstrakurikuler perhotelan" = mendampingi/memfasilitasi kegiatan ekstrakurikuler perhotelan), pahami maksud sebenarnya dan tuliskan deskripsi berbahasa Indonesia baku yang sangat profesional.
   - Perhatikan lokasi & konteks khusus bila disebutkan: kelas, aula, masjid, asrama, UKS, Puskesmas, Rumah Sakit, Outing Class, pembagian raport, kunjungan orang tua, menonton bersama.
   - Untuk kegiatan ekstrakurikuler/kokurikuler/keahlian (seperti IPSI/pencak silat, membatik, peternakan, perhotelan, pertanian, tata boga, tata kecantikan, LKBB), sebutkan aktivitas pembinaan keterampilan atau karakter spesifik bidang tersebut secara profesional.
2. Gunakan kalimat kerja operasional kedinasan (contoh: "Melaksanakan pendampingan...", "Mendampingi dan membimbing...", "Menjaga ketertiban...", "Bertindak sigap melerai dan memediasi..."). Panjang 1-2 kalimat padat, jelas, dan berkualitas.
3. Tentukan RHK yang paling sesuai:
   - RHK 1: Bimbingan, Pengajaran & Pengembangan Keahlian (mendampingi belajar, tugas sekolah/PR, review pelajaran, pembagian raport, outing class, kokurikuler membatik, keahlian tata boga, ekstrakurikuler peternakan/perhotelan/pertanian/kecantikan/coding, refleksi harian)
   - RHK 2: Kemandirian & Tata Graha Peserta Didik (menyapu kelas/aula/lingkungan, membersihkan kelas/aula/masjid, cuci pakaian/laundry, cuci piring, piket kebersihan, merapikan kamar/kasur/almari, memasak mandiri)
   - RHK 3: Pendampingan, Bimbingan, Motivasi & Rutinitas Harian Asrama (membangunkan tidur, persiapan sekolah, antar-jemput, makan pagi/siang/malam, sholat berjamaah di masjid/mushola, istirahat di asrama, mendampingi menonton, tidur malam, upacara bendera)
   - RHK 4: Bimbingan Spiritual, Emosional, Kedisiplinan & Kesehatan (mengaji/tadarus/yasin/diba', kajian agama, apel pagi/malam, ekstrakurikuler IPSI, baris-berbaris/LKBB, menjaga ketertiban kunjungan & kunjungan orang tua, melerai siswa & mendamaikan siswa yang bertengkar, merawat/mendampingi siswa sakit di UKS, istirahat di UKS, memeriksakan siswa, mengantar berobat, menjaga siswa sakit di puskesmas/rumah sakit, olahraga/senam)
   - RHK 5: Pendampingan Peserta Didik Berkebutuhan Khusus (ABK / Inklusi)
   - RHK 6: Pengembangan Kompetensi Tenaga Kependidikan (pelatihan, workshop, bimtek, webinar)
   - RHK 7: Tugas Tambahan dari Pimpinan / Kepala Sekolah (kepanitiaan, satgas, penugasan dinas resmi)`;

      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let parsed: any = null;

      for (const currentModel of modelsToTry) {
        try {
          const generatePromise = ai.models.generateContent({
            model: currentModel,
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

          // Proteksi batas waktu 6 detik agar UI pengguna selalu responsif
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_GEMINI_API')), 6000)
          );

          const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
          const text = response.text?.trim() || '';
          parsed = JSON.parse(text);
          if (parsed.deskripsi && parsed.rhk) {
            break;
          }
        } catch (innerErr: any) {
          const msg = String(innerErr?.message || innerErr);
          if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
            _apiKeyBlacklisted = true;
            _blacklistTimestamp = Date.now();
            break;
          }
          // Lanjutkan ke model berikutnya atau fallback ke bank kosakata secara halus
        }
      }

      if (parsed?.deskripsi && parsed?.rhk) {
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
      const errMsg = String(err?.message || err || '');
      if (
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('API key not valid') ||
        err?.status === 400 ||
        err?.status === 403
      ) {
        _apiKeyBlacklisted = true;
      }
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

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      return response.text ?? '';
    } catch {
      // lanjut ke model berikutnya
    }
  }
  return 'Layanan sistem SKP Sekolah Rakyat Terintegrasi 1 Kediri aktif menggunakan bank kosakata lokal berstandar kedinasan.';
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

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  for (const model of modelsToTry) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
      return;
    } catch {
      // lanjut ke model berikutnya
    }
  }
  onChunk('Layanan sistem SKP Sekolah Rakyat Terintegrasi 1 Kediri aktif menggunakan bank kosakata lokal berstandar kedinasan.');
}

/**
 * Setup WebSocket server for Gemini Live API audio streaming
 */
export function setupGeminiLiveWebSocket(server: any, path = '/api/gemini/live'): WebSocketServer {
  const wss = new WebSocketServer({ server, path });

  wss.on('connection', async (clientWs: WebSocket) => {
    if (!hasValidGeminiKey()) {
      clientWs.send(JSON.stringify({ error: 'Server Gemini API key not available' }));
      clientWs.close();
      return;
    }

    try {
      const liveAi = getAi();
      const session = await liveAi.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'Anda adalah asisten virtual Wali Asuh di Sekolah Rakyat Terintegrasi 1 Kabupaten Kediri.',
        },
        callbacks: {
          onmessage: (message: any) => {
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
              }
            }
            if (message.serverContent?.interrupted) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
            }
          },
        },
      });

      clientWs.on('message', (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch {
          // ignore invalid packet
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {}
      });
    } catch (err: any) {
      console.error('[Gemini Live WebSocket Error]:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err?.message || 'Live session error' }));
        clientWs.close();
      }
    }
  });

  return wss;
}

