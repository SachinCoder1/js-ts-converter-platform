import type { JsonToZodOptions, JsonToZodStats } from '../../types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function jsonToZodAst(
  jsonString: string,
  options: JsonToZodOptions,
): { code: string; stats: JsonToZodStats } {
  const parsed = JSON.parse(jsonString);
  const stats: JsonToZodStats = {
    fieldsProcessed: 0,
    zodMethodsUsed: 0,
    nestedObjectCount: 0,
    arraysDetected: 0,
  };

  const importLine = options.importStyle === 'import'
    ? "import { z } from 'zod';"
    : "const { z } = require('zod');";

  const schemaBody = generateZodType(parsed, options, stats, 0);
  let output = `${importLine}\n\nconst ${options.schemaVariableName} = ${schemaBody};`;

  if (options.generateInferredType) {
    const typeName = capitalize(options.schemaVariableName);
    output += `\n\nexport type ${typeName} = z.infer<typeof ${options.schemaVariableName}>;`;
  }

  return { code: output, stats };
}

function generateZodType(
  value: unknown,
  options: JsonToZodOptions,
  stats: JsonToZodStats,
  depth: number,
): string {
  if (value === null) {
    stats.zodMethodsUsed++;
    return 'z.null()';
  }

  if (typeof value === 'boolean') {
    stats.zodMethodsUsed++;
    return 'z.boolean()';
  }

  if (typeof value === 'number') {
    stats.zodMethodsUsed++;
    return Number.isInteger(value) ? 'z.number().int()' : 'z.number()';
  }

  if (typeof value === 'string') {
    stats.zodMethodsUsed++;
    return inferStringZodType(value, options);
  }

  if (Array.isArray(value)) {
    stats.arraysDetected++;
    stats.zodMethodsUsed++;

    if (value.length === 0) {
      return 'z.array(z.unknown())';
    }

    // Check if all elements have the same type
    const types = new Set(value.map(v => typeof v));
    if (types.size === 1) {
      const elementType = generateZodType(value[0], options, stats, depth + 1);
      return `z.array(${elementType})`;
    }

    // Mixed types  use union
    const uniqueTypes = getUniqueZodTypes(value, options, stats, depth);
    if (uniqueTypes.length === 1) {
      return `z.array(${uniqueTypes[0]})`;
    }
    return `z.array(z.union([${uniqueTypes.join(', ')}]))`;
  }

  if (typeof value === 'object') {
    stats.nestedObjectCount++;
    const indent = '  '.repeat(depth + 1);
    const closingIndent = '  '.repeat(depth);
    const entries = Object.entries(value as Record<string, unknown>);
    const fields = entries.map(([key, val]) => {
      stats.fieldsProcessed++;
      const fieldType = generateZodType(val, options, stats, depth + 1);
      return `${indent}${key}: ${fieldType},`;
    });

    if (fields.length === 0) {
      return 'z.object({})';
    }

    return `z.object({\n${fields.join('\n')}\n${closingIndent}})`;
  }

  stats.zodMethodsUsed++;
  return 'z.unknown()';
}

function inferStringZodType(value: string, options: JsonToZodOptions): string {
  // Email detection
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'z.string().email()';
  }

  // URL detection
  if (/^https?:\/\/.+/.test(value)) {
    return 'z.string().url()';
  }

  // UUID detection
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return 'z.string().uuid()';
  }

  // ISO datetime detection
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return options.coerceDates ? 'z.coerce.date()' : 'z.string().datetime()';
  }

  // ISO date detection
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return options.coerceDates ? 'z.coerce.date()' : 'z.string().date()';
  }

  return 'z.string()';
}

function getUniqueZodTypes(
  arr: unknown[],
  options: JsonToZodOptions,
  stats: JsonToZodStats,
  depth: number,
): string[] {
  const seen = new Set<string>();
  const types: string[] = [];

  for (const item of arr) {
    const zodType = generateZodType(item, options, stats, depth + 1);
    if (!seen.has(zodType)) {
      seen.add(zodType);
      types.push(zodType);
    }
  }

  return types;
}
