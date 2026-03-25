import type { TailwindConversionOptions } from './tailwind-types';

export const TAILWIND_DEFAULT_OPTIONS: TailwindConversionOptions = {
  inputFormat: 'classes',
  outputFormat: 'single',
  twVersion: 'v3',
  includeComments: true,
};

export const TAILWIND_DEFAULT_EXAMPLE = `flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8

md:flex-row md:gap-8

hover:bg-gray-100 transition-colors duration-200

text-2xl font-bold text-gray-900 tracking-tight

rounded-xl shadow-lg border border-gray-200

w-full max-w-4xl mx-auto`;
