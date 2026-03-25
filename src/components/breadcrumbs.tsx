import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import { buildBreadcrumbSchema } from '@/lib/seo-schemas';
import { SITE_URL } from '@/lib/constants';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schemaItems = items.map((item, index) => ({
    name: item.label,
    ...(index < items.length - 1 && item.href
      ? { url: `${SITE_URL}${item.href}` }
      : {}),
  }));

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(schemaItems)} />
      <nav
        aria-label="Breadcrumb"
        className="px-4 py-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <ol className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {items.map((item, index) => (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="opacity-50">/</span>
              )}
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
