import { HtmlJsxConverter } from '@/components/html-jsx/html-jsx-converter';
import { HtmlJsxSeoContent } from '@/components/html-jsx/html-jsx-seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('html-to-jsx');

export default function HtmlToJsxPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('html-to-jsx')!} />
      <JsonLd data={buildHowToSchema('html-to-jsx')!} />
      <JsonLd data={buildFAQPageSchema('html-to-jsx')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'HTML to JSX Converter' },
        ]}
      />
        <HtmlJsxConverter />
      <HtmlJsxSeoContent />
    </>
  );
}
