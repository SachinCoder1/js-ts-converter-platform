import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

const BLOG_DIR = path.join(process.cwd(), 'blog');
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'blogs');

type BlogCategory =
  | 'typescript' | 'json' | 'css' | 'react' | 'schema'
  | 'devops' | 'security' | 'testing' | 'performance' | 'general';

interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  tags: string[];
  category: BlogCategory;
  tool: string | null;
  author: string;
  publishDate: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: string;
  relatedSlugs: string[];
}

interface RawFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  keyword: string;
  difficulty: string;
  readTime: string;
  tool: string;
}

// Category derivation from tags (first match wins)
const CATEGORY_RULES: [BlogCategory, RegExp][] = [
  ['react', /\b(react|jsx|tsx|nextjs|next-js|next\.js|next-themes)\b/i],
  ['typescript', /\b(typescript|type-safety|migration|ts-ignore|tsconfig|declaration-file)\b/i],
  ['json', /\b(json|yaml|zod|valibot|schema-validation)\b/i],
  ['css', /\b(css|tailwind|scss|sass|styling|flexbox|grid-layout|dark.mode|responsive)\b/i],
  ['schema', /\b(schema|graphql|openapi|sql|database|orm|drizzle|kysely|mongoose|postgresql)\b/i],
  ['testing', /\b(test|vitest|jest|testing-library|tdd|testing)\b/i],
  ['devops', /\b(docker|ci|deploy|git|github|vercel|monorepo|turborepo|nx|pnpm|npm|bun|node|eslint|prettier|biome|editorconfig|husky|lint)\b/i],
  ['security', /\b(auth|security|oauth|stripe|upload)\b/i],
  ['performance', /\b(performance|bundle|optimization|lazy|core-web-vitals|memory-leak|slow|speed)\b/i],
];

function deriveCategory(tags: string[], keyword: string): BlogCategory {
  const combined = [...tags, keyword].join(' ').toLowerCase();
  for (const [category, regex] of CATEGORY_RULES) {
    if (regex.test(combined)) return category;
  }
  return 'general';
}

function parseFrontmatter(content: string): { meta: RawFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('No frontmatter found');
  const meta = yaml.load(match[1]) as RawFrontmatter;
  return { meta, body: match[2].trimStart() };
}

function computeRelatedSlugs(
  currentSlug: string,
  currentTags: string[],
  allPosts: { slug: string; tags: string[]; category: BlogCategory }[]
): string[] {
  const tagSet = new Set(currentTags.map(t => t.toLowerCase()));
  const current = allPosts.find(p => p.slug === currentSlug)!;

  const scored = allPosts
    .filter(p => p.slug !== currentSlug)
    .map(p => {
      let score = 0;
      for (const tag of p.tags) {
        if (tagSet.has(tag.toLowerCase())) score++;
      }
      // Bonus for same category
      if (p.category === current.category) score += 0.5;
      return { slug: p.slug, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map(p => p.slug);
}

// Generate schedule dates
function generateScheduleDates(count: number): string[] {
  const dates: string[] = [];

  // Batch 1: 30 posts spread from Feb 1 to Mar 24, 2026
  const batch1Start = new Date('2026-02-01');
  const batch1End = new Date('2026-03-24');
  const batch1Days = Math.floor((batch1End.getTime() - batch1Start.getTime()) / (1000 * 60 * 60 * 24));
  const batch1Count = Math.min(30, count);

  for (let i = 0; i < batch1Count; i++) {
    const dayOffset = Math.round((i / (batch1Count - 1)) * batch1Days);
    const date = new Date(batch1Start);
    date.setDate(date.getDate() + dayOffset);
    dates.push(date.toISOString().split('T')[0]);
  }

  // Batch 2: remaining posts at 1/day starting Mar 25
  const batch2Start = new Date('2026-03-25');
  for (let i = 0; i < count - batch1Count; i++) {
    const date = new Date(batch2Start);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

function main() {
  // Read all blog files
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} blog files`);

  // Parse all posts
  const parsedPosts: { slug: string; meta: RawFrontmatter; body: string; category: BlogCategory }[] = [];

  for (const file of files) {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    try {
      const { meta, body } = parseFrontmatter(content);
      const category = deriveCategory(meta.tags, meta.keyword);
      parsedPosts.push({ slug, meta, body, category });
    } catch (err) {
      console.error(`Error parsing ${file}:`, err);
    }
  }

  // Sort by slug for consistent ordering
  parsedPosts.sort((a, b) => a.slug.localeCompare(b.slug));

  // Generate schedule dates
  const dates = generateScheduleDates(parsedPosts.length);

  // Build metadata entries (first pass - without relatedSlugs)
  const postSummaries = parsedPosts.map((p, i) => ({
    slug: p.slug,
    tags: p.meta.tags,
    category: p.category,
  }));

  // Build full metadata
  const metadata: BlogPostMeta[] = parsedPosts.map((p, i) => ({
    slug: p.slug,
    title: p.meta.title,
    description: p.meta.description,
    keyword: p.meta.keyword,
    tags: p.meta.tags,
    category: p.category,
    tool: p.meta.tool || null,
    author: p.meta.author || 'SnipShift Team',
    publishDate: dates[i],
    difficulty: (p.meta.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
    readTime: p.meta.readTime || '5 min read',
    relatedSlugs: computeRelatedSlugs(p.slug, p.meta.tags, postSummaries),
  }));

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write metadata.json
  const metadataJson = { blogs: metadata };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'metadata.json'),
    JSON.stringify(metadataJson, null, 2),
    'utf-8'
  );
  console.log(`Wrote metadata.json with ${metadata.length} entries`);

  // Write stripped .md files
  for (const post of parsedPosts) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${post.slug}.md`),
      post.body,
      'utf-8'
    );
  }
  console.log(`Wrote ${parsedPosts.length} stripped .md files to content/blogs/`);

  // Print schedule summary
  const batch1 = metadata.filter(m => m.publishDate <= '2026-03-24');
  const batch2 = metadata.filter(m => m.publishDate >= '2026-03-25');
  console.log(`\nSchedule:`);
  console.log(`  Batch 1 (already published): ${batch1.length} posts (${batch1[0]?.publishDate} to ${batch1[batch1.length - 1]?.publishDate})`);
  console.log(`  Batch 2 (drip from today): ${batch2.length} posts (${batch2[0]?.publishDate} to ${batch2[batch2.length - 1]?.publishDate})`);

  // Print category distribution
  const catCounts: Record<string, number> = {};
  for (const m of metadata) {
    catCounts[m.category] = (catCounts[m.category] || 0) + 1;
  }
  console.log(`\nCategories:`);
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();
