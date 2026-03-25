'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useSidebar } from './sidebar/sidebar-context';

export function ToolHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40"
      style={{
        background: 'color-mix(in srgb, var(--background) 80%, transparent)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      <div className="flex h-12 items-center justify-between px-4 sm:px-6">
        {/* Left: mobile hamburger + logo */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger — opens sidebar drawer */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Open tool navigation"
          >
            <Menu size={18} />
          </button>

          {/* Logo — visible on mobile and when sidebar is collapsed */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex items-center gap-0.5 font-mono text-xs font-semibold tracking-tight"
              style={{ color: 'var(--primary)' }}
            >
              <span style={{ color: 'var(--text-tertiary)' }}>&lt;</span>
              D
              <span style={{ color: 'var(--text-tertiary)' }}>/&gt;</span>
            </div>
            <span
              className="text-sm font-semibold lg:hidden"
              style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              DevShift
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 hover:bg-[var(--hover)]"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border) 20%, color-mix(in srgb, var(--primary) 15%, var(--border)) 50%, var(--border) 80%, transparent)',
        }}
      />
    </motion.header>
  );
}
