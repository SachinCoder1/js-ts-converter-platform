import { RegexConverter } from '@/components/regex-tester/regex-converter';
import { RegexSeoContent } from '@/components/regex-tester/seo-content';
import { JsonLd } from '@/components/json-ld';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateToolMetadata } from '@/lib/seo-metadata';
import {
  buildWebApplicationSchema,
  buildHowToSchema,
  buildFAQPageSchema,
} from '@/lib/seo-schemas';

export const metadata = generateToolMetadata('regex-tester');

export default function RegexTesterPage() {
  return (
    <>
      <JsonLd data={buildWebApplicationSchema('regex-tester')!} />
      <JsonLd data={buildHowToSchema('regex-tester')!} />
      <JsonLd data={buildFAQPageSchema('regex-tester')!} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Regex Tester & Converter' },
        ]}
      />
      <RegexConverter />
      <RegexSeoContent />
    </>
  );
}
