import { CssToJsonConverter } from '@/components/css-to-json/converter';
import { CssToJsonSeoContent } from '@/components/css-to-json/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('css-to-json');

export default function CssToJsonPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('css-to-json')!} />
      <JsonLd data={buildHowToSchema('css-to-json')!} />
      <JsonLd data={buildFAQPageSchema('css-to-json')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'CSS to JSON Converter' },
        ]}
      />
        <CssToJsonConverter />
      <CssToJsonSeoContent />
    </>
  );
}
