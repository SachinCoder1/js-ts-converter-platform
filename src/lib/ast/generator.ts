import generate from '@babel/generator';
import type { File } from '@babel/types';

export function generateCode(ast: File): string {
  const result = generate(ast, {
    retainLines: false,
    compact: false,
    concise: false,
    jsescOption: {
      minimal: true,
    },
  });

  return result.code;
}
