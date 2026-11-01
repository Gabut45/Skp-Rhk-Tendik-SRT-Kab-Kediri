import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';

const LOGO_URL = 'https://images.fillout.com/orgid-722247/flowpublicid-j9anpelbvb/widgetid-default/mWbhCCsXJ6gShTNzJpdBuZ/pasted-image-1782612017460-iq4f615d.png';

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
  if (photos.length === 0) return '';
  const rows: string[] = [];
  for (let i = 0; i < photos.length; i += 2) {
    const left = `<td style="width:50%;padding:4px;text-align:center;vertical-align:top;"><img src="${esc(photos[i])}" style="width:100%;height:auto;border-radius:4px;border:1px solid #ddd;" /></td>`;
    const right = i + 1 < photos.length
      ? `<td style="width:50%;padding:4px;text-align:center;vertical-align:top;"><img src="${esc(photos[i + 1])}" style="width:100%;height:auto;border-radius:4px;border:1px solid #ddd;" /></td>`
      : '<td style="width:50%;padding:4px;"></td>';
    rows.push(`<tr>${left}${right}</tr>`);
  }
  return `<table style="width:100%;border-collapse:collapse;">${rows.join('')}</table>`;
}

function buildHtml(input: { tanggal: string; namaPelapor: string; nip: string; tandaTangan?: string }, kegiatan: z.infer<typeof kegiatanSchema>[], isWord: boolean) {
  const dateObj = new Date(input.tanggal + 'T00:00:00');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dateFormatted = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const rowsHtml = kegiatan.map((r, i) => {
    const photosGrid = buildPhotosGrid(r.fotoKegiatan || []);
    const rhkText = r.rhkKategori ? `<br/><em style="font-size:9pt;color:#444;">(${esc(expandRhk(r.rhkKategori))})</em>` : '';
    return `<tr>
      <td style="text-align:center;vertical-align:top;padding:8px;border:1px solid #333;">${i + 1}</td>
      <td style="vertical-align:top;padding:8px;border:1px solid #333;text-align:center;">${esc(r.waktuMulai)} - ${esc(r.waktuSelesai)}</td>
      <td style="vertical-align:top;padding:8px;border:1px solid #333;">
        ${photosGrid}
        <p style="margin:8px 0 0 0;text-align:justify;">${esc(r.deskripsiKegiatan)}${rhkText}</p>
      </td>
    </tr>`;
  }).join('');

  const ttdHtml = input.tandaTangan
    ? `<img src="${esc(input.tandaTangan)}" style="height:60px;" />`
    : '<br/><br/>';

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
${isWord ? '' : '@page { size: a4; margin: 0.6in 0.7in; }'}
body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #111; margin: 0; padding: 0; }
h1 { text-align: center; font-size: 14pt; margin: 16px 0; text-decoration: underline; }
table.main { width: 100%; border-collapse: collapse; }
table.main th { background: #f0f0f0; padding: 8px; border: 1px solid #333; font-size: 10pt; }
table.main td { font-size: 10pt; }
</style>
</head>
<body>

<!-- KOP SURAT -->
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

<h1>KINERJA HARIAN</h1>

<!-- META PELAPOR -->
<table style="margin:12px 0;font-size:11pt;border-collapse:collapse;">
  <tr><td style="padding:2px 0;width:85px;vertical-align:top;"><strong>Nama</strong></td><td style="padding:2px 4px;width:12px;vertical-align:top;">:</td><td style="padding:2px 0;">${esc(input.namaPelapor)}</td></tr>
  <tr><td style="padding:2px 0;vertical-align:top;"><strong>NIP</strong></td><td style="padding:2px 4px;vertical-align:top;">:</td><td style="padding:2px 0;">${esc(input.nip)}</td></tr>
  <tr><td style="padding:2px 0;vertical-align:top;"><strong>Unit Kerja</strong></td><td style="padding:2px 4px;vertical-align:top;">:</td><td style="padding:2px 0;">SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI</td></tr>
</table>

<!-- TABEL KEGIATAN -->
<table class="main">
  <thead>
    <tr>
      <th style="width:35px;">No.</th>
      <th style="width:90px;">Waktu</th>
      <th>Foto Kegiatan dan Deskripsi</th>
    </tr>
    <tr><td colspan="3" style="text-align:center;font-weight:bold;padding:8px;border:1px solid #333;">${dateFormatted}</td></tr>
  </thead>
  <tbody>${rowsHtml}</tbody>
</table>

<!-- TANDA TANGAN -->
<div style="margin-top:40px;width:100%;overflow:hidden;">
  <div style="float:right;width:240px;text-align:center;">
    <p style="margin:0 0 4px 0;">Pelapor,</p>
    ${ttdHtml}
    <p style="margin:4px 0 0 0;"><strong><u>${esc(input.namaPelapor)}</u></strong></p>
    <p style="margin:2px 0 0 0;">NIP. ${esc(input.nip)}</p>
  </div>
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
