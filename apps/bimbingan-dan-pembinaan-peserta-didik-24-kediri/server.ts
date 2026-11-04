import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleGenerateDeskripsiServer,
  handleGenerateTextServer,
  handleStreamTextServer,
  hasValidGeminiKey,
} from './src/server/geminiServer';
import {
  getVocabularyStats,
  saveLearnedVocabularyServer,
} from './src/server/vocabularyService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));

// Health check
app.get('/api/gemini/health', (_req, res) => {
  const keyValid = hasValidGeminiKey();
  res.json({
    status: 'ok',
    serverSide: true,
    hasKey: keyValid,
    mode: keyValid ? 'gemini-online' : 'server-vocabulary-bank',
  });
});

// Vocabulary stats and management
app.get('/api/vocabulary/stats', (_req, res) => {
  res.json(getVocabularyStats());
});

app.post('/api/vocabulary/save', (req, res) => {
  try {
    const { kataKunci, deskripsi, rhk } = req.body;
    if (kataKunci && deskripsi) {
      const saved = saveLearnedVocabularyServer(kataKunci, deskripsi, rhk || 'RHK 3', 'manual');
      res.json({ success: true, item: saved });
      return;
    }
    res.status(400).json({ success: false, message: 'Invalid payload' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Server-side Deskripsi Generation with Gemini 3.8 Flash
app.post('/api/gemini/generate-deskripsi', async (req, res) => {
  try {
    const { kataKunci } = req.body;
    const result = await handleGenerateDeskripsiServer(kataKunci || '');
    res.json(result);
  } catch (err: any) {
    console.error('Error generating deskripsi:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Server-side generic text generation
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const text = await handleGenerateTextServer(prompt, systemInstruction);
    res.json({ text });
  } catch (err: any) {
    console.error('Error in text generation:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Server-side streaming endpoint
app.post('/api/gemini/stream', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await handleStreamTextServer(
      prompt,
      chunk => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      },
      systemInstruction
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Error in streaming:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Serve static frontend build
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Production Server] Running on http://0.0.0.0:${PORT}`);
});
