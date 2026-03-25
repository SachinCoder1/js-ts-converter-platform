import { parse, Kind } from 'graphql';
import type {
  DocumentNode,
  DefinitionNode,
  TypeNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  EnumValueDefinitionNode,
  NamedTypeNode,
} from 'graphql';
import type { GraphqlToTsOptions, GraphqlToTsStats } from '../types';

const SCALAR_MAP: Record<string, string> = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
  ID: 'string',
};

function resolveType(
  node: TypeNode,
  options: GraphqlToTsOptions,
): { type: string; nullable: boolean } {
  switch (node.kind) {
    case Kind.NON_NULL_TYPE: {
      const inner = resolveType(node.type, options);
      return { type: inner.type, nullable: false };
    }
    case Kind.LIST_TYPE: {
      const inner = resolveType(node.type, options);
      const elementType = inner.nullable
        ? wrapNullable(inner.type, options)
        : inner.type;
      return { type: `${elementType}[]`, nullable: true };
    }
    case Kind.NAMED_TYPE: {
      const name = node.name.value;
      const tsType = SCALAR_MAP[name] || name;
      return { type: tsType, nullable: true };
    }
    default:
      return { type: 'unknown', nullable: true };
  }
}

function wrapNullable(type: string, options: GraphqlToTsOptions): string {
  if (options.nullableStyle === 'maybe') {
    return `Maybe<${type}>`;
  }
  return `${type} | null`;
}

function formatField(
  name: string,
  typeNode: TypeNode,
  options: GraphqlToTsOptions,
  indent: string,
): string {
  const { type, nullable } = resolveType(typeNode, options);
  const readonly = options.readonlyProperties ? 'readonly ' : '';

  if (nullable) {
    const fullType = wrapNullable(type, options);
    return `${indent}${readonly}${name}?: ${fullType};`;
  }
  return `${indent}${readonly}${name}: ${type};`;
}

function convertFields(
  fields: ReadonlyArray<FieldDefinitionNode | InputValueDefinitionNode>,
  options: GraphqlToTsOptions,
  stats: GraphqlToTsStats,
): string {
  return fields
    .map((field) => {
      stats.fieldsTyped++;
      return formatField(field.name.value, field.type, options, '  ');
    })
    .join('\n');
}

function convertEnumValues(
  values: ReadonlyArray<EnumValueDefinitionNode>,
  name: string,
  options: GraphqlToTsOptions,
): string {
  if (options.enumStyle === 'union') {
    const members = values.map((v) => `'${v.name.value}'`).join(' | ');
    const exp = options.exportAll ? 'export ' : '';
    return `${exp}type ${name} = ${members};`;
  }
  const exp = options.exportAll ? 'export ' : '';
  const members = values.map((v) => `  ${v.name.value} = '${v.name.value}',`).join('\n');
  return `${exp}enum ${name} {\n${members}\n}`;
}

function processDefinition(
  def: DefinitionNode,
  options: GraphqlToTsOptions,
  stats: GraphqlToTsStats,
): string | null {
  const exp = options.exportAll ? 'export ' : '';

  switch (def.kind) {
    case Kind.OBJECT_TYPE_DEFINITION: {
      const name = def.name.value;
      // Skip Query/Mutation/Subscription root types — we handle them separately
      if (['Query', 'Mutation', 'Subscription'].includes(name) && def.fields) {
        // Generate argument types for operations
        const argTypes: string[] = [];
        const fieldLines: string[] = [];

        for (const field of def.fields) {
          stats.fieldsTyped++;
          // If field has arguments, generate an args interface
          if (field.arguments && field.arguments.length > 0) {
            const argsName = `${capitalize(field.name.value)}${name === 'Mutation' ? 'Variables' : 'Args'}`;
            const argsFields = field.arguments
              .map((arg) => {
                stats.fieldsTyped++;
                return formatField(arg.name.value, arg.type, options, '  ');
              })
              .join('\n');
            argTypes.push(`${exp}interface ${argsName} {\n${argsFields}\n}`);
          }
          const { type, nullable } = resolveType(field.type, options);
          const readonly = options.readonlyProperties ? 'readonly ' : '';
          if (nullable) {
            fieldLines.push(`  ${readonly}${field.name.value}?: ${wrapNullable(type, options)};`);
          } else {
            fieldLines.push(`  ${readonly}${field.name.value}: ${type};`);
          }
        }

        stats.typesGenerated++;
        const mainInterface = `${exp}interface ${name} {\n${fieldLines.join('\n')}\n}`;
        return [...argTypes, mainInterface].join('\n\n');
      }

      if (!def.fields) return null;
      stats.typesGenerated++;
      const fields = convertFields(def.fields, options, stats);
      return `${exp}interface ${name} {\n${fields}\n}`;
    }

    case Kind.INPUT_OBJECT_TYPE_DEFINITION: {
      if (!def.fields) return null;
      stats.inputTypesGenerated++;
      stats.typesGenerated++;
      const name = def.name.value;
      const fields = convertFields(def.fields, options, stats);
      return `${exp}interface ${name} {\n${fields}\n}`;
    }

    case Kind.ENUM_TYPE_DEFINITION: {
      if (!def.values) return null;
      stats.enumsConverted++;
      return convertEnumValues(def.values, def.name.value, options);
    }

    case Kind.UNION_TYPE_DEFINITION: {
      if (!def.types) return null;
      stats.typesGenerated++;
      const name = def.name.value;
      const members = def.types.map((t: NamedTypeNode) => t.name.value).join(' | ');
      return `${exp}type ${name} = ${members};`;
    }

    case Kind.SCALAR_TYPE_DEFINITION: {
      stats.typesGenerated++;
      const name = def.name.value;
      return `${exp}type ${name} = unknown;`;
    }

    case Kind.INTERFACE_TYPE_DEFINITION: {
      if (!def.fields) return null;
      stats.typesGenerated++;
      const name = def.name.value;
      const fields = convertFields(def.fields, options, stats);
      return `${exp}interface ${name} {\n${fields}\n}`;
    }

    default:
      return null;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function graphqlToTsAst(
  schema: string,
  options: GraphqlToTsOptions,
): { code: string; stats: GraphqlToTsStats } {
  const stats: GraphqlToTsStats = {
    typesGenerated: 0,
    enumsConverted: 0,
    fieldsTyped: 0,
    inputTypesGenerated: 0,
  };

  let doc: DocumentNode;
  try {
    doc = parse(schema);
  } catch (err) {
    return {
      code: `// Error parsing GraphQL schema: ${err instanceof Error ? err.message : 'Unknown error'}`,
      stats,
    };
  }

  const lines: string[] = [];

  // Add Maybe helper if needed
  if (options.nullableStyle === 'maybe') {
    const exp = options.exportAll ? 'export ' : '';
    lines.push(`${exp}type Maybe<T> = T | null;`);
  }

  for (const def of doc.definitions) {
    const result = processDefinition(def, options, stats);
    if (result) {
      lines.push(result);
    }
  }

  return {
    code: lines.join('\n\n'),
    stats,
  };
}
