import { RelatedTools } from '@/components/related-tools';

export function GraphqlToTsSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your Schema',
      desc: 'Paste any GraphQL schema definition  types, enums, inputs, queries, mutations. The editor validates your schema in real-time.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our AI analyzes your schema structure, maps custom scalars, and generates precise TypeScript interfaces with proper nullability handling.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the generated TypeScript types or download as a .ts file. Drop them into your project for instant end-to-end type safety.',
    },
  ];

  const benefits = [
    { title: 'End-to-End Type Safety', desc: 'Generated types ensure your frontend queries match your GraphQL schema exactly  catch breaking changes at compile time, not in production.' },
    { title: 'Smart Scalar Mapping', desc: 'AI maps custom scalars like DateTime to Date, JSON to Record<string, unknown>, and generates a Scalars type map for your project.' },
    { title: 'No Manual Type Writing', desc: 'Stop maintaining TypeScript types by hand. Paste your schema and get production-ready interfaces in seconds.' },
    { title: 'Flexible Output', desc: 'Choose between TypeScript enums or union types, Maybe<T> or | null nullability, readonly properties, and more.' },
  ];

  const faqs = [
    {
      q: 'What GraphQL features are supported?',
      a: 'All standard GraphQL schema features: object types, input types, enums, unions, interfaces, scalars, queries, mutations, and subscriptions. Both SDL and introspection-style schemas work.',
    },
    {
      q: 'How accurate is the AI-generated output?',
      a: 'The AI understands GraphQL semantics and maps types precisely. Custom scalars get intelligent type mappings, nullable fields are handled correctly, and the output is validated as compilable TypeScript before being returned.',
    },
    {
      q: 'What happens without AI?',
      a: 'The AST fallback generates correct TypeScript types by directly mapping GraphQL types. It handles all standard types, enums, unions, and inputs. AI adds smarter custom scalar mapping and enhanced type inference.',
    },
    {
      q: 'Should I use enums or union types?',
      a: 'Union types (type Status = "ACTIVE" | "INACTIVE") are generally recommended for better tree-shaking and simpler usage. TypeScript enums work well when you need reverse mapping or prefer the enum syntax.',
    },
    {
      q: 'Does it handle nullable fields correctly?',
      a: 'Yes. Non-null fields (String!) become required properties, while nullable fields become optional with | null or Maybe<T> depending on your preference. Array nullability ([String!]! vs [String]) is also handled precisely.',
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
            GraphQL to TypeScript Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Generate TypeScript types and interfaces from GraphQL schemas instantly.
            AI-powered with smart scalar mapping and nullability handling.
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
        <RelatedTools currentToolId="graphql-to-ts" />
      </div>
    </article>
  );
}
