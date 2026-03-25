import { JsonToTsConverter } from '@/components/json-to-ts-converter';
import { JsonToTsSeoContent } from '@/components/json-to-ts-seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('json-to-ts');

export default function JsonToTypeScriptPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('json-to-ts')!} />
      <JsonLd data={buildHowToSchema('json-to-ts')!} />
      <JsonLd data={buildFAQPageSchema('json-to-ts')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'JSON to TypeScript Converter' },
        ]}
      />
        <JsonToTsConverter />
      <JsonToTsSeoContent />
    </>
  );
}
