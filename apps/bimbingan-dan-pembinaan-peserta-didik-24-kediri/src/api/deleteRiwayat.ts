import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

export default createEndpoint({
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  async execute({ input }) {
    await zite.riwayatFile.delete({ id: input.id });
    return { success: true };
  },
});
