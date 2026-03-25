'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const FLOATING_CHARS = ['{', '}', '=>', '</>', ':', 'fn', '[]', 'T', '?:', '&&'];

const JS_LINES = [
  'function greet(name) {',
  '  const msg = `Hello, ${name}`;',
  '  return { message: msg };',
  '}',
];

const TS_LINES = [
  'function greet(name: string): Greeting {',
  '  const msg: string = `Hello, ${name}`;',
  '  return { message: msg };',
  '}',
];

export function Hero() {
  const reduced = useReducedMotion();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: reduced ? 0 : 0.1, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ background: 'var(--background)' }}
    >
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(color-mix(in srgb, var(--border) 40%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--border) 40%, transparent) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          animation: reduced ? 'none' : 'grid-shift 20s linear infinite',
          opacity: 0.4,
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      {/* Floating code characters */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {FLOATING_CHARS.map((char, i) => (
            <span
              key={i}
              className="absolute font-mono text-sm select-none"
              style={{
                color: 'var(--text-disabled)',
                opacity: 0.06,
                left: `${8 + (i * 9) % 85}%`,
                bottom: '-20px',
                animation: `float-up ${18 + (i % 5) * 4}s linear infinite`,
                animationDelay: `${i * 1.8}s`,
              }}
            >
              {char}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-3xl text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-6">
          <span
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium"
            style={{
              background: 'color-mix(in srgb, var(--primary) 10%, var(--surface))',
              border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--border))',
              color: 'var(--primary)',
              letterSpacing: '0.03em',
            }}
          >
            15+ Free Developer Tools
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={item}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Convert Anything.
          <br />
          <span style={{ color: 'var(--primary)' }}>Type Everything.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
          style={{ color: 'var(--text-secondary)' }}
        >
          Free AI-powered developer tools to convert, type, and transform your code instantly.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/js-to-ts"
            className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-sm font-semibold transition-all duration-150"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              letterSpacing: '0.01em',
            }}
          >
            Start Converting →
          </Link>
          <a
            href="#tools"
            className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-sm font-medium transition-all duration-150"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            View All Tools
          </a>
        </motion.div>

        {/* Mini Demo */}
        <motion.div variants={item} className="mx-auto mt-12 max-w-md">
          <div
            className="overflow-hidden rounded-lg"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            {/* Tab bar */}
            <div
              className="flex items-center gap-4 px-4 py-2 text-[10px] font-mono uppercase tracking-widest"
              style={{
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-disabled)',
              }}
            >
              <span>input.js</span>
              <span style={{ color: 'var(--primary)', opacity: 0.5 }}>→</span>
              <span style={{ color: 'var(--primary)' }}>output.ts</span>
            </div>
            {/* Code */}
            <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--border)' }}>
              <div className="p-4">
                <pre className="text-[11px] leading-relaxed font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {JS_LINES.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </pre>
              </div>
              <div className="p-4 relative overflow-hidden">
                <pre className="text-[11px] leading-relaxed font-mono" style={{ color: 'var(--text-primary)' }}>
                  {TS_LINES.map((line, i) => (
                    <div key={i} className="demo-line" style={{ animationDelay: `${i * 0.6}s` }}>
                      {line}
                    </div>
                  ))}
                </pre>
                <span
                  className="absolute inline-block w-[1px] h-[14px]"
                  style={{
                    background: 'var(--primary)',
                    animation: reduced ? 'none' : 'cursor-blink 1s steps(2) infinite',
                    right: '16px',
                    bottom: '20px',
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs"
          style={{ color: 'var(--text-disabled)' }}
        >
          <span>No signup required</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span>Free forever</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span>Privacy-first</span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      {!reduced && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ color: 'var(--text-disabled)', opacity: 0.4 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
        </div>
      )}
    </section>
  );
}
