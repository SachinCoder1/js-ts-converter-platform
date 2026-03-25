export function SqlToTsSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your SQL',
      desc: 'Paste CREATE TABLE statements from PostgreSQL, MySQL, or SQLite. The editor provides real-time syntax highlighting and instant preview.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our AI analyzes your schema, maps SQL types to TypeScript, detects foreign key relations, and generates precise interfaces — or Prisma/Drizzle schemas.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the generated TypeScript types or download as a .ts file. Drop them into your project for instant type-safe database access.',
    },
  ];

  const benefits = [
    { title: 'Type-Safe Database Access', desc: 'Generated interfaces ensure your queries return exactly the types you expect — catch schema mismatches at compile time, not in production.' },
    { title: 'Relation Inference', desc: 'AI detects REFERENCES and FOREIGN KEY constraints, adding typed relation comments so you know how your tables connect.' },
    { title: 'Prisma & Drizzle Support', desc: 'Beyond TypeScript interfaces, generate Prisma schema models or Drizzle ORM table definitions directly from your SQL.' },
    { title: 'Instant AST Preview', desc: 'See TypeScript types update in real-time as you type SQL, powered by a regex-based parser that runs entirely in your browser.' },
  ];

  const faqs = [
    {
      q: 'Which SQL dialects are supported?',
      a: 'PostgreSQL, MySQL, and SQLite. Each dialect handles its specific types — SERIAL and JSONB for PostgreSQL, AUTO_INCREMENT and ENUM() for MySQL, and flexible typing for SQLite.',
    },
    {
      q: 'How accurate is the AI-generated output?',
      a: 'The AI understands SQL semantics and maps column types precisely. Foreign keys are detected from both inline REFERENCES and standalone CONSTRAINT declarations. Output is validated as compilable TypeScript before being returned.',
    },
    {
      q: 'What happens without AI?',
      a: 'The AST fallback generates correct TypeScript interfaces using regex-based SQL parsing. It handles all standard column types, NOT NULL constraints, PRIMARY KEY detection, and foreign key references. AI adds relation inference, Prisma/Drizzle generation, and enhanced type narrowing.',
    },
    {
      q: 'How are nullable columns handled?',
      a: 'Columns without NOT NULL are treated as nullable. You can choose between union-null style (column: string | null) or optional style (column?: string) in the options.',
    },
    {
      q: 'What is Select + Insert mode?',
      a: 'Select + Insert generates two types per table. The Select type includes all columns, while the Insert type makes auto-generated fields (id, created_at, columns with DEFAULT) optional — matching how you actually insert rows.',
    },
  ];

  return (
    <section
      className="relative"
      style={{
        background: 'var(--background)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto max-w-screen-xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            SQL to TypeScript Converter
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Generate TypeScript interfaces from SQL CREATE TABLE statements.
            AI-powered with smart type mapping, relation inference, and Prisma/Drizzle support.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h3
            className="text-xl font-semibold text-center mb-10"
            style={{ color: 'var(--text-primary)' }}
          >
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="text-xs font-bold mb-2"
                  style={{ color: 'var(--primary)' }}
                >
                  STEP {step.num}
                </div>
                <h4
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {step.title}
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Use This Tool */}
        <div className="mb-20">
          <h3
            className="text-xl font-semibold text-center mb-10"
            style={{ color: 'var(--text-primary)' }}
          >
            Why Use This Tool
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h4
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {b.title}
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h3
            className="text-xl font-semibold text-center mb-10"
            style={{ color: 'var(--text-primary)' }}
          >
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <summary
                  className="cursor-pointer px-6 py-4 font-medium text-sm list-none flex items-center justify-between"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {faq.q}
                  <svg
                    className="w-4 h-4 transition-transform group-open:rotate-180"
                    style={{ color: 'var(--text-tertiary)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div
                  className="px-6 pb-4 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
