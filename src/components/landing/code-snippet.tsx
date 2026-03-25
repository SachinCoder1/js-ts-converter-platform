import { highlight } from 'sugar-high';

interface CodeSnippetProps {
  code: string;
  label: string;
  accent?: boolean;
}

export function CodeSnippet({ code, label, accent }: CodeSnippetProps) {
  const html = highlight(code);

  return (
    <div
      className="flex-1 overflow-hidden rounded-lg"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${accent ? 'color-mix(in srgb, var(--primary) 20%, var(--border))' : 'var(--border)'}`,
      }}
    >
      <div
        className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest"
        style={{
          borderBottom: '1px solid var(--border)',
          color: accent ? 'var(--primary)' : 'var(--text-disabled)',
        }}
      >
        {label}
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono">
        <code
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ color: 'var(--text-secondary)' }}
        />
      </pre>
    </div>
  );
}
