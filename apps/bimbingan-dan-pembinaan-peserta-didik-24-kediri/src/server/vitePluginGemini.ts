import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  handleGenerateDeskripsiServer,
  handleGenerateTextServer,
  handleStreamTextServer,
  hasValidGeminiKey,
} from './geminiServer.ts';
import {
  getVocabularyStats,
  saveLearnedVocabularyServer,
} from './vocabularyService.ts';

import bodyParser from 'body-parser';

export function geminiServerPlugin(): Plugin {
  return {
    name: 'vite-plugin-gemini-server',
    configureServer(server) {
      server.middlewares.use(bodyParser.json({ limit: '10mb' }));
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // Health check endpoint
        if (url === '/api/gemini/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          const keyValid = hasValidGeminiKey();
          res.end(JSON.stringify({
            status: 'ok',
            serverSide: true,
            hasKey: keyValid,
            mode: keyValid ? 'gemini-online' : 'server-vocabulary-bank',
          }));
          return;
        }

        // Endpoint: GET /api/proxy-image (Proxy gambar eksternal hosting cPanel tanpa blokir CORS browser)
        if (url === '/api/proxy-image' && req.method === 'GET') {
          try {
            const parsedUrl = new URL(req.url || '', 'http://localhost');
            const targetUrl = parsedUrl.searchParams.get('url');
            if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
              res.statusCode = 400;
              res.end('Invalid URL');
              return;
            }

            const response = await fetch(targetUrl);
            if (!response.ok) {
              res.statusCode = response.status;
              res.end(`Failed to fetch image: ${response.statusText}`);
              return;
            }

            const contentType = response.headers.get('content-type') || 'image/jpeg';
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.statusCode = 200;
            res.end(buffer);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(`Proxy error: ${err?.message || 'Error'}`);
          }
          return;
        }

        // Endpoint: GET /api/vocabulary/stats
        if (url === '/api/vocabulary/stats' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(getVocabularyStats()));
          return;
        }

        // Endpoint: POST /api/vocabulary/save
        if (url === '/api/vocabulary/save' && req.method === 'POST') {
          try {
            const body = (req as any).body ?? {};
            const { kataKunci, deskripsi, rhk } = body;
            if (kataKunci && deskripsi) {
              const saved = saveLearnedVocabularyServer(kataKunci, deskripsi, rhk || 'RHK 3', 'manual');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, item: saved }));
              return;
            }
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: 'Invalid payload' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err?.message }));
          }
          return;
        }

        // Endpoint: POST /api/gemini/generate-deskripsi
        if (url === '/api/gemini/generate-deskripsi' && req.method === 'POST') {
          try {
            const body = (req as any).body ?? {};
            const kataKunci = body?.kataKunci ?? '';
            const result = await handleGenerateDeskripsiServer(kataKunci);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('[Gemini Server Plugin Error]:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
          return;
        }

        // Endpoint: POST /api/gemini/generate (generic text)
        if (url === '/api/gemini/generate' && req.method === 'POST') {
          try {
            const body = (req as any).body ?? {};
            const prompt = body?.prompt ?? '';
            const systemInstruction = body?.systemInstruction;
            const text = await handleGenerateTextServer(prompt, systemInstruction);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ text }));
          } catch (err: any) {
            console.error('[Gemini Server Generate Error]:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
          return;
        }

        // Endpoint: POST /api/gemini/stream (streaming text via SSE)
        if (url === '/api/gemini/stream' && req.method === 'POST') {
          try {
            const body = (req as any).body ?? {};
            const prompt = body?.prompt ?? '';
            const systemInstruction = body?.systemInstruction;

            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            });

            await handleStreamTextServer(
              prompt,
              chunk => {
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
              },
              systemInstruction
            );

            res.write(`data: [DONE]\n\n`);
            res.end();
          } catch (err: any) {
            console.error('[Gemini Server Stream Error]:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err?.message || 'Server stream error' }));
          }
          return;
        }

        next();
      });
    },
  };
}
