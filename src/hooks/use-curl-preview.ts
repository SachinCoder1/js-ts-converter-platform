'use client';

import { useState, useEffect, useRef } from 'react';
import type { CurlToCodeOptions, CurlToCodeStats } from '@/lib/types';

interface CurlPreviewResult {
  preview: string;
  stats: CurlToCodeStats | null;
  parseError: string | null;
}

export function useCurlPreview(curl: string, options: CurlToCodeOptions): CurlPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<CurlToCodeStats | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!curl.trim()) {
      setPreview('');
      setStats(null);
      setParseError(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      try {
        // Dynamic import to keep bundle lean
        const { parseCurl } = require('@/lib/curl-parser');
        const { GENERATORS } = require('@/lib/curl-to-code/generators');

        const parsed = parseCurl(curl);
        const generator = GENERATORS[options.targetLanguage];
        if (!generator) {
          setPreview('');
          setParseError('Unknown target language');
          return;
        }

        const code = generator.generate(parsed, {
          codeStyle: options.codeStyle,
          errorHandling: options.errorHandling,
          variableStyle: options.variableStyle,
        });

        setPreview(code);
        setParseError(null);
        setStats({
          headersDetected: Object.keys(parsed.headers).length,
          methodDetected: parsed.method,
          hasBody: parsed.body !== null || parsed.formData !== null,
          hasAuth: parsed.auth !== null,
          flagsParsed: Object.keys(parsed.headers).length +
            (parsed.body ? 1 : 0) +
            (parsed.auth ? 1 : 0) +
            (parsed.cookies ? 1 : 0) +
            (parsed.insecure ? 1 : 0) +
            (parsed.followRedirects ? 1 : 0) +
            (parsed.compressed ? 1 : 0) +
            (parsed.formData ? parsed.formData.length : 0),
        });
      } catch (e) {
        setParseError(e instanceof Error ? e.message : 'Failed to parse cURL command');
        setPreview('');
        setStats(null);
      }
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [curl, options.targetLanguage, options.codeStyle, options.errorHandling, options.variableStyle]);

  return { preview, stats, parseError };
}
