import 'server-only';
import type { FileType } from '../../types';
import { buildPrompt, type PromptParts } from '../ai-prompt';
import { AI_TIMEOUT_MS } from '../../constants';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callOpenAI(prompt: PromptParts): Promise<string> {
  const apiKey = process.env.CHATGPT_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
    }

    const data: OpenAIResponse = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from OpenAI');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function convertWithOpenAI(code: string, fileType: FileType): Promise<string> {
  const prompt = buildPrompt(code, fileType);
  return callOpenAI(prompt);
}
