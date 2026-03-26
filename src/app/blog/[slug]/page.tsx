import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { BlogPost } from '@/components/blog/blog-post';
import {
  getPostBySlug,
  getPostContent,
  getRelatedPosts,
  getPrevNextPosts,
  getPublishedPosts,
} from '@/lib/blog';
import { SITE_URL } from '@/lib/constants';

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | SnipShift Blog`,
    description: post.description,
    keywords: [post.keyword, ...post.tags],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author],
      tags: post.tags,
      url: `${SITE_URL}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const content = getPostContent(slug);
  const relatedPosts = getRelatedPosts(post);
  const { prev, next } = getPrevNextPosts(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SnipShift',
      url: SITE_URL,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(', '),
    wordCount: content.split(/\s+/).length,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--background)' }}
    >
      <Header />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BlogPost
          post={post}
          content={content}
          relatedPosts={relatedPosts}
          prevPost={prev}
          nextPost={next}
        />
      </main>
      <LandingFooter />
    </div>
  );
}
