import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ success: z.boolean(), cpanelDeleted: z.boolean().optional() }),
  async execute({ input }) {
    // 1. Hapus dari database lokal zite
    try {
      await zite.kegiatanHarian.delete({ id: input.id });
    } catch (e) {
      // Mungkin record hanya ada di cPanel, lanjutkan
      console.warn('[deleteKegiatan] Catatan lokal tidak ditemukan atau gagal dihapus:', e);
    }

    // 2. Hapus secara permanen dari server MySQL cPanel
    let cpanelDeleted = false;
    try {
      const res = await fetch(`${DEFAULT_CPANEL_URL}?action=delete_kegiatan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: input.id }),
      });
      if (res.ok) {
        const json = await res.json();
        cpanelDeleted = Boolean(json.success);
      }
    } catch (err) {
      console.warn('[deleteKegiatan] Gagal hapus di cPanel MySQL:', err);
    }

    return { success: true, cpanelDeleted };
  },
});
