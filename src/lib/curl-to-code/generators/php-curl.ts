import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { escapeQuote } from './helpers';

export const phpCurlGenerator: CodeGenerator = {
  language: 'php',
  fileExtension: 'php',
  fileType: 'PHP',
  label: 'PHP',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { errorHandling } = options;
    const lines: string[] = [];

    lines.push('<?php');
    lines.push('');
    lines.push('$ch = curl_init();');
    lines.push('');
    lines.push(`curl_setopt($ch, CURLOPT_URL, '${escapeQuote(parsed.url)}');`);
    lines.push('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);');

    if (parsed.method !== 'GET') {
      if (parsed.method === 'POST') {
        lines.push('curl_setopt($ch, CURLOPT_POST, true);');
      } else {
        lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${parsed.method}');`);
      }
    }

    const headerEntries = Object.entries(parsed.headers);
    if (headerEntries.length > 0) {
      lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, [');
      for (const [key, value] of headerEntries) {
        lines.push(`    '${key}: ${escapeQuote(value)}',`);
      }
      lines.push(']);');
    }

    if (parsed.body) {
      lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${escapeQuote(parsed.body)}');`);
    }

    if (parsed.formData) {
      lines.push('curl_setopt($ch, CURLOPT_POSTFIELDS, [');
      for (const field of parsed.formData) {
        if (field.isFile) {
          lines.push(`    '${field.name}' => new CURLFile('${escapeQuote(field.value)}'),`);
        } else {
          lines.push(`    '${field.name}' => '${escapeQuote(field.value)}',`);
        }
      }
      lines.push(']);');
    }

    if (parsed.auth) {
      lines.push(`curl_setopt($ch, CURLOPT_USERPWD, '${escapeQuote(parsed.auth.username)}:${escapeQuote(parsed.auth.password)}');`);
    }

    if (parsed.cookies) {
      lines.push(`curl_setopt($ch, CURLOPT_COOKIE, '${escapeQuote(parsed.cookies)}');`);
    }

    if (parsed.insecure) {
      lines.push('curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);');
      lines.push('curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);');
    }

    if (parsed.followRedirects) {
      lines.push('curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);');
    }

    lines.push('');
    lines.push('$response = curl_exec($ch);');

    if (errorHandling === 'try-catch') {
      lines.push('');
      lines.push('if (curl_errno($ch)) {');
      lines.push("    echo 'Error: ' . curl_error($ch);");
      lines.push('} else {');
      lines.push('    echo $response;');
      lines.push('}');
    } else {
      lines.push('echo $response;');
    }

    lines.push('');
    lines.push('curl_close($ch);');

    return lines.join('\n');
  },
};
