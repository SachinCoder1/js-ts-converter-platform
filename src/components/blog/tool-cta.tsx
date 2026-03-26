import Link from 'next/link';

interface ToolCTAProps {
  toolPath: string;
  toolName: string;
}

export function ToolCTA({ toolPath, toolName }: ToolCTAProps) {
  return (
    <div
      className="rounded-xl p-6 my-8"
      style={{
        background: 'color-mix(in srgb, var(--primary) 5%, var(--surface))',
        border: '1px solid color-mix(in srgb, var(--primary) 15%, var(--border))',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg" role="img" aria-label="tool">
          🔧
        </span>
        <div className="flex-1">
          <h3
            className="text-sm font-semibold mb-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            Try the {toolName}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Paste your code, get the result instantly. AI-powered, free, no signup.
          </p>
          <Link
            href={toolPath}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 hover:shadow-lg"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            Open {toolName}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
