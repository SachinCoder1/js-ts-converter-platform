import { EnvToTypesConverter, EnvToTypesSeoContent } from '@/components/env-to-types';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('env-to-types');

export default function EnvToTypesPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('env-to-types')!} />
      <JsonLd data={buildHowToSchema('env-to-types')!} />
      <JsonLd data={buildFAQPageSchema('env-to-types')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Env to Types Converter' },
        ]}
      />
      <EnvToTypesConverter />
      <EnvToTypesSeoContent />
    </>
  );
}
