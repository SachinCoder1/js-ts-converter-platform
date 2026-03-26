export function OpenApiToTsSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your Spec',
      desc: 'Paste any OpenAPI 3.x or Swagger 2.0 spec in JSON or YAML. The editor validates your spec structure in real-time.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our AI analyzes your spec, resolves $ref pointers, maps schemas, and generates precise TypeScript interfaces with proper nullability and enum handling.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the generated TypeScript types or download as a .ts file. Drop them into your project for instant end-to-end type safety with your API.',
    },
  ];

  const benefits = [
    { title: 'Type-Safe API Consumers', desc: 'Generated types ensure your frontend API calls match the spec exactly  catch breaking changes at compile time, not in production.' },
    { title: 'Handles $ref, allOf, oneOf', desc: 'Complex schema compositions are resolved correctly  intersection types for allOf, union types for oneOf/anyOf, and recursive $ref resolution.' },
    { title: 'No Manual Type Writing', desc: 'Stop maintaining TypeScript types by hand. Paste your spec and get production-ready interfaces in seconds.' },
    { title: 'Flexible Output', desc: 'Choose between TypeScript enums or union types, toggle JSDoc comments, and optionally generate typed API client functions.' },
  ];

  const faqs = [
    {
      q: 'Does it support both OpenAPI 3.x and Swagger 2.0?',
      a: 'Yes. The converter auto-detects the spec version. For OpenAPI 3.x, it reads from components.schemas. For Swagger 2.0, it reads from definitions. You can also manually select the version.',
    },
    {
      q: 'How accurate is the AI-generated output?',
      a: 'The AI understands OpenAPI semantics and maps types precisely. $ref pointers are resolved, nullable fields are handled correctly, and the output is validated as compilable TypeScript before being returned.',
    },
    {
      q: 'What happens without AI?',
      a: 'The AST fallback generates correct TypeScript types by directly mapping OpenAPI schemas. It handles all standard types, enums, $ref resolution, allOf/oneOf, and nullable fields. AI adds smarter type inference and API client generation.',
    },
    {
      q: 'Can it generate API client functions?',
      a: 'Yes. Choose "Interfaces + API client" or "Interfaces + Fetch wrappers" in the output mode selector. The AI will generate typed functions for each endpoint in your spec.',
    },
    {
      q: 'Does it support YAML input?',
      a: 'Yes. Toggle the input format between JSON and YAML. The converter parses both formats correctly and generates the same TypeScript output regardless of input format.',
    },
  ];

  return (
    <section
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
            OpenAPI/Swagger to TypeScript Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Generate TypeScript types and interfaces from OpenAPI 3.x or Swagger 2.0 specs instantly.
            AI-powered with $ref resolution, enum mapping, and optional API client generation.
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
      </div>
    </section>
  );
}
