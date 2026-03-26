import { RelatedTools } from '@/components/related-tools';

export function JsonToZodSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your JSON',
      desc: 'Paste any JSON object  API responses, config files, database records. The editor validates your JSON in real-time.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our AI analyzes your data patterns, detects emails, URLs, dates, and UUIDs, then generates a precise Zod schema with smart validations.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the generated Zod schema or download it as a .ts file. Drop it into your project for instant type-safe validation.',
    },
  ];

  const benefits = [
    { title: 'Type-Safe Validation', desc: 'Zod schemas validate data at runtime and infer TypeScript types at compile time  one source of truth.' },
    { title: 'Smart Pattern Detection', desc: 'AI detects emails, URLs, dates, UUIDs, and enums from your data and adds the right Zod validators automatically.' },
    { title: 'No Manual Schema Writing', desc: 'Stop writing Zod schemas by hand. Paste your API response and get a production-ready schema in seconds.' },
    { title: 'Production-Ready Output', desc: 'Generated schemas include proper nesting, array types, nullable handling, and optional z.infer type exports.' },
  ];

  const faqs = [
    {
      q: 'What is Zod?',
      a: 'Zod is the most popular TypeScript-first schema validation library. It lets you declare schemas, validate data at runtime, and infer static TypeScript types  all from a single schema definition.',
    },
    {
      q: 'How accurate is the AI-generated schema?',
      a: 'The AI analyzes your actual data values to infer the best Zod validators. For example, it detects that "jane@example.com" should use z.string().email() rather than just z.string(). Results are validated to ensure they compile as valid TypeScript.',
    },
    {
      q: 'What happens without AI?',
      a: 'The AST fallback still generates correct Zod schemas by mapping JSON types directly (string → z.string(), number → z.number(), etc.). It also detects common patterns like emails and URLs. AI adds smarter validations and .describe() annotations.',
    },
    {
      q: 'Can I use this for API response validation?',
      a: 'Absolutely  that\'s the most common use case. Paste a sample API response, generate the Zod schema, then use it with z.parse() or z.safeParse() to validate incoming data in your application.',
    },
    {
      q: 'Does it handle nested objects and arrays?',
      a: 'Yes. Nested objects become nested z.object() calls, arrays are typed with z.array(), and mixed-type arrays use z.union(). The schema mirrors the full structure of your JSON.',
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
            JSON to Zod Schema Generator
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Generate Zod validation schemas from any JSON object instantly.
            AI-powered smart validation detects emails, URLs, dates, and more.
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
            Why Use This Tool
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
        <RelatedTools currentToolId="json-to-zod" />
      </div>
    </article>
  );
}
