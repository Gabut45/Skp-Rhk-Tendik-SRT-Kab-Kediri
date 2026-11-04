import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { LOGO_BASE64 } from '@/lib/assets-base64';

const LOGO_URL = LOGO_BASE64;

const RHK_FULL: Record<string, string> = {
  '1': 'Bimbingan dan Pengajaran Peserta Didik',
  '2': 'Kemandirian Peserta Didik',
  '3': 'Pendampingan, Bimbingan, Motivasi, dan Pembinaan Peserta Didik',
  '4': 'Bimbingan Spiritual dan Emosional',
  '5': 'Pendampingan Peserta Didik Berkebutuhan Khusus',
  '6': 'Pengembangan Kompetensi Tenaga Kependidikan',
  '7': 'Tugas Tambahan dari Kepala Sekolah',
};

const kegiatanSchema = z.object({
  waktuMulai: z.string(),
  waktuSelesai: z.string(),
  deskripsiKegiatan: z.string(),
  rhkKategori: z.string().optional(),
  fotoKegiatan: z.array(z.string()).optional(),
});

function esc(s: unknown) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function expandRhk(rhk: string): string {
  const match = rhk.match(/RHK\s*(\d+)/i);
  if (match) {
    const num = match[1];
    const name = RHK_FULL[num];
    if (name) return `RHK ${num} - ${name}`;
  }
  return rhk;
}

function buildPhotosGrid(photos: string[]): string {
  if (!photos || photos.length === 0) return '';
  const limited = photos.slice(0, 10);

  // Jika hanya ada 1 foto: tampilkan di tengah secara proporsional dan jelas tanpa terpotong
  if (limited.length === 1) {
    return `<div style="text-align:center;margin-bottom:6px;page-break-inside:avoid;break-inside:avoid;">
      <div class="photo-single-box" style="display:inline-block;max-width:100%;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:3px;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
        <img class="photo-single-img" src="${esc(limited[0])}" style="max-width:100%;max-height:280px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;border-radius:2px;" alt="Bukti Foto Kegiatan" />
      </div>
    </div>`;
  }

  // Jika 2 foto atau lebih: tata berdampingan (2 kolom) dengan rasio aspek utuh
  const rows: string[] = [];
  for (let i = 0; i < limited.length; i += 2) {
    const leftPhoto = `<div class="photo-proof-box" style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:3px;box-shadow:0 1px 2px rgba(0,0,0,0.04);display:block;text-align:center;">
      <img class="photo-proof-img" src="${esc(limited[i])}" style="max-width:100%;max-height:230px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;border-radius:2px;" alt="Bukti Foto Kegiatan" />
    </div>`;

    const rightPhoto = i + 1 < limited.length
      ? `<div class="photo-proof-box" style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:3px;box-shadow:0 1px 2px rgba(0,0,0,0.04);display:block;text-align:center;">
          <img class="photo-proof-img" src="${esc(limited[i + 1])}" style="max-width:100%;max-height:230px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;border-radius:2px;" alt="Bukti Foto Kegiatan" />
        </div>`
      : '';

    rows.push(`<tr style="page-break-inside:avoid;break-inside:avoid;">
      <td style="width:50%;padding:3px;text-align:center;vertical-align:middle;border:none;">${leftPhoto}</td>
      <td style="width:50%;padding:3px;text-align:center;vertical-align:middle;border:none;">${rightPhoto}</td>
    </tr>`);
  }

  return `<table style="width:100%;border-collapse:collapse;margin-bottom:6px;border:none;page-break-inside:avoid;break-inside:avoid;">${rows.join('')}</table>`;
}

