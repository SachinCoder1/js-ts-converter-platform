import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { escapeQuote } from './helpers';

export const rustReqwestGenerator: CodeGenerator = {
  language: 'rust',
  fileExtension: 'rs',
  fileType: 'RS',
  label: 'Rust',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { errorHandling } = options;
    const lines: string[] = [];

    lines.push('use reqwest;');
    lines.push('use std::error::Error;');
    lines.push('');
    lines.push('#[tokio::main]');

    if (errorHandling === 'try-catch') {
      lines.push('async fn main() -> Result<(), Box<dyn Error>> {');
    } else {
      lines.push('async fn main() {');
    }

    // Build client
    if (parsed.insecure) {
      lines.push('    let client = reqwest::Client::builder()');
      lines.push('        .danger_accept_invalid_certs(true)');
      lines.push('        .build()?;');
    } else {
      lines.push('    let client = reqwest::Client::new();');
    }

    lines.push('');

    const method = parsed.method.toLowerCase();
    lines.push(`    let response = client.${method}("${parsed.url}")`);

    for (const [key, value] of Object.entries(parsed.headers)) {
      lines.push(`        .header("${key}", "${escapeQuote(value)}")`);
    }

    if (parsed.auth) {
      lines.push(`        .basic_auth("${escapeQuote(parsed.auth.username)}", Some("${escapeQuote(parsed.auth.password)}"))`);
    }

    if (parsed.cookies) {
      lines.push(`        .header("Cookie", "${escapeQuote(parsed.cookies)}")`);
    }

    if (parsed.body) {
      const isJson = isJsonContent(parsed);
      if (isJson) {
        lines.push(`        .body(r#"${parsed.body}"#)`);
      } else {
        lines.push(`        .body("${escapeQuote(parsed.body)}")`);
      }
    }

    if (parsed.formData) {
      lines.push('        .multipart(');
      lines.push('            reqwest::multipart::Form::new()');
      for (const field of parsed.formData) {
        if (field.isFile) {
          lines.push(`                .file("${field.name}", "${field.value}")?`);
        } else {
          lines.push(`                .text("${field.name}", "${escapeQuote(field.value)}")`);
        }
      }
      lines.push('        )');
    }

    if (errorHandling === 'try-catch') {
      lines.push('        .send()');
      lines.push('        .await?;');
      lines.push('');
      lines.push('    let body = response.text().await?;');
      lines.push('    println!("{}", body);');
      lines.push('');
      lines.push('    Ok(())');
    } else {
      lines.push('        .send()');
      lines.push('        .await');
      lines.push('        .unwrap();');
      lines.push('');
      lines.push('    let body = response.text().await.unwrap();');
      lines.push('    println!("{}", body);');
    }

    lines.push('}');

    return lines.join('\n');
  },
};

function isJsonContent(parsed: ParsedCurlCommand): boolean {
  const ct = parsed.headers['Content-Type'] || parsed.headers['content-type'] || '';
  return ct.includes('application/json');
}
