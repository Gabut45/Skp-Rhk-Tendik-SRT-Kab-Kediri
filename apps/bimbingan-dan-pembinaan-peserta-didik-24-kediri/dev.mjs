import { createServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Automatically load .env file from root or app folder if present
try {
  if (typeof process.loadEnvFile === 'function') {
    const rootEnv = path.resolve(__dirname, '../../.env');
    const localEnv = path.resolve(__dirname, '.env');
    if (fs.existsSync(rootEnv)) {
      process.loadEnvFile(rootEnv);
    } else if (fs.existsSync(localEnv)) {
      process.loadEnvFile(localEnv);
    }
  }
} catch {
  // ignore
}

// Safely parse any port or host passed as flags (--port 3000 --host 0.0.0.0) or positionals (3000 0.0.0.0)
const args = process.argv.slice(2);
let port = 3000;
let host = '0.0.0.0';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1], 10) || 3000;
    i++;
  } else if (arg.startsWith('--port=')) {
    port = parseInt(arg.split('=')[1], 10) || 3000;
  } else if (arg === '--host' && args[i + 1]) {
    host = args[i + 1];
    i++;
  } else if (arg.startsWith('--host=')) {
    host = arg.split('=')[1] || '0.0.0.0';
  } else if (/^\d{2,5}$/.test(arg)) {
    port = parseInt(arg, 10) || 3000;
  } else if (/^(0\.0\.0\.0|localhost|127\.0\.0\.1)$/.test(arg)) {
    host = arg;
  }
}

async function startDevServer(retries = 10, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const server = await createServer({
        configFile: path.resolve(__dirname, 'vite.config.ts'),
        root: __dirname,
        server: {
          port,
          host,
        },
      });

      await server.listen();
      server.printUrls();

      const shutdown = async () => {
        try {
          await server.close();
        } catch {
          // ignore
        }
        process.exit(0);
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
      return server;
    } catch (err) {
      if ((err.code === 'EADDRINUSE' || String(err).includes('EADDRINUSE') || String(err).includes('already in use')) && attempt < retries) {
        console.warn(`[dev.mjs] Port ${port} in use, retrying attempt ${attempt}/${retries} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('Failed to start Vite dev server:', err);
        process.exit(1);
      }
    }
  }
}

await startDevServer();

