import { z } from 'zod';
import { zite, setDeletedAll } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({
    namaPelapor: z.string(),
    nip: z.string(),
    tanggal: z.string(),
    tandaTangan: z.string().optional(),
    cpanelUrl: z.string().optional(),
    cpanelKey: z.string().optional(),
    kegiatan: z.array(z.object({
      id: z.string().optional(),
      waktuMulai: z.string(),
      waktuSelesai: z.string(),
      kataKunciKegiatan: z.string().optional(),
      deskripsiKegiatan: z.string(),
      rhkKategori: z.string(),
      fotoKegiatan: z.array(z.string()).optional(),
    })),
  }),
  outputSchema: z.object({ success: z.boolean(), count: z.number(), cpanelSynced: z.boolean().optional() }),
  async execute({ input }) {
    setDeletedAll(false);
    // Siapkan list kegiatan dengan ID konsisten
    const preparedKegiatan = input.kegiatan.map((k, idx) => ({
      id: k.id || `keg_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      waktuMulai: k.waktuMulai,
      waktuSelesai: k.waktuSelesai,
      kataKunciKegiatan: k.kataKunciKegiatan || '',
      deskripsiKegiatan: k.deskripsiKegiatan,
      rhkKategori: k.rhkKategori || 'RHK 3',
      fotoKegiatan: k.fotoKegiatan,
    }));

    // 1. Simpan ke database lokal dengan ID konsisten
    await zite.kegiatanHarian.bulkCreate({
      records: preparedKegiatan.map(k => ({
        id: k.id,
        namaPelapor: input.namaPelapor,
        nip: input.nip,
        tanggal: input.tanggal,
        waktuMulai: k.waktuMulai,
        waktuSelesai: k.waktuSelesai,
        kataKunciKegiatan: k.kataKunciKegiatan,
        deskripsiKegiatan: k.deskripsiKegiatan,
        rhkKategori: k.rhkKategori,
        fotoKegiatan: k.fotoKegiatan?.map(url => ({ url })),
        tandaTangan: input.tandaTangan ? [{ url: input.tandaTangan }] : undefined,
        unitKerja: 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
      })),
    });

    // 2. Simpan langsung ke server cPanel MySQL dengan ID yang sama persis
    let cpanelSynced = false;
    const cpanelUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const targetUrl = `${cpanelUrl}${cpanelUrl.includes('?') ? '&' : '?'}&action=save_bulk`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          namaPelapor: input.namaPelapor,
          nip: input.nip,
          tanggal: input.tanggal,
          tandaTangan: input.tandaTangan,
          kegiatan: preparedKegiatan,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        cpanelSynced = Boolean(json.success);
      }
    } catch (err) {
      console.warn('[saveBulkKegiatan] cPanel sync warning:', err);
    }

    return { success: true, count: preparedKegiatan.length, cpanelSynced };
  },
});
