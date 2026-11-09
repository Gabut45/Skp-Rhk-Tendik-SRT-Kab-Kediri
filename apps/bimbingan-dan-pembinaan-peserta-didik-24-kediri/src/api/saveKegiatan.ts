import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default createEndpoint({
  inputSchema: z.object({
    namaPelapor: z.string(),
    nip: z.string(),
    tanggal: z.string(),
    waktuMulai: z.string(),
    waktuSelesai: z.string(),
    kataKunciKegiatan: z.string(),
    deskripsiKegiatan: z.string(),
    rhkKategori: z.string(),
    fotoKegiatan: z.array(z.string()).optional(),
    tandaTangan: z.string().optional(),
    unitKerja: z.string().optional(),
  }),
  outputSchema: z.object({ success: z.boolean(), id: z.string() }),
  async execute({ input }) {
    const record = await zite.kegiatanHarian.create({
      record: {
        namaPelapor: input.namaPelapor,
        nip: input.nip,
        tanggal: input.tanggal,
        waktuMulai: input.waktuMulai,
        waktuSelesai: input.waktuSelesai,
        kataKunciKegiatan: input.kataKunciKegiatan,
        deskripsiKegiatan: input.deskripsiKegiatan,
        rhkKategori: input.rhkKategori,
        fotoKegiatan: input.fotoKegiatan?.map(url => ({ url })),
        tandaTangan: input.tandaTangan ? [{ url: input.tandaTangan }] : undefined,
        unitKerja: input.unitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
      },
    });

    // Pastikan foto berformat base64 diupload ke cPanel File Manager terlebih dahulu
    const finalPhotos: string[] = [];
    if (input.fotoKegiatan && input.fotoKegiatan.length > 0) {
      for (const p of input.fotoKegiatan) {
        if (!p || typeof p !== 'string' || p.trim().length < 5 || p.startsWith('data:,')) continue;
        if (p.startsWith('http://') || p.startsWith('https://')) {
          finalPhotos.push(p);
        } else if (p.startsWith('data:image/')) {
          try {
            const upRes = await fetch(`${DEFAULT_CPANEL_URL}?action=upload_foto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ foto: p, subfolder: 'uploads' }),
            });
            if (upRes.ok) {
              const upJson = await upRes.json();
              if (upJson.success && upJson.url) {
                finalPhotos.push(upJson.url);
                continue;
              }
            }
          } catch {}
          finalPhotos.push(p);
        }
      }
    }

    // Pastikan tanda tangan diupload jika base64
    let finalTtd = input.tandaTangan;
    if (finalTtd && finalTtd.startsWith('data:image/')) {
      try {
        const upRes = await fetch(`${DEFAULT_CPANEL_URL}?action=upload_foto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foto: finalTtd, subfolder: 'uploads' }),
        });
        if (upRes.ok) {
          const upJson = await upRes.json();
          if (upJson.success && upJson.url) {
            finalTtd = upJson.url;
          }
        }
      } catch {}
    }

    // Sync to cPanel MySQL
    try {
      await fetch(`${DEFAULT_CPANEL_URL}?action=save_bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaPelapor: input.namaPelapor,
          nip: input.nip,
          tanggal: input.tanggal,
          tandaTangan: finalTtd,
          unitKerja: input.unitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
          kegiatan: [{
            id: record.id,
            waktuMulai: input.waktuMulai,
            waktuSelesai: input.waktuSelesai,
            kataKunciKegiatan: input.kataKunciKegiatan,
            deskripsiKegiatan: input.deskripsiKegiatan,
            rhkKategori: input.rhkKategori,
            fotoKegiatan: finalPhotos.length > 0 ? finalPhotos : undefined,
          }],
        }),
      });
    } catch (err) {
      console.warn('[saveKegiatan] cPanel sync warning:', err);
    }

    return { success: true, id: record.id };
  },
});
