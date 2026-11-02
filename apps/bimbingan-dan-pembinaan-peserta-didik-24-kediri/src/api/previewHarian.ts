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
  const rows: string[] = [];
  for (let i = 0; i < photos.length; i += 2) {
    const left = `<td style="width:50%;padding:4px;text-align:center;vertical-align:top;border:none;"><img src="${esc(photos[i])}" style="width:100%;max-height:150px;object-fit:cover;border-radius:3px;border:1px solid #ccc;display:block;" /></td>`;
    const right = i + 1 < photos.length
      ? `<td style="width:50%;padding:4px;text-align:center;vertical-align:top;border:none;"><img src="${esc(photos[i + 1])}" style="width:100%;max-height:150px;object-fit:cover;border-radius:3px;border:1px solid #ccc;display:block;" /></td>`
      : '<td style="width:50%;padding:4px;border:none;"></td>';
    rows.push(`<tr>${left}${right}</tr>`);
  }
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:6px;border:none;">${rows.join('')}</table>`;
}

function buildHtml(input: { tanggal: string; namaPelapor: string; nip: string; tandaTangan?: string }, kegiatan: z.infer<typeof kegiatanSchema>[], isWord: boolean) {
  const dateObj = new Date(input.tanggal + 'T00:00:00');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dateFormatted = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const ttdDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const rowsHtml = kegiatan.map((r, i) => {
    const photosGrid = buildPhotosGrid(r.fotoKegiatan || []);
    const rhkText = r.rhkKategori ? `<br/><em style="font-size:9pt;color:#444;">(${esc(expandRhk(r.rhkKategori))})</em>` : '';
    return `<tr style="page-break-inside:avoid;break-inside:avoid;">
      <td style="text-align:center;vertical-align:top;padding:8px 6px;border:1px solid #222;">${i + 1}</td>
      <td style="vertical-align:top;padding:8px 6px;border:1px solid #222;text-align:center;white-space:nowrap;font-weight:500;">${esc(r.waktuMulai)} - ${esc(r.waktuSelesai)}</td>
      <td style="vertical-align:top;padding:8px 10px;border:1px solid #222;">
        ${photosGrid}
        <p style="margin:${photosGrid ? '6px' : '0'} 0 0 0;text-align:justify;line-height:1.45;">${esc(r.deskripsiKegiatan)}${rhkText}</p>
      </td>
    </tr>`;
  }).join('');

  const ttdHtml = input.tandaTangan
    ? `<img class="signature-img" src="${esc(input.tandaTangan)}" alt="Tanda Tangan" style="max-height:52px;max-width:135px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;" />`
    : '<div style="height:52px;"></div>';

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
${isWord ? '' : '@page { size: a4; margin: 12mm 15mm; }'}
body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #111; margin: 0; padding: 0; line-height: 1.4; }
h1 { text-align: center; font-size: 13.5pt; font-weight: bold; margin: 14px 0 8px 0; text-decoration: underline; letter-spacing: 0.5px; }
table.meta-table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 18px; }
table.meta-table td { font-size: 10.5pt; line-height: 1.6; }
table.main { width: 100%; border-collapse: collapse; margin-top: 4px; }
table.main th { background: #f2f2f2; padding: 7px 8px; border: 1px solid #222; font-size: 10pt; font-weight: bold; }
table.main td { font-size: 10pt; border: 1px solid #222; }
table.main tr { page-break-inside: avoid; break-inside: avoid; }
.signature-block { page-break-inside: avoid !important; break-inside: avoid !important; margin-top: 28px; width: 100%; }
.signature-img { max-height: 52px !important; max-width: 135px !important; width: auto !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
.kop-line { border-top: 2.5px solid #000; border-bottom: 1px solid #000; height: 3px; margin: 6px 0 16px 0; }
.meta-spacing { height: 14px; width: 100%; }
</style>
</head>
<body>

<!-- KOP SURAT -->
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

<h1>KINERJA HARIAN</h1>

<!-- Data Pelapor -->
<table class="meta-table" style="width:100%;border-collapse:collapse;margin-top:12px;margin-bottom:18px;">
  <tr>
    <td style="padding:3px 0;width:95px;vertical-align:middle;font-weight:bold;white-space:nowrap;">Nama</td>
    <td style="padding:3px 8px;width:12px;vertical-align:middle;text-align:center;">:</td>
    <td style="padding:3px 0;vertical-align:middle;line-height:1.6;">${esc(input.namaPelapor)}</td>
  </tr>
  <tr>
    <td style="padding:3px 0;vertical-align:middle;font-weight:bold;white-space:nowrap;">NIP</td>
    <td style="padding:3px 8px;vertical-align:middle;text-align:center;">:</td>
    <td style="padding:3px 0;vertical-align:middle;letter-spacing:0.5px;white-space:nowrap;line-height:1.6;">${esc(input.nip)}</td>
  </tr>
  <tr>
    <td style="padding:3px 0;vertical-align:middle;font-weight:bold;white-space:nowrap;">Unit Kerja</td>
    <td style="padding:3px 8px;vertical-align:middle;text-align:center;">:</td>
    <td style="padding:3px 0;vertical-align:middle;line-height:1.6;">SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI</td>
  </tr>
</table>

<!-- Ruang pemisah (jarak) antara Unit Kerja dan Tabel Kinerja Harian -->
<div class="meta-spacing" style="height:14px;width:100%;"></div>

<!-- TABEL KEGIATAN -->
<table class="main">
  <thead>
    <tr>
      <th style="width:38px;text-align:center;">No.</th>
      <th style="width:105px;text-align:center;">Waktu</th>
      <th style="text-align:center;">Foto Kegiatan dan Deskripsi</th>
    </tr>
    <tr><td colspan="3" style="text-align:center;font-weight:bold;padding:7px;background:#f8f8f8;border:1px solid #222;font-size:10pt;">${dateFormatted}</td></tr>
  </thead>
  <tbody>${rowsHtml}</tbody>
</table>

<!-- TANDA TANGAN (anti page break, proportional signature) -->
<div class="signature-block" style="margin-top:28px;margin-bottom:20px;width:100%;page-break-inside:avoid;break-inside:avoid;overflow:visible;">
  <table style="width:100%;border-collapse:collapse;border:none;">
    <tr>
      <td style="width:50%;border:none;background:transparent;"></td>
      <td style="width:50%;text-align:center;border:none;background:transparent;vertical-align:top;padding:0 0 16px 0;overflow:visible;">
        <p style="margin:0 0 4px 0;font-size:11pt;line-height:1.5;">Kediri, ${ttdDate}</p>
        <p style="margin:0 0 6px 0;font-size:11pt;line-height:1.5;">Pelapor,</p>
        <div style="height:55px;min-height:55px;display:flex;align-items:center;justify-content:center;margin:3px auto;text-align:center;">
          ${ttdHtml}
        </div>
        <p style="margin:6px 0 2px 0;font-size:11pt;line-height:1.5;"><strong><u>${esc(input.namaPelapor)}</u></strong></p>
        <p class="signature-nip" style="margin:2px 0 0 0;font-size:11pt;line-height:1.6;padding-bottom:10px;white-space:nowrap;letter-spacing:0.4px;">NIP. ${esc(input.nip)}</p>
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
