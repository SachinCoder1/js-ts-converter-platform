import { JsonToZodConverter } from '@/components/json-to-zod/converter';
import { JsonToZodSeoContent } from '@/components/json-to-zod/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('json-to-zod');

export default function JsonToZodPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('json-to-zod')!} />
      <JsonLd data={buildHowToSchema('json-to-zod')!} />
      <JsonLd data={buildFAQPageSchema('json-to-zod')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'JSON to Zod Schema Generator' },
        ]}
      />
        <JsonToZodConverter />
      <JsonToZodSeoContent />
    </>
  );
}
