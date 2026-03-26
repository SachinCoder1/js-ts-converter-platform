import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { tryParseJson, formatJsonIndented } from './helpers';

export const pythonRequestsGenerator: CodeGenerator = {
  language: 'python',
  fileExtension: 'py',
  fileType: 'PY',
  label: 'Python',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { errorHandling, variableStyle } = options;
    const lines: string[] = [];

    lines.push('import requests');
    lines.push('');

    const headers = { ...parsed.headers };
    if (parsed.cookies) {
      headers['Cookie'] = parsed.cookies;
    }
    const hasHeaders = Object.keys(headers).length > 0;
    const isJson = isJsonContent(parsed);
    const jsonObj = parsed.body ? tryParseJson(parsed.body) : null;

    if (variableStyle === 'extracted') {
      lines.push(`url = '${parsed.url}'`);
      if (hasHeaders) {
        lines.push(`headers = ${pythonDict(headers)}`);
      }
      if (parsed.body) {
        if (isJson && jsonObj) {
          lines.push(`payload = ${pythonDict(jsonObj as Record<string, unknown>)}`);
        } else {
          lines.push(`data = '${pyEscape(parsed.body)}'`);
        }
      }
      lines.push('');
    }

    const urlRef = variableStyle === 'extracted' ? 'url' : `'${parsed.url}'`;
    const method = parsed.method.toLowerCase();
    const args: string[] = [urlRef];

    if (hasHeaders) {
      args.push(`headers=${variableStyle === 'extracted' ? 'headers' : pythonDict(headers)}`);
    }

    if (parsed.body) {
      if (isJson && jsonObj) {
        args.push(`json=${variableStyle === 'extracted' ? 'payload' : pythonDict(jsonObj as Record<string, unknown>)}`);
      } else {
        args.push(`data=${variableStyle === 'extracted' ? 'data' : `'${pyEscape(parsed.body)}'`}`);
      }
    }

    if (parsed.formData) {
      const fileEntries = parsed.formData.filter(f => f.isFile);
      const dataEntries = parsed.formData.filter(f => !f.isFile);
      if (fileEntries.length > 0) {
        const filesDict = fileEntries.map(f => `    '${f.name}': open('${f.value}', 'rb')`).join(',\n');
        args.push(`files={\n${filesDict}\n}`);
      }
      if (dataEntries.length > 0) {
        const dataDict = dataEntries.map(f => `    '${f.name}': '${pyEscape(f.value)}'`).join(',\n');
        args.push(`data={\n${dataDict}\n}`);
      }
    }

    if (parsed.auth) {
      args.push(`auth=('${pyEscape(parsed.auth.username)}', '${pyEscape(parsed.auth.password)}')`);
    }

    if (parsed.insecure) {
      args.push('verify=False');
    }

    if (parsed.followRedirects) {
      args.push('allow_redirects=True');
    }

    if (errorHandling === 'try-catch') {
      lines.push('try:');
      lines.push(`    response = requests.${method}(${args.join(', ')})`);
      lines.push('    response.raise_for_status()');
      lines.push('    data = response.json()');
      lines.push('    print(data)');
      lines.push('except requests.exceptions.RequestException as e:');
      lines.push("    print(f'Error: {e}')");
    } else {
      lines.push(`response = requests.${method}(${args.join(', ')})`);
      lines.push('data = response.json()');
      lines.push('print(data)');
    }

    return lines.join('\n');
  },
};

function isJsonContent(parsed: ParsedCurlCommand): boolean {
  const ct = parsed.headers['Content-Type'] || parsed.headers['content-type'] || '';
  return ct.includes('application/json');
}

function pyEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function pythonDict(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  const inner = entries.map(([k, v]) => {
    if (typeof v === 'string') return `    '${k}': '${pyEscape(v)}'`;
    if (typeof v === 'boolean') return `    '${k}': ${v ? 'True' : 'False'}`;
    if (v === null) return `    '${k}': None`;
    if (typeof v === 'number') return `    '${k}': ${v}`;
    return `    '${k}': ${JSON.stringify(v)}`;
  }).join(',\n');
  return `{\n${inner}\n}`;
}
