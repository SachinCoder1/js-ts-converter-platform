import { ScssConverter } from '@/components/scss/scss-converter';
import { ScssSeoContent } from '@/components/scss/scss-seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('scss-to-css');

export default function ScssToCSS() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('scss-to-css')!} />
      <JsonLd data={buildHowToSchema('scss-to-css')!} />
      <JsonLd data={buildFAQPageSchema('scss-to-css')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'SCSS to CSS Compiler' },
        ]}
      />
        <ScssConverter />
      <ScssSeoContent />
    </>
  );
}
