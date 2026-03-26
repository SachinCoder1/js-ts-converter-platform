import type { EnvToTypesOptions } from './types';

export type { EnvToTypesOptions } from './types';

export const DEFAULT_ENV_TO_TYPES_OPTIONS: EnvToTypesOptions = {
  outputFormat: 'typescript',
  optionalMode: 'all-required',
  addComments: true,
  prefixDetection: 'auto',
};

export interface ConversionOutput {
  output: string;
  error: string | null;
  duration: number;
}

type InferredType = 'string' | 'number' | 'boolean' | 'url';

interface ParsedEnvEntry {
  key: string;
  value: string;
  isEmpty: boolean;
  inferredType: InferredType;
  isClientVar: boolean;
  prefix: string | null;
}

const CLIENT_PREFIXES = ['NEXT_PUBLIC_', 'VITE_', 'REACT_APP_'];

function inferType(value: string): InferredType {
  if (value === '') return 'string';
  if (/^-?\d+(\.\d+)?$/.test(value)) return 'number';
  if (/^(true|false)$/i.test(value)) return 'boolean';
  if (/^https?:\/\//.test(value) || /^\w+:\/\//.test(value)) return 'url';
  return 'string';
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseEnvContent(input: string, options: EnvToTypesOptions): ParsedEnvEntry[] {
  const lines = input.split('\n');
  const entries: ParsedEnvEntry[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (line === '' || line.startsWith('#')) {
      i++;
      continue;
    }

    // Match KEY=value
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)/);
    if (!match) {
      i++;
      continue;
    }

    const key = match[1];
    let rawValue = match[2];

    // Handle multiline quoted values
    const quoteChar = rawValue.startsWith('"') ? '"' : rawValue.startsWith("'") ? "'" : null;
    if (quoteChar && !rawValue.endsWith(quoteChar)) {
      // Accumulate lines until closing quote
      i++;
      while (i < lines.length) {
        rawValue += '\n' + lines[i];
        if (lines[i].includes(quoteChar)) break;
        i++;
      }
    }

    const value = stripQuotes(rawValue.trim());
    const detectedPrefix =
      options.prefixDetection === 'auto'
        ? CLIENT_PREFIXES.find((p) => key.startsWith(p)) ?? null
        : null;

    entries.push({
      key,
      value,
      isEmpty: value === '',
      inferredType: inferType(value),
      isClientVar: detectedPrefix !== null,
      prefix: detectedPrefix,
    });

    i++;
  }

  return entries;
}

function isOptional(entry: ParsedEnvEntry, optionalMode: EnvToTypesOptions['optionalMode']): boolean {
  if (optionalMode === 'all-optional') return true;
  if (optionalMode === 'empty-optional' && entry.isEmpty) return true;
  return false;
}

function tsType(entry: ParsedEnvEntry): string {
  switch (entry.inferredType) {
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'url': return 'string';
    case 'string': return 'string';
  }
}

// ---- TypeScript Interface Generator ----

function generateTypeScriptInterface(entries: ParsedEnvEntry[], options: EnvToTypesOptions): string {
  const lines: string[] = [];

  if (options.prefixDetection === 'auto') {
    const serverEntries = entries.filter((e) => !e.isClientVar);
    const clientEntries = entries.filter((e) => e.isClientVar);

    if (clientEntries.length > 0 && serverEntries.length > 0) {
      lines.push(...buildInterfaceBlock('ServerEnv', serverEntries, options));
      lines.push('');
      lines.push(...buildInterfaceBlock('ClientEnv', clientEntries, options));
      lines.push('');
      lines.push('export type Env = ServerEnv & ClientEnv;');
      return lines.join('\n');
    }
  }

  lines.push(...buildInterfaceBlock('Env', entries, options));
  return lines.join('\n');
}

function buildInterfaceBlock(name: string, entries: ParsedEnvEntry[], options: EnvToTypesOptions): string[] {
  const lines: string[] = [];
  lines.push(`export interface ${name} {`);

  for (const entry of entries) {
    const optional = isOptional(entry, options.optionalMode);
    const optionalMark = optional ? '?' : '';
    if (options.addComments && entry.value) {
      lines.push(`  /** ${entry.key}=${entry.value} */`);
    }
    lines.push(`  ${entry.key}${optionalMark}: ${tsType(entry)};`);
  }

  lines.push('}');
  return lines;
}

// ---- Zod Schema Generator ----

function zodType(entry: ParsedEnvEntry, optional: boolean): string {
  let schema: string;

  switch (entry.inferredType) {
    case 'number':
      schema = 'z.coerce.number()';
      break;
    case 'boolean':
      schema = 'z.coerce.boolean()';
      break;
    case 'url':
      schema = 'z.string().url()';
      break;
    case 'string':
      schema = 'z.string()';
      break;
  }

  if (optional) schema += '.optional()';
  return schema;
}

