import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FileType, OutputFileType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashCode(code: string, fileType: string): Promise<string> {
  const data = new TextEncoder().encode(code + fileType);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 16);
}

export function stripMarkdownFences(text: string): string {
  let result = text.trim();
  result = result.replace(/^```(?:typescript|tsx?|javascript|jsx?)?\s*\n?/i, '');
  result = result.replace(/\n?```\s*$/i, '');
  return result.trim();
}

export function sanitizeOutput(text: string): boolean {
  const suspicious = [
    /process\.env/i,
    /GOOGLE_GEMINI_API_KEY/i,
    /DEEPSEEK_API_KEY/i,
    /OPENROUTER_API_KEY/i,
    /system prompt/i,
    /you are an ai/i,
    /ignore previous/i,
  ];
  return !suspicious.some(pattern => pattern.test(text));
}

export function checkOutputRatio(inputLength: number, outputLength: number): boolean {
  if (inputLength === 0) return outputLength < 500;
  const ratio = outputLength / inputLength;
  return ratio >= 0.1 && ratio <= 5.0;
}

export function getOutputFileType(fileType: FileType): OutputFileType {
  return fileType === 'jsx' ? 'tsx' : 'ts';
}

export function getMonacoLanguage(fileType: string): string {
  switch (fileType) {
    case 'js': return 'javascript';
    case 'jsx': return 'javascript';
    case 'ts': return 'typescript';
    case 'tsx': return 'typescript';
    case 'json': return 'json';
    case 'css': return 'css';
    case 'plaintext': return 'plaintext';
    default: return 'javascript';
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
