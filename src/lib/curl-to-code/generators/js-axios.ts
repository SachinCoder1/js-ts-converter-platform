import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { escapeQuote } from './helpers';

export const jsAxiosGenerator: CodeGenerator = {
  language: 'javascript',
  fileExtension: 'js',
  fileType: 'JS',
  label: 'Axios',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { codeStyle, errorHandling, variableStyle } = options;
    const lines: string[] = [];

    lines.push("import axios from 'axios';");
    lines.push('');

    const headers = { ...parsed.headers };
    if (parsed.cookies) {
      headers['Cookie'] = parsed.cookies;
    }
    const hasHeaders = Object.keys(headers).length > 0;

    if (variableStyle === 'extracted') {
      lines.push(`const url = '${parsed.url}';`);
      if (hasHeaders) {
        lines.push(`const headers = ${formatHeaders(headers)};`);
      }
      if (parsed.body) {
        const isJson = isJsonContent(parsed);
        lines.push(`const data = ${isJson ? parsed.body : `'${escapeQuote(parsed.body)}'`};`);
      }
      lines.push('');
    }

    const urlRef = variableStyle === 'extracted' ? 'url' : `'${parsed.url}'`;
    const configParts = buildConfig(parsed, headers, hasHeaders, variableStyle);

    if (codeStyle === 'async-await') {
      lines.push('async function makeRequest() {');
      if (errorHandling === 'try-catch') {
        lines.push('  try {');
        lines.push(`    const response = await axios(${buildAxiosArgs(urlRef, configParts, '    ')});`);
        lines.push('    console.log(response.data);');
        lines.push('  } catch (error) {');
        lines.push('    console.error(\'Error:\', error.message);');
        lines.push('  }');
      } else {
        lines.push(`  const response = await axios(${buildAxiosArgs(urlRef, configParts, '  ')});`);
        lines.push('  console.log(response.data);');
      }
      lines.push('}');
      lines.push('');
      lines.push('makeRequest();');
    } else {
      lines.push(`axios(${buildAxiosArgs(urlRef, configParts, '')})`);
      lines.push('  .then(response => console.log(response.data))');
      if (errorHandling === 'try-catch') {
        lines.push('  .catch(error => console.error(\'Error:\', error.message));');
      } else {
        lines.push(';');
      }
    }

    return lines.join('\n');
  },
};

function isJsonContent(parsed: ParsedCurlCommand): boolean {
  const ct = parsed.headers['Content-Type'] || parsed.headers['content-type'] || '';
  return ct.includes('application/json');
}

function formatHeaders(headers: Record<string, string>): string {
  const entries = Object.entries(headers);
  if (entries.length === 0) return '{}';
  const lines = entries.map(([k, v]) => `    '${k}': '${escapeQuote(v)}'`);
  return `{\n${lines.join(',\n')}\n  }`;
}

function buildConfig(
  parsed: ParsedCurlCommand,
  headers: Record<string, string>,
  hasHeaders: boolean,
  variableStyle: string,
): string[] {
  const parts: string[] = [];
  parts.push(`method: '${parsed.method.toLowerCase()}'`);
  parts.push(`url: ${variableStyle === 'extracted' ? 'url' : `'${parsed.url}'`}`);

  if (hasHeaders) {
    parts.push(`headers: ${variableStyle === 'extracted' ? 'headers' : formatHeaders(headers)}`);
  }

  if (parsed.body) {
    const isJson = isJsonContent(parsed);
    if (variableStyle === 'extracted') {
      parts.push('data');
    } else if (isJson) {
      parts.push(`data: ${parsed.body}`);
    } else {
      parts.push(`data: '${escapeQuote(parsed.body)}'`);
    }
  }

  if (parsed.auth) {
    parts.push(`auth: { username: '${escapeQuote(parsed.auth.username)}', password: '${escapeQuote(parsed.auth.password)}' }`);
  }

  return parts;
}

function buildAxiosArgs(urlRef: string, configParts: string[], baseIndent: string): string {
  const inner = configParts.map(p => `${baseIndent}  ${p}`).join(',\n');
  return `{\n${inner}\n${baseIndent}}`;
}
