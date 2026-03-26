import { RelatedTools } from '@/components/related-tools';

export function MarkdownTableSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your Data',
      desc: 'Paste a Markdown table, JSON array, or CSV into the input editor. The converter auto-detects the format.',
    },
    {
      num: '02',
      title: 'Choose Output Format',
      desc: 'Switch between output tabs to see your data as JSON, CSV, or Markdown. Adjust delimiter, alignment, and JSON style.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Both outputs update instantly. Copy to clipboard or download as a file.',
    },
  ];

  const benefits = [
    {
      title: 'Documentation & READMEs',
      desc: 'Convert CSV data or JSON API responses into formatted Markdown tables for README files and documentation.',
    },
    {
      title: 'Data Analysis',
      desc: 'Turn Markdown tables from docs or wikis into JSON or CSV for processing in scripts or spreadsheets.',
    },
    {
      title: 'API Testing',
      desc: 'Convert between JSON and CSV formats for API request payloads, mock data, and test fixtures.',
    },
    {
      title: 'Database Seeding',
      desc: 'Transform CSV exports or Markdown tables into JSON arrays for database seed files and migrations.',
    },
  ];

  const faqs = [
    {
      q: 'Is this converter free to use?',
      a: 'Yes, completely free with no signup, no limits, and no data sent to any server. Everything runs in your browser.',
    },
    {
      q: 'Is my data sent to a server?',
      a: 'No. All conversions happen entirely in your browser using JavaScript. Your data never leaves your machine.',
    },
    {
      q: 'What formats does it support?',
      a: 'Markdown tables (pipe-delimited), JSON (array of objects, array of arrays, or nested), and CSV with configurable delimiters (comma, tab, semicolon, pipe).',
    },
    {
      q: 'Does it handle special characters?',
      a: 'Yes! The converter properly handles quoted CSV fields, escaped commas, escaped double-quotes, pipes in Markdown cells, and Unicode characters.',
    },
    {
      q: 'Can I convert in any direction?',
      a: 'Yes, the converter is fully bidirectional. Paste any of the three formats and get the other two as outputs instantly.',
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
            Markdown Table to JSON/CSV Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert between Markdown tables, JSON, and CSV instantly in your browser.
            Auto-detects input format  no server, no signup, completely free.
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

        {/* Why Convert */}
        <div className="space-y-8">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Why Convert Between These Formats
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

        {/* Common Use Cases */}
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Common Use Cases
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['README Tables', 'API Docs', 'Spreadsheet Data', 'Database Seeds'].map((item) => (
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
        <RelatedTools currentToolId="markdown-table-converter" />
      </div>
    </article>
  );
}
