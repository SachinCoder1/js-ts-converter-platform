import type { AIProvider } from './types';

export type TailwindInputFormat = 'classes' | 'html';
export type TailwindOutputFormat = 'single' | 'grouped' | 'media-queries';
export type TailwindVersion = 'v3' | 'v4';

export interface TailwindConversionOptions {
  inputFormat: TailwindInputFormat;
  outputFormat: TailwindOutputFormat;
  twVersion: TailwindVersion;
  includeComments: boolean;
}

export interface TailwindConversionRequest {
  input: string;
  options: TailwindConversionOptions;
  preferredProvider?: AIProvider;
}

export interface TailwindConversionStats {
  classesConverted: number;
  propertiesGenerated: number;
  mediaQueries: number;
  pseudoSelectors: number;
  unknownClasses: number;
}

export interface TailwindConversionResult {
  convertedCss: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: TailwindConversionStats;
  duration: number;
}