function generateZodSchema(entries: ParsedEnvEntry[], options: EnvToTypesOptions): string {
  const lines: string[] = [];
  lines.push("import { z } from 'zod';");
  lines.push('');
  lines.push('export const envSchema = z.object({');

  for (const entry of entries) {
    const optional = isOptional(entry, options.optionalMode);
    const comment = options.addComments && entry.value ? ` // ${entry.key}=${entry.value}` : '';
    lines.push(`  ${entry.key}: ${zodType(entry, optional)},${comment}`);
  }

  lines.push('});');
  lines.push('');
  lines.push('export type Env = z.infer<typeof envSchema>;');

  return lines.join('\n');
}

// ---- t3-env Generator ----

function t3ZodType(entry: ParsedEnvEntry, optional: boolean): string {
  // Special-case NODE_ENV
  if (entry.key === 'NODE_ENV') {
    const schema = "z.enum(['development', 'production', 'test'])";
    return optional ? `${schema}.optional()` : schema;
  }
  return zodType(entry, optional);
}

function generateT3Env(entries: ParsedEnvEntry[], options: EnvToTypesOptions): string {
  const lines: string[] = [];
  const serverEntries = entries.filter((e) => !e.isClientVar);
  const clientEntries = entries.filter((e) => e.isClientVar);

  lines.push("import { createEnv } from '@t3-oss/env-nextjs';");
  lines.push("import { z } from 'zod';");
  lines.push('');
  lines.push('export const env = createEnv({');

  // Server section
  lines.push('  server: {');
  for (const entry of serverEntries) {
    const optional = isOptional(entry, options.optionalMode);
    const comment = options.addComments && entry.value ? ` // ${entry.value}` : '';
    lines.push(`    ${entry.key}: ${t3ZodType(entry, optional)},${comment}`);
  }
  lines.push('  },');

  // Client section
  lines.push('  client: {');
  for (const entry of clientEntries) {
    const optional = isOptional(entry, options.optionalMode);
    const comment = options.addComments && entry.value ? ` // ${entry.value}` : '';
    lines.push(`    ${entry.key}: ${t3ZodType(entry, optional)},${comment}`);
  }
  lines.push('  },');

  // runtimeEnv
  lines.push('  runtimeEnv: {');
  for (const entry of entries) {
    lines.push(`    ${entry.key}: process.env.${entry.key},`);
  }
  lines.push('  },');

  lines.push('});');

  return lines.join('\n');
}

// ---- Valibot Schema Generator ----

function valibotType(entry: ParsedEnvEntry, optional: boolean): string {
  let schema: string;

  switch (entry.inferredType) {
    case 'number':
      schema = 'v.pipe(v.string(), v.transform(Number))';
      break;
    case 'boolean':
      schema = "v.pipe(v.string(), v.transform((val) => val === 'true'))";
      break;
    case 'url':
      schema = 'v.pipe(v.string(), v.url())';
      break;
    case 'string':
      schema = 'v.string()';
      break;
  }

  if (optional) schema = `v.optional(${schema})`;
  return schema;
}

function generateValibotSchema(entries: ParsedEnvEntry[], options: EnvToTypesOptions): string {
  const lines: string[] = [];
  lines.push("import * as v from 'valibot';");
  lines.push('');
  lines.push('export const envSchema = v.object({');

  for (const entry of entries) {
    const optional = isOptional(entry, options.optionalMode);
    const comment = options.addComments && entry.value ? ` // ${entry.key}=${entry.value}` : '';
    lines.push(`  ${entry.key}: ${valibotType(entry, optional)},${comment}`);
  }

  lines.push('});');
  lines.push('');
  lines.push('export type Env = v.InferOutput<typeof envSchema>;');

  return lines.join('\n');
}

// ---- Main Conversion Function ----

export function convertEnvToTypes(
  input: string,
  options: EnvToTypesOptions = DEFAULT_ENV_TO_TYPES_OPTIONS
): ConversionOutput {
  const start = performance.now();

  if (!input.trim()) {
    return { output: '', error: null, duration: 0 };
  }

  try {
    const entries = parseEnvContent(input, options);

    if (entries.length === 0) {
      return { output: '', error: 'No valid environment variables found', duration: 0 };
    }

    let output: string;

    switch (options.outputFormat) {
      case 'typescript':
        output = generateTypeScriptInterface(entries, options);
        break;
      case 'zod':
        output = generateZodSchema(entries, options);
        break;
      case 't3-env':
        output = generateT3Env(entries, options);
        break;
      case 'valibot':
        output = generateValibotSchema(entries, options);
        break;
    }

    const duration = Math.round(performance.now() - start);
    return { output, error: null, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { output: '', error: `Parse error: ${String(err)}`, duration };
  }
}
