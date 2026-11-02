import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ziteId } from 'zitejs/vite-plugin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { geminiServerPlugin } from './src/server/vitePluginGemini.ts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
const __ziteFlowId = (() => { try { return JSON.parse(readFileSync(path.resolve(__dirname, 'zite.config.json'), 'utf-8')).id ?? ''; } catch { return ''; } })();
export default defineConfig(({ command }) => ({
  root: __dirname,
  define: { 'import.meta.env.VITE_ZITE_FLOW_ID': JSON.stringify(__ziteFlowId), },
  build: { target: 'esnext', sourcemap: false, reportCompressedSize: false },
  server: {
    host: '0.0.0.0',
    port: 3000,
    cors: true,
    hmr: {
      overlay: false,
    },
    allowedHosts: true,
  },
  legacy: {
    skipWebSocketTokenCheck: true,
  },
  optimizeDeps: {
    exclude: ["zitejs/db", "zitejs/api", "zitejs/auth", "zitejs/backend", "zitejs/integrations", "zitejs/email", "zitejs/meta", "zitejs/pdf", "zitejs/upload"],
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-dom/server',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'sonner',
    ],
  },
  plugins: [
    react(),
    ziteId(),
    geminiServerPlugin(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@project/components": path.resolve(__dirname, "../../packages/components"),
      "zitejs/auth": path.resolve(__dirname, "../../packages/components/lib/legacyAuth.ts"),
      "zitejs/auth/base": path.resolve(__dirname, "../../packages/components/lib/legacyAuth.ts"),
      "zitejs/backend/base": path.resolve(__dirname, "../../node_modules/zitejs/dist/esm/backend/index.js"),
      "zitejs/db": path.resolve(__dirname, "../../.zite/db.ts"),
      "zitejs/api": path.resolve(__dirname, "./.zite/api.ts"),
      "zitejs/pdf": path.resolve(__dirname, "../../.zite/pdf.ts"),
      "zitejs/upload": path.resolve(__dirname, "../../.zite/upload.ts"),
      "zitejs/backend": path.resolve(__dirname, "./.zite/backend.ts"),
      "zitejs/caller": path.resolve(__dirname, "../../node_modules/zitejs/dist/esm/caller/index.js"),
      "zitejs/integrations": path.resolve(__dirname, "./.zite/integrations/airtable.ts"),
      "zitejs/email": path.resolve(__dirname, "./.zite/integrations/email.ts"),
      "zitejs/meta": path.resolve(__dirname, "./.zite/meta.ts"),
    },
  },
}));
