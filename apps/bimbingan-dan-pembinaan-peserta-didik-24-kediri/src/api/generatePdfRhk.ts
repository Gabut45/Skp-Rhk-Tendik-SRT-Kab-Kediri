import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';
import { ZitePdf } from 'zitejs/pdf';
import { LOGO_BASE64 } from '@/lib/assets-base64';

const LOGO_URL = LOGO_BASE64;

const RHK_INFO: Record<string, { judulLaporan: string; maksudTujuan: string; ruangLingkup: string }> = {
  '1': { judulLaporan: 'BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK', maksudTujuan: 'Bimbingan dan pengajaran kepada siswa peserta didik SRMA 24 Kediri bertujuan memberikan pendampingan belajar yang terarah dan kondusif, menumbuhkan kedisiplinan, kemandirian, dan tanggungjawab siswa dalam menciptakan lingkungan asrama yang baik.', ruangLingkup: 'Kegiatan bimbingan dan pengajaran yang dilaksanakan di SRMA 24 Kediri meliputi sharing bersama, refleksi malam setelah kegiatan, pendampingan dan bimbingan belajar yang dilaksanakan oleh wali asuh dan wali asrama yang diikuti oleh seluruh siswa SRMA 24 Kediri.' },
  '2': { judulLaporan: 'KEMANDIRIAN PESERTA DIDIK', maksudTujuan: 'Kegiatan kemandirian kepada siswa peserta didik SRMA 24 Kediri bertujuan membangun kemandirian pada diri siswa agar dapat terbiasa melakukan kegiatan sehari-hari secara mandiri dan tidak bergantung kepada orang lain, serta ketika siswa sudah keluar dari asrama dapat diterapkan di lingkungan keluarga.', ruangLingkup: 'Kegiatan kemandirian yang dilaksanakan di SRMA 24 Kediri meliputi ibadah sholat berjamaah, olahraga pagi, bersih diri dan lingkungan, pembiasaan pagi, makan, cuci baju, cuci piring, belajar mandiri, dan diskusi.' },
  '3': { judulLaporan: 'BIMBINGAN DAN PEMBINAAN PESERTA DIDIK DALAM BERBAGAI ASPEK KEHIDUPAN TERMASUK IBADAH, BELAJAR, DAN AKTIVITAS SEHARI HARI', maksudTujuan: 'Kegiatan bimbingan dan pembinaan peserta didik dalam berbagai aspek kehidupan termasuk ibadah, belajar dan aktivitas sehari-hari kepada peserta didik SRMA 24 Kediri bertujuan memberikan bimbingan dan pembinaan disetiap kegiatan yang dilakukan di asrama, dengan maksud memberikan pendampingan dan pengawasan agar setiap siswa peserta didik dapat melaksanaan kegiatan dengan baik dan efektif.', ruangLingkup: 'Kegiatan yang dilaksanakan di SRMA 24 Kediri meliputi pendampingan ibadah, pendampingan belajar, pendampingan makan, pendampingan kebersihan lingkungan, refleksi harian, dll.' },
  '4': { judulLaporan: 'BIMBINGAN SPIRITUAL DAN EMOSIONAL (DISIPLIN, KONTROL KEGIATAN BELAJAR, DAN KESEHATAN PESERTA DIDIK)', maksudTujuan: 'Kegiatan bimbingan spiritual dan emosional kepada siswa peserta didik SRMA 24 Kediri bertujuan membangun kebiasaan disiplin dalam kegiatan keagamaan, belajar dengan giat dan tekun, terbangun kebiasaan untuk menjaga kesehatan, dan memberikan dukungan emosional kepada siswa peserta didik.', ruangLingkup: 'Kegiatan bimbingan spiritual dan emosional yang dilaksanakan di SRMA 24 Kediri meliputi kegiatan keagamaan, sharing bersama, belajar mandiri, pengecekan kesehatan, kunjungan orangtua, pembinaan kebersihan, konseling, dan apel malam.' },
  '5': { judulLaporan: 'PENDAMPINGAN PESERTA DIDIK BERKEBUTUHAN KHUSUS', maksudTujuan: 'Kegiatan pendampingan peserta didik berkebutuhan khusus bertujuan memberikan perhatian dan bimbingan khusus kepada siswa yang mengalami hambatan dalam akademik maupun sosio-emosional agar dapat mengikuti kegiatan asrama dengan optimal.', ruangLingkup: 'Kegiatan pendampingan peserta didik berkebutuhan khusus meliputi identifikasi kebutuhan siswa, pendampingan individual, koordinasi dengan guru dan konselor.' },
  '6': { judulLaporan: 'PENGEMBANGAN KOMPETENSI TENAGA KEPENDIDIKAN', maksudTujuan: 'Tersedianya hasil pengembangan kompetensi Tenaga Kependidikan yang terkonfirmasi melalui sistem informasi pengelolaan kinerja.', ruangLingkup: 'Kegiatan pengembangan kompetensi meliputi pelatihan, webinar, dan kegiatan pengembangan diri lainnya.' },
  '7': { judulLaporan: 'TUGAS TAMBAHAN SESUAI PENUGASAN KEPALA SEKOLAH', maksudTujuan: 'Tersedianya hasil tugas tambahan sesuai dengan penugasan dari Kepala Sekolah sesuai dengan ketentuan.', ruangLingkup: 'Tugas tambahan yang diberikan oleh Kepala Sekolah sesuai kebutuhan operasional SRMA 24 Kediri.' },
};

