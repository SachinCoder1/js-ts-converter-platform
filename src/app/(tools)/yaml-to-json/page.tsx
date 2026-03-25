import { YamlJsonConverter, YamlJsonSeoContent } from '@/components/yaml-json';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('yaml-to-json');

export default function YamlToJsonPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('yaml-to-json')!} />
      <JsonLd data={buildHowToSchema('yaml-to-json')!} />
      <JsonLd data={buildFAQPageSchema('yaml-to-json')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'YAML to JSON Converter' },
        ]}
      />
        <YamlJsonConverter />
      <YamlJsonSeoContent />
    </>
  );
}
