import { GraphqlToTsConverter } from '@/components/graphql-to-ts/converter';
import { GraphqlToTsSeoContent } from '@/components/graphql-to-ts/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('graphql-to-ts');

export default function GraphqlToTypescriptPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('graphql-to-ts')!} />
      <JsonLd data={buildHowToSchema('graphql-to-ts')!} />
      <JsonLd data={buildFAQPageSchema('graphql-to-ts')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'GraphQL to TypeScript Generator' },
        ]}
      />
        <GraphqlToTsConverter />
      <GraphqlToTsSeoContent />
    </>
  );
}
