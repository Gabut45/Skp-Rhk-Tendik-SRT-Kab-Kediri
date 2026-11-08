interface Env {
  GEMINI_API_KEY?: string;
  API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const apiKey =
      context.env.GEMINI_API_KEY ||
      context.env.API_KEY ||
      context.env.VITE_GEMINI_API_KEY ||
      '';

    if (!apiKey || apiKey === 'TODO' || apiKey.includes('AIzaSyDummy')) {
      return new Response(
        JSON.stringify({
          error: 'API_KEY_NOT_FOUND',
          message: 'API Key Gemini belum diatur di Cloudflare Environment Variables (GEMINI_API_KEY)',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = (await context.request.json()) as { kataKunci?: string };
    const raw = String(body?.kataKunci || '').trim();

    if (!raw) {
      return new Response(
        JSON.stringify({ deskripsi: '', rhk: 'RHK 3' }),
        { status: 200, headers: corsHeaders }
      );
    }

    const prompt = `Anda adalah sistem AI perumus deskripsi Sasaran Kinerja Pegawai (SKP) / Rencana Hasil Kerja (RHK) Tenaga Kependidikan / Wali Asuh di Sekolah Rakyat Terintegrasi Kab Kediri.
Kata Kunci Kegiatan: "${raw}"

Instruksi:
1. Buat kalimat deskripsi kegiatan formal PNS/PPPK yang SANGAT PERSIS DAN RELEVAN dengan kata kunci.
   - PENTING: Perhatikan kata waktu (pagi, sarapan, siang, sore, malam, subuh). JANGAN PERNAH tertukar! Jika kata kunci berisi "makan malam", deskripsi WAJIB tentang makan malam (JANGAN menyebut sarapan/makan pagi). Begitu pula sholat, apel, piket, dan kegiatan lainnya.
2. Gunakan kalimat kerja operasional kedinasan (contoh: "Melaksanakan pendampingan...", "Membimbing dan mengawasi...", "Mendampingi peserta didik..."). Panjang 1-2 kalimat padat berkualitas.
3. Tentukan RHK yang paling sesuai:
   - RHK 1: Bimbingan dan Pengajaran Peserta Didik (belajar, tugas sekolah, review pelajaran, laptop belajar, refleksi harian, jurnal)
   - RHK 2: Kemandirian Peserta Didik (cuci pakaian/laundry, cuci piring, piket kebersihan, merapikan kamar/kasur, memasak mandiri)
   - RHK 3: Pendampingan, Bimbingan, Motivasi, dan Pembinaan Peserta Didik (membangunkan tidur, persiapan sekolah, antar-jemput, penyambutan pulang sekolah, makan pagi/siang/malam, sholat berjamaah, istirahat siang, tidur malam, upacara bendera)
   - RHK 4: Bimbingan Spiritual dan Emosional (mengaji/tadarus Al-Quran, kajian agama, setoran hafalan, apel pagi/malam, kedisiplinan/tata tertib, konseling, kesehatan/merawat siswa sakit, olahraga/senam pagi/sore, kunjungan ortu)
   - RHK 5: Pendampingan Peserta Didik Berkebutuhan Khusus
   - RHK 6: Pengembangan Kompetensi Tenaga Kependidikan
   - RHK 7: Tugas Tambahan dari Kepala Sekolah

Keluarkan HANYA format JSON valid tanpa markdown, dengan struktur:
{"deskripsi": "...", "rhk": "RHK X"}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({
          error: 'GEMINI_CALL_FAILED',
          status: geminiRes.status,
          details: errText,
        }),
        { status: geminiRes.status, headers: corsHeaders }
      );
    }

    const geminiData = (await geminiRes.json()) as any;
    const candidateText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    let parsed = { deskripsi: '', rhk: 'RHK 3' };
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      const matchDesk = candidateText.match(/"deskripsi"\s*:\s*"([^"]+)"/);
      const matchRhk = candidateText.match(/"rhk"\s*:\s*"([^"]+)"/);
      if (matchDesk) parsed.deskripsi = matchDesk[1];
      if (matchRhk) parsed.rhk = matchRhk[1] || 'RHK 3';
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: err?.message || 'Error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
