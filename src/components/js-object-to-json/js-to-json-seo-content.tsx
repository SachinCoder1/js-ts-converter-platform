import { RelatedTools } from '@/components/related-tools';

export function JsToJsonSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your Object',
      desc: 'Paste a JavaScript object literal into the input editor. Supports messy syntax  single quotes, trailing commas, comments, and more.',
    },
    {
      num: '02',
      title: 'See Live JSON',
      desc: 'Conversion happens automatically as you type. No button to click  your valid JSON appears instantly in the output panel.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the valid JSON to your clipboard or download it as a .json file. Ready for APIs, configs, and data files.',
    },
  ];

  const benefits = [
    {
      title: 'Handles Quirky Syntax',
      desc: 'Single quotes, trailing commas, unquoted keys, inline comments  all cleaned up automatically.',
    },
    {
      title: 'Strips Invalid Values',
      desc: 'Functions, undefined, Infinity, NaN, and other JS-only values are removed or converted to JSON-safe equivalents.',
    },
    {
      title: 'Instant Results',
      desc: 'No server calls needed. Runs 100% in your browser with live conversion as you type.',
    },
    {
      title: 'Configurable Output',
      desc: 'Choose indentation style, decide how to handle undefined values, and optionally sort keys alphabetically.',
    },
  ];

  const faqs = [
    {
      q: 'What JavaScript syntax does this handle?',
      a: 'This tool handles single-quoted strings, unquoted property keys, trailing commas, single-line and multi-line comments, undefined values, function values, template literals, Infinity, NaN, new Date() expressions, and RegExp literals.',
    },
    {
      q: 'Is my code sent to a server?',
      a: 'No. All conversion happens entirely in your browser. Your code never leaves your machine  there are no API calls or server-side processing.',
    },
    {
      q: 'What happens to functions and undefined?',
      a: 'Function values (including arrow functions) are always removed since they have no JSON equivalent. For undefined values, you can choose to either remove the key entirely or convert it to null.',
    },
    {
      q: 'How does it handle special values like Infinity?',
      a: 'Infinity, -Infinity, and NaN are converted to null since they are not valid JSON. new Date() expressions are converted to ISO 8601 strings when possible. RegExp literals are converted to their string representation.',
    },
    {
      q: 'Can I convert JSON back to a JS object?',
      a: 'JSON is already valid JavaScript, so you can use it directly. If you need to add JS-specific features like comments or functions, you would need to edit the output manually.',
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
            JavaScript Object to JSON Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert messy JavaScript object literals into clean, valid JSON instantly.
            Handles single quotes, trailing commas, comments, and JS-only values  all in your browser.
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

        {/* Why Use This Tool */}
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

        {/* Supported Transformations */}
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Supported Transformations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              "' \u2192 \"",
              'Unquoted Keys',
              'Trailing Commas',
              'Comments',
              'undefined',
              'Functions',
              'Infinity/NaN',
              'new Date()',
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
        <RelatedTools currentToolId="js-object-to-json" />
      </div>
    </article>
  );
}
