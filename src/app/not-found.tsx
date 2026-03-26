import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page Not Found' };

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-6"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="font-mono text-7xl font-bold"
        style={{
          color: 'var(--primary)',
          opacity: 0.3,
          letterSpacing: '-0.05em',
        }}
      >
        404
      </div>
      <h1
        className="text-xl font-semibold"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        Page not found
      </h1>
      <p className="text-sm max-w-sm" style={{ color: 'var(--text-tertiary)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-md px-5 py-2.5 text-sm font-semibold transition-all duration-200"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          boxShadow: '0 0 0 1px color-mix(in srgb, var(--primary) 50%, transparent), 0 1px 2px rgba(0,0,0,0.2), 0 0 20px var(--glow)',
        }}
      >
        Back to SnipShift
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
