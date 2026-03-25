import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page Not Found' };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Back to DevShift
      </Link>
      <div className="flex flex-col gap-2 mt-4">
        <p
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Or try one of our popular tools:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--hover)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            JS to TypeScript
          </Link>
          <Link
            href="/json-to-zod"
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--hover)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            JSON to Zod
          </Link>
          <Link
            href="/css-to-tailwind"
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--hover)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            CSS to Tailwind
          </Link>
        </div>
      </div>
    </div>
  );
}