const MAX_PHOTOS_PER_RECORD = 20;

const GAMBARAN_UMUM = `Keputusan Kepala Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi Nomor: 276/9/HM.01.03/8/2025, Tentang Penetapan Tenaga Kependidikan di Sekolah Rakyat Tahun Ajaran 2025/2026, Tugas Wali Asuh antara lain adalah memberikan bimbingan bimbingan dan pengajaran yang baik agar peserta didik di Sekolah Rakyat dapat tumbuh dan berkembang secara optimal, membangun kemandirian peserta didik, mendampingi, membimbing, memotivasi, dan membina peserta didik dalam berbagai aspek kehidupan, termasuk dalam ibadah, belajar, dan aktivitas kesehatan peserta didik, berperan sebagai fitur orangtua pengganti di asrama, dan berkomitmen mendampingi dan memiliki kepakaan terhadap kebutuhan spesifik peserta didik berkebutuhan khusus, dan mampu bekerja sama dengan guru maupun pendamping untuk memastikan kenyamanan dan partisipasi siswa disabilitas di lingkungan asrama.`;

function esc(s: unknown) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTanggal(dateStr: string): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildDocTable(records: any[]): string {
  if (records.length === 0) {
    return '<p style="text-align:center;color:#666;font-style:italic;">(Belum ada dokumentasi foto)</p>';
  }

  // Group records by date
  const byDate: Record<string, any[]> = {};
  for (const r of records) {
    const tgl = r.tanggal || 'Tanpa Tanggal';
    if (!byDate[tgl]) byDate[tgl] = [];
    byDate[tgl].push(r);
  }

  const sortedDates = Object.keys(byDate).sort();
  let no = 1;
  const rowsHtml: string[] = [];

  for (const tgl of sortedDates) {
    const recsForDate = byDate[tgl];
    const tglFormatted = tgl !== 'Tanpa Tanggal' ? formatTanggal(tgl) : tgl;

    for (const r of recsForDate) {
      const allPhotos = r.fotoKegiatan || [];
      if (allPhotos.length === 0 && !r.deskripsiKegiatan) continue;

      // Build photo grid for this record (2 columns, limited)
      let photosHtml = '';
      if (allPhotos.length > 0) {
        const photos = allPhotos.slice(0, MAX_PHOTOS_PER_RECORD);
        const photoRows: string[] = [];
        for (let i = 0; i < photos.length; i += 2) {
          const left = `<td style="width:50%;padding:3px;text-align:center;vertical-align:top;"><img src="${esc(photos[i].url)}" style="width:100%;max-height:160px;object-fit:cover;border-radius:4px;border:1px solid #ddd;" /></td>`;
          const right = i + 1 < photos.length
            ? `<td style="width:50%;padding:3px;text-align:center;vertical-align:top;"><img src="${esc(photos[i + 1].url)}" style="width:100%;max-height:160px;object-fit:cover;border-radius:4px;border:1px solid #ddd;" /></td>`
            : '<td style="width:50%;padding:3px;"></td>';
          photoRows.push(`<tr>${left}${right}</tr>`);
        }
        photosHtml = `<table style="width:100%;border-collapse:collapse;">${photoRows.join('')}</table>`;
        if (allPhotos.length > MAX_PHOTOS_PER_RECORD) {
          photosHtml += `<p style="text-align:center;font-size:8pt;color:#666;margin:2px 0 0 0;">(Menampilkan ${MAX_PHOTOS_PER_RECORD} dari ${allPhotos.length} foto)</p>`;
        }
      }

      const desc = r.deskripsiKegiatan || '';
      rowsHtml.push(`<tr style="page-break-inside:avoid;break-inside:avoid;">
        <td style="text-align:center;vertical-align:top;padding:8px;border:1px solid #333;width:35px;">${no}</td>
        <td style="vertical-align:top;padding:8px;border:1px solid #333;width:120px;text-align:center;font-size:9pt;">${esc(tglFormatted)}</td>
        <td style="vertical-align:top;padding:8px;border:1px solid #333;">
          ${photosHtml}
          <p style="margin:${allPhotos.length > 0 ? '8px' : '0'} 0 0 0;text-align:justify;font-size:10pt;">${esc(desc)}</p>
        </td>
      </tr>`);
      no++;
    }
  }

  if (rowsHtml.length === 0) {
    return '<p style="text-align:center;color:#666;font-style:italic;">(Belum ada dokumentasi foto)</p>';
  }

  return `<table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr>
        <th style="background:#f0f0f0;padding:8px;border:1px solid #333;font-size:10pt;width:35px;">No.</th>
        <th style="background:#f0f0f0;padding:8px;border:1px solid #333;font-size:10pt;width:120px;">Tanggal</th>
        <th style="background:#f0f0f0;padding:8px;border:1px solid #333;font-size:10pt;">Bukti Foto dan Deskripsi</th>
      </tr>
    </thead>
    <tbody>${rowsHtml.join('')}</tbody>
  </table>`;
}

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

