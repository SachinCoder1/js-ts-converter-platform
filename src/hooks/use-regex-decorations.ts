'use client';

import { useEffect, useRef } from 'react';
import type { RegexTestResult } from '@/lib/types';
import type * as Monaco from 'monaco-editor';

const MAX_DECORATIONS = 1_000;

const MATCH_COLORS = [
  'rgba(212, 168, 68, 0.25)',   // accent gold
  'rgba(126, 198, 153, 0.25)',  // green
  'rgba(94, 176, 212, 0.25)',   // blue
  'rgba(226, 153, 92, 0.25)',   // orange
  'rgba(180, 130, 200, 0.25)',  // purple
  'rgba(200, 120, 140, 0.25)',  // pink
];

export function useRegexDecorations(
  editor: Monaco.editor.IStandaloneCodeEditor | null,
  testResult: RegexTestResult,
) {
  const decorationsRef = useRef<Monaco.editor.IEditorDecorationsCollection | null>(null);

  useEffect(() => {
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    if (decorationsRef.current) {
      decorationsRef.current.clear();
    }

    if (!testResult.isValid || testResult.matches.length === 0) {
      return;
    }

    const decorations: Monaco.editor.IModelDeltaDecoration[] = [];
    const matchesToShow = testResult.matches.slice(0, MAX_DECORATIONS);

    for (const match of matchesToShow) {
      const startPos = model.getPositionAt(match.index);
      const endPos = model.getPositionAt(match.index + match.length);

      decorations.push({
        range: {
          startLineNumber: startPos.lineNumber,
          startColumn: startPos.column,
          endLineNumber: endPos.lineNumber,
          endColumn: endPos.column,
        },
        options: {
          inlineClassName: 'regex-match-highlight',
          hoverMessage: { value: `Match: \`${match.fullMatch}\`` },
          stickiness: 1,
        },
      });
    }

    decorationsRef.current = editor.createDecorationsCollection(decorations);

    return () => {
      if (decorationsRef.current) {
        decorationsRef.current.clear();
      }
    };
  }, [editor, testResult]);
}
