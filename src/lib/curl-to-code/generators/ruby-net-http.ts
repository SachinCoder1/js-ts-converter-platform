import type { ParsedCurlCommand } from '@/lib/curl-parser/types';
import type { CodeGenerator, CodeGeneratorOptions } from './index';
import { escapeQuote } from './helpers';

export const rubyNetHttpGenerator: CodeGenerator = {
  language: 'ruby',
  fileExtension: 'rb',
  fileType: 'RB',
  label: 'Ruby',

  generate(parsed: ParsedCurlCommand, options: CodeGeneratorOptions): string {
    const { errorHandling } = options;
    const lines: string[] = [];

    lines.push("require 'net/http'");
    lines.push("require 'uri'");
    lines.push("require 'json'");
    lines.push('');

    lines.push(`uri = URI.parse('${escapeQuote(parsed.url)}')`);
    lines.push('http = Net::HTTP.new(uri.host, uri.port)');

    if (parsed.url.startsWith('https')) {
      lines.push('http.use_ssl = true');
      if (parsed.insecure) {
        lines.push('http.verify_mode = OpenSSL::SSL::VERIFY_NONE');
      }
    }

    lines.push('');

    const methodClass = getMethodClass(parsed.method);
    lines.push(`request = Net::HTTP::${methodClass}.new(uri.request_uri)`);

    for (const [key, value] of Object.entries(parsed.headers)) {
      lines.push(`request['${key}'] = '${escapeQuote(value)}'`);
    }

    if (parsed.auth) {
      lines.push(`request.basic_auth('${escapeQuote(parsed.auth.username)}', '${escapeQuote(parsed.auth.password)}')`);
    }

    if (parsed.cookies) {
      lines.push(`request['Cookie'] = '${escapeQuote(parsed.cookies)}'`);
    }

    if (parsed.body) {
      const isJson = isJsonContent(parsed);
      if (isJson) {
        lines.push(`request.body = '${escapeQuote(parsed.body)}'`);
      } else {
        lines.push(`request.body = '${escapeQuote(parsed.body)}'`);
      }
    }

    if (parsed.formData) {
      lines.push('# Note: For multipart form data, consider using a gem like multipart-post');
      for (const field of parsed.formData) {
        if (field.isFile) {
          lines.push(`# File upload: ${field.name} => ${field.value}`);
        } else {
          lines.push(`request.set_form_data('${field.name}' => '${escapeQuote(field.value)}')`);
        }
      }
    }

    lines.push('');

    if (errorHandling === 'try-catch') {
      lines.push('begin');
      lines.push('  response = http.request(request)');
      lines.push('  puts response.body');
      lines.push('rescue StandardError => e');
      lines.push('  puts "Error: #{e.message}"');
      lines.push('end');
    } else {
      lines.push('response = http.request(request)');
      lines.push('puts response.body');
    }

    return lines.join('\n');
  },
};

function getMethodClass(method: string): string {
  const map: Record<string, string> = {
    GET: 'Get',
    POST: 'Post',
    PUT: 'Put',
    DELETE: 'Delete',
    PATCH: 'Patch',
    HEAD: 'Head',
    OPTIONS: 'Options',
  };
  return map[method] || 'Get';
}

function isJsonContent(parsed: ParsedCurlCommand): boolean {
  const ct = parsed.headers['Content-Type'] || parsed.headers['content-type'] || '';
  return ct.includes('application/json');
}
