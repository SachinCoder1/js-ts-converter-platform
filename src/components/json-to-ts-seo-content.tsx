import { RelatedTools } from '@/components/related-tools';

export function JsonToTsSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your JSON',
      desc: 'Paste a JSON object or array into the input editor. Supports API responses, config files, and any valid JSON structure.',
    },
    {
      num: '02',
      title: 'Configure Options',
      desc: 'Choose interface or type alias, toggle export and readonly, set your root type name, and select AI or local generation.',
    },
    {
      num: '03',
      title: 'Copy Your Types',
      desc: 'Copy the generated TypeScript interfaces or download as a .ts file. Ready to drop into your project.',
    },
  ];

  const benefits = [
    { title: 'Type-Safe API Responses', desc: 'Generate interfaces that match your API payloads, catching shape mismatches at compile time.' },
    { title: 'API Contract Documentation', desc: 'Turn JSON responses into typed contracts that serve as living documentation for your endpoints.' },
    { title: 'Faster Development', desc: 'Skip writing interfaces by hand. Paste JSON, get types instantly, and stay in your flow.' },
    { title: 'Catch Shape Mismatches', desc: 'Detect missing fields, wrong types, and nullable values before they cause runtime errors.' },
  ];

  const faqs = [
    {
      q: 'How does it handle nested objects?',
      a: 'Each nested object gets its own named interface, derived from the JSON key name. For example, an "address" field becomes an Address interface. The AI mode generates even more meaningful names based on data context.',
    },
    {
      q: 'What happens with arrays?',
      a: 'Arrays are analyzed to determine element types. If all elements share the same shape, a single typed array is generated. Mixed-type arrays produce union types. Empty arrays are typed as unknown[].',
    },
    {
      q: 'How are null values handled?',
      a: 'Null values are typed as union types (e.g., unknown | null) since the actual type cannot be inferred from null alone. The AI mode can often infer the intended type from field naming patterns.',
    },
    {
      q: 'What does the AI mode add?',
      a: 'AI mode generates semantically meaningful interface names (e.g., "User" instead of "Root"), adds JSDoc comments for dates, emails, and IDs, and can intelligently mark fields as optional based on common patterns.',
    },
    {
      q: 'Is this tool free?',
      a: 'Yes, completely free with no signup required. Both local (AST) and AI-powered generation are available at no cost.',
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
            JSON to TypeScript Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Generate TypeScript interfaces and types from any JSON structure instantly.
            Powered by AI for intelligent naming, JSDoc annotations, and optional field detection.
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

        {/* Why Use This */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Why Generate Types from JSON
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
            {['Nested Objects', 'Arrays', 'Nullable Fields', 'Date Detection'].map((item) => (
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
        <RelatedTools currentToolId="json-to-ts" />
      </div>
    </article>
  );
}
