import { RelatedTools } from '@/components/related-tools';

export function CssToTailwindSeoContent() {
  const steps = [
    {
      num: '01',
      title: 'Paste Your CSS',
      desc: 'Paste vanilla CSS rules  selectors, media queries, pseudo-classes. The editor highlights your CSS in real-time.',
    },
    {
      num: '02',
      title: 'Click Convert',
      desc: 'Our AI maps your CSS properties to Tailwind utility classes, handles responsive breakpoints, and converts hover/focus states.',
    },
    {
      num: '03',
      title: 'Copy & Use',
      desc: 'Copy the Tailwind classes directly into your HTML/JSX, or use the @apply format in your CSS files.',
    },
  ];

  const benefits = [
    { title: 'Faster Development', desc: 'Tailwind utility classes let you style directly in your markup  no more switching between HTML and CSS files.' },
    { title: 'Consistent Design', desc: 'Tailwind\'s design system enforces consistent spacing, colors, and typography across your entire project.' },
    { title: 'Smaller CSS Bundle', desc: 'Tailwind purges unused classes at build time, producing significantly smaller CSS bundles than traditional stylesheets.' },
    { title: 'Responsive Built-In', desc: 'Media queries become simple prefixes (sm:, md:, lg:)  responsive design is effortless with Tailwind.' },
  ];

  const faqs = [
    {
      q: 'Which Tailwind versions are supported?',
      a: 'Both Tailwind v3 and v4 are supported. Select your version in the options bar to get the correct class names and conventions for your project.',
    },
    {
      q: 'What happens with CSS values that don\'t match Tailwind defaults?',
      a: 'By default, arbitrary values are used (e.g., p-[13px], text-[#ff5733]). You can switch to "Closest match" mode to use the nearest standard Tailwind utility instead.',
    },
    {
      q: 'Does it handle media queries and pseudo-classes?',
      a: 'Yes. Media queries like @media (min-width: 768px) are converted to responsive prefixes (md:), and pseudo-classes like :hover and :focus become Tailwind modifiers (hover:, focus:).',
    },
    {
      q: 'What output formats are available?',
      a: 'Three formats: "Classes only" gives you raw utility class strings per selector, "HTML structure" wraps them in elements, and "@apply syntax" gives you CSS with Tailwind @apply directives.',
    },
    {
      q: 'How does the AI improve conversion quality?',
      a: 'The AI understands CSS context better than simple property mapping. It handles complex properties (gradients, transforms, animations), suggests semantic Tailwind classes, and produces cleaner, non-redundant class combinations.',
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
            CSS to Tailwind Converter
          </h1>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Convert vanilla CSS to Tailwind utility classes instantly.
            Handles responsive breakpoints, pseudo-classes, and complex properties with AI-powered accuracy.
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
            Why Convert to Tailwind
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
        <RelatedTools currentToolId="css-to-tailwind" />
      </div>
    </article>
  );
}
