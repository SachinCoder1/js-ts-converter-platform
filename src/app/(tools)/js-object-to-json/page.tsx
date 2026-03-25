import { JsToJsonConverter } from '@/components/js-object-to-json/js-to-json-converter';
import { JsToJsonSeoContent } from '@/components/js-object-to-json/js-to-json-seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('js-object-to-json');

export default function JsObjectToJsonPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('js-object-to-json')!} />
      <JsonLd data={buildHowToSchema('js-object-to-json')!} />
      <JsonLd data={buildFAQPageSchema('js-object-to-json')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'JS Object to JSON Converter' },
        ]}
      />
        <JsToJsonConverter />
      <JsToJsonSeoContent />
    </>
  );
}
