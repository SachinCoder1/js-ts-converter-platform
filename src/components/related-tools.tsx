import Link from 'next/link';
import { TOOL_REGISTRY } from '@/lib/constants';
import { TOOL_SEO_DATA } from '@/lib/seo-data';

export function RelatedTools({ currentToolId }: { currentToolId: string }) {
  const seoData = TOOL_SEO_DATA[currentToolId];
  if (!seoData) return null;

  const relatedIds = seoData.relatedTools;
  const tools = relatedIds
    .map((id) => {
      const registry = TOOL_REGISTRY[id as keyof typeof TOOL_REGISTRY];
      return registry ? { ...registry, id } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; path: string; description: string }>;

  if (tools.length === 0) return null;

  return (
    <section style={{ marginTop: '3rem' }}>
      <h2
        style={{
          fontSize: '1.375rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          letterSpacing: '-0.01em',
        }}
      >
        Related Tools
      </h2>
      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          lineHeight: 1.7,
        }}
      >
        Check out these other free developer converter tools from SnipShift:
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
        }}
      >
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.path}
            className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-200 hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5"
            style={{
              padding: '1rem 1.25rem',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                display: 'block',
                fontWeight: 600,
                color: 'var(--primary)',
                marginBottom: '0.25rem',
              }}
            >
              {tool.name}
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: 'var(--text-tertiary)',
                lineHeight: 1.5,
              }}
            >
              {tool.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
