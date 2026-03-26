import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import type { BlogCategory, BlogPostMeta } from './types';

// Read metadata.json once and cache in module scope
const metadataPath = path.join(process.cwd(), 'content', 'blogs', 'metadata.json');
const rawData = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const allPosts: BlogPostMeta[] = rawData.blogs;

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getPublishedPosts(): BlogPostMeta[] {
  const today = getToday();
  return allPosts
    .filter(post => post.publishDate <= today)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function getAllPostsMeta(): BlogPostMeta[] {
  return allPosts;
}

export function getPostBySlug(slug: string): BlogPostMeta | null {
  const today = getToday();
  const post = allPosts.find(p => p.slug === slug);
  if (!post || post.publishDate > today) return null;
  return post;
}

export function getRelatedPosts(post: BlogPostMeta): BlogPostMeta[] {
  const today = getToday();
  return post.relatedSlugs
    .map(slug => allPosts.find(p => p.slug === slug))
    .filter((p): p is BlogPostMeta => !!p && p.publishDate <= today);
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getPublishedPosts().filter(post => post.tags.includes(tag));
}

export function getPostsByCategory(category: BlogCategory): BlogPostMeta[] {
  return getPublishedPosts().filter(post => post.category === category);
}

export function getPostContent(slug: string): string {
  const filePath = path.join(process.cwd(), 'content', 'blogs', `${slug}.md`);
  return fs.readFileSync(filePath, 'utf-8');
}

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  typescript: 'TypeScript',
  json: 'JSON',
  css: 'CSS',
  react: 'React',
  schema: 'Schema',
  devops: 'DevOps',
  security: 'Security',
  testing: 'Testing',
  performance: 'Performance',
  general: 'General',
};

export function getAllCategories(): { id: BlogCategory; label: string; count: number }[] {
  const published = getPublishedPosts();
  const counts: Partial<Record<BlogCategory, number>> = {};
  for (const post of published) {
    counts[post.category] = (counts[post.category] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([id, count]) => ({
      id: id as BlogCategory,
      label: CATEGORY_LABELS[id as BlogCategory],
      count: count!,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getPrevNextPosts(slug: string): { prev: BlogPostMeta | null; next: BlogPostMeta | null } {
  const published = getPublishedPosts();
  const index = published.findIndex(p => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index < published.length - 1 ? published[index + 1] : null,
    next: index > 0 ? published[index - 1] : null,
  };
}

export function getFeaturedPost(): BlogPostMeta {
  const published = getPublishedPosts();
  const featured = published.find(p => p.isFeatured);
  return featured || published[0];
}

export function searchPosts(query: string): BlogPostMeta[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getPublishedPosts().filter(post =>
    post.title.toLowerCase().includes(q) ||
    post.description.toLowerCase().includes(q) ||
    post.keyword.toLowerCase().includes(q) ||
    post.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const published = getPublishedPosts();
  const counts: Record<string, number> = {};
  for (const post of published) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
