'use client';

import { useRef, type ReactNode } from 'react';
import type { BlogPostMeta } from '@/lib/types';
import { BlogHero } from './blog-hero';
import { BlogSearch, type BlogSearchHandle } from './blog-search';

interface BlogListingShellProps {
  allPosts: BlogPostMeta[];
  postCount: number;
  children: ReactNode;
}

export function BlogListingShell({ allPosts, postCount, children }: BlogListingShellProps) {
  const searchRef = useRef<BlogSearchHandle>(null);

  return (
    <>
      <BlogHero postCount={postCount} onSearchClick={() => searchRef.current?.open()} />
      <BlogSearch ref={searchRef} allPosts={allPosts} />
      {children}
    </>
  );
}
