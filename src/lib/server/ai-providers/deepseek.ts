import 'server-only';
import type { FileType } from '../../types';
import { buildPrompt, type PromptParts } from '../ai-prompt';
import { AI_TIMEOUT_MS } from '../../constants';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callDeepSeek(prompt: PromptParts): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DeepSeek API key not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
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
      throw new Error(`DeepSeek API error: ${response.status} ${errorBody}`);
    }

    const data: DeepSeekResponse = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from DeepSeek');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function convertWithDeepSeek(code: string, fileType: FileType): Promise<string> {
  const prompt = buildPrompt(code, fileType);
  return callDeepSeek(prompt);
}
