import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for DevShift — free online developer tools for code conversion and transformation.',
  robots: { index: false, follow: true },
};

const sectionStyle = { marginBottom: '2.5rem' };
const h2Style = {
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: '0.75rem',
} as const;
const pStyle = { color: 'var(--text-secondary)', lineHeight: 1.7 } as const;
const linkStyle = { color: 'var(--primary)', textDecoration: 'underline' } as const;
const ulStyle = {
  color: 'var(--text-secondary)',
  lineHeight: 1.7,
  paddingLeft: '1.5rem',
  listStyleType: 'disc',
  marginTop: '0.5rem',
} as const;

export default function TermsPage() {
  return (
    <>
      <Header />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Terms of Service' },
        ]}
      />
      <main
        className="flex-1 mx-auto w-full max-w-3xl px-6 py-16"
        style={{ color: 'var(--text-primary)' }}
      >
        <article>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Terms of Service
          </h1>
          <p
            style={{
              color: 'var(--text-tertiary)',
              marginBottom: '2.5rem',
              fontSize: '0.875rem',
            }}
          >
            Last updated: March 20, 2026
          </p>

          {/* 1. Acceptance of Terms */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>1. Acceptance of Terms</h2>
            <p style={pStyle}>
              By accessing and using DevShift (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use the
              Service.
            </p>
          </section>

          {/* 2. What DevShift Is */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>2. What DevShift Is</h2>
            <p style={pStyle}>
              DevShift is a collection of free online developer tools for code conversion and
              transformation. The tools convert between various code formats including JavaScript,
              TypeScript, JSON, YAML, CSS, HTML, GraphQL, SQL, and more. The Service is provided
              &quot;as-is&quot; with no warranties of any kind, express or implied.
            </p>
          </section>

          {/* 3. How It Works */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>3. How It Works</h2>
            <p style={{ ...pStyle, marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Client-side tools</strong> — These
              tools run entirely in your browser. Your code never leaves your device. This includes:
              JS Object to JSON, HTML to JSX, JSON to YAML, YAML to JSON, CSS to JSON, SCSS to CSS,
              and Tailwind to CSS.
            </p>
            <p style={pStyle}>
              <strong style={{ color: 'var(--text-primary)' }}>AI-powered tools</strong> — These
              tools send your code to our server, which forwards it to third-party AI services
              (Google Gemini API, DeepSeek API, OpenRouter API) for processing. Your code is not
              stored by us after the conversion is complete. We cannot guarantee how third-party AI
              providers handle data — refer to their respective privacy policies. AI-powered tools
              include: JS to TypeScript, JSON to TypeScript, JSON to Zod, CSS to Tailwind, GraphQL
              to TypeScript, PropTypes to TypeScript, SQL to TypeScript, and OpenAPI to TypeScript.
            </p>
          </section>

          {/* 4. Acceptable Use */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Acceptable Use</h2>
            <p style={pStyle}>You agree not to use DevShift to:</p>
            <ul style={ulStyle}>
              <li>Process code you don&apos;t have the right to process</li>
              <li>Attempt to attack, overload, or exploit the Service</li>
              <li>Circumvent rate limits or abuse the Service</li>
              <li>Use the output to train AI models without authorization</li>
              <li>Send malicious payloads or attempt prompt injection attacks</li>
              <li>
                Use automated tools, bots, or scrapers to access the Service in an abusive manner
              </li>
            </ul>
          </section>

          {/* 5. Intellectual Property */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Intellectual Property</h2>
            <p style={{ ...pStyle, marginBottom: '1rem' }}>
              Your code remains yours. We claim no rights over your input or output. You retain full
              ownership of any code you submit for conversion and any converted output you receive.
            </p>
            <p style={pStyle}>
              DevShift&apos;s interface, design, branding, and underlying technology are the
              intellectual property of Annotara (Apexlayer Technologies Pvt Ltd). You may not copy,
              reproduce, or redistribute the Service&apos;s design or codebase without written
              permission.
            </p>
          </section>

          {/* 6. Limitations of Liability */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Limitations of Liability</h2>
            <p style={pStyle}>
              The Service is free and provided &quot;as-is.&quot; To the fullest extent permitted by
              law, DevShift and its operators are not liable for: incorrect or incomplete
              conversions, data loss, service downtime, or any damages arising from the use or
              inability to use the Service. AI-generated output may contain errors — always review
              converted code before using it in production.
            </p>
          </section>

          {/* 7. Rate Limits */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Rate Limits</h2>
            <p style={pStyle}>
              We enforce rate limits to keep the Service available and fair for everyone. Abusing
              rate limits or attempting to circumvent them may result in temporary or permanent
              access restrictions.
            </p>
          </section>

          {/* 8. Changes to Terms */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Changes to Terms</h2>
            <p style={pStyle}>
              We may update these Terms of Service at any time. Changes will be reflected on this
              page with an updated &quot;Last updated&quot; date. Your continued use of the Service
              after changes are posted constitutes your acceptance of the revised terms.
            </p>
          </section>

          {/* 9. Governing Law */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>9. Governing Law</h2>
            <p style={pStyle}>
              These Terms of Service are governed by and construed in accordance with the laws of
              India. Any disputes arising from these terms or your use of the Service shall be
              subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          {/* 10. Contact */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>10. Contact</h2>
            <p style={pStyle}>
              Questions about these terms? Reach out to us at{' '}
              <a href="mailto:hello@devshift.dev" style={linkStyle}>
                hello@devshift.dev
              </a>{' '}
              or visit our{' '}
              <Link href="/contact" style={linkStyle}>
                contact page
              </Link>
              .
            </p>
          </section>

          <p
            style={{
              color: 'var(--text-tertiary)',
              lineHeight: 1.7,
              marginTop: '1rem',
              fontSize: '0.875rem',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
            }}
          >
            DevShift is operated by Annotara (Apexlayer Technologies Pvt Ltd), based in India.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
