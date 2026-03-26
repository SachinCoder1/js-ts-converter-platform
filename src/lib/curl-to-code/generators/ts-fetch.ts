import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { buildHeadersObject, escapeQuote, tryParseJson } from './helpers';

export const tsFetchGenerator: CodeGenerator = {
  language: 'typescript',
  fileExtension: 'ts',
  fileType: 'TS',
  label: 'TS Fetch',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { errorHandling, variableStyle } = options;
    const lines: string[] = [];

    // Generate response type stub
    lines.push('interface ResponseData {');
    lines.push('  // TODO: Define response type');
    lines.push('  [key: string]: unknown;');
    lines.push('}');
    lines.push('');

    // Generate request body type if JSON
    const isJson = isJsonContent(parsed);
    if (parsed.body && isJson) {
      const jsonObj = tryParseJson(parsed.body);
      if (jsonObj && typeof jsonObj === 'object') {
        lines.push('interface RequestBody {');
        for (const [key, value] of Object.entries(jsonObj as Record<string, unknown>)) {
          lines.push(`  ${key}: ${inferTsType(value)};`);
        }
        lines.push('}');
        lines.push('');
      }
    }

    const headers = { ...parsed.headers };
    if (parsed.auth) {
      headers['Authorization'] = `\${btoa('${parsed.auth.username}:${parsed.auth.password}')}`;
    }
    if (parsed.cookies) {
      headers['Cookie'] = parsed.cookies;
    }
    const hasHeaders = Object.keys(headers).length > 0;
    const hasBody = parsed.body !== null;

    if (variableStyle === 'extracted') {
      lines.push(`const url: string = '${parsed.url}';`);
      if (hasHeaders) {
        lines.push(`const headers: Record<string, string> = ${buildHeadersObject(headers, parsed.auth)};`);
      }
      if (parsed.body && isJson) {
        lines.push(`const body: RequestBody = ${parsed.body};`);
      }
      lines.push('');
    }

    const urlRef = variableStyle === 'extracted' ? 'url' : `'${parsed.url}'`;

    lines.push('async function makeRequest(): Promise<ResponseData> {');
    if (errorHandling === 'try-catch') {
      lines.push('  try {');
      const i = '    ';
      appendFetchCall(lines, parsed, headers, hasHeaders, hasBody, isJson, urlRef, variableStyle, i);
      lines.push(`${i}const data: ResponseData = await response.json();`);
      lines.push(`${i}return data;`);
      lines.push('  } catch (error) {');
      lines.push('    console.error(\'Error:\', error);');
      lines.push('    throw error;');
      lines.push('  }');
    } else {
      const i = '  ';
      appendFetchCall(lines, parsed, headers, hasHeaders, hasBody, isJson, urlRef, variableStyle, i);
      lines.push(`${i}const data: ResponseData = await response.json();`);
      lines.push(`${i}return data;`);
    }
    lines.push('}');

    return lines.join('\n');
  },
};

function isJsonContent(parsed: ParsedCurlCommand): boolean {
  const ct = parsed.headers['Content-Type'] || parsed.headers['content-type'] || '';
  return ct.includes('application/json');
}

function inferTsType(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return value.length > 0 ? `${inferTsType(value[0])}[]` : 'unknown[]';
  return 'Record<string, unknown>';
}

function appendFetchCall(
  lines: string[],
  parsed: ParsedCurlCommand,
  headers: Record<string, string>,
  hasHeaders: boolean,
  hasBody: boolean,
  isJson: boolean,
  urlRef: string,
  variableStyle: string,
  i: string,
): void {
  const opts: string[] = [];
  if (parsed.method !== 'GET') {
    opts.push(`${i}  method: '${parsed.method}'`);
  }
  if (hasHeaders) {
    opts.push(`${i}  headers: ${variableStyle === 'extracted' ? 'headers' : buildHeadersObject(headers, parsed.auth)}`);
  }
  if (hasBody && parsed.body) {
    if (variableStyle === 'extracted') {
      opts.push(`${i}  body: ${isJson ? 'JSON.stringify(body)' : 'body'}`);
    } else if (isJson) {
      opts.push(`${i}  body: JSON.stringify(${parsed.body})`);
    } else {
      opts.push(`${i}  body: '${parsed.body.replace(/'/g, "\\'")}'`);
    }
  }

  if (opts.length > 0) {
    lines.push(`${i}const response = await fetch(${urlRef}, {\n${opts.join(',\n')}\n${i}});`);
  } else {
    lines.push(`${i}const response = await fetch(${urlRef});`);
  }
}
