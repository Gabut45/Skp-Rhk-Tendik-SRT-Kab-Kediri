import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';
import { ZitePdf } from 'zitejs/pdf';

const LOGO_URL = 'https://images.fillout.com/orgid-722247/flowpublicid-j9anpelbvb/widgetid-default/mWbhCCsXJ6gShTNzJpdBuZ/pasted-image-1782612017460-iq4f615d.png';

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
          const left = `<td style="width:50%;padding:3px;text-align:center;vertical-align:top;"><img src="${esc(photos[i].url)}" style="width:100%;height:auto;border-radius:4px;border:1px solid #ddd;" /></td>`;
          const right = i + 1 < photos.length
            ? `<td style="width:50%;padding:3px;text-align:center;vertical-align:top;"><img src="${esc(photos[i + 1].url)}" style="width:100%;height:auto;border-radius:4px;border:1px solid #ddd;" /></td>`
            : '<td style="width:50%;padding:3px;"></td>';
          photoRows.push(`<tr>${left}${right}</tr>`);
        }
        photosHtml = `<table style="width:100%;border-collapse:collapse;">${photoRows.join('')}</table>`;
        if (allPhotos.length > MAX_PHOTOS_PER_RECORD) {
          photosHtml += `<p style="text-align:center;font-size:8pt;color:#666;margin:2px 0 0 0;">(Menampilkan ${MAX_PHOTOS_PER_RECORD} dari ${allPhotos.length} foto)</p>`;
        }
      }

      const desc = r.deskripsiKegiatan || '';
      rowsHtml.push(`<tr>
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
  outputSchema: z.object({ url: z.string(), id: z.string(), wordHtml: z.string().optional() }),
  async execute({ input }) {
    const rhkInfo = RHK_INFO[input.rhkNomor];
    if (!rhkInfo) throw new Error('RHK tidak ditemukan');

    const rhkLabel = `RHK ${input.rhkNomor}`;
    const { records } = await zite.kegiatanHarian.findAll({
      filters: {
        tanggal: { gte: input.tanggalMulai, lte: input.tanggalSelesai },
        rhkKategori: { contains: rhkLabel },
        namaPelapor: input.namaPelapor,
      },
      limit: 500,
    });

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
      ? `<img src="${esc(input.tandaTangan)}" style="height:60px;" />`
      : '<br/><br/>';

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
</style>
</head>
<body>

<table style="width:100%;border-collapse:collapse;margin-bottom:0;">
  <tr>
    <td style="width:90px;vertical-align:middle;padding-left:10px;padding-right:12px;">
      <img src="${LOGO_URL}" style="width:72px;height:auto;" />
    </td>
    <td style="text-align:center;vertical-align:middle;">
      <div style="font-weight:bold;font-size:11pt;margin:0;">KEMENTERIAN SOSIAL REPUBLIK INDONESIA</div>
      <div style="font-weight:bold;font-size:10.5pt;margin:0;">PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI</div>
      <div style="font-weight:bold;font-size:10.5pt;margin:0;">KESEJAHTERAAN SOSIAL</div>
      <div style="font-weight:bold;font-size:13pt;margin:2px 0;">SEKOLAH RAKYAT TERINTEGRASI 1 KABUPATEN KEDIRI</div>
      <div style="font-size:8.5pt;margin:1px 0;">Desa Plosokidul Kecamatan Plosoklaten, Kab. Kediri, Jawa Timur</div>
    </td>
  </tr>
</table>
<hr style="border:none;border-top:3px solid #000;margin:4px 0 16px 0;" />

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

<div style="margin-top:40px;width:100%;overflow:hidden;">
  <div style="float:right;width:260px;text-align:center;">
    <p style="margin:0 0 2px 0;">Kediri, ${esc(dateStr)}</p>
    <p style="margin:0 0 4px 0;">Wali Asuh</p>
    ${ttdHtml}
    <p style="margin:4px 0 0 0;"><strong><u>${esc(input.namaPelapor)}</u></strong></p>
    <p style="margin:2px 0 0 0;">NIP. ${esc(input.nip)}</p>
  </div>
</div>
<div style="clear:both;"></div>

<div class="page-break"></div>

<h1 style="text-decoration:underline;margin-top:20px;">DOKUMENTASI</h1>
<p style="text-align:center;font-weight:bold;font-size:11pt;margin:4px 0 12px 0;">${esc(rhkInfo.judulLaporan)}</p>
${docTable}

</body></html>`;

    const isWord = input.format === 'word';
    const wordHtml = isWord ? html
      .replace('<html>', '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">')
      .replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/><meta http-equiv="Content-Type" content="application/vnd.ms-word; charset=utf-8" />')
      : undefined;

    const { url } = await ZitePdf.renderHtml({
      html,
      filename: `laporan-rhk${input.rhkNomor}-${input.tanggalMulai}-${input.tanggalSelesai}.pdf`,
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

    return { url, id: riwayat.id, wordHtml };
  },
});
