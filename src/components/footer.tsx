import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="py-8 px-6"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
      }}
    >
      <div
        className="mx-auto max-w-screen-2xl flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xs font-medium"
            style={{ color: 'var(--primary)', opacity: 0.6 }}
          >
            &lt;D/&gt;
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-disabled)', letterSpacing: '0.02em' }}
          >
            DevShift
          </span>
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: 'var(--text-disabled)', letterSpacing: '0.03em' }}
        >
          Next.js + Tailwind + AI
        </span>
      </div>
      <div className="mx-auto max-w-screen-2xl mt-4 flex items-center justify-center gap-4">
        <Link
          href="/terms"
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: 'var(--text-disabled)' }}
        >
          Terms of Service
        </Link>
        <Link
          href="/privacy"
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: 'var(--text-disabled)' }}
        >
          Privacy Policy
        </Link>
        <Link
          href="/contact"
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: 'var(--text-disabled)' }}
        >
          Contact
        </Link>
      </div>
    </footer>
  );
}
