/**
 * Client-Side Gemini API Proxy Utility
 * Calls server-side /api/gemini/* routes to keep API keys secure and accessible to all users.
 */

export interface DeskripsiResponse {
  deskripsi: string;
  rhk: string;
}

/**
 * Generate formal activity description and RHK category via server
 */
export async function generateDeskripsiServer(kataKunci: string): Promise<DeskripsiResponse> {
  const res = await fetch('/api/gemini/generate-deskripsi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kataKunci }),
  });

  if (!res.ok) {
    throw new Error(`Server returned status ${res.status}`);
  }

  return await res.json();
}

/**
 * Generate general text via server
 */
export async function generateTextServer(prompt: string, systemInstruction?: string): Promise<string> {
  const res = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction }),
  });

  if (!res.ok) {
    throw new Error(`Server returned status ${res.status}`);
  }

  const data = await res.json();
  return data.text || '';
}

/**
 * Stream text generation via Server-Sent Events (SSE) from the server
 */
export async function streamTextServer(
  prompt: string,
  onChunk: (text: string) => void,
  systemInstruction?: string
): Promise<void> {
  const res = await fetch('/api/gemini/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Streaming failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const dataStr = trimmed.replace(/^data:\s*/, '');
      if (dataStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.text) {
          onChunk(parsed.text);
        }
      } catch {
        // ignore parse error of partial chunk
      }
    }
  }
}

export interface GeminiHealthResponse {
  status: string;
  serverSide: boolean;
  hasKey: boolean;
  mode: string;
}

/**
 * Check server-side Gemini AI health and readiness
 */
export async function checkGeminiHealth(): Promise<GeminiHealthResponse> {
  const res = await fetch('/api/gemini/health');
  if (!res.ok) {
    throw new Error('Health check failed');
  }
  return await res.json();
}

export interface LiveClientOptions {
  onAudio?: (base64Pcm24k: string) => void;
  onInterrupted?: () => void;
  onError?: (err: any) => void;
  onClose?: () => void;
}

/**
 * Connect to server-side Gemini Live API via WebSocket
 */
export function connectGeminiLive(options: LiveClientOptions): {
  sendAudioChunk: (base64Pcm16k: string) => void;
  close: () => void;
} {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/api/gemini/live`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.audio && options.onAudio) {
        options.onAudio(data.audio);
      }
      if (data.interrupted && options.onInterrupted) {
        options.onInterrupted();
      }
      if (data.error && options.onError) {
        options.onError(new Error(data.error));
      }
    } catch (e) {
      options.onError?.(e);
    }
  };

  ws.onerror = (e) => options.onError?.(e);
  ws.onclose = () => options.onClose?.();

  return {
    sendAudioChunk: (base64Pcm16k: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ audio: base64Pcm16k }));
      }
    },
    close: () => {
      try {
        ws.close();
      } catch {}
    },
  };
}

