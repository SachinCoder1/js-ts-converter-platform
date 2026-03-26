import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CurlTargetLanguage, CurlCodeStyle, CurlErrorHandling, CurlVariableStyle } from '@/lib/types';

export interface CodeGeneratorOptions {
  codeStyle: CurlCodeStyle;
  errorHandling: CurlErrorHandling;
  variableStyle: CurlVariableStyle;
}

export interface CodeGenerator {
  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string;
  language: string;
  fileExtension: string;
  fileType: string;
  label: string;
}

import { jsFetchGenerator } from './js-fetch';
import { jsAxiosGenerator } from './js-axios';
import { tsFetchGenerator } from './ts-fetch';
import { pythonRequestsGenerator } from './python-requests';
import { goNetHttpGenerator } from './go-net-http';
import { rustReqwestGenerator } from './rust-reqwest';
import { phpCurlGenerator } from './php-curl';
import { rubyNetHttpGenerator } from './ruby-net-http';

export const GENERATORS: Record<CurlTargetLanguage, CodeGenerator> = {
  'js-fetch': jsFetchGenerator,
  'js-axios': jsAxiosGenerator,
  'ts-fetch': tsFetchGenerator,
  'python-requests': pythonRequestsGenerator,
  'go-net-http': goNetHttpGenerator,
  'rust-reqwest': rustReqwestGenerator,
  'php-curl': phpCurlGenerator,
  'ruby-net-http': rubyNetHttpGenerator,
};

export const OUTPUT_LANG_MAP: Record<CurlTargetLanguage, { language: string; fileType: string; fileName: string }> = {
  'js-fetch':        { language: 'javascript', fileType: 'JS',  fileName: 'request.js' },
  'js-axios':        { language: 'javascript', fileType: 'JS',  fileName: 'request.js' },
  'ts-fetch':        { language: 'typescript', fileType: 'TS',  fileName: 'request.ts' },
  'python-requests': { language: 'python',     fileType: 'PY',  fileName: 'request.py' },
  'go-net-http':     { language: 'go',         fileType: 'GO',  fileName: 'request.go' },
  'rust-reqwest':    { language: 'rust',       fileType: 'RS',  fileName: 'request.rs' },
  'php-curl':        { language: 'php',        fileType: 'PHP', fileName: 'request.php' },
  'ruby-net-http':   { language: 'ruby',       fileType: 'RB',  fileName: 'request.rb' },
};
