'use client';

import Link from 'next/link';
import { TOOL_REGISTRY } from '@/lib/constants';
import type { BlogPostMeta } from '@/lib/types';
import { MarkdownRenderer } from './markdown-renderer';
import { TableOfContents } from './table-of-contents';
import { BlogCard } from './blog-card';
import { ReadingProgress } from './reading-progress';
import { ShareButtons } from './share-buttons';
import { ToolCTA } from './tool-cta';
import { CATEGORY_LABELS, DIFFICULTY_COLORS, formatDateLong } from './constants';

function getToolName(toolPath: string): string | null {
  const tool = Object.values(TOOL_REGISTRY).find(t => t.path === toolPath);
  return tool?.name || null;
}

function splitContentAt60Percent(content: string): [string, string] | null {
  const target = Math.floor(content.length * 0.6);
  // Find nearest paragraph boundary (double newline) near the 60% mark
  let splitIndex = content.lastIndexOf('\n\n', target);
  if (splitIndex === -1 || splitIndex < content.length * 0.3) {
    splitIndex = content.indexOf('\n\n', target);
  }
  if (splitIndex === -1 || splitIndex > content.length * 0.85) return null;
  return [content.slice(0, splitIndex), content.slice(splitIndex)];
}

interface BlogPostProps {
  post: BlogPostMeta;
  content: string;
  relatedPosts: BlogPostMeta[];
  prevPost: BlogPostMeta | null;
  nextPost: BlogPostMeta | null;
}

export function BlogPost({ post, content, relatedPosts, prevPost, nextPost }: BlogPostProps) {
  const toolName = post.tool ? getToolName(post.tool) : null;
  const contentSplit = post.tool && toolName ? splitContentAt60Percent(content) : null;

  return (
    <article className="px-6 py-8">
      <ReadingProgress />

      <div className="mx-auto max-w-6xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-10 transition-colors hover:text-[var(--primary)]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Post Header */}
        <header className="mb-12 max-w-3xl">
          {/* Meta row */}
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
              }}
            >
              {CATEGORY_LABELS[post.category]}
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                color: DIFFICULTY_COLORS[post.difficulty],
                border: `1px solid color-mix(in srgb, ${DIFFICULTY_COLORS[post.difficulty]} 25%, transparent)`,
              }}
            >
              {post.difficulty}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
              {post.readTime}
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold tracking-tight mb-4"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            {post.title}
          </h1>

          <p
            className="text-lg leading-relaxed mb-6 max-w-2xl"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {post.description}
          </p>

          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-disabled)' }}>
            {/* Author avatar placeholder */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: 'color-mix(in srgb, var(--primary) 15%, var(--surface))',
                color: 'var(--primary)',
              }}
            >
              S
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>{post.author}</span>
            <span>·</span>
            <time dateTime={post.publishDate}>{formatDateLong(post.publishDate)}</time>
          </div>

          {/* Gradient separator */}
          <div
            className="mt-8 h-px"
            style={{
              background: 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 20%, transparent), transparent)',
            }}
          />
        </header>

        {/* Content + TOC layout */}
        <div className="flex gap-12">
          {/* Main content */}
          <div className="min-w-0 flex-1 max-w-[720px]">
            {contentSplit ? (
              <>
                <MarkdownRenderer content={contentSplit[0]} />
                {post.tool && toolName && <ToolCTA toolPath={post.tool} toolName={toolName} />}
                <MarkdownRenderer content={contentSplit[1]} />
              </>
            ) : (
              <MarkdownRenderer content={content} />
            )}

            {/* Bottom Tool CTA */}
            {post.tool && toolName && (
              <div className="mt-10">
                <ToolCTA toolPath={post.tool} toolName={toolName} />
              </div>
            )}

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?category=${post.category}`}
                  className="text-[11px] rounded-full px-3 py-1 transition-colors hover:text-[var(--primary)] hover:border-[var(--primary)]"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-disabled)',
                  }}
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Share */}
            <ShareButtons title={post.title} />

            {/* Prev/Next navigation */}
            <nav
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group relative rounded-xl p-5 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-disabled)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                    </svg>
                    Previous Post
                  </span>
                  <p
                    className="text-sm font-medium line-clamp-2 group-hover:text-[var(--primary)] transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {prevPost.title}
                  </p>
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--primary) 25%, transparent)' }}
                  />
                </Link>
              ) : <div />}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group relative rounded-xl p-5 text-right transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-disabled)' }}>
                    Next Post
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                  <p
                    className="text-sm font-medium line-clamp-2 group-hover:text-[var(--primary)] transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {nextPost.title}
                  </p>
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--primary) 25%, transparent)' }}
                  />
                </Link>
              )}
            </nav>
          </div>

          {/* TOC sidebar */}
          <TableOfContents content={content} />
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-10" style={{ borderTop: '1px solid var(--border)' }}>
            <h2
              className="text-lg font-semibold mb-6"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedPosts.slice(0, 3).map((rp, i) => (
                <BlogCard key={rp.slug} post={rp} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
