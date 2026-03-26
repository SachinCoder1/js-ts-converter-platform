import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { BlogListingShell } from '@/components/blog/blog-listing-shell';
import { FeaturedPost } from '@/components/blog/featured-post';
import { CategoryFilter } from '@/components/blog/category-filter';
import { BlogCard } from '@/components/blog/blog-card';
import { Pagination } from '@/components/blog/pagination';
import {
  getPublishedPosts,
  getPostsByCategory,
  getAllCategories,
  getFeaturedPost,
} from '@/lib/blog';
import type { BlogCategory } from '@/lib/types';

const POSTS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'Blog  Developer Guides, Tutorials & Deep Dives | SnipShift',
  description:
    'TypeScript tutorials, React guides, CSS tips, and developer tool deep dives from the SnipShift team. Free, practical, no fluff.',
  alternates: {
    types: {
      'application/rss+xml': '/blog/feed.xml',
    },
  },
};

function BlogGrid({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const category = searchParams.category as BlogCategory | undefined;
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));

  const allPublished = getPublishedPosts();
  const featuredPost = getFeaturedPost();
  const filteredPosts = category
    ? getPostsByCategory(category)
    : allPublished;

  // Exclude featured post from the grid when showing "All" (no filter) on first page
  const gridPosts = !category
    ? filteredPosts.filter(p => p.slug !== featuredPost.slug)
    : filteredPosts;

  const totalPosts = gridPosts.length;
  const posts = gridPosts.slice(0, page * POSTS_PER_PAGE);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const categories = getAllCategories();

  return (
    <>
      <BlogListingShell allPosts={allPublished} postCount={allPublished.length}>
        {/* Featured post  only on first page with no category filter */}
        {!category && page <= 1 && <FeaturedPost post={featuredPost} />}

        <Suspense fallback={null}>
          <CategoryFilter
            categories={categories}
            totalCount={allPublished.length}
          />
        </Suspense>

        <section className="px-6 py-10">
          <div className="mx-auto max-w-6xl">
            {posts.length === 0 ? (
              <p
                className="text-center text-sm py-20"
                style={{ color: 'var(--text-disabled)' }}
              >
                No posts found in this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post, i) => (
                  <BlogCard key={post.slug} post={post} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        <Suspense fallback={null}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalPosts={totalPosts}
            showingCount={posts.length}
          />
        </Suspense>
      </BlogListingShell>
    </>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--background)' }}
    >
      <Header />
      <main className="flex-1">
        <BlogGrid searchParams={params} />
      </main>
      <LandingFooter />
    </div>
  );
}
