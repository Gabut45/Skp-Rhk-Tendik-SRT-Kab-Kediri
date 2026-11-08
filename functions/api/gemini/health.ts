interface Env {
  GEMINI_API_KEY?: string;
  API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
}

export async function onRequestGet(context: { env: Env }) {
  const apiKey =
    context.env.GEMINI_API_KEY ||
    context.env.API_KEY ||
    context.env.VITE_GEMINI_API_KEY ||
    '';

  const hasKey = Boolean(apiKey && apiKey.length > 20 && !apiKey.includes('Dummy') && apiKey !== 'TODO');

  return new Response(
    JSON.stringify({
      status: 'ok',
      platform: 'cloudflare-pages',
      hasKey,
      mode: hasKey ? 'gemini-online' : 'no-key-set',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
