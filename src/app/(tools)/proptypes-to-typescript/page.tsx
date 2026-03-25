import { PropTypesToTsConverter } from '@/components/proptypes-to-ts/converter';
import { PropTypesToTsSeoContent } from '@/components/proptypes-to-ts/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('proptypes-to-ts');

export default function PropTypesToTypescriptPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('proptypes-to-ts')!} />
      <JsonLd data={buildHowToSchema('proptypes-to-ts')!} />
      <JsonLd data={buildFAQPageSchema('proptypes-to-ts')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'PropTypes to TypeScript Converter' },
        ]}
      />
        <PropTypesToTsConverter />
      <PropTypesToTsSeoContent />
    </>
  );
}
