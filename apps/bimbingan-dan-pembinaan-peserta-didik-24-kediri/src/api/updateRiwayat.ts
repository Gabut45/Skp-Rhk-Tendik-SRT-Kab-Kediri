import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

export default createEndpoint({
  inputSchema: z.object({
    id: z.string(),
    namaPelapor: z.string().optional(),
    namaFile: z.string().optional(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  async execute({ input }) {
    const update: any = {};
    if (input.namaPelapor) update.namaPelapor = input.namaPelapor;
    if (input.namaFile) update.namaFile = input.namaFile;
    await zite.riwayatFile.update({ id: input.id, record: update });
    return { success: true };
  },
});
