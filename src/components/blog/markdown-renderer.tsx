'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { highlight } from 'sugar-high';
import { Copy, Check, Lightbulb, AlertTriangle, Info } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onHeadings?: (headings: { id: string; text: string; level: number }[]) => void;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2.5 right-2.5 rounded-md p-1.5 transition-all duration-150 opacity-0 group-hover:opacity-100 hover:bg-[var(--surface)]"
      style={{
        color: copied ? 'var(--success)' : 'var(--text-disabled)',
      }}
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function CodeBlock({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const code = String(children).replace(/\n$/, '');
  const language = className?.replace('language-', '') || '';

  // Inline code (no language class, no newlines)
  if (!className && !code.includes('\n')) {
    return (
      <code
        className="rounded px-1.5 py-0.5 text-[0.9em] font-mono"
        style={{
          background: 'var(--elevated)',
          color: 'color-mix(in srgb, var(--primary) 80%, var(--text-primary))',
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  const highlighted = highlight(code)
    // Remove newlines between sh__line block spans  display:block handles line breaks
    .replace(/\n/g, '');

  return (
    <div
      className="group relative my-6 rounded-lg overflow-hidden"
      style={{
        background: 'hsl(220 13% 10%)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Language label + copy button row */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        {language ? (
          <span
            className="text-[10px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5"
            style={{
              color: 'var(--text-disabled)',
              background: 'color-mix(in srgb, var(--text-disabled) 8%, transparent)',
            }}
          >
            {language}
          </span>
        ) : (
          <span />
        )}
        <CopyButton code={code} />
      </div>

      <pre
        className="overflow-x-auto px-5 py-4 text-[14px] leading-[1.4]"
        style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }}
      >
        <code
          dangerouslySetInnerHTML={{ __html: highlighted }}
          style={{
            '--sh-class': '#e5c07b',
            '--sh-identifier': '#e06c75',
            '--sh-keyword': '#c678dd',
            '--sh-string': '#98c379',
            '--sh-sign': '#abb2bf',
            '--sh-property': '#61afef',
            '--sh-entity': '#56b6c2',
            '--sh-jsxliterals': '#56b6c2',
            '--sh-comment': '#5c6370',
          } as React.CSSProperties}
        />
      </pre>
    </div>
  );
}

function Blockquote({ children }: { children?: React.ReactNode }) {
  let text = '';
  try {
    const childArray = React.Children.toArray(children);
    const pElement = childArray.find(
      (c): c is React.ReactElement<{ children?: React.ReactNode }> =>
        React.isValidElement(c) && c.type === 'p'
    );
    if (pElement) {
      const pChildren = React.Children.toArray(pElement.props.children);
      text = String(pChildren[0] || '');
    }
  } catch {
    // ignore
  }

  let borderColor = 'var(--border)';
  let bgColor = 'transparent';
  let Icon: React.ComponentType<{ size: number; className?: string }> | null = null;

  if (text.startsWith('Tip:') || text.startsWith('**Tip:**')) {
    borderColor = 'var(--success)';
    bgColor = 'color-mix(in srgb, var(--success) 5%, transparent)';
    Icon = Lightbulb;
  } else if (text.startsWith('Warning:') || text.startsWith('**Warning:**')) {
    borderColor = 'var(--warning)';
    bgColor = 'color-mix(in srgb, var(--warning) 5%, transparent)';
    Icon = AlertTriangle;
  } else if (text.startsWith('Note:') || text.startsWith('**Note:**')) {
    borderColor = 'var(--primary)';
    bgColor = 'color-mix(in srgb, var(--primary) 5%, transparent)';
    Icon = Info;
  }

  return (
    <blockquote
      className="my-6 rounded-r-lg pl-4 pr-4 py-3 text-sm"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        background: bgColor,
        color: 'var(--text-secondary)',
      }}
    >
      {Icon && (
        <div className="flex items-start gap-2">
          <span className="shrink-0 mt-1" style={{ color: borderColor }}>
            <Icon size={16} />
          </span>
          <div>{children}</div>
        </div>
      )}
      {!Icon && children}
    </blockquote>
  );
}

function HeadingWithAnchor({
  level,
  id,
  className,
  style,
  children,
}: {
  level: number;
  id?: string;
  className: string;
  style: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';

  return (
    <Tag id={id} className={`group/heading ${className}`} style={style}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover/heading:opacity-50 hover:!opacity-100 transition-opacity duration-150 text-[0.6em]"
          style={{ color: 'var(--text-disabled)' }}
          aria-label="Link to section"
          onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          #
        </a>
      )}
    </Tag>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="blog-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          h1: ({ children, id }) => (
            <HeadingWithAnchor
              level={1}
              id={id}
              className="text-2xl sm:text-3xl font-bold mt-10 mb-4 tracking-tight scroll-mt-20"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              {children}
            </HeadingWithAnchor>
          ),
          h2: ({ children, id }) => (
            <HeadingWithAnchor
              level={2}
              id={id}
              className="text-[1.75rem] font-semibold mt-12 mb-4 tracking-tight scroll-mt-20"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              {children}
            </HeadingWithAnchor>
          ),
          h3: ({ children, id }) => (
            <HeadingWithAnchor
              level={3}
              id={id}
              className="text-[1.35rem] font-semibold mt-10 mb-3 scroll-mt-20"
              style={{ color: 'var(--text-primary)' }}
            >
              {children}
            </HeadingWithAnchor>
          ),
          h4: ({ children, id }) => (
            <HeadingWithAnchor
              level={4}
              id={id}
              className="text-base font-semibold mt-8 mb-2 scroll-mt-20"
              style={{ color: 'var(--text-primary)' }}
            >
              {children}
            </HeadingWithAnchor>
          ),
          p: ({ children }) => (
            <p
              className="my-5 text-[17px] leading-[1.8]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {children}
            </p>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                className="font-medium transition-colors hover:underline underline-offset-2 decoration-1"
                style={{ color: 'var(--primary)' }}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {children}
                {isExternal && <span className="text-[0.75em] ml-0.5">↗</span>}
              </a>
            );
          },
          ul: ({ children }) => (
            <ul
              className="my-5 ml-5 space-y-2 text-[17px] leading-[1.8]"
              style={{
                color: 'var(--text-secondary)',
                listStyleType: 'disc',
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className="my-5 ml-5 list-decimal space-y-2 text-[17px] leading-[1.8]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">{children}</li>
          ),
          code: CodeBlock,
          blockquote: Blockquote,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ background: 'var(--surface)' }}>{children}</thead>
          ),
          th: ({ children }) => (
            <th
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border)' }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="px-4 py-3 text-sm"
              style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
            >
              {children}
            </td>
          ),
          tr: ({ children, ...props }) => (
            <tr
              style={{
                background: 'transparent',
              }}
              className="even:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]"
            >
              {children}
            </tr>
          ),
          hr: () => (
            <hr
              className="my-10 mx-auto"
              style={{
                border: 'none',
                height: '1px',
                width: '60%',
                background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 20%, var(--border)), transparent)',
              }}
            />
          ),
          strong: ({ children }) => (
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>
          ),
          img: ({ src, alt }) => (
            <figure className="my-6">
              <img
                src={src}
                alt={alt || ''}
                className="rounded-lg w-full"
                style={{ border: '1px solid var(--border)' }}
                loading="lazy"
              />
              {alt && (
                <figcaption
                  className="mt-2 text-center text-xs italic"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
