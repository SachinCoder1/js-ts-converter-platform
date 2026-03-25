import type { JsonToTsOptions, JsonToTsStats } from '../types';
import { InterfaceCollector } from './interface-collector';

export interface JsonToTsConversionResult {
  code: string;
  stats: JsonToTsStats;
}

export function jsonToTypeScript(jsonString: string, options: JsonToTsOptions): JsonToTsConversionResult {
  const emptyStats: JsonToTsStats = {
    interfacesCreated: 0,
    propertiesTyped: 0,
    nullableFields: 0,
    arrayTypes: 0,
  };

  if (!jsonString.trim()) {
    return { code: '', stats: emptyStats };
  }

  try {
    const parsed: unknown = JSON.parse(jsonString);

    if (parsed === null || typeof parsed !== 'object') {
      // Primitive JSON value — just return the type
      const primitiveType = parsed === null ? 'null'
        : typeof parsed === 'string' ? 'string'
        : typeof parsed === 'number' ? 'number'
        : typeof parsed === 'boolean' ? 'boolean'
        : 'unknown';

      const exportPrefix = options.exportKeyword ? 'export ' : '';
      const code = `${exportPrefix}type ${options.rootTypeName} = ${primitiveType};\n`;
      return { code, stats: emptyStats };
    }

    const collector = new InterfaceCollector(options);

    if (Array.isArray(parsed)) {
      // Root is an array — process as array type
      const elementType = parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null
        ? collector.processValue(parsed[0], options.rootTypeName + 'Item')
        : collector.processValue(parsed, options.rootTypeName);

      if (!Array.isArray(parsed[0])) {
        const exportPrefix = options.exportKeyword ? 'export ' : '';
        const arrayTypeStr = `${exportPrefix}type ${options.rootTypeName} = ${elementType}[];\n`;
        const generated = collector.generate();
        return {
          code: generated + '\n' + arrayTypeStr,
          stats: collector.getStats(),
        };
      }
    } else {
      collector.processValue(parsed, options.rootTypeName);
    }

    return {
      code: collector.generate(),
      stats: collector.getStats(),
    };
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw err; // Re-throw JSON parse errors for the caller to handle
    }
    return { code: '', stats: emptyStats };
  }
}
