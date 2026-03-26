import { RelatedTools } from '@/components/related-tools';

export function EnvToTypesSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your .env',
      desc: 'Paste or type your .env file content into the input editor. Supports comments, quoted values, and multiline strings.',
    },
    {
      num: '02',
      title: 'Choose Format',
      desc: 'Select your output format: TypeScript interface, Zod schema, t3-env config, or Valibot schema. Adjust optional and comment settings.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Your typed schema updates instantly. Copy it to your clipboard or download it as a .ts file.',
    },
  ];

  const benefits = [
    {
      title: 'Runtime Safety',
      desc: 'Catch missing or mistyped environment variables at build time instead of discovering them in production.',
    },
    {
      title: 'IDE Autocomplete',
      desc: 'Get full IntelliSense and autocomplete for process.env in VS Code, WebStorm, and other TypeScript-aware editors.',
    },
    {
      title: 'Framework Integration',
      desc: 'Generate t3-env configs that automatically split NEXT_PUBLIC_ variables into client/server sections.',
    },
    {
      title: 'Validation Schemas',
      desc: 'Produce Zod or Valibot schemas that validate and coerce environment variables at app startup.',
    },
  ];

  const faqs = [
    {
      q: 'Is this converter free to use?',
      a: 'Yes, completely free with no signup, no limits, and no data sent to any server. Everything runs in your browser.',
    },
    {
      q: 'Is my .env data sent to a server?',
      a: 'No. The conversion happens entirely in your browser using JavaScript. Your environment variables and secrets never leave your machine.',
    },
    {
      q: 'How are types inferred from values?',
      a: 'Numeric values like PORT=3000 become number, boolean values like DEBUG=true become boolean, URL patterns become string with .url() validation, and everything else becomes string. Empty values can be marked as optional.',
    },
    {
      q: 'What is the t3-env format?',
      a: 'The t3-env format generates a createEnv() configuration compatible with @t3-oss/env-nextjs. It splits variables into server and client sections based on prefix detection (NEXT_PUBLIC_, VITE_, REACT_APP_).',
    },
    {
      q: 'Which output format should I use?',
      a: 'Use TypeScript interface for simple type declarations, Zod for runtime validation, t3-env for Next.js projects using the T3 stack, or Valibot for a lighter-weight validation alternative to Zod.',
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
            Env to TypeScript / Zod Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert .env files to typed TypeScript interfaces, Zod schemas, t3-env configs,
            or Valibot schemas  instantly in your browser, no server, completely free.
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

        {/* Why Type Your Env */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Why Type Your Environment Variables
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

        {/* Supported Formats */}
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Supported Output Formats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['TypeScript', 'Zod', 't3-env', 'Valibot'].map((item) => (
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
        <RelatedTools currentToolId="env-to-types" />
      </div>
    </article>
  );
}
