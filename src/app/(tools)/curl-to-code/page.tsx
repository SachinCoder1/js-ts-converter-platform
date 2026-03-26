import { CurlToCodeConverter } from '@/components/curl-to-code/converter';
import { CurlToCodeSeoContent } from '@/components/curl-to-code/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('curl-to-code');

export default function CurlToCodePage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('curl-to-code')!} />
      <JsonLd data={buildHowToSchema('curl-to-code')!} />
      <JsonLd data={buildFAQPageSchema('curl-to-code')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'cURL to Code Converter' },
        ]}
      />
      <CurlToCodeConverter />
      <CurlToCodeSeoContent />
    </>
  );
}
