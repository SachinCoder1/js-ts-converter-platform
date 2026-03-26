import type { Metadata } from 'next';
import { SqlToTsConverter } from '@/components/sql-to-ts/converter';
import { SqlToTsSeoContent } from '@/components/sql-to-ts/seo-content';

export const metadata: Metadata = {
  title: 'SQL to TypeScript Converter  Generate Interfaces from Database Schema | SnipShift',
  description:
    'Convert SQL CREATE TABLE statements to TypeScript interfaces instantly. AI-powered with smart type mapping, relation inference, and Prisma/Drizzle support. Free, no signup required.',
  keywords: [
    'sql to typescript',
    'sql schema to typescript',
    'sql type generator',
    'create table to interface',
    'database schema to typescript',
    'sql to ts converter',
    'postgresql to typescript',
    'mysql to typescript',
  ],
  openGraph: {
    title: 'SQL to TypeScript Converter  Generate Interfaces from Database Schema | SnipShift',
    description:
      'Convert SQL schemas to TypeScript interfaces with AI-powered type mapping. Free, no signup required.',
  },
  twitter: {
    title: 'SQL to TypeScript Converter  Generate Interfaces from Database Schema | SnipShift',
    description:
      'Convert SQL schemas to TypeScript interfaces with AI-powered type mapping. Free, no signup required.',
  },
};

export default function SqlToTypescriptPage() {
  return (
    <>
        <SqlToTsConverter />
      <SqlToTsSeoContent />
    </>
  );
}
