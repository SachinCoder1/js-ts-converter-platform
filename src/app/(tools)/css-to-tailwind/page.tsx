import { CssToTailwindConverter } from '@/components/css-to-tailwind/converter';
import { CssToTailwindSeoContent } from '@/components/css-to-tailwind/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('css-to-tailwind');

export default function CssToTailwindPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('css-to-tailwind')!} />
      <JsonLd data={buildHowToSchema('css-to-tailwind')!} />
      <JsonLd data={buildFAQPageSchema('css-to-tailwind')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'CSS to Tailwind Converter' },
        ]}
      />
        <CssToTailwindConverter />
      <CssToTailwindSeoContent />
    </>
  );
}
