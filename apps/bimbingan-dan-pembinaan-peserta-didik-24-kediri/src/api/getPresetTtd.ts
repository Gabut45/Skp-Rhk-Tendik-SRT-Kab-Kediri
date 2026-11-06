import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({
    cpanelUrl: z.string().optional(),
    cpanelKey: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    presets: z.record(z.string()),
  }),
  async execute({ input }) {
    const presets: Record<string, string> = {};
    const baseUrl = input.cpanelUrl || DEFAULT_CPANEL_URL;
    const targetUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}action=get_kegiatan&tanggalMulai=1970-01-01&tanggalSelesai=1970-01-01`;

    const headers: Record<string, string> = {};
    if (input.cpanelKey) headers['X-API-KEY'] = input.cpanelKey;

    // 1. Ambil preset dari database server MySQL cPanel
    try {
      const res = await fetch(targetUrl, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.records)) {
          for (const r of json.records) {
            const pelapor = String(r.nama_pelapor || r.namaPelapor || '').trim();
            if (!pelapor) continue;

            let url = '';
            // Cek di foto_kegiatan terlebih dahulu (karena foto_kegiatan terupdate di ON DUPLICATE KEY UPDATE)
            if (Array.isArray(r.foto_kegiatan) && r.foto_kegiatan.length > 0) {
              const item = r.foto_kegiatan[0];
              url = typeof item === 'string' ? item : (item?.url || '');
            } else if (Array.isArray(r.fotoKegiatan) && r.fotoKegiatan.length > 0) {
              const item = r.fotoKegiatan[0];
              url = typeof item === 'string' ? item : (item?.url || '');
            }

            // Fallback ke tanda_tangan jika belum ada
            if (!url) {
              if (Array.isArray(r.tanda_tangan) && r.tanda_tangan.length > 0) {
                const item = r.tanda_tangan[0];
                url = typeof item === 'string' ? item : (item?.url || '');
              } else if (Array.isArray(r.tandaTangan) && r.tandaTangan.length > 0) {
                const item = r.tandaTangan[0];
                url = typeof item === 'string' ? item : (item?.url || '');
              }
            }

            if (url) {
              presets[pelapor] = url;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[getPresetTtd] Gagal mengambil preset dari cPanel:', err);
    }

    // 2. Ambil dari lokal jika ada yang belum tercover
    try {
      const { records: localPresets } = await zite.kegiatanHarian.findAll({
        filters: { tanggal: '1970-01-01' },
        limit: 100,
      });
      for (const lp of localPresets) {
        const pelapor = String(lp.namaPelapor || '').trim();
        if (!pelapor || presets[pelapor]) continue;
        const url = lp.fotoKegiatan?.[0]?.url || lp.tandaTangan?.[0]?.url || '';
        if (url) {
          presets[pelapor] = url;
        }
      }
    } catch {
      // ignore
    }

    return {
      success: true,
      presets,
    };
  },
});
