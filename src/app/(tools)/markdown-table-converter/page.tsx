import { MarkdownTableConverter, MarkdownTableSeoContent } from '@/components/markdown-table';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('markdown-table-converter');

export default function MarkdownTableConverterPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('markdown-table-converter')!} />
      <JsonLd data={buildHowToSchema('markdown-table-converter')!} />
      <JsonLd data={buildFAQPageSchema('markdown-table-converter')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Markdown Table Converter' },
        ]}
      />
      <MarkdownTableConverter />
      <MarkdownTableSeoContent />
    </>
  );
}
