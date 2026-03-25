import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Hero } from '@/components/landing/hero';
import { ToolGrid } from '@/components/landing/tool-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { WhyDevShift } from '@/components/landing/why-devshift';
import { CodeExamples } from '@/components/landing/code-examples';
import { HomepageSeoContent } from '@/components/landing/homepage-seo-content';
import { LandingFooter } from '@/components/landing/landing-footer';
import { JsonLd } from '@/components/json-ld';
import { buildWebSiteSchema, buildItemListSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = {
  title:
    'DevShift — Free Online Developer Converter Tools | JS to TS, JSON to Zod, CSS to Tailwind & More',
  description:
    'Free developer tools to convert code instantly. JS/JSX to TypeScript, JSON to Zod schemas, CSS to Tailwind, HTML to JSX, and 13+ more converters. No signup required.',
  keywords: [
    'developer tools',
    'code converter',
    'javascript to typescript',
    'json to typescript',
    'css to tailwind',
    'free developer tools',
    'ai code converter',
    'online converter',
    'json to zod',
    'html to jsx',
  ],
  openGraph: {
    title: 'DevShift — Free Online Developer Converter Tools',
    description:
      'Convert JavaScript to TypeScript instantly with AI-powered type inference. Plus 13+ more free developer converter tools. No signup required.',
    url: 'https://devshift.dev',
    siteName: 'DevShift',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'DevShift — Free Online Developer Converter Tools',
      },
    ],
  },
  twitter: {
    title: 'DevShift — Free Online Developer Converter Tools',
    description:
      'Convert JavaScript to TypeScript instantly with AI-powered type inference. Plus 13+ more free developer converter tools. No signup required.',
    images: ['/api/og'],
  },
  alternates: {
    canonical: 'https://devshift.dev',
  },
};

export default function Home() {
  return (
    <>
      <JsonLd data={buildWebSiteSchema()} />
      <JsonLd data={buildItemListSchema()} />
      <Header />
      <main>
        <Hero />
        <ToolGrid />
        <HowItWorks />
        <WhyDevShift />
        <CodeExamples />
        <HomepageSeoContent />
      </main>
      <LandingFooter />
    </>
  );
}
