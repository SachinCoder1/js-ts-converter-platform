import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { escapeQuote } from './helpers';

export const goNetHttpGenerator: CodeGenerator = {
  language: 'go',
  fileExtension: 'go',
  fileType: 'GO',
  label: 'Go',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { errorHandling } = options;
    const lines: string[] = [];
    const imports = new Set<string>();
    imports.add('"fmt"');
    imports.add('"net/http"');
    imports.add('"io"');

    const hasBody = parsed.body !== null;
    if (hasBody) {
      imports.add('"strings"');
    }

    if (parsed.insecure) {
      imports.add('"crypto/tls"');
    }

    lines.push('package main');
    lines.push('');

    // Build function body first to know all imports
    const bodyLines: string[] = [];

    if (hasBody) {
      bodyLines.push(`\tbody := strings.NewReader(\`${parsed.body}\`)`);
      bodyLines.push(`\treq, err := http.NewRequest("${parsed.method}", "${parsed.url}", body)`);
    } else {
      bodyLines.push(`\treq, err := http.NewRequest("${parsed.method}", "${parsed.url}", nil)`);
    }

    if (errorHandling === 'try-catch') {
      bodyLines.push('\tif err != nil {');
      bodyLines.push('\t\tfmt.Println("Error creating request:", err)');
      bodyLines.push('\t\treturn');
      bodyLines.push('\t}');
    }

    for (const [key, value] of Object.entries(parsed.headers)) {
      bodyLines.push(`\treq.Header.Set("${key}", "${escapeQuote(value)}")`);
    }

    if (parsed.auth) {
      bodyLines.push(`\treq.SetBasicAuth("${escapeQuote(parsed.auth.username)}", "${escapeQuote(parsed.auth.password)}")`);
    }

    if (parsed.cookies) {
      bodyLines.push(`\treq.Header.Set("Cookie", "${escapeQuote(parsed.cookies)}")`);
    }

    bodyLines.push('');

    if (parsed.insecure) {
      bodyLines.push('\tclient := &http.Client{');
      bodyLines.push('\t\tTransport: &http.Transport{');
      bodyLines.push('\t\t\tTLSClientConfig: &tls.Config{InsecureSkipVerify: true},');
      bodyLines.push('\t\t},');
      bodyLines.push('\t}');
    } else {
      bodyLines.push('\tclient := &http.Client{}');
    }

    bodyLines.push('\tresp, err := client.Do(req)');
    if (errorHandling === 'try-catch') {
      bodyLines.push('\tif err != nil {');
      bodyLines.push('\t\tfmt.Println("Error sending request:", err)');
      bodyLines.push('\t\treturn');
      bodyLines.push('\t}');
    }
    bodyLines.push('\tdefer resp.Body.Close()');
    bodyLines.push('');
    bodyLines.push('\trespBody, err := io.ReadAll(resp.Body)');
    if (errorHandling === 'try-catch') {
      bodyLines.push('\tif err != nil {');
      bodyLines.push('\t\tfmt.Println("Error reading response:", err)');
      bodyLines.push('\t\treturn');
      bodyLines.push('\t}');
    }
    bodyLines.push('\tfmt.Println(string(respBody))');

    // Now write imports
    lines.push('import (');
    for (const imp of Array.from(imports).sort()) {
      lines.push(`\t${imp}`);
    }
    lines.push(')');
    lines.push('');
    lines.push('func main() {');
    lines.push(...bodyLines);
    lines.push('}');

    return lines.join('\n');
  },
};
