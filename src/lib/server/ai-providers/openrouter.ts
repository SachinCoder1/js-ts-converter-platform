import 'server-only';
import type { FileType } from '../../types';
import { buildPrompt, type PromptParts } from '../ai-prompt';
import { AI_TIMEOUT_MS, SITE_URL, SITE_NAME } from '../../constants';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callOpenRouter(prompt: PromptParts): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OpenRouter API key not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
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
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from OpenRouter');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function convertWithOpenRouter(code: string, fileType: FileType): Promise<string> {
  const prompt = buildPrompt(code, fileType);
  return callOpenRouter(prompt);
}
