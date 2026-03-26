import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { buildHeadersObject } from './helpers';

export const jsFetchGenerator: CodeGenerator = {
  language: 'javascript',
  fileExtension: 'js',
  fileType: 'JS',
  label: 'JS Fetch',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { codeStyle, errorHandling, variableStyle } = options;
    const lines: string[] = [];

    const headers = { ...parsed.headers };
    if (parsed.auth) {
      const encoded = `btoa('${parsed.auth.username}:${parsed.auth.password}')`;
      headers['Authorization'] = `\${${encoded}}`;
    }
    if (parsed.cookies) {
      headers['Cookie'] = parsed.cookies;
    }

    const hasHeaders = Object.keys(headers).length > 0;
    const hasBody = parsed.body !== null || parsed.formData !== null;
    const needsOptions = parsed.method !== 'GET' || hasHeaders || hasBody;

    if (variableStyle === 'extracted') {
      lines.push(`const url = '${parsed.url}';`);
      if (hasHeaders) {
        lines.push(`const headers = ${buildHeadersObject(headers, parsed.auth)};`);
      }
      if (parsed.body) {
        const isJson = isJsonBody(parsed);
        if (isJson) {
          lines.push(`const body = ${parsed.body};`);
        } else {
          lines.push(`const body = '${escapeString(parsed.body)}';`);
        }
      }
      lines.push('');
    }

    const urlRef = variableStyle === 'extracted' ? 'url' : `'${parsed.url}'`;

    if (codeStyle === 'async-await') {
      lines.push('async function makeRequest() {');
      const tryIndent = errorHandling === 'try-catch' ? '    ' : '  ';

      if (errorHandling === 'try-catch') {
        lines.push('  try {');
      }

      const fetchArgs = buildFetchArgs(parsed, headers, hasHeaders, hasBody, needsOptions, variableStyle, tryIndent);
      lines.push(`${tryIndent}const response = await fetch(${urlRef}${fetchArgs});`);
      lines.push(`${tryIndent}const data = await response.json();`);
      lines.push(`${tryIndent}console.log(data);`);

      if (errorHandling === 'try-catch') {
        lines.push('  } catch (error) {');
        lines.push('    console.error(\'Error:\', error);');
        lines.push('  }');
      }
      lines.push('}');
      lines.push('');
      lines.push('makeRequest();');
    } else if (codeStyle === 'promises') {
      const fetchArgs = buildFetchArgs(parsed, headers, hasHeaders, hasBody, needsOptions, variableStyle, '');
      lines.push(`fetch(${urlRef}${fetchArgs})`);
      lines.push('  .then(response => response.json())');
      lines.push('  .then(data => console.log(data))');
      if (errorHandling === 'try-catch') {
        lines.push('  .catch(error => console.error(\'Error:\', error));');
      } else {
        lines.push(';');
      }
    } else {
      // callback style falls back to async/await for fetch
      lines.push('async function makeRequest() {');
      const fetchArgs = buildFetchArgs(parsed, headers, hasHeaders, hasBody, needsOptions, variableStyle, '  ');
      lines.push(`  const response = await fetch(${urlRef}${fetchArgs});`);
      lines.push('  const data = await response.json();');
      lines.push('  console.log(data);');
      lines.push('}');
      lines.push('');
      lines.push('makeRequest();');
    }

    return lines.join('\n');
  },
};

function isJsonBody(parsed: ParsedCurlCommand): boolean {
  const ct = parsed.headers['Content-Type'] || parsed.headers['content-type'] || '';
  return ct.includes('application/json');
}

function escapeString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function buildFetchArgs(
  parsed: ParsedCurlCommand,
  headers: Record<string, string>,
  hasHeaders: boolean,
  hasBody: boolean,
  needsOptions: boolean,
  variableStyle: string,
  baseIndent: string,
): string {
  if (!needsOptions) return '';

  const opts: string[] = [];
  if (parsed.method !== 'GET') {
    opts.push(`${baseIndent}  method: '${parsed.method}'`);
  }
  if (hasHeaders) {
    if (variableStyle === 'extracted') {
      opts.push(`${baseIndent}  headers`);
    } else {
      opts.push(`${baseIndent}  headers: ${buildHeadersObject(headers, parsed.auth)}`);
    }
  }
  if (parsed.formData) {
    opts.push(`${baseIndent}  body: formData`);
  } else if (parsed.body) {
    const isJson = isJsonBody(parsed);
    if (variableStyle === 'extracted') {
      opts.push(`${baseIndent}  body: ${isJson ? 'JSON.stringify(body)' : 'body'}`);
    } else if (isJson) {
      opts.push(`${baseIndent}  body: JSON.stringify(${parsed.body})`);
    } else {
      opts.push(`${baseIndent}  body: '${escapeString(parsed.body)}'`);
    }
  }

  return `, {\n${opts.join(',\n')}\n${baseIndent}}`;
}
