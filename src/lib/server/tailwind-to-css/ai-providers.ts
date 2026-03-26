import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { AI_TIMEOUT_MS } from '../../constants';
import type { PromptParts } from './ai-prompt';

// Gemini needs its own wrapper since the existing one is typed to JS→TS
export async function callTailwindGemini(prompt: PromptParts): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro-preview-05-06',
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 8192,
    },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
      systemInstruction: { role: 'system', parts: [{ text: prompt.system }] },
    });

    const text = result.response.text();
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

// Re-export DeepSeek and OpenRouter  they already accept generic PromptParts
export { callDeepSeek as callTailwindDeepSeek } from '../ai-providers/deepseek';
export { callOpenRouter as callTailwindOpenRouter } from '../ai-providers/openrouter';
