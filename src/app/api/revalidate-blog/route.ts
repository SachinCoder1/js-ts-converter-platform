import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/constants';
import { getPublishedPosts } from '@/lib/blog';

const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = 'df8fddb22e2e42d78b65029c7e4a5132';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

async function pingYandex() {
  try {
    const res = await fetch(
      `https://blogs.yandex.ru/pings/?status=success&url=${encodeURIComponent(SITEMAP_URL)}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    return { engine: 'Yandex' as const, success: res.status < 400, httpStatus: res.status };
  } catch (err) {
    return { engine: 'Yandex' as const, success: false, error: String(err) };
  }
}

/** Get blog URLs published today (newly visible posts) */
function getTodaysNewUrls(): string[] {
  const today = new Date().toISOString().split('T')[0];
  return getPublishedPosts()
    .filter(post => post.publishDate === today)
    .map(post => `${SITE_URL}/blog/${post.slug}`);
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

  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');

  const todayUrls = getTodaysNewUrls();
  const urlsToSubmit = todayUrls.length > 0 ? [`${SITE_URL}/blog`, ...todayUrls] : [];

  const [yandex, indexNow] = await Promise.all([
    pingYandex(),
    submitIndexNow(urlsToSubmit),
  ]);

  return NextResponse.json({
    revalidated: true,
    date: new Date().toISOString(),
    yandex,
    indexNow,
    submittedUrls: urlsToSubmit,
  });
}
