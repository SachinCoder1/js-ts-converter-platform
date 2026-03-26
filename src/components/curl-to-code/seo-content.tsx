import { RelatedTools } from '@/components/related-tools';

export function CurlToCodeSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your cURL',
      desc: 'Paste a cURL command  from browser DevTools, Postman, or API docs. The editor handles multi-line commands with backslash continuations.',
    },
    {
      num: '02',
      title: 'Choose Language & Convert',
      desc: 'Select your target language from the tabs. See instant preview, then click Convert for AI-powered, production-ready code.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the generated code into your project. All headers, auth, body, and options are preserved exactly.',
    },
  ];

  const benefits = [
    { title: '8 Languages', desc: 'JavaScript (fetch & axios), TypeScript, Python, Go, Rust, PHP, and Ruby  all from a single cURL command.' },
    { title: 'Instant Preview', desc: 'Rule-based parsing gives you immediate output as you type, before you even click Convert.' },
    { title: 'AI-Powered', desc: 'Click Convert for AI-refined, idiomatic code with proper error handling and language-specific best practices.' },
    { title: 'Browser DevTools Ready', desc: 'Copy any request as cURL from Chrome/Firefox DevTools and paste it directly  all flags are handled.' },
  ];

  const faqs = [
    {
      q: 'What cURL flags are supported?',
      a: 'All common flags: -X (method), -H (headers), -d (body), --data-raw, --data-binary, --data-urlencode, -u (auth), -b (cookies), -k (insecure), -L (redirects), -F (form data), --compressed, and -o (output).',
    },
    {
      q: 'How do I get a cURL command from my browser?',
      a: 'Open DevTools (F12), go to the Network tab, right-click any request, and select "Copy as cURL". Paste it directly into the converter.',
    },
    {
      q: 'Does it handle JSON bodies correctly?',
      a: 'Yes. When Content-Type is application/json, the converter properly formats the body  using JSON.stringify in JavaScript, json= in Python requests, and equivalent patterns in other languages.',
    },
    {
      q: 'What\'s the difference between instant preview and AI conversion?',
      a: 'Instant preview uses rule-based parsing for immediate feedback. AI conversion generates more idiomatic, production-ready code with better error handling, type annotations (TypeScript), and language-specific best practices.',
    },
    {
      q: 'Is my cURL command stored on the server?',
      a: 'Your cURL command is sent to the server only when you click Convert (for AI processing). It is never stored  results are cached temporarily by hash for performance, but the original command is discarded immediately.',
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
            cURL to Code Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert cURL commands to JavaScript, Python, Go, Rust, PHP, Ruby, and more.
            Instant preview with AI-powered refinement for production-ready code.
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
        <RelatedTools currentToolId="curl-to-code" />
      </div>
    </article>
  );
}
