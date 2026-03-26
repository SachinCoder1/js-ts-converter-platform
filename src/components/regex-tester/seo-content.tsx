import { RelatedTools } from '@/components/related-tools';

export function RegexSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Enter Your Regex',
      desc: 'Type your regex pattern and toggle flags (g, i, m, s, u, y). Choose from common presets like email, URL, or date patterns.',
    },
    {
      num: '02',
      title: 'Test & Explore',
      desc: 'Paste your test string and see matches highlighted in real-time. Inspect capture groups, named groups, and match positions.',
    },
    {
      num: '03',
      title: 'Explain & Convert',
      desc: 'Get an AI-powered plain English explanation, or convert your pattern to Python, Go, Rust, PHP, or Java with syntax notes.',
    },
  ];

  const benefits = [
    { title: 'Live Match Highlighting', desc: 'See matches highlighted instantly as you type  no button clicks needed for testing.' },
    { title: 'AI-Powered Explanation', desc: 'Get a plain English breakdown of what your regex does, component by component.' },
    { title: 'Cross-Language Conversion', desc: 'Convert regex between JavaScript, Python, Go, Rust, PHP, and Java with syntax difference notes.' },
    { title: 'Built-in Cheatsheet', desc: 'Quick reference card with character classes, quantifiers, anchors, groups, and flags  always one click away.' },
  ];

  const faqs = [
    {
      q: 'What is a regular expression?',
      a: 'A regular expression (regex) is a pattern that describes a set of strings. It\'s used for searching, matching, and manipulating text in programming languages. For example, \\d+ matches one or more digits.',
    },
    {
      q: 'How does the AI explanation work?',
      a: 'The AI analyzes your regex pattern and generates a plain English explanation of each component  character classes, quantifiers, groups, and assertions. It\'s especially helpful for understanding complex patterns written by others.',
    },
    {
      q: 'Why do regex patterns differ between languages?',
      a: 'Different programming languages implement regex engines with slightly different syntax. For example, JavaScript uses (?<name>) for named groups while Python uses (?P<name>). The global flag "g" in JavaScript has no equivalent in most other languages  they use functions like findall() instead.',
    },
    {
      q: 'Is the regex testing secure?',
      a: 'Yes. All regex testing happens in your browser  your test strings are never sent to a server. Only the AI explanation and cross-language conversion features use server-side processing, and patterns are never stored.',
    },
    {
      q: 'Does it protect against catastrophic backtracking?',
      a: 'Yes. The tester includes a 2-second timeout and caps matches at 10,000 to prevent patterns with catastrophic backtracking from freezing your browser.',
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
            Regex Tester & Cross-Language Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Test regular expressions with live highlighting, get AI explanations,
            and convert between JavaScript, Python, Go, Rust, PHP, and Java.
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
        <RelatedTools currentToolId="regex-tester" />
      </div>
    </article>
  );
}
