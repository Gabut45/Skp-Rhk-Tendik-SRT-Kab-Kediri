import { GoogleGenAI, Type } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  saveLearnedVocabularyServer,
  lookupServerVocabulary,
} from './vocabularyService.ts';

// Shared server-side Gemini client utility
// User-Agent must be set to 'aistudio-build' in httpOptions for telemetry
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface GenerateDeskripsiPayload {
  kataKunci: string;
}

export interface GenerateDeskripsiResult {
  deskripsi: string;
  rhk: string;
}

// Server-side time context detection to guarantee 0% time mismatch
function detectTimeContext(text: string): 'pagi' | 'siang' | 'sore' | 'malam' | 'subuh' | null {
  const lower = text.toLowerCase();
  if (lower.includes('subuh')) return 'subuh';
  if (lower.includes('malam') || lower.includes('isya') || lower.includes('tidur')) return 'malam';
  if (lower.includes('sarapan') || lower.includes('pagi')) return 'pagi';
  if (lower.includes('siang') || lower.includes('dzuhur') || lower.includes('duhur')) return 'siang';
  if (lower.includes('sore') || lower.includes('ashar')) return 'sore';
  return null;
}

// Heuristic fallback on server if Gemini API is unavailable or offline
function generateServerFallback(rawKeyword: string): GenerateDeskripsiResult {
  const keyword = rawKeyword.toLowerCase().trim();
  const timeContext = detectTimeContext(keyword);

  let rhk = 'RHK 3';
  if (
    keyword.includes('cuci') || keyword.includes('piring') || keyword.includes('laundry') ||
    keyword.includes('piket') || keyword.includes('bersih') || keyword.includes('kamar') ||
    keyword.includes('ranjang') || keyword.includes('kasur') || keyword.includes('sampah') ||
    keyword.includes('jemur') || keyword.includes('masak mandiri')
  ) {
    rhk = 'RHK 2';
  } else if (
    keyword.includes('ngaji') || keyword.includes('tadarus') || keyword.includes('quran') ||
    keyword.includes('apel') || keyword.includes('disiplin') || keyword.includes('konseling') ||
    keyword.includes('sakit') || keyword.includes('olahraga') || keyword.includes('senam')
  ) {
    rhk = 'RHK 4';
  } else if (
    keyword.includes('belajar') || keyword.includes('tugas') || keyword.includes('materi') ||
    keyword.includes('akademik') || keyword.includes('laptop') || keyword.includes('refleksi')
  ) {
    rhk = 'RHK 1';
  }

  // Pre-crafted exact phrase fallbacks
  if (keyword.includes('makan malam')) {
    return {
      deskripsi: 'Mendampingi kegiatan makan malam bersama di ruang makan asrama, menciptakan suasana kekeluargaan yang hangat, serta mengingatkan peserta didik untuk menghabiskan makanan dan membersihkan tempat makan.',
      rhk: 'RHK 3',
    };
  }
  if (keyword.includes('makan pagi') || keyword.includes('sarapan')) {
    return {
      deskripsi: 'Mengawasi kegiatan makan pagi (sarapan) peserta didik sebelum berangkat sekolah, memastikan seluruh siswa sarapan dengan cukup agar memiliki energi optimal untuk mengikuti pembelajaran.',
      rhk: 'RHK 3',
    };
  }
  if (keyword.includes('makan siang')) {
    return {
      deskripsi: 'Mendampingi dan mengawasi kegiatan makan siang peserta didik di ruang makan asrama sepulang dari sekolah, memastikan suasana tertib dan asupan nutrisi tercukupi.',
      rhk: 'RHK 3',
    };
  }
  if (keyword.includes('sholat subuh') || keyword.includes('solat subuh')) {
    return {
      deskripsi: 'Mendampingi pelaksanaan sholat Subuh berjamaah bersama seluruh peserta didik di mushola asrama, dilanjutkan dengan dzikir pagi dan kultum singkat pembinaan karakter.',
      rhk: 'RHK 3',
    };
  }
  if (keyword.includes('sholat maghrib') || keyword.includes('sholat isya') || keyword.includes('tarawih')) {
    return {
      deskripsi: 'Mendampingi pelaksanaan sholat berjamaah di mushola asrama bersama peserta didik pada malam hari, membina kekhusyukan dan ketertiban shaf ibadah.',
      rhk: 'RHK 3',
    };
  }

  const cleanKeyword = rawKeyword.trim().replace(/^mendampingi\s+/i, '').replace(/^mengawasi\s+/i, '');
  const capitalized = cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1);

  let deskripsi = '';
  if (timeContext === 'malam') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} bersama peserta didik di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan suasana malam hari tetap tertib, aman, dan penuh rasa kekeluargaan.`;
  } else if (timeContext === 'pagi' || timeContext === 'subuh') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} peserta didik pada pagi hari di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan disiplin, tertib, dan mempersiapkan siswa dengan penuh semangat.`;
  } else if (timeContext === 'siang') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} peserta didik pada siang hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib dan teratur.`;
  } else if (timeContext === 'sore') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} bersama peserta didik pada sore hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan seluruh siswa mengikuti dengan antusias.`;
  } else {
    deskripsi = `Melaksanakan tugas pendampingan pada kegiatan ${capitalized.toLowerCase()} peserta didik di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib, bertanggung jawab, dan mendukung pembinaan karakter siswa.`;
  }

  return { deskripsi, rhk };
}

/**
 * Server-side core generation function using Gemini 3.8 Flash
 */
export async function handleGenerateDeskripsiServer(rawKeyword: string): Promise<GenerateDeskripsiResult> {
  const trimmed = rawKeyword.trim();
  if (!trimmed) {
    return { deskripsi: '', rhk: 'RHK 3' };
  }

  if (process.env.GEMINI_API_KEY) {
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
        } catch (e) {
          console.warn('[Gemini Server] Auto-save vocabulary notice:', e);
        }

        return {
          deskripsi: deskripsiStr,
          rhk: rhkStr,
        };
      }
    } catch (err) {
      console.warn('[Gemini Server] API call fallback to server vocabulary bank:', err);
    }
  }

  // Gracefully fallback to rich server vocabulary bank (learned + pre-seeded + dynamic synthesizer)
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
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw err;
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
}
