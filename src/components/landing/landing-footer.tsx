import Image from 'next/image';
import Link from 'next/link';
import { TOOL_REGISTRY } from '@/lib/constants';

const toolLinks = Object.values(TOOL_REGISTRY).slice(0, 8);
const moreToolLinks = Object.values(TOOL_REGISTRY).slice(8);

export function LandingFooter() {
  return (
    <footer
      className="relative px-6 py-12"
      style={{
        background: 'var(--background)',
      }}
    >
      {/* Gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 30%, var(--border)) 50%, transparent)',
        }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/snipshift_logo_transparent.png"
                alt="SnipShift"
                width={24}
                height={24}
                className="rounded"
                style={{ width: 24, height: 24 }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
              >
                SnipShift
              </span>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Free AI-powered developer tools to convert, type, and transform your code.
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              &copy; {new Date().getFullYear()} SnipShift
            </p>
          </div>

          {/* Tools column 1 */}
          <div>
            <h3
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Tools
            </h3>
            <ul className="space-y-2">
              {toolLinks.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.path}
                    className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools column 2 / More tools */}
          <div>
            <h3
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              More Tools
            </h3>
            <ul className="space-y-2">
              {moreToolLinks.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.path}
                    className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Legal */}
          <div className="space-y-6">
            <div>
              <h3
                className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blog"
                    className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    Changelog (coming soon)
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3
                className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-xs transition-colors duration-150 hover:text-[var(--primary)]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 text-center"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p
            className="text-[11px] font-mono"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}
          >
            &copy; {new Date().getFullYear()} SnipShift. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
