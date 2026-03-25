'use client';

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-2 left-2 z-[100] rounded-md px-4 py-2 text-sm font-semibold focus:not-sr-only"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          outline: '2px solid var(--ring)',
          outlineOffset: '2px',
        }}
      >
        Skip to main content
      </a>
      <a
        href="#editor-pair"
        className="fixed top-2 left-48 z-[100] rounded-md px-4 py-2 text-sm font-semibold focus:not-sr-only"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          outline: '2px solid var(--ring)',
          outlineOffset: '2px',
        }}
      >
        Skip to editor
      </a>
    </div>
  );
}
