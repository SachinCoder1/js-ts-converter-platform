import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/constants';

const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

const PING_ENDPOINTS = [
  { name: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
  { name: 'Bing', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
  { name: 'Yandex', url: `https://blogs.yandex.ru/pings/?status=success&url=${encodeURIComponent(SITEMAP_URL)}` },
];

async function pingSearchEngines() {
  const results = await Promise.allSettled(
    PING_ENDPOINTS.map(async ({ name, url }) => {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      return { name, status: res.status };
    })
  );

  return results.map((result, i) => ({
    engine: PING_ENDPOINTS[i].name,
    success: result.status === 'fulfilled' && result.value.status < 400,
    ...(result.status === 'fulfilled'
      ? { httpStatus: result.value.status }
      : { error: String((result as PromiseRejectedResult).reason) }),
  }));
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');

  const pings = await pingSearchEngines();

  return NextResponse.json({
    revalidated: true,
    date: new Date().toISOString(),
    pings,
  });
}
