import generate from '@babel/generator';
import type { File } from '@babel/types';

export function generateCode(ast: File): string {
  const result = generate(ast, {
    retainLines: true,
    compact: false,
    concise: false,
    jsescOption: {
      minimal: true,
    },
    jsxPreserveParens: true,
  } as Parameters<typeof generate>[1]);

  return result.code;
}
