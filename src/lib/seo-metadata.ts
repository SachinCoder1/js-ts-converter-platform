import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from './constants';
import { TOOL_SEO_DATA } from './seo-data';

export function generateToolMetadata(toolId: string): Metadata {
  const seoData = TOOL_SEO_DATA[toolId];
  if (!seoData) {
    return { title: SITE_NAME };
  }

  const canonicalUrl =
    seoData.path === '/'
      ? SITE_URL
      : `${SITE_URL}${seoData.path}`;

  return {
    title: seoData.metaTitle,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      type: 'website',
      title: seoData.metaTitle,
      description: seoData.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: `/api/og?tool=${toolId}`,
          width: 1200,
          height: 630,
          alt: `${seoData.source} to ${seoData.target} Converter — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.metaTitle,
      description: seoData.description,
      images: [`/api/og?tool=${toolId}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
