import { PackageToBadgesConverter, PackageToBadgesSeoContent } from '@/components/package-to-badges';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('package-to-badges');

export default function PackageToBadgesPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('package-to-badges')!} />
      <JsonLd data={buildHowToSchema('package-to-badges')!} />
      <JsonLd data={buildFAQPageSchema('package-to-badges')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Package.json to Badges' },
        ]}
      />
      <PackageToBadgesConverter />
      <PackageToBadgesSeoContent />
    </>
  );
}
