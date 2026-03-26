import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Mail, Github, Twitter, ShieldAlert, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the SnipShift team. Report bugs, request features, or ask questions about our free developer tools.',
  robots: { index: true, follow: true },
};

const linkStyle = { color: 'var(--primary)', textDecoration: 'underline' } as const;

export default function ContactPage() {
  return (
    <>
      <Header />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact' },
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
            Get in Touch
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              fontSize: '1.0625rem',
            }}
          >
            Have a question, found a bug, or want to say hi? We&apos;d love to hear from you.
          </p>

          {/* Contact Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ marginBottom: '3rem' }}
          >
            {/* Email Card */}
            <a
              href="mailto:hello@snipshift.dev"
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
              }}
              className="contact-card"
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  background: 'var(--hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Mail size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}
              >
                Email
              </h2>
              <p
                style={{
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '0.5rem',
                }}
              >
                hello@snipshift.dev
              </p>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              >
                For general inquiries, feedback, and bug reports.
              </p>
            </a>

            {/* GitHub Card */}
            <a
              href="https://github.com/AmanVarshney01/snipshift"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
              }}
              className="contact-card"
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  background: 'var(--hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Github size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}
              >
                GitHub
              </h2>
              <p
                style={{
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '0.5rem',
                }}
              >
                snipshift
              </p>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              >
                Open an issue for bug reports or feature requests. Star us if you find SnipShift
                useful.
              </p>
            </a>

            {/* Twitter/X Card */}
            <a
              href="https://x.com/snipshift_dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
              }}
              className="contact-card"
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  background: 'var(--hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Twitter size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}
              >
                Twitter / X
              </h2>
              <p
                style={{
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '0.5rem',
                }}
              >
                @snipshift_dev
              </p>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              >
                Follow us for updates and new tool announcements.
              </p>
            </a>
          </div>

          {/* Additional Sections */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Security Vulnerability */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldAlert size={16} style={{ color: 'var(--warning)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Report a Security Vulnerability
                </h2>
              </div>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                If you&apos;ve found a security issue, please email{' '}
                <a href="mailto:security@snipshift.dev" style={linkStyle}>
                  security@snipshift.dev
                </a>
                . Do not open a public GitHub issue for security vulnerabilities.
              </p>
            </div>

            {/* Request a New Tool */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lightbulb size={16} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Request a New Tool
                </h2>
              </div>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                Want us to build a specific converter? Let us know at{' '}
                <a href="mailto:hello@snipshift.dev" style={linkStyle}>
                  hello@snipshift.dev
                </a>{' '}
                or{' '}
                <a
                  href="https://github.com/AmanVarshney01/snipshift/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  open a GitHub issue
                </a>
                .
              </p>
            </div>
          </div>
        </article>
      </main>

      {/* Hover styles for contact cards */}
      <style>{`
        .contact-card:hover {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 1px var(--glow), 0 4px 12px var(--glow) !important;
        }
      `}</style>

      <Footer />
    </>
  );
}
