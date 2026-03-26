'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50"
      style={{
        background: 'color-mix(in srgb, var(--background) 80%, transparent)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/snipshift_logo_transparent.png"
              alt="SnipShift"
              width={28}
              height={28}
              className="rounded"
              style={{ width: 28, height: 28 }}
            />
            <span
              className="text-[15px] font-semibold"
              style={{
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              SnipShift
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/#tools"
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:bg-[var(--hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Tools
          </Link>
          <Link
            href="/blog"
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:bg-[var(--hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Blog
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>

      {/* Gradient border  accent glow fading at edges */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border) 20%, color-mix(in srgb, var(--primary) 15%, var(--border)) 50%, var(--border) 80%, transparent)',
        }}
      />
    </motion.header>
  );
}
