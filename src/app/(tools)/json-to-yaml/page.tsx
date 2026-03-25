import { JsonYamlConverter, JsonYamlSeoContent } from '@/components/json-yaml';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('json-to-yaml');

export default function JsonToYamlPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('json-to-yaml')!} />
      <JsonLd data={buildHowToSchema('json-to-yaml')!} />
      <JsonLd data={buildFAQPageSchema('json-to-yaml')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'JSON to YAML Converter' },
        ]}
      />
      <JsonYamlConverter />
      <JsonYamlSeoContent />
    </>
  );
}
