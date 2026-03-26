import Link from 'next/link';
import { TOOL_REGISTRY, TOOL_META } from '@/lib/constants';

const tools = Object.values(TOOL_REGISTRY).map((t) => ({
  ...t,
  meta: TOOL_META[t.id],
}));

const faqs = [
  {
    q: 'How do I convert JavaScript to TypeScript online?',
    a: 'Paste your JavaScript or JSX code into SnipShift\'s JS to TypeScript converter. Our AI analyzes your code structure, infers types, creates named interfaces, and produces clean TypeScript. The conversion is instant and free  no signup required.',
  },
  {
    q: 'Is SnipShift free?',
    a: 'Yes, SnipShift is completely free with no signup required. All 15+ tools are available without limits. Client-side tools like JSON ↔ YAML, SCSS → CSS, and HTML → JSX run entirely in your browser.',
  },
  {
    q: 'Is my code safe when using SnipShift?',
    a: 'Client-side tools process your code entirely in your browser  nothing is sent to a server. AI-powered tools send your code for processing but never store it permanently. The conversion cache automatically expires after 7 days.',
  },
  {
    q: 'What\'s the best JS to TS converter?',
    a: 'SnipShift\'s JS to TypeScript converter uses AI to generate meaningful interface names, proper React component typing, and avoids using "any" types. It supports JSX to TSX conversion, handles complex nested objects, and creates clean, production-ready TypeScript.',
  },
  {
    q: 'Can I convert React PropTypes to TypeScript?',
    a: 'Yes, SnipShift has a dedicated PropTypes to TypeScript converter. It converts React PropTypes declarations to TypeScript interfaces with proper typing for required/optional props, custom validators, and component default props.',
  },
  {
    q: 'Does SnipShift support JSX to TSX conversion?',
    a: 'Yes, SnipShift\'s JS to TypeScript converter fully supports JSX to TSX conversion. It adds proper React.FC typing, event handler types, and component prop interfaces automatically.',
  },
];

export function HomepageSeoContent() {
  return (
    <section
      className="relative"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 12%, var(--border)) 50%, transparent)',
        }}
      />

      <div className="mx-auto max-w-2xl px-6 py-20 space-y-20">
        {/* About */}
        <div className="space-y-4">
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Free Online Developer Converter Tools
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            SnipShift is a free collection of 15+ developer tools designed to convert, transform, and generate code instantly.
            Whether you need to convert JavaScript to TypeScript, generate Zod schemas from JSON, transform CSS to Tailwind
            utility classes, or compile SCSS to CSS  SnipShift has you covered.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Our AI-powered converters use multiple language models (Gemini, DeepSeek, OpenRouter) to generate meaningful
            type names, smart validations, and production-ready code. Client-side tools run entirely in your browser with
            zero server calls for maximum speed and privacy.
          </p>
        </div>

        {/* Supported Conversions */}
        <div className="space-y-6">
          <h2
            className="text-[11px] font-semibold text-center uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Supported Conversions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ color: 'var(--text-secondary)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-2 text-left text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Source</th>
                  <th className="py-2 text-left text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}></th>
                  <th className="py-2 text-left text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Target</th>
                  <th className="py-2 text-left text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Engine</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2 font-mono text-xs">{tool.meta?.sourceLabel}</td>
                    <td className="py-2 text-xs" style={{ color: 'var(--primary)', opacity: 0.5 }}>→</td>
                    <td className="py-2 font-mono text-xs">
                      <Link href={tool.path} className="hover:underline" style={{ color: 'var(--primary)' }}>
                        {tool.meta?.targetLabel}
                      </Link>
                    </td>
                    <td className="py-2 text-xs">
                      {tool.meta?.tags.includes('AI-Powered') ? 'AI' : 'Client-side'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2
            className="text-[11px] font-semibold text-center uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-md"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <summary
                  className="cursor-pointer px-4 py-3 text-sm font-medium rounded-md faq-summary"
                  style={{ color: 'var(--text-primary)', transition: 'background 150ms ease-out' }}
                >
                  {faq.q}
                </summary>
                <p
                  className="px-4 pb-3 text-sm leading-relaxed"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
