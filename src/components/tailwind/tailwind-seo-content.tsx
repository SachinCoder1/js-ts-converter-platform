import { RelatedTools } from '@/components/related-tools';

export function TailwindSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your Classes',
      desc: 'Paste Tailwind utility classes or HTML with class attributes into the input editor.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our engine maps each class to its CSS equivalent, grouping responsive and pseudo-class variants automatically.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the vanilla CSS output or download it as a .css file. Ready to drop into any project.',
    },
  ];

  const benefits = [
    { title: 'Understand Your Styles', desc: 'See exactly what CSS Tailwind generates under the hood for better debugging.' },
    { title: 'Framework Migration', desc: 'Move away from Tailwind without rewriting styles from scratch.' },
    { title: 'Learning Tool', desc: 'Learn CSS fundamentals by seeing what each Tailwind utility class actually does.' },
    { title: 'Documentation', desc: 'Generate CSS documentation from Tailwind class lists for design handoffs.' },
  ];

  const faqs = [
    {
      q: 'Is this tool free to use?',
      a: 'Yes, completely free with no signup required. Just paste your Tailwind classes and convert.',
    },
    {
      q: 'How does it handle responsive variants like md: and lg:?',
      a: 'Responsive variants are automatically grouped under the correct @media queries. For example, md:flex becomes @media (min-width: 768px) { display: flex } with the standard Tailwind breakpoints.',
    },
    {
      q: 'Does it support Tailwind v4?',
      a: 'Yes. Toggle between v3 and v4 in the options bar. v4 mode handles newer syntax like opacity modifiers (bg-red-500/50), the size-* utility, and updated default values.',
    },
    {
      q: 'What about complex utilities like space-y or divide?',
      a: 'AI-enhanced mode handles complex selectors like space-y-4 (which generates > * + * child combinator rules). Rule-based mode covers the most common patterns including spacing, colors, typography, and layout utilities.',
    },
    {
      q: 'Is my input stored or shared?',
      a: 'Conversion results are cached to improve performance, but your input is never stored permanently or shared with third parties. The cache automatically expires after 7 days.',
    },
  ];

  return (
    <article
      className="relative"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--background) 100%, var(--surface) 50%)',
      }}
    >
      {/* Gradient divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 12%, var(--border)) 50%, transparent)',
        }}
      />

      <div className="mx-auto max-w-2xl px-6 py-20 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1
            className="text-3xl sm:text-4xl font-semibold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2 }}
          >
            Tailwind to CSS Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert Tailwind CSS utility classes to vanilla CSS instantly.
            See exactly what CSS your Tailwind classes generate  perfect for learning, debugging, and migration.
          </p>
        </div>

        {/* How It Works */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="text-center space-y-3">
                <span
                  className="font-mono text-2xl font-light"
                  style={{ color: 'var(--primary)', opacity: 0.7 }}
                >
                  {step.num}
                </span>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Convert */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Why Convert Tailwind to CSS
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 p-4 rounded-md"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: 'var(--success)' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
                </svg>
                <div>
                  <h3
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Features */}
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Supported Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Responsive', 'Pseudo-classes', 'Arbitrary Values', 'v3 & v4'].map((item) => (
              <div
                key={item}
                className="text-center p-3 rounded-md font-mono text-xs font-medium"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  letterSpacing: '0.02em',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            FAQ
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
        <RelatedTools currentToolId="tailwind-to-css" />
      </div>
    </article>
  );
}
