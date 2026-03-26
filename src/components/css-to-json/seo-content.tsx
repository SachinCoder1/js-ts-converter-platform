import { RelatedTools } from '@/components/related-tools';

export function CssToJsonSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your CSS',
      desc: 'Paste your CSS rules into the input editor. Supports selectors, media queries, pseudo-classes, and vendor prefixes.',
    },
    {
      num: '02',
      title: 'Choose Options',
      desc: 'Select camelCase or kebab-case keys, numeric value handling, and an optional wrapper like StyleSheet.create().',
    },
    {
      num: '03',
      title: 'Copy the JSON',
      desc: 'Your CSS is instantly converted to JSON. Copy the result or download it as a .json file.',
    },
  ];

  const benefits = [
    {
      title: 'CSS-in-JS Compatibility',
      desc: 'Use your existing CSS with React, Vue, or any CSS-in-JS library like styled-components and Emotion.',
    },
    {
      title: 'React Native Ready',
      desc: 'Wrap output with StyleSheet.create() for instant React Native compatibility with your existing styles.',
    },
    {
      title: 'Type-Safe Styles',
      desc: 'JSON style objects can be typed with TypeScript for compile-time style checking and autocompletion.',
    },
    {
      title: 'Easy Migration',
      desc: 'Migrate legacy CSS codebases to modern CSS-in-JS one file at a time without rewriting from scratch.',
    },
  ];

  const faqs = [
    {
      q: 'Is this tool free to use?',
      a: 'Yes, the CSS to JSON converter is completely free with no signup required. Just paste your CSS and get instant results.',
    },
    {
      q: 'Does it handle media queries?',
      a: 'Yes, media queries are converted to nested JSON objects. The @media rule becomes a key, and its child rules are nested inside.',
    },
    {
      q: 'What about pseudo-classes like :hover?',
      a: 'Pseudo-classes are preserved in the selector key. For example, .button:hover becomes a ".button:hover" key in the output JSON.',
    },
    {
      q: 'Is my CSS sent to a server?',
      a: 'No, all conversion happens entirely in your browser. Your CSS never leaves your machine  there are no API calls or server processing involved.',
    },
    {
      q: 'Can I use this for React Native?',
      a: 'Yes! Select the "StyleSheet.create()" wrapper option to get output formatted for React Native. Remember that React Native only supports a subset of CSS properties.',
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
            CSS to JSON Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert CSS rules to JSON objects for CSS-in-JS libraries like styled-components,
            Emotion, and React Native StyleSheet. Instant, free, and runs entirely in your browser.
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

        {/* Why Convert */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              fontSize: '11px',
            }}
          >
            Why Convert CSS to JSON
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

        {/* Supported Conversions */}
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              fontSize: '11px',
            }}
          >
            Supported Conversions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['CSS \u2192 JSON', 'Media Queries', 'Pseudo-classes', 'Vendor Prefixes'].map(
              (item) => (
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
              )
            )}
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
        <RelatedTools currentToolId="css-to-json" />
      </div>
    </article>
  );
}
