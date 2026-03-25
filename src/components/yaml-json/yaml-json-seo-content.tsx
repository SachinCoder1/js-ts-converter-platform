import { RelatedTools } from '@/components/related-tools';

export function YamlJsonSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your YAML',
      desc: 'Paste or type your YAML data into the input editor. Supports anchors, aliases, multi-line strings, merge keys, and multi-document YAML.',
    },
    {
      num: '02',
      title: 'Customize Output',
      desc: 'Choose your JSON indentation style, how to handle multiple YAML documents, and whether to sort keys alphabetically.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Your JSON output updates instantly. Copy it to your clipboard or download it as a .json file.',
    },
  ];

  const benefits = [
    {
      title: 'API Integration',
      desc: 'Convert YAML configs to JSON for REST APIs, GraphQL schemas, and other JSON-only interfaces.',
    },
    {
      title: 'Tooling Compatibility',
      desc: 'Many tools, linters, and validators expect JSON input. Convert YAML configs for seamless integration.',
    },
    {
      title: 'Programmatic Access',
      desc: 'JSON is natively supported in every programming language. Convert YAML for easy parsing and manipulation.',
    },
    {
      title: 'Data Interchange',
      desc: 'JSON is the universal data exchange format. Convert YAML to JSON for cross-system compatibility.',
    },
  ];

  const faqs = [
    {
      q: 'Is this converter free to use?',
      a: 'Yes, completely free with no signup, no limits, and no data sent to any server. Everything runs in your browser.',
    },
    {
      q: 'Is my data sent to a server?',
      a: 'No. The conversion happens entirely in your browser using JavaScript. Your YAML data never leaves your machine.',
    },
    {
      q: 'Does it support multi-document YAML?',
      a: 'Yes! YAML files with multiple documents separated by --- are fully supported. You can combine them into a JSON array or view each document separately.',
    },
    {
      q: 'What YAML features are supported?',
      a: 'All standard YAML features are supported: anchors and aliases, merge keys, multi-line strings (literal and folded), complex keys, tags, nested structures, and more.',
    },
    {
      q: 'Why convert YAML to JSON?',
      a: 'JSON is required by many APIs, tools, and programming environments. Converting YAML to JSON makes your configuration data compatible with JSON-only systems while keeping YAML as your source of truth.',
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
            YAML to JSON Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert YAML to JSON instantly in your browser. Supports multi-document YAML,
            anchors, aliases, and all YAML features — no server, no signup, completely free.
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
            Why Convert YAML to JSON
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
            {['REST APIs', 'Package.json', 'Config Files', 'Data Pipelines'].map((item) => (
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
        <RelatedTools currentToolId="yaml-to-json" />
      </div>
    </article>
  );
}
