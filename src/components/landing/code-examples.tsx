'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { CodeSnippet } from './code-snippet';

const examples = [
  {
    title: 'JavaScript → TypeScript',
    input: {
      label: 'input.js',
      code: `function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return { name: data.name, email: data.email };
}`,
    },
    output: {
      label: 'output.ts',
      code: `interface User {
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return { name: data.name, email: data.email };
}`,
    },
  },
  {
    title: 'JSON → TypeScript Interface',
    input: {
      label: 'data.json',
      code: `{
  "id": 1,
  "title": "Hello World",
  "tags": ["typescript", "react"],
  "author": { "name": "Dev", "verified": true }
}`,
    },
    output: {
      label: 'types.ts',
      code: `interface Author {
  name: string;
  verified: boolean;
}

interface Post {
  id: number;
  title: string;
  tags: string[];
  author: Author;
}`,
    },
  },
  {
    title: 'CSS → Tailwind',
    input: {
      label: 'styles.css',
      code: `.card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: #1a1a2e;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}`,
    },
    output: {
      label: 'component.tsx',
      code: `<div className="
  flex flex-col
  p-6
  rounded-lg
  bg-[#1a1a2e]
  shadow-md
" />`,
    },
  },
];

export function CodeExamples() {
  const { ref, isInView } = useInView();
  const reduced = useReducedMotion();

  return (
    <section
      ref={ref}
      className="px-6 py-24"
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
          See It in Action
        </motion.h2>

        {/* Examples */}
        <div className="space-y-8">
          {examples.map((example, i) => (
            <motion.div
              key={example.title}
              initial={{ opacity: 0, y: reduced ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: reduced ? 0 : i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <h3
                className="mb-3 text-xs font-medium"
                style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}
              >
                {example.title}
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <CodeSnippet code={example.input.code} label={example.input.label} />
                {/* Arrow */}
                <div className="flex shrink-0 items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="rotate-90 sm:rotate-0"
                    style={{ color: 'var(--primary)', opacity: 0.5 }}
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
                <CodeSnippet code={example.output.code} label={example.output.label} accent />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
