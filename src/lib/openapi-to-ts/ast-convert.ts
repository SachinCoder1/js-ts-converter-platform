import yaml from 'js-yaml';
import type { OpenApiToTsOptions, OpenApiToTsStats } from '../types';

interface SchemaObject {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  $ref?: string;
  enum?: (string | number)[];
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  nullable?: boolean;
  additionalProperties?: boolean | SchemaObject;
}

interface PathItem {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
}

interface ParameterObject {
  name: string;
  in: string;
  required?: boolean;
  schema?: SchemaObject;
  description?: string;
}

interface OperationObject {
  summary?: string;
  operationId?: string;
  parameters?: ParameterObject[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: SchemaObject }>;
  };
  responses?: Record<string, {
    description?: string;
    content?: Record<string, { schema?: SchemaObject }>;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpecDocument = Record<string, any>;

function parseSpec(spec: string, inputFormat: 'json' | 'yaml'): SpecDocument {
  if (inputFormat === 'yaml') {
    return yaml.load(spec) as SpecDocument;
  }
  return JSON.parse(spec);
}

function detectVersion(doc: SpecDocument): 'openapi3' | 'swagger2' {
  if (doc.openapi && typeof doc.openapi === 'string' && doc.openapi.startsWith('3')) {
    return 'openapi3';
  }
  if (doc.swagger && typeof doc.swagger === 'string' && doc.swagger.startsWith('2')) {
    return 'swagger2';
  }
  // Default to openapi3 for unknown
  return 'openapi3';
}

function getSchemas(doc: SpecDocument, version: 'openapi3' | 'swagger2'): Record<string, SchemaObject> {
  if (version === 'openapi3') {
    return doc.components?.schemas || {};
  }
  return doc.definitions || {};
}

function getPaths(doc: SpecDocument): Record<string, PathItem> {
  return doc.paths || {};
}

function resolveRefName(ref: string): string {
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(capitalize)
    .join('');
}

function resolveType(
  schema: SchemaObject,
  options: OpenApiToTsOptions,
  stats: OpenApiToTsStats,
  indent: string,
): string {
  if (schema.$ref) {
    stats.refsResolved++;
    return resolveRefName(schema.$ref);
  }

  if (schema.allOf) {
    const types = schema.allOf.map((s) => resolveType(s, options, stats, indent));
    return types.join(' & ');
  }

  if (schema.oneOf) {
    const types = schema.oneOf.map((s) => resolveType(s, options, stats, indent));
    return types.join(' | ');
  }

  if (schema.anyOf) {
    const types = schema.anyOf.map((s) => resolveType(s, options, stats, indent));
    return types.join(' | ');
  }

  if (schema.enum) {
    if (options.enumStyle === 'union') {
      return schema.enum.map((v) => typeof v === 'string' ? `'${v}'` : String(v)).join(' | ');
    }
    // Inline enum — just use union for inline cases
    return schema.enum.map((v) => typeof v === 'string' ? `'${v}'` : String(v)).join(' | ');
  }

  if (!schema.type && schema.properties) {
    // Inline object
    return buildInlineObject(schema, options, stats, indent);
  }

  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') return 'string';
      if (schema.format === 'date') return 'string';
      if (schema.format === 'binary') return 'Blob';
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array': {
      if (!schema.items) return 'unknown[]';
      const itemType = resolveType(schema.items, options, stats, indent);
      // Wrap union/intersection types in parens for array
      if (itemType.includes(' | ') || itemType.includes(' & ')) {
        return `(${itemType})[]`;
      }
      return `${itemType}[]`;
    }
    case 'object': {
      if (schema.additionalProperties) {
        const valueType = typeof schema.additionalProperties === 'boolean'
          ? 'unknown'
          : resolveType(schema.additionalProperties, options, stats, indent);
        return `Record<string, ${valueType}>`;
      }
      if (schema.properties) {
        return buildInlineObject(schema, options, stats, indent);
      }
      return 'Record<string, unknown>';
    }
    default:
      return 'unknown';
  }
}

function buildInlineObject(
  schema: SchemaObject,
  options: OpenApiToTsOptions,
  stats: OpenApiToTsStats,
  indent: string,
): string {
  const required = new Set(schema.required || []);
  const lines: string[] = [];
  const innerIndent = indent + '  ';

  for (const [name, propSchema] of Object.entries(schema.properties || {})) {
    const jsDoc = options.addJsDoc && propSchema.description
      ? `${innerIndent}/** ${propSchema.description} */\n`
      : '';
    const optional = required.has(name) ? '' : '?';
    let type = resolveType(propSchema, options, stats, innerIndent);
    if (propSchema.nullable) {
      type = `${type} | null`;
    }
    lines.push(`${jsDoc}${innerIndent}${name}${optional}: ${type};`);
  }

  return `{\n${lines.join('\n')}\n${indent}}`;
}

