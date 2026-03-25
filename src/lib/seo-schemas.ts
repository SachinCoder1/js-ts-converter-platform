import { SITE_URL, SITE_NAME, TOOL_REGISTRY } from './constants';
import { TOOL_SEO_DATA } from './seo-data';

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Free online developer converter tools',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildItemListSchema() {
  const tools = Object.values(TOOL_REGISTRY).filter(
    (tool) => tool.id !== 'sql-to-ts'
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `${SITE_URL}${tool.path}`,
    })),
  };
}

export function buildWebApplicationSchema(toolId: string) {
  const seoData = TOOL_SEO_DATA[toolId];
  if (!seoData) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${seoData.source} to ${seoData.target} Converter`,
    description: seoData.description,
    url: `${SITE_URL}${seoData.path}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function buildHowToSchema(toolId: string) {
  const seoData = TOOL_SEO_DATA[toolId];
  if (!seoData) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to convert ${seoData.source} to ${seoData.target}`,
    step: seoData.howToSteps.map((text) => ({
      '@type': 'HowToStep',
      text,
    })),
  };
}

export function buildFAQPageSchema(toolId: string) {
  const seoData = TOOL_SEO_DATA[toolId];
  if (!seoData) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seoData.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  crumbs: { name: string; url?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  };
}
