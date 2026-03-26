import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="py-6 px-6"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
      }}
    >
      <div
        className="mx-auto max-w-screen-2xl flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/snipshift_logo_transparent.png"
            alt="SnipShift"
            width={18}
            height={18}
            className="rounded"
            style={{ width: 18, height: 18 }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '-0.01em' }}
          >
            SnipShift
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            &middot;
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            Free developer tools
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
