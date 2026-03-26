import { RelatedTools } from '@/components/related-tools';

export function SeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your Code',
      desc: 'Paste your JavaScript or JSX code into the input editor. Supports React components, Node.js modules, and more.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our AI analyzes your code structure, infers types, creates interfaces, and produces clean TypeScript.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the converted TypeScript code or download it as a .ts/.tsx file. Ready to use in your project.',
    },
  ];

  const benefits = [
    { title: 'Catch Bugs Early', desc: 'TypeScript catches type errors at compile time, before they reach production.' },
    { title: 'Better IDE Support', desc: 'Get autocompletion, refactoring tools, and inline documentation in your editor.' },
    { title: 'Self-Documenting Code', desc: 'Type annotations serve as living documentation for your codebase.' },
    { title: 'Safer Refactoring', desc: 'Rename variables, move functions, and restructure code with confidence.' },
  ];

  const faqs = [
    {
      q: 'Is SnipShift free to use?',
      a: 'Yes, SnipShift is completely free with no signup required. Just paste your code and convert.',
    },
    {
      q: 'How accurate is the AI conversion?',
      a: 'SnipShift uses multiple AI models (Gemini, DeepSeek) for high-quality type inference. It creates named interfaces, proper React typing, and avoids using "any" types. Results are validated to ensure they parse as valid TypeScript.',
    },
    {
      q: 'Is my code stored or shared?',
      a: 'Conversion results are cached to improve performance, but your code is never stored permanently or shared with third parties. The cache automatically expires after 7 days.',
    },
    {
      q: 'What happens if AI models are unavailable?',
      a: 'SnipShift falls back to AST-based conversion which runs locally. While less sophisticated than AI conversion, it still handles import/export conversion, basic type inference, and JSDoc extraction.',
    },
    {
      q: 'Can I convert large files?',
      a: 'SnipShift supports files up to 50KB. For very large codebases, we recommend converting files individually or using tools like ts-migrate for bulk conversion.',
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
            JavaScript to TypeScript Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert your JavaScript and JSX code to fully-typed TypeScript and TSX instantly.
            Powered by AI for accurate type inference and named interfaces.
          </p>
        </div>

        {/* How It Works */}
        <div className="space-y-8">
          <h2
            className="text-[11px] font-semibold text-center uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-tertiary)' }}
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

        {/* Why TypeScript */}
        <div className="space-y-8">
          <h2
            className="text-[11px] font-semibold text-center uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Why Convert to TypeScript
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

        {/* Supported Conversions */}
        <div className="space-y-6">
          <h2
            className="text-[11px] font-semibold text-center uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Supported Conversions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['JS \u2192 TS', 'JSX \u2192 TSX', 'React', 'Node.js'].map((item) => (
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
            className="text-[11px] font-semibold text-center uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-tertiary)' }}
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
        <RelatedTools currentToolId="js-to-ts" />
      </div>
    </article>
  );
}
