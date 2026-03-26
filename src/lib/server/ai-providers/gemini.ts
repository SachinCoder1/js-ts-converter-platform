import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FileType } from '../../types';
import { buildPrompt, type PromptParts } from '../ai-prompt';
import { AI_TIMEOUT_MS } from '../../constants';

export async function callGemini(prompt: PromptParts): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
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

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function convertWithGemini(code: string, fileType: FileType): Promise<string> {
  const prompt = buildPrompt(code, fileType);
  return callGemini(prompt);
}
