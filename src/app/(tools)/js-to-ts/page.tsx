import { Converter } from '@/components/converter';
import { SeoContent } from '@/components/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('js-to-ts');

export default function JsToTsPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('js-to-ts')!} />
      <JsonLd data={buildHowToSchema('js-to-ts')!} />
      <JsonLd data={buildFAQPageSchema('js-to-ts')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'JS to TypeScript Converter' },
        ]}
      />
      <Converter />
      <SeoContent />
    </>
  );
}
