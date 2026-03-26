import { RelatedTools } from '@/components/related-tools';

export function HtmlJsxSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your HTML',
      desc: 'Paste any HTML snippet into the input editor. Supports divs, forms, SVGs, and everything in between.',
    },
    {
      num: '02',
      title: 'See JSX Instantly',
      desc: 'Conversion happens in real time as you type. Attributes, styles, and comments are transformed automatically.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the converted JSX/TSX code or download it. Drop it straight into your React component.',
    },
  ];

  const conversions = [
    { from: 'class', to: 'className', desc: 'HTML class attribute becomes React\'s className' },
    { from: 'for', to: 'htmlFor', desc: 'Label for attribute becomes htmlFor' },
    { from: 'style="..."', to: 'style={{ }}', desc: 'Inline CSS strings become JavaScript objects' },
    { from: 'onclick', to: 'onClick', desc: 'Event handlers convert to camelCase' },
    { from: '<img>', to: '<img />', desc: 'Void elements get self-closing syntax' },
    { from: '<!-- -->', to: '{/* */}', desc: 'HTML comments become JSX comments' },
    { from: 'tabindex', to: 'tabIndex', desc: 'Attribute names convert to camelCase' },
    { from: 'stroke-width', to: 'strokeWidth', desc: 'SVG attributes convert to camelCase' },
  ];

  const benefits = [
    { title: 'Save Time on Migrations', desc: 'Stop manually renaming attributes when moving HTML templates into React components.' },
    { title: 'Handle Edge Cases', desc: 'SVG attributes, inline styles, and event handlers are all converted correctly.' },
    { title: 'Real-time Preview', desc: 'See the converted output instantly as you type or paste your HTML code.' },
    { title: 'Configurable Output', desc: 'Choose JSX or TSX, wrap in components, and control quote style and self-closing behavior.' },
  ];

  const faqs = [
    {
      q: 'Is the HTML to JSX converter free?',
      a: 'Yes, this tool is completely free with no signup required. All conversion happens in your browser  nothing is sent to a server.',
    },
    {
      q: 'Does it handle SVG attributes?',
      a: 'Yes. SVG-specific attributes like stroke-width, fill-rule, clip-path, and many others are correctly converted to their camelCase JSX equivalents.',
    },
    {
      q: 'What about inline styles?',
      a: 'Inline style strings are parsed and converted to JavaScript objects. For example, style="font-size: 14px; color: red" becomes style={{ fontSize: 14, color: \'red\' }}.',
    },
    {
      q: 'What is the difference between JSX and TSX output?',
      a: 'JSX is used in JavaScript React projects while TSX is used in TypeScript React projects. The converted code is the same, but the component wrapper (if selected) adds TypeScript type annotations in TSX mode.',
    },
    {
      q: 'Does it work with large HTML files?',
      a: 'The converter runs entirely in your browser and handles HTML snippets of any reasonable size. For very large files, there may be a brief processing delay.',
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
            HTML to JSX/TSX Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert plain HTML into valid JSX or TSX instantly. Handles className, inline styles,
            event handlers, self-closing tags, SVG attributes, and more.
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

        {/* What Gets Converted */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            What Gets Converted
          </h2>
          <div className="space-y-2">
            {conversions.map((item) => (
              <div
                key={item.from}
                className="flex items-center gap-3 p-3 rounded-md"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <code
                    className="font-mono text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--muted)', color: 'var(--text-secondary)' }}
                  >
                    {item.from}
                  </code>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                  <code
                    className="font-mono text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)', color: 'var(--primary)' }}
                  >
                    {item.to}
                  </code>
                </div>
                <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-tertiary)' }}>
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why Convert HTML to JSX */}
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
        <RelatedTools currentToolId="html-to-jsx" />
      </div>
    </article>
  );
}
