import { RelatedTools } from '@/components/related-tools';

export function ScssSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your SCSS',
      desc: 'Paste your SCSS or SASS code into the input editor. Supports variables, nesting, mixins, extends, and all Sass features.',
    },
    {
      num: '02',
      title: 'Click Compile',
      desc: 'The Dart Sass compiler processes your code server-side, handling all SCSS features including functions, maps, and control flow.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the compiled CSS or download it as a .css file. Choose between expanded (readable) or compressed (minified) output.',
    },
  ];

  const benefits = [
    {
      title: 'No Build Setup Required',
      desc: 'Skip the Webpack/Vite/Gulp configuration. Compile SCSS to CSS instantly in your browser.',
    },
    {
      title: 'Instant Feedback',
      desc: 'See your compiled CSS output immediately. Perfect for prototyping, debugging, and learning SCSS syntax.',
    },
    {
      title: 'Compressed Output',
      desc: 'Generate production-ready minified CSS with one click. Reduce file size without a separate build step.',
    },
    {
      title: 'Full Sass Support',
      desc: 'Powered by Dart Sass  the official, primary implementation. Supports all modern Sass features.',
    },
  ];

  const faqs = [
    {
      q: 'What is the difference between SCSS and SASS?',
      a: 'SCSS uses curly braces and semicolons (like CSS), while SASS uses indentation-based syntax without braces or semicolons. Both compile to the same CSS output. SCSS is more popular because it looks like regular CSS.',
    },
    {
      q: 'Is this tool free to use?',
      a: 'Yes, completely free with no signup required. Just paste your SCSS code and compile.',
    },
    {
      q: 'Does it support @import and @use?',
      a: 'This tool compiles single-file SCSS. Since there is no filesystem context, @import and @use directives that reference external files will produce a compilation error. Inline code and built-in Sass modules work perfectly.',
    },
    {
      q: 'How large can my SCSS files be?',
      a: 'The tool supports SCSS input up to 50KB, which covers the vast majority of stylesheets. For very large projects, consider using a local Sass compiler.',
    },
    {
      q: 'Which Sass compiler is used?',
      a: 'We use Dart Sass, the official primary implementation of Sass maintained by the Sass team. It supports all modern features including the module system, built-in functions, and the latest CSS features.',
    },
  ];

  return (
    <article
      className="relative"
      style={{
        borderTop: '1px solid var(--border)',
        background:
          'color-mix(in srgb, var(--background) 100%, var(--surface) 50%)',
      }}
    >
      {/* Gradient divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 12%, var(--border)) 50%, transparent)',
        }}
      />

      <div className="mx-auto max-w-2xl px-6 py-20 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1
            className="text-3xl sm:text-4xl font-semibold"
            style={{
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            SCSS to CSS Compiler
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Compile your SCSS and SASS code to standard CSS instantly. Powered by
            Dart Sass for full feature support. Free, no signup required.
          </p>
        </div>

        {/* How It Works */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              fontSize: '11px',
            }}
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
                  style={{
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
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
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              fontSize: '11px',
            }}
          >
            Why Use an Online SCSS Compiler
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 mt-0.5"
                  style={{ color: 'var(--success)' }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                <div>
                  <h3
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}
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
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              fontSize: '11px',
            }}
          >
            Supported Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'SCSS Syntax',
              'SASS Indented',
              'Variables & Mixins',
              'Nesting & Extend',
            ].map((item) => (
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
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              fontSize: '11px',
            }}
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
                  style={{
                    color: 'var(--text-primary)',
                    transition: 'background 150ms ease-out',
                  }}
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
        <RelatedTools currentToolId="scss-to-css" />
      </div>
    </article>
  );
}
