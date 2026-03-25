import { TailwindConverter } from '@/components/tailwind/tailwind-converter';
import { TailwindSeoContent } from '@/components/tailwind/tailwind-seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('tailwind-to-css');

export default function TailwindToCssPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('tailwind-to-css')!} />
      <JsonLd data={buildHowToSchema('tailwind-to-css')!} />
      <JsonLd data={buildFAQPageSchema('tailwind-to-css')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Tailwind to CSS Converter' },
        ]}
      />
        <TailwindConverter />
      <TailwindSeoContent />
    </>
  );
}
