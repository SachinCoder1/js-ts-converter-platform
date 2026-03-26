import { tokenize } from './tokenizer';
import type { ParsedCurlCommand } from './types';

export type { ParsedCurlCommand } from './types';

export function parseCurl(input: string): ParsedCurlCommand {
  const argv = tokenize(input.trim());

  const result: ParsedCurlCommand = {
    url: '',
    method: '',
    headers: {},
    body: null,
    bodyType: null,
    auth: null,
    cookies: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    output: null,
    formData: null,
  };

  // Strip leading 'curl' if present
  let start = 0;
  if (argv.length > 0 && argv[0].toLowerCase() === 'curl') {
    start = 1;
  }

  let hasExplicitMethod = false;
  let hasBody = false;

  for (let i = start; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '-X':
      case '--request': {
        const val = argv[++i];
        if (val) {
          result.method = val.toUpperCase();
          hasExplicitMethod = true;
        }
        break;
      }

      case '-H':
      case '--header': {
        const val = argv[++i];
        if (val) {
          const colonIdx = val.indexOf(':');
          if (colonIdx > 0) {
            const key = val.slice(0, colonIdx).trim();
            const value = val.slice(colonIdx + 1).trim();
            result.headers[key] = value;
          }
        }
        break;
      }

      case '-d':
      case '--data':
      case '--data-raw': {
        const val = argv[++i];
        if (val !== undefined) {
          result.body = val;
          result.bodyType = 'raw';
          hasBody = true;
        }
        break;
      }

      case '--data-binary': {
        const val = argv[++i];
        if (val !== undefined) {
          result.body = val;
          result.bodyType = 'binary';
          hasBody = true;
        }
        break;
      }

      case '--data-urlencode': {
        const val = argv[++i];
        if (val !== undefined) {
          if (result.body && result.bodyType === 'form-urlencoded') {
            result.body += '&' + val;
          } else {
            result.body = val;
          }
          result.bodyType = 'form-urlencoded';
          hasBody = true;
        }
        break;
      }

      case '-u':
      case '--user': {
        const val = argv[++i];
        if (val) {
          const colonIdx = val.indexOf(':');
          if (colonIdx >= 0) {
            result.auth = {
              username: val.slice(0, colonIdx),
              password: val.slice(colonIdx + 1),
            };
          } else {
            result.auth = { username: val, password: '' };
          }
        }
        break;
      }

      case '-b':
      case '--cookie': {
        const val = argv[++i];
        if (val) {
          result.cookies = val;
        }
        break;
      }

      case '-k':
      case '--insecure':
        result.insecure = true;
        break;

      case '-L':
      case '--location':
        result.followRedirects = true;
        break;

      case '--compressed':
        result.compressed = true;
        break;

      case '-F':
      case '--form': {
        const val = argv[++i];
        if (val) {
          if (!result.formData) result.formData = [];
          const eqIdx = val.indexOf('=');
          if (eqIdx >= 0) {
            const name = val.slice(0, eqIdx);
            const value = val.slice(eqIdx + 1);
            const isFile = value.startsWith('@');
            result.formData.push({
              name,
              value: isFile ? value.slice(1) : value,
              isFile,
            });
          }
          result.bodyType = 'multipart';
          hasBody = true;
        }
        break;
      }

      case '-o':
      case '--output': {
        const val = argv[++i];
        if (val) {
          result.output = val;
        }
        break;
      }

      default: {
        // Treat non-flag arguments as the URL
        if (!arg.startsWith('-') && !result.url) {
          result.url = arg;
        }
        break;
      }
    }
  }

  // Default method
  if (!hasExplicitMethod) {
    result.method = hasBody ? 'POST' : 'GET';
  }

  // If compressed, ensure Accept-Encoding is present
  if (result.compressed && !result.headers['Accept-Encoding']) {
    result.headers['Accept-Encoding'] = 'gzip, deflate, br';
  }

  return result;
}
