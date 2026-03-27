import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { SITE_URL, TOOL_REGISTRY } from '@/lib/constants';
import { getPublishedPosts } from '@/lib/blog';

const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = 'df8fddb22e2e42d78b65029c7e4a5132';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

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

/** Get blog URLs published today (newly visible posts) */
function getTodaysNewUrls(): string[] {
  const today = new Date().toISOString().split('T')[0];
  return getPublishedPosts()
    .filter(post => post.publishDate === today)
    .map(post => `${SITE_URL}/blog/${post.slug}`);
}

/** Get ALL site URLs — tools, blogs, static pages */
function getAllSiteUrls(): string[] {
  const urls: string[] = [];

  // Homepage
  urls.push(SITE_URL);

  // Tool pages
  for (const tool of Object.values(TOOL_REGISTRY)) {
    urls.push(`${SITE_URL}${tool.path}`);
  }

  // Blog listing
  urls.push(`${SITE_URL}/blog`);

  // All published blog posts
  for (const post of getPublishedPosts()) {
    urls.push(`${SITE_URL}/blog/${post.slug}`);
  }

  // Static pages
  urls.push(`${SITE_URL}/contact`);
  urls.push(`${SITE_URL}/terms`);
  urls.push(`${SITE_URL}/privacy`);

  return urls;
}

/** Submit URLs via IndexNow (covers Bing, Yandex, Seznam, Naver) */
async function submitIndexNow(urls: string[]): Promise<{ success: boolean; httpStatus?: number; urlCount: number; error?: string }> {
  if (urls.length === 0) {
    return { success: true, urlCount: 0 };
  }

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'snipshift.dev',
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    return { success: res.status >= 200 && res.status < 400, httpStatus: res.status, urlCount: urls.length };
  } catch (err) {
    return { success: false, urlCount: urls.length, error: String(err) };
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isFull = searchParams.get('full') === 'true';

  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');

  // full=true → submit ALL site URLs; default → only today's new blog posts + /blog
  const urlsToSubmit = isFull
    ? getAllSiteUrls()
    : (() => {
        const todayUrls = getTodaysNewUrls();
        return todayUrls.length > 0 ? [`${SITE_URL}/blog`, ...todayUrls] : [];
      })();

  const [pings, indexNow] = await Promise.all([
    pingSearchEngines(),
    submitIndexNow(urlsToSubmit),
  ]);

  return NextResponse.json({
    revalidated: true,
    date: new Date().toISOString(),
    mode: isFull ? 'full' : 'incremental',
    pings,
    indexNow,
    submittedUrls: urlsToSubmit,
  });
}
