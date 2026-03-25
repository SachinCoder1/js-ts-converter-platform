import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for DevShift — how we handle your data. No accounts, no tracking, no ads.',
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
const strongStyle = { color: 'var(--text-primary)' } as const;

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy' },
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
            Privacy Policy
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

          {/* The Short Version */}
          <section
            style={{
              marginBottom: '2.5rem',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                color: 'var(--primary)',
              }}
            >
              The Short Version
            </h2>
            <ul style={ulStyle}>
              <li>We don&apos;t require accounts or collect personal information.</li>
              <li>
                <strong style={strongStyle}>Client-side tools:</strong> your code never leaves your
                browser.
              </li>
              <li>
                <strong style={strongStyle}>AI-powered tools:</strong> your code is sent to our
                server and forwarded to AI providers for processing, then discarded.
              </li>
              <li>We don&apos;t sell data. We don&apos;t run ads. We don&apos;t track you across the web.</li>
            </ul>
          </section>

          {/* What We Collect */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>What We Collect</h2>
            <p style={{ ...pStyle, marginBottom: '0.75rem' }}>
              <strong style={strongStyle}>Server logs:</strong> IP address, user agent, timestamp,
              and request URL — standard server logs for security and abuse prevention. These are
              retained for a maximum of 30 days.
            </p>
            <p style={{ ...pStyle, marginBottom: '0.75rem' }}>
              <strong style={strongStyle}>Rate limiting data:</strong> IP-based counters stored in
              memory, reset periodically. This data is not persisted to any database.
            </p>
            <p style={{ ...pStyle, marginBottom: '0.75rem' }}>
              <strong style={strongStyle}>Conversion cache:</strong> We cache conversion results
              (input hash → output) to improve performance. The cache stores a hash of your code
              (not the code itself) and the converted output. Cache entries expire after 7 days.
            </p>
            <p style={pStyle}>
              <strong style={strongStyle}>Analytics:</strong> We use Vercel Analytics and/or
              Cloudflare Analytics for aggregate traffic data (page views, countries, devices). These
              are privacy-friendly — no cookies, no personal data, no individual tracking.
            </p>
          </section>

          {/* What We Don't Collect */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>What We Don&apos;t Collect</h2>
            <ul style={ulStyle}>
              <li>No accounts, no emails, no passwords</li>
              <li>
                No cookies for tracking — we may use a cookie for theme preference (dark/light mode),
                which contains no personal data
              </li>
              <li>
                No third-party tracking scripts — no Google Analytics, no Facebook Pixel, no ad
                trackers
              </li>
              <li>We do not store your source code after conversion is complete</li>
            </ul>
          </section>

          {/* Third-Party AI Services */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>Third-Party AI Services</h2>
            <p style={{ ...pStyle, marginBottom: '0.75rem' }}>
              When you use AI-powered tools, your code is sent to one or more of the following
              third-party AI services for processing:
            </p>
            <ul style={{ ...ulStyle, marginBottom: '1rem' }}>
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  Google Gemini API
                </a>
              </li>
              <li>
                <a
                  href="https://www.deepseek.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  DeepSeek API
                </a>
              </li>
              <li>
                <a
                  href="https://openrouter.ai/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  OpenRouter API
                </a>
              </li>
            </ul>
            <p style={{ ...pStyle, marginBottom: '0.75rem' }}>
              We send only the code you submit — no personal information, IP addresses, or metadata
              is forwarded to AI providers. Each provider has their own data handling policies; please
              refer to the links above.
            </p>
            <p style={pStyle}>
              We recommend not submitting proprietary, confidential, or sensitive code to AI-powered
              tools if you have concerns about third-party processing.
            </p>
          </section>

          {/* Data Storage & Security */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>Data Storage & Security</h2>
            <ul style={ulStyle}>
              <li>We don&apos;t operate a database. No user data is stored persistently.</li>
              <li>Conversion cache uses Vercel KV (encrypted at rest).</li>
              <li>All traffic is encrypted via HTTPS.</li>
              <li>
                API keys for AI services are stored as environment variables, never exposed to
                clients.
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>Your Rights</h2>
            <p style={{ ...pStyle, marginBottom: '0.75rem' }}>
              Since we don&apos;t collect personal data or require accounts, there is no data to
              request, modify, or delete.
            </p>
            <p style={pStyle}>
              If you believe we have any data about you and want it removed, please{' '}
              <Link href="/contact" style={linkStyle}>
                contact us
              </Link>
              .
            </p>
          </section>

          {/* Children's Privacy */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>Children&apos;s Privacy</h2>
            <p style={pStyle}>
              DevShift is not directed at children under 13. We do not knowingly collect data from
              children. If you believe a child has submitted data through our Service, please contact
              us so we can address it.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>Changes to This Policy</h2>
            <p style={pStyle}>
              We may update this Privacy Policy from time to time. Any changes will be reflected on
              this page with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          {/* Contact */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>Contact</h2>
            <p style={pStyle}>
              Privacy questions? Reach out to us at{' '}
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
