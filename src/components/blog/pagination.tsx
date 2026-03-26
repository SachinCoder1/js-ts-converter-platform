'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  showingCount: number;
}

export function Pagination({ currentPage, totalPages, totalPosts, showingCount }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;
  if (showingCount >= totalPosts) return null;

  function loadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage + 1));
    router.push(`/blog?${params.toString()}`, { scroll: false });
  }

  const remaining = totalPosts - showingCount;

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
        Showing {showingCount} of {totalPosts} articles
      </p>
      <button
        onClick={loadMore}
        className="rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[var(--surface)]"
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        Load {Math.min(remaining, 12)} more articles
      </button>
    </div>
  );
}
