import type { MetadataRoute } from 'next';
import { SITE_URL, TOOL_REGISTRY } from '@/lib/constants';
import { getPublishedPosts } from '@/lib/blog';

const LAST_MODIFIED = new Date('2026-03-20');

export default function sitemap(): MetadataRoute.Sitemap {
  // Tool pages from registry (exclude unimplemented tools)
  const implementedTools = Object.values(TOOL_REGISTRY).filter(
    (tool) => tool.id !== 'sql-to-ts'
  );

  const toolPages: MetadataRoute.Sitemap = implementedTools
    .map((tool) => ({
      url: `${SITE_URL}${tool.path}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Blog posts
  const publishedPosts = getPublishedPosts();
  const blogPages: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    // Homepage
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
    },
    // Tool pages
    ...toolPages,
    // Blog listing
    {
      url: `${SITE_URL}/blog`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Blog posts
    ...blogPages,
    // Legal pages
    {
      url: `${SITE_URL}/terms`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
