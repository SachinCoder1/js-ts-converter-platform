'use client';

import { useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { useTheme } from '@/hooks/use-theme';
import { useRegexDecorations } from '@/hooks/use-regex-decorations';
import type { RegexTestResult } from '@/lib/types';
import type * as Monaco from 'monaco-editor';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-col gap-3 p-4" style={{ background: 'var(--surface)' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="skeleton-line" style={{ width: '28px', opacity: 0.4 }} />
          <div
            className="skeleton-line"
            style={{ width: `${40 + Math.random() * 55}%`, animationDelay: `${i * 80}ms` }}
          />
        </div>
      ))}
    </div>
  ),
});

function defineCustomThemes(monaco: Parameters<OnMount>[1]) {
  monaco.editor.defineTheme('snipshift-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c9a14a' },
      { token: 'string', foreground: '7ec699' },
      { token: 'number', foreground: 'e2995c' },
    ],
    colors: {
      'editor.background': '#0c0f14',
      'editor.foreground': '#c8ccd4',
      'editor.lineHighlightBackground': '#0f1219',
      'editor.selectionBackground': '#d4a84420',
      'editorCursor.foreground': '#d4a844',
      'editor.selectionHighlightBackground': '#d4a84415',
      'editorLineNumber.foreground': '#2d3340',
      'editorLineNumber.activeForeground': '#525b6b',
      'editorGutter.background': '#0c0f14',
      'editorWidget.background': '#12161e',
      'editorWidget.border': '#1a1f2b',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#1a1f2b80',
      'scrollbarSlider.hoverBackground': '#252b38',
      'scrollbarSlider.activeBackground': '#2d3340',
    },
  });

  monaco.editor.defineTheme('snipshift-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#2d3340',
      'editor.lineHighlightBackground': '#f8f4ee',
      'editor.selectionBackground': '#c8960025',
      'editorCursor.foreground': '#9a7000',
      'editorLineNumber.foreground': '#c5c0b8',
      'editorLineNumber.activeForeground': '#8693a5',
      'editorGutter.background': '#ffffff',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#d8d4cc60',
      'scrollbarSlider.hoverBackground': '#c5c0b8',
    },
  });
}

interface TestStringEditorProps {
  value: string;
  onChange: (value: string) => void;
  testResult: RegexTestResult;
}

export function TestStringEditor({ value, onChange, testResult }: TestStringEditorProps) {
  const { isDark } = useTheme();
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useRegexDecorations(editorRef.current, testResult);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    monacoRef.current = monaco;
    editorRef.current = editor;
    defineCustomThemes(monaco);
    monaco.editor.setTheme(isDark ? 'snipshift-dark' : 'snipshift-light');

    editor.updateOptions({
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        useShadows: false,
      },
    });
  }, [isDark]);

  const theme = isDark ? 'snipshift-dark' : 'snipshift-light';
  if (monacoRef.current) {
    try { monacoRef.current.editor.setTheme(theme); } catch { /* theme not yet defined */ }
  }

  return (
    <div className="flex flex-col h-full rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div
        className="flex items-center h-8 px-3 gap-2 shrink-0"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--background)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" fill="hsl(160 70% 45%)" opacity="0.15" />
          <text x="8" y="11" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="var(--font-geist-mono)" fill="hsl(160 70% 55%)">
            Tx
          </text>
        </svg>
        <span
          className="font-mono text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Test String
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="plaintext"
          value={value}
          onChange={(val) => onChange(val || '')}
          theme={theme}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 13,
            lineHeight: 22,
            letterSpacing: 0.3,
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: 'line',
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: false,
            fontFamily: "var(--font-geist-mono), 'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            cursorWidth: 2,
            renderWhitespace: 'none',
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
          }}
        />
      </div>
    </div>
  );
}
