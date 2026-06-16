const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// gemini-2.5-flash confirmed working — others are rate-limited on free tier
const MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
];

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

async function callGeminiWithModel(
  model: string,
  contents: GeminiMessage[],
  systemInstruction?: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const body: any = {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`${res.status}::${data?.error?.message || res.statusText}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response');
  return text;
}

async function callGemini(
  contents: GeminiMessage[],
  systemInstruction?: string
): Promise<string> {
  if (!API_KEY) {
    return 'AI features unavailable — VITE_GEMINI_API_KEY not set in .env file.';
  }

  let lastError = '';
  for (const model of MODELS) {
    try {
      return await callGeminiWithModel(model, contents, systemInstruction);
    } catch (err: any) {
      lastError = err?.message || 'Unknown error';
      console.warn(`[Gemini] ${model} failed:`, lastError);
      if (lastError.includes('429')) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  throw new Error(lastError);
}

/** Single-turn request */
export async function askGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  try {
    return await callGemini(
      [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction
    );
  } catch (err: any) {
    console.error('[askGemini] error:', err?.message);
    if (err?.message?.includes('429')) {
      return '⚠️ Rate limit hit. Please wait 30 seconds and try again.';
    }
    return 'AI is temporarily unavailable. Please try again.';
  }
}

/**
 * Multi-turn chat — history is ONLY user/model message pairs.
 * System context is passed separately via systemInstruction.
 */
export async function askGeminiChat(
  history: GeminiMessage[],
  newMessage: string,
  systemInstruction?: string
): Promise<string> {
  try {
    // Ensure history ends with model (or is empty) before adding new user msg
    const cleanHistory = history.filter((_, i) => {
      if (i === 0) return history[0].role === 'user';
      return true;
    });

    const contents: GeminiMessage[] = [
      ...cleanHistory,
      { role: 'user', parts: [{ text: newMessage }] },
    ];

    return await callGemini(contents, systemInstruction);
  } catch (err: any) {
    console.error('[askGeminiChat] error:', err?.message);
    if (err?.message?.includes('429')) {
      return '⚠️ Rate limit hit. Free tier allows 15 requests/min. Please wait 30 seconds and try again.';
    }
    return '⚠️ AI temporarily unavailable. Please try again.';
  }
}

// Legacy compat
export const askGeminiWithHistory = askGeminiChat;
export const genAI = null;
export const geminiModel = null;