function buildSchemaInterface(
  name: string,
  schema: SchemaObject,
  options: OpenApiToTsOptions,
  stats: OpenApiToTsStats,
): string {
  // Handle enums as top-level type
  if (schema.enum) {
    stats.enumsGenerated++;
    if (options.enumStyle === 'enum') {
      const members = schema.enum
        .map((v) => typeof v === 'string' ? `  ${toPascalCase(v)} = '${v}',` : `  Value${v} = ${v},`)
        .join('\n');
      return `export enum ${name} {\n${members}\n}`;
    }
    const members = schema.enum.map((v) => typeof v === 'string' ? `'${v}'` : String(v)).join(' | ');
    return `export type ${name} = ${members};`;
  }

  // Handle allOf — intersection type
  if (schema.allOf) {
    const types = schema.allOf.map((s) => resolveType(s, options, stats, ''));
    stats.schemasConverted++;
    return `export type ${name} = ${types.join(' & ')};`;
  }

  // Handle oneOf/anyOf — union type
  if (schema.oneOf || schema.anyOf) {
    const schemas = schema.oneOf || schema.anyOf || [];
    const types = schemas.map((s) => resolveType(s, options, stats, ''));
    stats.schemasConverted++;
    return `export type ${name} = ${types.join(' | ')};`;
  }

  // Standard object with properties
  const required = new Set(schema.required || []);
  const lines: string[] = [];

  const jsDocHeader = options.addJsDoc && schema.description
    ? `/** ${schema.description} */\n`
    : '';

  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const jsDoc = options.addJsDoc && propSchema.description
        ? `  /** ${propSchema.description} */\n`
        : '';
      const optional = required.has(propName) ? '' : '?';
      let type = resolveType(propSchema, options, stats, '  ');
      if (propSchema.nullable) {
        type = `${type} | null`;
      }
      lines.push(`${jsDoc}  ${propName}${optional}: ${type};`);
    }
  }

  // Handle additionalProperties
  if (schema.additionalProperties && typeof schema.additionalProperties !== 'boolean') {
    const valueType = resolveType(schema.additionalProperties, options, stats, '  ');
    lines.push(`  [key: string]: ${valueType};`);
  } else if (schema.additionalProperties === true) {
    lines.push(`  [key: string]: unknown;`);
  }

  stats.schemasConverted++;
  return `${jsDocHeader}export interface ${name} {\n${lines.join('\n')}\n}`;
}

function buildEndpointTypes(
  paths: Record<string, PathItem>,
  options: OpenApiToTsOptions,
  stats: OpenApiToTsStats,
): string[] {
  const output: string[] = [];
  const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const method of methods) {
      const operation = pathItem[method] as OperationObject | undefined;
      if (!operation) continue;

      const operationName = operation.operationId
        ? toPascalCase(operation.operationId)
        : toPascalCase(`${method} ${path.replace(/[{}]/g, '')}`);

      // Generate params type
      if (operation.parameters && operation.parameters.length > 0) {
        const paramLines: string[] = [];
        for (const param of operation.parameters) {
          const jsDoc = options.addJsDoc && param.description
            ? `  /** ${param.description} */\n`
            : '';
          const type = param.schema
            ? resolveType(param.schema, options, stats, '  ')
            : 'string';
          const optional = param.required ? '' : '?';
          paramLines.push(`${jsDoc}  ${param.name}${optional}: ${type};`);
        }
        output.push(`export interface ${operationName}Params {\n${paramLines.join('\n')}\n}`);
        stats.endpointsTyped++;
      }

      // Generate request body type
      if (operation.requestBody?.content) {
        const contentType = Object.values(operation.requestBody.content)[0];
        if (contentType?.schema) {
          const type = resolveType(contentType.schema, options, stats, '');
          if (!type.startsWith('{') && !type.includes(' | ') && !type.includes(' & ')) {
            // Simple ref — just alias
            output.push(`export type ${operationName}Body = ${type};`);
          } else {
            output.push(`export type ${operationName}Body = ${type};`);
          }
          stats.endpointsTyped++;
        }
      }

      // Generate response type
      const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
      if (successResponse?.content) {
        const contentType = Object.values(successResponse.content)[0];
        if (contentType?.schema) {
          const type = resolveType(contentType.schema, options, stats, '');
          output.push(`export type ${operationName}Response = ${type};`);
          stats.endpointsTyped++;
        }
      }
    }
  }

  return output;
}

export function openApiToTsAst(
  spec: string,
  options: OpenApiToTsOptions,
): { code: string; stats: OpenApiToTsStats } {
  const stats: OpenApiToTsStats = {
    schemasConverted: 0,
    endpointsTyped: 0,
    enumsGenerated: 0,
    refsResolved: 0,
  };

  let doc: SpecDocument;
  try {
    doc = parseSpec(spec, options.inputFormat);
  } catch (err) {
    return {
      code: `// Error parsing spec: ${err instanceof Error ? err.message : 'Invalid format'}`,
      stats,
    };
  }

  const version = options.specVersion === 'auto'
    ? detectVersion(doc)
    : options.specVersion;

  const schemas = getSchemas(doc, version);
  const paths = getPaths(doc);

  const output: string[] = [];

  // Add header comment
  const specVersionLabel = version === 'swagger2' ? 'Swagger 2.0' : 'OpenAPI 3.x';
  output.push(`// Generated from ${specVersionLabel} spec`);

  // Build schema types
  for (const [name, schema] of Object.entries(schemas)) {
    output.push(buildSchemaInterface(name, schema, options, stats));
  }

  // Build endpoint types
  if (options.outputMode !== 'interfaces-only') {
    const endpointTypes = buildEndpointTypes(paths, options, stats);
    if (endpointTypes.length > 0) {
      output.push('// --- Endpoint types ---');
      output.push(...endpointTypes);
    }
  }

  return {
    code: output.join('\n\n'),
    stats,
  };
}
