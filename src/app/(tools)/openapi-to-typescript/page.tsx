import type { Metadata } from 'next';
import { OpenApiToTsConverter } from '@/components/openapi-to-ts/converter';
import { OpenApiToTsSeoContent } from '@/components/openapi-to-ts/seo-content';

export const metadata: Metadata = {
  title: 'OpenAPI/Swagger to TypeScript Converter  Generate Types from API Spec | SnipShift',
  description:
    'Convert OpenAPI 3.x and Swagger 2.0 specs to TypeScript types and interfaces instantly. AI-powered with $ref resolution, enum mapping, and optional API client generation. Free, no signup required.',
  keywords: [
    'openapi to typescript',
    'swagger to typescript',
    'generate typescript from openapi',
    'swagger codegen typescript online',
    'openapi typescript generator',
    'openapi types converter',
    'swagger to ts',
    'free openapi codegen',
  ],
  openGraph: {
    title: 'OpenAPI/Swagger to TypeScript Converter  Generate Types from API Spec | SnipShift',
    description:
      'Convert OpenAPI and Swagger specs to TypeScript types with AI-powered schema resolution. Free, no signup required.',
  },
  twitter: {
    title: 'OpenAPI/Swagger to TypeScript Converter  Generate Types from API Spec | SnipShift',
    description:
      'Convert OpenAPI and Swagger specs to TypeScript types with AI-powered schema resolution. Free, no signup required.',
  },
};

export default function OpenApiToTypescriptPage() {
  return (
    <>
        <OpenApiToTsConverter />
      <OpenApiToTsSeoContent />
    </>
  );
}
