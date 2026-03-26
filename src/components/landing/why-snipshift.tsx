'use client';

import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, CircleDollarSign, Zap, Layers, Code } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered, Not Just Regex',
    desc: 'Our TypeScript, Zod, and schema converters use AI to generate meaningful names, smart validations, and proper typing  not just find-and-replace.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    desc: 'Client-side tools never leave your browser. AI tools process your code but never store it. Your proprietary code stays yours.',
  },
  {
    icon: CircleDollarSign,
    title: 'Actually Free',
    desc: 'No freemium bait. No "convert 3 files then pay" limits. No signup wall. Every tool, every time.',
  },
  {
    icon: Zap,
    title: 'Built for Speed',
    desc: '6 tools run entirely in your browser with zero server calls. AI tools use a multi-model fallback chain for reliability.',
  },
  {
    icon: Layers,
    title: '15+ Tools, One Platform',
    desc: 'Stop bookmarking 15 different converter websites. Everything you need, one consistent interface.',
  },
  {
    icon: Code,
    title: 'Developer-First Design',
    desc: 'Monaco editor (same as VS Code), keyboard shortcuts, dark mode, copy/download in one click.',
  },
];

export function WhySnipShift() {
  const { ref, isInView } = useInView();
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="px-6 py-24" style={{ background: 'var(--background)' }}>
      <div className="mx-auto max-w-4xl">
        {/* Section label */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Why SnipShift
        </motion.h2>

        {/* Feature grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: reduced ? 0 : i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="rounded-lg p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <Icon
                  size={20}
                  className="mb-3"
                  style={{ color: 'var(--primary)' }}
                />
                <h3
                  className="mb-1.5 text-sm font-semibold"
                  style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
