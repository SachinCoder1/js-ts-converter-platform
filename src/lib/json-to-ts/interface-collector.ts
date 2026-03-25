import type { JsonToTsOptions, JsonToTsStats } from '../types';

interface InterfaceField {
  name: string;
  type: string;
  optional: boolean;
  comment?: string;
}

interface InterfaceDefinition {
  name: string;
  fields: InterfaceField[];
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function capitalize(str: string): string {
  if (!str) return str;
  // Handle camelCase/snake_case: "zipCode" -> "ZipCode", "order_id" -> "OrderId"
  return str
    .replace(/[-_](\w)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(\w)/, (_, c: string) => c.toUpperCase());
}

function singularize(name: string): string {
  if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
  if (name.endsWith('ses') || name.endsWith('xes') || name.endsWith('zes')) return name.slice(0, -2);
  if (name.endsWith('s') && !name.endsWith('ss')) return name.slice(0, -1);
  return name;
}

export class InterfaceCollector {
  private interfaces: InterfaceDefinition[] = [];
  private usedNames = new Set<string>();
  private stats: JsonToTsStats = {
    interfacesCreated: 0,
    propertiesTyped: 0,
    nullableFields: 0,
    arrayTypes: 0,
  };
  private options: JsonToTsOptions;

  constructor(options: JsonToTsOptions) {
    this.options = options;
  }

  private getUniqueName(baseName: string): string {
    let name = baseName;
    let counter = 2;
    while (this.usedNames.has(name)) {
      name = `${baseName}${counter}`;
      counter++;
    }
    this.usedNames.add(name);
    return name;
  }

  processValue(value: unknown, name: string): string {
    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      return this.processArray(value, name);
    }

    if (typeof value === 'object') {
      return this.processObject(value as Record<string, unknown>, name);
    }

    return this.inferPrimitive(value);
  }

  private inferPrimitive(value: unknown): string {
    if (typeof value === 'string') {
      if (ISO_DATE_RE.test(value)) {
        return 'string'; // Will be annotated with JSDoc at field level
      }
      return 'string';
    }
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'unknown';
  }

  private processArray(arr: unknown[], parentKey: string): string {
    this.stats.arrayTypes++;

    if (arr.length === 0) {
      return 'unknown[]';
    }

    // Collect types from all elements
    const elementName = capitalize(singularize(parentKey));
    const elementTypes = new Set<string>();
    let objectType: string | null = null;

    for (const element of arr) {
      if (element === null) {
        elementTypes.add('null');
      } else if (Array.isArray(element)) {
        elementTypes.add(this.processArray(element, parentKey + 'Item'));
      } else if (typeof element === 'object') {
        // For objects in arrays, generate one interface from the first object
        // (assuming homogeneous shape)
        if (!objectType) {
          objectType = this.processObject(element as Record<string, unknown>, elementName);
        }
        elementTypes.add(objectType);
      } else {
        elementTypes.add(this.inferPrimitive(element));
      }
    }

    const types = [...elementTypes];
    if (types.length === 1) {
      return `${types[0]}[]`;
    }
    return `(${types.join(' | ')})[]`;
  }

  private processObject(obj: Record<string, unknown>, name: string): string {
    const interfaceName = this.getUniqueName(capitalize(name));
    const fields: InterfaceField[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fieldName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      let fieldType: string;
      let comment: string | undefined;
      let isNullable = false;

      if (value === null) {
        // null field: type as unknown | null since we can't infer the actual type
        fieldType = 'unknown | null';
        isNullable = true;
        this.stats.nullableFields++;
      } else if (Array.isArray(value)) {
        const elementName = capitalize(singularize(key));
        fieldType = this.processArray(value, elementName);
      } else if (typeof value === 'object') {
        fieldType = this.processObject(value as Record<string, unknown>, key);
      } else {
        fieldType = this.inferPrimitive(value);
        if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
          comment = 'ISO 8601 date string';
        }
      }

      this.stats.propertiesTyped++;

      fields.push({
        name: fieldName,
        type: fieldType,
        optional: this.options.optionalFields === 'optional',
        comment,
      });
    }

    this.interfaces.push({ name: interfaceName, fields });
    this.stats.interfacesCreated++;

    return interfaceName;
  }

  generate(): string {
    const { outputStyle, exportKeyword, readonlyProperties } = this.options;
    const exportPrefix = exportKeyword ? 'export ' : '';
    const readonlyPrefix = readonlyProperties ? 'readonly ' : '';
    const lines: string[] = [];

    for (const iface of this.interfaces) {
      if (outputStyle === 'interface') {
        lines.push(`${exportPrefix}interface ${iface.name} {`);
      } else {
        lines.push(`${exportPrefix}type ${iface.name} = {`);
      }

      for (const field of iface.fields) {
        if (field.comment) {
          lines.push(`  /** ${field.comment} */`);
        }
        const opt = field.optional ? '?' : '';
        lines.push(`  ${readonlyPrefix}${field.name}${opt}: ${field.type};`);
      }

      if (outputStyle === 'interface') {
        lines.push('}');
      } else {
        lines.push('};');
      }
      lines.push('');
    }

    return lines.join('\n').trimEnd() + '\n';
  }

  getStats(): JsonToTsStats {
    return { ...this.stats };
  }
}
