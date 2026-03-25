import type { FileType, ASTConversionResult, ConversionStats } from '../types';
import { parseCode } from './parser';
import { transformToTypeScript } from './transforms';
import { generateCode } from './generator';

export function astConvert(code: string, fileType: FileType): ASTConversionResult {
  const emptyStats: ConversionStats = {
    interfacesCreated: 0,
    typesAdded: 0,
    anyCount: 0,
  };

  if (!code.trim()) {
    return {
      code: '',
      stats: emptyStats,
      unknownZones: 0,
      errors: [],
    };
  }

  try {
    const parseResult = parseCode(code, fileType);

    if (!parseResult.ast) {
      // If parsing fails, return original code as-is
      return {
        code,
        stats: emptyStats,
        unknownZones: 0,
        errors: parseResult.errors,
      };
    }

    const isJSX = fileType === 'jsx';
    const transformStats = transformToTypeScript(parseResult.ast, isJSX);

    const generated = generateCode(parseResult.ast);

    // Count 'any' types in output
    const anyCount = (generated.match(/:\s*any\b/g) || []).length;

    return {
      code: generated,
      stats: {
        interfacesCreated: transformStats.interfacesCreated,
        typesAdded: transformStats.typesAdded,
        anyCount,
      },
      unknownZones: 0,
      errors: [],
    };
  } catch (err) {
    // Never throw — return original code as fallback
    return {
      code,
      stats: emptyStats,
      unknownZones: 0,
      errors: [err instanceof Error ? err.message : 'Unknown AST error'],
    };
  }
}

export { parseCode } from './parser';
export { parseTypeScript } from './parser';
