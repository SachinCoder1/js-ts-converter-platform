'use client';

import { useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { useTheme } from '@/hooks/use-theme';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 p-4" style={{ background: 'var(--surface)' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="skeleton-line" style={{ width: '28px', opacity: 0.4 }} />
          <div
            className="skeleton-line"
            style={{ width: `${40 + Math.random() * 55}%`, animationDelay: `${i * 80}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

// Custom dark theme matching our design system
function defineCustomThemes(monaco: Parameters<OnMount>[1]) {
  monaco.editor.defineTheme('devshift-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c9a14a' },
      { token: 'string', foreground: '7ec699' },
      { token: 'number', foreground: 'e2995c' },
      { token: 'type', foreground: '5eb0d4' },
      { token: 'identifier', foreground: 'c8ccd4' },
      { token: 'delimiter', foreground: '808690' },
      { token: 'tag', foreground: 'c9a14a' },
      { token: 'attribute.name', foreground: '7ec699' },
      { token: 'attribute.value', foreground: '7ec699' },
    ],
    colors: {
      'editor.background': '#0c0f14',        // matches our surface
      'editor.foreground': '#c8ccd4',
      'editor.lineHighlightBackground': '#0f1219',
      'editor.selectionBackground': '#d4a84420',  // accent at 13%
      'editorCursor.foreground': '#d4a844',        // accent color
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
      'editorBracketMatch.background': '#d4a84420',
      'editorBracketMatch.border': '#d4a84440',
      'editor.wordHighlightBackground': '#d4a84415',
      'editorIndentGuide.background': '#1a1f2b',
      'editorIndentGuide.activeBackground': '#252b38',
    },
  });

  monaco.editor.defineTheme('devshift-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8693a5', fontStyle: 'italic' },
      { token: 'keyword', foreground: '9a7000' },
      { token: 'string', foreground: '2e7d32' },
      { token: 'number', foreground: 'c75000' },
      { token: 'type', foreground: '1565c0' },
      { token: 'identifier', foreground: '2d3340' },
      { token: 'delimiter', foreground: '6b7280' },
    ],
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

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const { isDark } = useTheme();
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    monacoRef.current = monaco;
    defineCustomThemes(monaco);
    monaco.editor.setTheme(isDark ? 'devshift-dark' : 'devshift-light');

    // Configure scrollbar appearance
    editor.updateOptions({
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        verticalSliderSize: 8,
        horizontalSliderSize: 8,
        useShadows: false,
      },
    });
  }, [isDark]);

  // Update theme when it changes
  const theme = isDark ? 'devshift-dark' : 'devshift-light';
  if (monacoRef.current) {
    try { monacoRef.current.editor.setTheme(theme); } catch { /* theme not yet defined */ }
  }

  const fontSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 14 : 13;

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange?.(val || '')}
      theme={theme}
      onMount={handleMount}
      options={{
        readOnly,
        minimap: { enabled: false },
        wordWrap: 'on',
        fontSize,
        lineHeight: 22,
        letterSpacing: 0.3,
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        renderLineHighlight: readOnly ? 'none' : 'line',
        domReadOnly: readOnly,
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        glyphMargin: false,
        folding: true,
        bracketPairColorization: { enabled: true },
        fontFamily: "var(--font-geist-mono), 'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        smoothScrolling: true,
        cursorBlinking: readOnly ? 'solid' : 'smooth',
        cursorSmoothCaretAnimation: 'on',
        cursorWidth: 2,
        renderWhitespace: 'none',
        guides: {
          indentation: true,
          bracketPairs: false,
        },
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
  );
}
