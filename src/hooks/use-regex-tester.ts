'use client';

import { useMemo } from 'react';
import type { RegexMatch, RegexTestResult } from '@/lib/types';

const MAX_MATCHES = 10_000;

export function useRegexTester(
  pattern: string,
  flags: string,
  testString: string,
): RegexTestResult {
  return useMemo(() => {
    if (!pattern) {
      return { matches: [], matchCount: 0, isValid: true, error: null };
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      return {
        matches: [],
        matchCount: 0,
        isValid: false,
        error: e instanceof Error ? e.message : 'Invalid regular expression',
      };
    }

    if (!testString) {
      return { matches: [], matchCount: 0, isValid: true, error: null };
    }

    const matches: RegexMatch[] = [];
    const isGlobal = regex.global;

    if (isGlobal) {
      let match: RegExpExecArray | null;
      const startTime = performance.now();

      while ((match = regex.exec(testString)) !== null) {
        matches.push(extractMatch(match));

        // Prevent infinite loops on zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }

        if (matches.length >= MAX_MATCHES) break;

        // Timeout safety: 2 seconds max
        if (performance.now() - startTime > 2000) break;
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push(extractMatch(match));
      }
    }

    return {
      matches,
      matchCount: matches.length,
      isValid: true,
      error: null,
    };
  }, [pattern, flags, testString]);
}

function extractMatch(match: RegExpExecArray): RegexMatch {
  const groups: Record<string, string> = {};
  if (match.groups) {
    for (const [key, value] of Object.entries(match.groups)) {
      if (value !== undefined) {
        groups[key] = value;
      }
    }
  }

  const captures: (string | undefined)[] = [];
  for (let i = 1; i < match.length; i++) {
    captures.push(match[i]);
  }

  return {
    fullMatch: match[0],
    index: match.index,
    length: match[0].length,
    groups,
    captures,
  };
}
