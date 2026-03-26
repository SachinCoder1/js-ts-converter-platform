import 'server-only';
import type { FileType } from '../../types';
import { buildPrompt, type PromptParts } from '../ai-prompt';
import { AI_TIMEOUT_MS } from '../../constants';

interface KimiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callKimi(prompt: PromptParts): Promise<string> {
  const apiKey = process.env.MOONSHOT_KIMI_API_KEY;
  if (!apiKey) throw new Error('Kimi API key not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        temperature: 0,
        max_tokens: 8192,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Kimi API error: ${response.status} ${errorBody}`);
    }

    const data: KimiResponse = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Kimi');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function convertWithKimi(code: string, fileType: FileType): Promise<string> {
  const prompt = buildPrompt(code, fileType);
  return callKimi(prompt);
}