async function fetchCpanelForRhk(params: { tanggalMulai: string; tanggalSelesai: string; namaPelapor: string; rhkLabel: string }) {
  try {
    const query = new URLSearchParams({
      action: 'get_kegiatan',
      tanggalMulai: params.tanggalMulai,
      tanggalSelesai: params.tanggalSelesai,
      namaPelapor: params.namaPelapor,
    });
    const res = await fetch(`${DEFAULT_CPANEL_URL}?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        return data.records
          .filter((r: any) => {
            const rhk = r.rhk_kategori || r.rhkKategori || '';
            return rhk.includes(params.rhkLabel);
          })
          .map((r: any) => ({
            id: String(r.id || `keg_${r.id_kegiatan}`),
            namaPelapor: r.nama_pelapor || r.namaPelapor,
            nip: r.nip,
            tanggal: r.tanggal,
            waktuMulai: r.waktu_mulai || r.waktuMulai,
            waktuSelesai: r.waktu_selesai || r.waktuSelesai,
            kataKunciKegiatan: r.kata_kunci_kegiatan || r.kataKunciKegiatan,
            deskripsiKegiatan: r.deskripsi_kegiatan || r.deskripsiKegiatan,
            rhkKategori: r.rhk_kategori || r.rhkKategori,
            fotoKegiatan: Array.isArray(r.foto_kegiatan) ? r.foto_kegiatan : (r.fotoKegiatan || []),
            tandaTangan: Array.isArray(r.tanda_tangan) ? r.tanda_tangan : (r.tandaTangan || []),
            unitKerja: r.unit_kerja || r.unitKerja,
          }));
      }
    }
  } catch (err) {
    console.warn('[generatePdfRhk] cPanel fetch warning:', err);
  }
  return [];
}

export default createEndpoint({
  inputSchema: z.object({
    rhkNomor: z.string(),
    tanggalMulai: z.string(),
    tanggalSelesai: z.string(),
    namaPelapor: z.string(),
    nip: z.string(),
    tandaTangan: z.string().optional(),
    format: z.enum(['pdf', 'word']).optional(),
  }),
  outputSchema: z.object({ url: z.string(), id: z.string(), wordHtml: z.string(), pdfHtml: z.string() }),
  async execute({ input }) {
    const rhkInfo = RHK_INFO[input.rhkNomor];
    if (!rhkInfo) throw new Error('RHK tidak ditemukan');

    const rhkLabel = `RHK ${input.rhkNomor}`;
    const cpanelRecs = await fetchCpanelForRhk({
      tanggalMulai: input.tanggalMulai,
      tanggalSelesai: input.tanggalSelesai,
      namaPelapor: input.namaPelapor,
      rhkLabel,
    });

    const { records: localRecs } = await zite.kegiatanHarian.findAll({
      filters: {
        tanggal: { gte: input.tanggalMulai, lte: input.tanggalSelesai },
        rhkKategori: { contains: rhkLabel },
        namaPelapor: input.namaPelapor,
      },
      limit: 500,
    });

    const combinedMap = new Map<string, any>();
    for (const r of cpanelRecs) combinedMap.set(r.id, r);
    for (const r of localRecs) {
      if (!combinedMap.has(r.id)) combinedMap.set(r.id, r);
    }
    const records = Array.from(combinedMap.values());

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const endDate = new Date(input.tanggalSelesai + 'T00:00:00');
    const dateStr = `${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;

    const descriptions = records.map(r => r.deskripsiKegiatan).filter(Boolean);
    const uniqueDescs = [...new Set(descriptions)];
    const kegiatanBody = uniqueDescs.length > 0
      ? uniqueDescs.map(d => esc(d)).join('. ')
      : 'Kegiatan dilaksanakan sesuai dengan jadwal dan ketentuan yang berlaku.';

    const docTable = buildDocTable(records);

    const ttdHtml = input.tandaTangan
      ? `<img class="signature-img" src="${esc(input.tandaTangan)}" alt="Tanda Tangan" style="max-height:52px;max-width:135px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;" />`
      : '<div style="height:52px;"></div>';

    const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
@page { size: a4; margin: 0.7in; }
body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #111; line-height: 1.6; text-align: justify; margin: 0; padding: 0; }
h1 { text-align: center; font-size: 13pt; font-weight: bold; margin: 12px 0 4px; }
h2 { font-size: 12pt; margin: 16px 0 8px; }
.section { margin: 8px 0; }
.section p { text-indent: 40px; margin: 4px 0; }
.doc-title { text-align: center; font-weight: bold; font-size: 11pt; margin: 2px 0; }
.page-break { page-break-before: always; }
.signature-block { page-break-inside: avoid !important; break-inside: avoid !important; margin-top: 28px; width: 100%; }
.signature-img { max-height: 52px !important; max-width: 135px !important; width: auto !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
.kop-line { border-top: 2.5px solid #000; border-bottom: 1px solid #000; height: 3px; margin: 6px 0 16px 0; }
</style>
</head>
<body>

<table style="width:100%;border-collapse:collapse;margin-bottom:0;">
  <tr>
    <td style="width:85px;vertical-align:middle;padding-left:6px;padding-right:12px;">
      <img src="${LOGO_URL}" style="width:72px;height:auto;" />
    </td>
    <td style="text-align:center;vertical-align:middle;">
      <div style="font-weight:bold;font-size:11pt;margin:0;letter-spacing:0.3px;">KEMENTERIAN SOSIAL REPUBLIK INDONESIA</div>
      <div style="font-weight:bold;font-size:10pt;margin:0;letter-spacing:0.2px;">PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI</div>
      <div style="font-weight:bold;font-size:10pt;margin:0;letter-spacing:0.2px;">KESEJAHTERAAN SOSIAL</div>
      <div style="font-weight:bold;font-size:12.5pt;margin:2px 0;letter-spacing:0.4px;">SEKOLAH RAKYAT TERINTEGRASI 1 KABUPATEN KEDIRI</div>
      <div style="font-size:8.5pt;margin:1px 0;">Desa Plosokidul Kecamatan Plosoklaten, Kab. Kediri, Jawa Timur</div>
    </td>
  </tr>
</table>
<div class="kop-line" style="border-top:2.5px solid #000;border-bottom:1px solid #000;height:3px;margin:6px 0 16px 0;"></div>

<h1>LAPORAN KEGIATAN</h1>
<p class="doc-title">${esc(rhkInfo.judulLaporan)}</p>
<p class="doc-title">SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI JAWA TIMUR</p>
<p class="doc-title">${esc(dateStr).toUpperCase()}</p>

<h2>A. PENDAHULUAN</h2>
<div class="section">
  <h2 style="font-size:12pt;margin-left:20px;">1. Gambaran Umum</h2>
  <p>${esc(GAMBARAN_UMUM)}</p>
  <h2 style="font-size:12pt;margin-left:20px;">2. Maksud dan Tujuan</h2>
  <p>${esc(rhkInfo.maksudTujuan)}</p>
  <h2 style="font-size:12pt;margin-left:20px;">3. Ruang Lingkup</h2>
  <p>${esc(rhkInfo.ruangLingkup)}</p>
  <h2 style="font-size:12pt;margin-left:20px;">4. Dasar</h2>
  <p>Dasar pelaksanaan bimbingan dan pengajaran pada pedoman pelaksanaan sekolah rakyat.</p>
</div>

<h2>B. KEGIATAN YANG DILAKSANAKAN</h2>
<div class="section"><p>${kegiatanBody}</p></div>

<h2>C. HASIL YANG DICAPAI</h2>
<div class="section"><p>Kegiatan yang dilaksanakan berjalan dengan baik dan tertib. Seluruh siswa mengikuti kegiatan dengan penuh antusias dan semangat. Hasil yang dicapai sesuai dengan tujuan yang telah ditetapkan.</p></div>

<h2>D. KESIMPULAN DAN SARAN</h2>
<div class="section"><p>Kegiatan ${esc(rhkInfo.judulLaporan.toLowerCase())} kepada siswa peserta didik sangat bermanfaat bagi siswa dan siswi yang berada di sekolah rakyat dengan harapan terbentuknya kebiasaan yang baik serta dapat diterapkan di kehidupan sehari-harinya dikemudian hari.</p></div>

<h2>E. PENUTUP</h2>
<div class="section"><p>Demikian laporan pelaksanaan kegiatan ${esc(rhkInfo.judulLaporan.toLowerCase())} kami laporkan. Selanjutnya, semoga bermanfaat bagi kehidupan di Asrama Sekolah Rakyat Menengah Atas 24 Kediri.</p></div>

<div class="signature-block" style="margin-top:28px;margin-bottom:20px;width:100%;page-break-inside:avoid;break-inside:avoid;overflow:visible;">
  <table style="width:100%;border-collapse:collapse;border:none;">
    <tr>
      <td style="width:50%;border:none;background:transparent;"></td>
      <td style="width:50%;text-align:center;border:none;background:transparent;vertical-align:top;padding:0 0 16px 0;overflow:visible;">
        <p style="margin:0 0 4px 0;font-size:11pt;line-height:1.5;">Kediri, ${esc(dateStr)}</p>
        <p style="margin:0 0 6px 0;font-size:11pt;line-height:1.5;">Wali Asuh,</p>
        <div style="height:55px;min-height:55px;display:flex;align-items:center;justify-content:center;margin:3px auto;text-align:center;">
          ${ttdHtml}
        </div>
        <p style="margin:6px 0 2px 0;font-size:11pt;line-height:1.5;"><strong><u>${esc(input.namaPelapor)}</u></strong></p>
        <p class="signature-nip" style="margin:2px 0 0 0;font-size:11pt;line-height:1.6;padding-bottom:10px;white-space:nowrap;letter-spacing:0.4px;">NIP. ${esc(input.nip)}</p>
      </td>
    </tr>
  </table>
</div>

<div class="page-break"></div>

<h1 style="text-decoration:underline;margin-top:20px;">DOKUMENTASI</h1>
<p style="text-align:center;font-weight:bold;font-size:11pt;margin:4px 0 12px 0;">${esc(rhkInfo.judulLaporan)}</p>
${docTable}

</body></html>`;

    const isWord = input.format === 'word';
    const wordHtml = html
      .replace('<html>', '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">')
      .replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/><meta http-equiv="Content-Type" content="application/vnd.ms-word; charset=utf-8" />');

    const { url } = await ZitePdf.renderHtml({
      html: isWord ? wordHtml : html,
      filename: `laporan-rhk${input.rhkNomor}-${input.tanggalMulai}-${input.tanggalSelesai}.${isWord ? 'doc' : 'pdf'}`,
    });

    const formatLabel = isWord ? 'WORD' : 'PDF';
    const riwayat = await zite.riwayatFile.create({
      record: {
        namaFile: `Laporan ${rhkLabel} - ${rhkInfo.judulLaporan} (${formatLabel})`,
        jenisLaporan: 'Laporan RHK',
        namaPelapor: input.namaPelapor,
        pdfUrl: url,
        dibuatPada: new Date().toISOString(),
        tanggalMulai: input.tanggalMulai,
        tanggalSelesai: input.tanggalSelesai,
        rhkNomor: rhkLabel,
      },
    });

    return { url, id: riwayat.id, wordHtml, pdfHtml: html };
  },
});
