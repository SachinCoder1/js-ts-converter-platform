import { RelatedTools } from '@/components/related-tools';

export function PropTypesToTsSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your PropTypes',
      desc: 'Paste any React component with PropTypes definitions. The editor supports full JSX syntax highlighting.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our AI analyzes your PropTypes, infers event handler types, and generates precise TypeScript interfaces with smart type mapping.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the generated TypeScript interface or the full refactored component. Drop it into your project to complete the migration.',
    },
  ];

  const benefits = [
    { title: 'Accurate Type Mapping', desc: 'Every PropTypes validator maps to the correct TypeScript type — shapes become interfaces, oneOf becomes union literals, arrayOf becomes typed arrays.' },
    { title: 'Smart Event Inference', desc: 'AI detects event handler patterns like onClick, onChange, and onSubmit, and generates proper React event types instead of generic functions.' },
    { title: 'defaultProps Handling', desc: 'Automatically merges defaultProps into optional interface fields or keeps them separate — your choice.' },
    { title: 'Production-Ready Output', desc: 'Generated interfaces include proper nesting, React.ReactNode for render props, and compile without TypeScript errors.' },
  ];

  const faqs = [
    {
      q: 'Why migrate from PropTypes to TypeScript?',
      a: 'PropTypes only validate at runtime in development mode. TypeScript catches type errors at compile time, provides IDE autocomplete, and the type information is available across your entire codebase — not just within one component.',
    },
    {
      q: 'How does the AI improve over basic conversion?',
      a: 'The AI infers specific event handler types from naming conventions (e.g., onClick becomes React.MouseEvent), detects custom validators, and generates JSDoc comments for complex types. The AST fallback uses generic function types.',
    },
    {
      q: 'Does it handle PropTypes.shape and nested objects?',
      a: 'Yes. PropTypes.shape({...}) becomes an inline object type or a separate named interface when the shape has 3 or more fields. Nested shapes are fully supported and recursively converted.',
    },
    {
      q: 'What about PropTypes.oneOf and enum types?',
      a: 'PropTypes.oneOf([\'admin\', \'editor\', \'viewer\']) becomes the union type \'admin\' | \'editor\' | \'viewer\' — preserving the exact allowed values as TypeScript literal types.',
    },
    {
      q: 'Can I convert the entire component or just the interface?',
      a: 'Both. Use "Interface only" mode to get just the Props interface, or "Interface + Component" mode to get the full refactored component with typed props parameter and the PropTypes block removed.',
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
            PropTypes to TypeScript Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert React PropTypes to TypeScript interfaces instantly.
            AI-powered smart type inference with event handler detection and defaultProps merging.
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

        {/* Why Migrate */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Why Migrate to TypeScript
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
        <RelatedTools currentToolId="proptypes-to-ts" />
      </div>
    </article>
  );
}