function buildHtml(input: { tanggal: string; namaPelapor: string; nip: string; tandaTangan?: string }, kegiatan: z.infer<typeof kegiatanSchema>[], isWord: boolean) {
  const dateObj = new Date(input.tanggal + 'T00:00:00');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dateFormatted = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const ttdDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const rowsHtml = kegiatan.map((r, i) => {
    const photosGrid = buildPhotosGrid(r.fotoKegiatan || []);
    const rhkRaw = r.rhkKategori || '';
    const rhkText = rhkRaw ? `<br/><em style="font-size:9pt;color:#444;">(${esc(expandRhk(rhkRaw))})</em>` : '';
    return `<tr style="page-break-inside:avoid;break-inside:avoid;">
      <td style="text-align:center;vertical-align:top;padding:6px 5px;border:1px solid #222;">${i + 1}</td>
      <td style="vertical-align:top;padding:6px 5px;border:1px solid #222;text-align:center;white-space:nowrap;font-weight:500;">${esc(r.waktuMulai)} - ${esc(r.waktuSelesai)}</td>
      <td style="vertical-align:top;padding:6px 8px;border:1px solid #222;">
        ${photosGrid}
        <p style="margin:${photosGrid ? '4px' : '0'} 0 0 0;text-align:justify;line-height:1.4;">${esc(r.deskripsiKegiatan)}${rhkText}</p>
      </td>
    </tr>`;
  }).join('');

  const ttdHtml = input.tandaTangan
    ? `<img class="signature-img" src="${esc(input.tandaTangan)}" alt="Tanda Tangan" style="max-height:48px;max-width:130px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;" />`
    : '<div style="height:48px;"></div>';

  const wordNs = isWord ? ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"' : '';
  const wordMeta = isWord ? '<meta http-equiv="Content-Type" content="application/vnd.ms-word; charset=utf-8" />' : '';
  const wordSection = isWord
    ? `<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>@page Section1 { size: 210mm 297mm; margin: 1.5cm 2cm; }</style>`
    : '';

  return `<!doctype html>
<html${wordNs}>
<head><meta charset="utf-8"/>
${wordMeta}
${wordSection}
<style>
${isWord ? '' : '@page { size: a4; margin: 10mm 12mm; }'}
body { font-family: 'Times New Roman', serif; font-size: 10.5pt; color: #111; margin: 0; padding: 0; line-height: 1.35; }
h1 { text-align: center; font-size: 13pt; font-weight: bold; margin: 8px 0 4px 0; text-decoration: underline; letter-spacing: 0.3px; }
table.meta-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 8px; }
table.meta-table td { font-size: 10pt; line-height: 1.4; padding: 2px 0; }
table.main { width: 100%; border-collapse: collapse; margin-top: 4px; }
table.main th { background: #f2f2f2; padding: 6px; border: 1px solid #222; font-size: 9.5pt; font-weight: bold; }
table.main td { font-size: 9.5pt; border: 1px solid #222; }
table.main tr { page-break-inside: avoid; break-inside: avoid; }
.signature-block { page-break-inside: avoid !important; break-inside: avoid !important; margin-top: 14px; margin-bottom: 6px; width: 100%; }
.signature-img { max-height: 48px !important; max-width: 130px !important; width: auto !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
.kop-line { border-top: 2.5px solid #000; border-bottom: 1px solid #000; height: 3px; margin: 4px 0 10px 0; }
.photo-proof-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px; display: block; text-align: center; }
.photo-proof-img { max-width: 100% !important; max-height: 230px !important; width: auto !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
.photo-single-box { display: inline-block; max-width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px; }
.photo-single-img { max-width: 100% !important; max-height: 280px !important; width: auto !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
</style>
</head>
<body>

<!-- KOP SURAT -->
<table class="kop-block" style="width:100%;border-collapse:collapse;margin-bottom:0;">
  <tr>
    <td style="width:80px;vertical-align:middle;padding-left:4px;padding-right:10px;">
      <img src="${LOGO_URL}" style="width:68px;height:auto;" />
    </td>
    <td style="text-align:center;vertical-align:middle;">
      <div style="font-weight:bold;font-size:10.5pt;margin:0;letter-spacing:0.2px;">KEMENTERIAN SOSIAL REPUBLIK INDONESIA</div>
      <div style="font-weight:bold;font-size:9.5pt;margin:0;letter-spacing:0.1px;">PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI</div>
      <div style="font-weight:bold;font-size:9.5pt;margin:0;letter-spacing:0.1px;">KESEJAHTERAAN SOSIAL</div>
      <div style="font-weight:bold;font-size:12pt;margin:2px 0;letter-spacing:0.3px;">SEKOLAH RAKYAT TERINTEGRASI 1 KABUPATEN KEDIRI</div>
      <div style="font-size:8pt;margin:1px 0;">Desa Plosokidul Kecamatan Plosoklaten, Kab. Kediri, Jawa Timur</div>
    </td>
  </tr>
</table>
<div class="kop-line" style="border-top:2.5px solid #000;border-bottom:1px solid #000;height:3px;margin:4px 0 10px 0;"></div>

<h1>KINERJA HARIAN</h1>

<!-- Data Pelapor -->
<table class="meta-table" style="width:100%;border-collapse:collapse;margin-top:6px;margin-bottom:8px;">
  <tr>
    <td style="padding:2px 0;width:90px;vertical-align:middle;font-weight:bold;white-space:nowrap;">Nama</td>
    <td style="padding:2px 6px;width:12px;vertical-align:middle;text-align:center;">:</td>
    <td style="padding:2px 0;vertical-align:middle;line-height:1.4;">${esc(input.namaPelapor)}</td>
  </tr>
  <tr>
    <td style="padding:2px 0;vertical-align:middle;font-weight:bold;white-space:nowrap;">NIP</td>
    <td style="padding:2px 6px;width:12px;vertical-align:middle;text-align:center;">:</td>
    <td style="padding:2px 0;vertical-align:middle;letter-spacing:0.4px;white-space:nowrap;line-height:1.4;">${esc(input.nip)}</td>
  </tr>
  <tr>
    <td style="padding:2px 0;vertical-align:middle;font-weight:bold;white-space:nowrap;">Unit Kerja</td>
    <td style="padding:2px 6px;width:12px;vertical-align:middle;text-align:center;">:</td>
    <td style="padding:2px 0;vertical-align:middle;line-height:1.4;">SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI</td>
  </tr>
</table>

<!-- TABEL KEGIATAN -->
<table class="main">
  <thead>
    <tr>
      <th style="width:36px;text-align:center;">No.</th>
      <th style="width:100px;text-align:center;">Waktu</th>
      <th style="text-align:center;">Foto Kegiatan dan Deskripsi</th>
    </tr>
    <tr><td colspan="3" style="text-align:center;font-weight:bold;padding:5px;background:#f8f8f8;border:1px solid #222;font-size:9.5pt;">${dateFormatted}</td></tr>
  </thead>
  <tbody>${rowsHtml}</tbody>
</table>

<!-- Signature Section (anti page break, proportional signature) -->
<div class="signature-block" style="margin-top:14px;margin-bottom:6px;width:100%;page-break-inside:avoid;break-inside:avoid;overflow:visible;">
  <table style="width:100%;border-collapse:collapse;border:none;">
    <tr>
      <td style="width:50%;border:none;background:transparent;"></td>
      <td style="width:50%;text-align:center;border:none;background:transparent;vertical-align:top;padding:0;overflow:visible;">
        <p style="margin:0 0 2px 0;font-size:10.5pt;line-height:1.4;">Kediri, ${ttdDate}</p>
        <p style="margin:0 0 4px 0;font-size:10.5pt;line-height:1.4;">Pelapor,</p>
        <div style="height:48px;min-height:48px;display:flex;align-items:center;justify-content:center;margin:2px auto;text-align:center;">
          ${ttdHtml}
        </div>
        <p style="margin:4px 0 1px 0;font-size:10.5pt;line-height:1.4;"><strong><u>${esc(input.namaPelapor)}</u></strong></p>
        <p class="signature-nip" style="margin:1px 0 0 0;font-size:10pt;line-height:1.4;white-space:nowrap;letter-spacing:0.3px;">NIP. ${esc(input.nip)}</p>
      </td>
    </tr>
  </table>
</div>

</body></html>`;
}

export default createEndpoint({
  inputSchema: z.object({
    tanggal: z.string(),
    namaPelapor: z.string(),
    nip: z.string(),
    tandaTangan: z.string().optional(),
    kegiatan: z.array(kegiatanSchema),
  }),
  outputSchema: z.object({ pdfHtml: z.string(), wordHtml: z.string() }),
  async execute({ input }) {
    const pdfHtml = buildHtml(input, input.kegiatan, false);
    const wordHtml = buildHtml(input, input.kegiatan, true);
    return { pdfHtml, wordHtml };
  },
});
