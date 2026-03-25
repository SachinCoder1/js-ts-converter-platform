import { parse, type ParserOptions } from '@babel/parser';
import type { File } from '@babel/types';
import type { FileType } from '../types';

export interface ParseResult {
  ast: File | null;
  errors: string[];
}

export function parseCode(code: string, fileType: FileType): ParseResult {
  const plugins: ParserOptions['plugins'] = [
    'decorators-legacy',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'optionalChaining',
    'nullishCoalescingOperator',
    'dynamicImport',
    'objectRestSpread',
    'optionalCatchBinding',
    'asyncGenerators',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'topLevelAwait',
  ];

  if (fileType === 'jsx') {
    plugins.push('jsx');
  }

  try {
    const ast = parse(code, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      plugins,
      errorRecovery: true,
    });
    return { ast, errors: [] };
  } catch (err) {
    // Try again with JSX enabled even for .js files (common in React projects)
    if (fileType === 'js') {
      try {
        plugins.push('jsx');
        const ast = parse(code, {
          sourceType: 'module',
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          allowSuperOutsideMethod: true,
          plugins,
          errorRecovery: true,
        });
        return { ast, errors: [] };
      } catch {
        // Fall through to error return
      }
    }
    const message = err instanceof Error ? err.message : 'Parse error';
    return { ast: null, errors: [message] };
  }
}

export function parseTypeScript(code: string): ParseResult {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        'decorators-legacy',
        'classProperties',
        'optionalChaining',
        'nullishCoalescingOperator',
        'dynamicImport',
        'objectRestSpread',
        'topLevelAwait',
      ],
      errorRecovery: true,
    });
    return { ast, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse error';
    return { ast: null, errors: [message] };
  }
}
