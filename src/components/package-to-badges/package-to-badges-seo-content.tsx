import { RelatedTools } from '@/components/related-tools';

export function PackageToBadgesSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your package.json',
      desc: 'Paste your package.json into the input editor. The tool detects frameworks, testing tools, linters, build tools, and more.',
    },
    {
      num: '02',
      title: 'Customize Options',
      desc: 'Choose badge style (flat, square, badge), output format (Markdown, HTML, RST), custom colors, and toggle which badge categories to include.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Your badges update instantly. Copy the generated markdown into your README.md or download it as a file.',
    },
  ];

  const benefits = [
    {
      title: 'Auto-Detect Tech Stack',
      desc: 'Automatically identifies React, Next.js, Vue, Angular, Express, TypeScript, and dozens more from your dependencies.',
    },
    {
      title: 'Shields.io Compatible',
      desc: 'Generates standard shields.io badge URLs that work on GitHub, GitLab, Bitbucket, and any markdown renderer.',
    },
    {
      title: 'Multiple Output Formats',
      desc: 'Get badges in Markdown, HTML, or reStructuredText format for any documentation platform.',
    },
    {
      title: 'Private Package Support',
      desc: 'Works with private packages too  generates static badges for version and license when npm badges are unavailable.',
    },
  ];

  const faqs = [
    {
      q: 'Is this badge generator free to use?',
      a: 'Yes, completely free with no signup, no limits, and no data sent to any server. Everything runs in your browser.',
    },
    {
      q: 'Is my package.json data sent to a server?',
      a: 'No. The badge generation happens entirely in your browser using JavaScript. Your package.json data never leaves your machine.',
    },
    {
      q: 'What frameworks and tools does it detect?',
      a: 'It detects React, Next.js, Vue, Svelte, Angular, Express, Fastify, Nuxt, Gatsby, Tailwind CSS, Jest, Vitest, Mocha, Cypress, Playwright, ESLint, Prettier, Biome, Webpack, Vite, esbuild, Turborepo, Rollup, and TypeScript.',
    },
    {
      q: 'Can I customize the badge appearance?',
      a: 'Yes. Choose from five shields.io styles, set a custom hex color, pick your output format, and toggle individual badge categories on or off.',
    },
    {
      q: 'Does it work with scoped npm packages?',
      a: 'Yes. Scoped packages like @scope/name are properly URL-encoded so all shields.io and npm badges resolve correctly.',
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
            Package.json to README Badges
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Auto-generate shields.io badges from your package.json. Detects your entire tech stack
            and creates ready-to-use badge markdown  no server, no signup, completely free.
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

        {/* Detected Categories */}
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold text-center uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontSize: '11px' }}
          >
            Badge Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['npm Info', 'TypeScript', 'Frameworks', 'Testing', 'Linting', 'Build Tools', 'CI Status', 'Node Engine', 'Bundle Size', 'Downloads'].map((item) => (
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
        <RelatedTools currentToolId="package-to-badges" />
      </div>
    </article>
  );
}
