'use client';

import { motion } from 'framer-motion';
import { ClipboardPaste, Sparkles, Rocket } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const steps = [
  {
    num: '01',
    title: 'Paste Your Code',
    desc: 'Drop your JavaScript, CSS, JSON, GraphQL, SQL, or any supported format into the editor.',
    icon: ClipboardPaste,
  },
  {
    num: '02',
    title: 'Convert Instantly',
    desc: 'AI-powered conversion generates proper types, interfaces, and schemas. Client-side tools run in your browser — no server needed.',
    icon: Sparkles,
  },
  {
    num: '03',
    title: 'Copy & Ship',
    desc: 'Copy the result, download the file, or keep iterating. No signup, no limits on client-side tools.',
    icon: Rocket,
  },
];

export function HowItWorks() {
  const { ref, isInView } = useInView();
  const reduced = useReducedMotion();

  return (
    <section
      ref={ref}
      className="relative px-6 py-24"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Section label */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          How It Works
        </motion.h2>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: reduced ? 0 : i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative text-center"
              >
                {/* Connecting line (between steps on desktop) */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 sm:block"
                    style={{
                      background: 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 20%, transparent), transparent)',
                    }}
                  />
                )}

                <div className="relative flex flex-col items-center gap-4">
                  {/* Number */}
                  <span
                    className="font-mono text-3xl font-light"
                    style={{ color: 'var(--primary)', opacity: 0.5 }}
                  >
                    {step.num}
                  </span>

                  {/* Icon */}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{
                      background: 'color-mix(in srgb, var(--primary) 8%, var(--background))',
                      border: '1px solid color-mix(in srgb, var(--primary) 15%, var(--border))',
                    }}
                  >
                    <Icon size={20} style={{ color: 'var(--primary)' }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="max-w-xs text-sm leading-relaxed"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
