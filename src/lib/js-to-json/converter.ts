import type { JsToJsonOptions, JsToJsonResult } from './types';

interface Stats {
  keysRemoved: number;
  commentsStripped: number;
  specialValuesConverted: number;
}

const enum CharState {
  Normal,
  SingleQuoteString,
  DoubleQuoteString,
  TemplateLiteral,
  LineComment,
  BlockComment,
}

/**
 * Strip single-line (//) and multi-line comments,
 * respecting string boundaries.
 */
function stripComments(text: string, stats: Stats): string {
  let result = '';
  let state: CharState = CharState.Normal;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    switch (state) {
      case CharState.Normal:
        if (ch === '/' && next === '/') {
          state = CharState.LineComment;
          stats.commentsStripped++;
          i += 2;
        } else if (ch === '/' && next === '*') {
          state = CharState.BlockComment;
          stats.commentsStripped++;
          i += 2;
        } else if (ch === "'") {
          state = CharState.SingleQuoteString;
          result += ch;
          i++;
        } else if (ch === '"') {
          state = CharState.DoubleQuoteString;
          result += ch;
          i++;
        } else if (ch === '`') {
          state = CharState.TemplateLiteral;
          result += ch;
          i++;
        } else {
          result += ch;
          i++;
        }
        break;

      case CharState.SingleQuoteString:
        if (ch === '\\') {
          result += ch + (next || '');
          i += 2;
        } else if (ch === "'") {
          state = CharState.Normal;
          result += ch;
          i++;
        } else {
          result += ch;
          i++;
        }
        break;

      case CharState.DoubleQuoteString:
        if (ch === '\\') {
          result += ch + (next || '');
          i += 2;
        } else if (ch === '"') {
          state = CharState.Normal;
          result += ch;
          i++;
        } else {
          result += ch;
          i++;
        }
        break;

      case CharState.TemplateLiteral:
        if (ch === '\\') {
          result += ch + (next || '');
          i += 2;
        } else if (ch === '`') {
          state = CharState.Normal;
          result += ch;
          i++;
        } else {
          result += ch;
          i++;
        }
        break;

      case CharState.LineComment:
        if (ch === '\n') {
          state = CharState.Normal;
          result += '\n';
          i++;
        } else {
          i++;
        }
        break;

      case CharState.BlockComment:
        if (ch === '*' && next === '/') {
          state = CharState.Normal;
          i += 2;
        } else {
          if (ch === '\n') result += '\n';
          i++;
        }
        break;
    }
  }

  return result;
}

/**
 * Remove function values: `key: function(...) {...}` and `key: (...) => ...`
 * Also handles method shorthand: `key(...) {...}`
 */
function removeFunctionValues(text: string, stats: Stats): string {
  // Remove arrow functions with block body: key: (...) => { ... }
  // Remove regular functions: key: function(...) { ... }
  // Remove method shorthand: key(...) { ... }

  let result = text;

  // Pattern: key: function(...) { ... }
  // We need brace counting for the function body
  result = removeFuncPattern(
    result,
    /([a-zA-Z_$][\w$]*\s*:\s*)function\s*\([^)]*\)\s*\{/g,
    stats
  );

  // Pattern: key: (...) => { ... }
  result = removeFuncPattern(
    result,
    /([a-zA-Z_$][\w$]*\s*:\s*)\([^)]*\)\s*=>\s*\{/g,
    stats
  );

  // Pattern: key: () => expression, (arrow without braces - match to next comma or closing brace)
  result = result.replace(
    /([a-zA-Z_$][\w$]*\s*:\s*)\([^)]*\)\s*=>\s*[^,}\n]+[,]?[ \t]*/g,
    (match) => {
      stats.keysRemoved++;
      // Check if the match ends with a comma
      return '';
    }
  );

  // Clean up empty lines left behind
  result = result.replace(/^\s*\n/gm, '');

  return result;
}

function removeFuncPattern(text: string, pattern: RegExp, stats: Stats): string {
  let result = text;
  let match: RegExpExecArray | null;

  // Reset lastIndex
  pattern.lastIndex = 0;

  while ((match = pattern.exec(result)) !== null) {
    const startOfLine = result.lastIndexOf('\n', match.index) + 1;
    const braceStart = result.indexOf('{', match.index + match[0].length - 1);

    if (braceStart === -1) continue;

    let depth = 1;
    let j = braceStart + 1;
    while (j < result.length && depth > 0) {
      if (result[j] === '{') depth++;
      if (result[j] === '}') depth--;
      j++;
    }

    // Skip trailing comma and whitespace
    while (j < result.length && /[\s,]/.test(result[j])) j++;

    result = result.slice(0, startOfLine) + result.slice(j);
    stats.keysRemoved++;

    // Reset pattern to search from beginning since we modified the string
    pattern.lastIndex = 0;
  }

  return result;
}

/**
 * Handle `undefined` values based on user option.
 */
function handleUndefined(
  text: string,
  mode: 'remove' | 'null',
  stats: Stats
): string {
  if (mode === 'null') {
    return text.replace(
      /\bundefined\b/g,
      () => {
        stats.specialValuesConverted++;
        return 'null';
      }
    );
  }

  // Remove mode: remove the entire key-value pair
  const result = text.replace(
    /^\s*[a-zA-Z_$][\w$]*\s*:\s*undefined\s*,?[ \t]*\n?/gm,
    () => {
      stats.keysRemoved++;
      return '';
    }
  );

  // Also handle quoted keys with undefined
  return result.replace(
    /^\s*["'][a-zA-Z_$][\w$]*["']\s*:\s*undefined\s*,?[ \t]*\n?/gm,
    () => {
      stats.keysRemoved++;
      return '';
    }
  );
}

/**
 * Handle special JS values: Infinity, NaN, new Date(), RegExp literals.
 */
function handleSpecialValues(text: string, stats: Stats): string {
  let result = text;

  // Infinity, -Infinity, NaN -> null
  result = result.replace(
    /(?<![a-zA-Z_$])(-?Infinity|NaN)(?![a-zA-Z_$])/g,
    () => {
      stats.specialValuesConverted++;
      return 'null';
    }
  );

  // new Date('...') or new Date("...") -> ISO string
  result = result.replace(
    /new\s+Date\(\s*['"]([^'"]*)['"]\s*\)/g,
    (_, dateStr) => {
      stats.specialValuesConverted++;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'null';
        return `"${d.toISOString()}"`;
      } catch {
        return 'null';
      }
    }
  );

  // new Date() with no args -> null
  result = result.replace(
    /new\s+Date\(\s*\)/g,
    () => {
      stats.specialValuesConverted++;
      return 'null';
    }
  );

  // new Date(number) -> ISO string
  result = result.replace(
    /new\s+Date\(\s*(\d+)\s*\)/g,
    (_, ts) => {
      stats.specialValuesConverted++;
      try {
        const d = new Date(Number(ts));
        if (isNaN(d.getTime())) return 'null';
        return `"${d.toISOString()}"`;
      } catch {
        return 'null';
      }
    }
  );

  // RegExp literals /pattern/flags -> string representation
  // Be careful not to match division operators
  result = result.replace(
    /:\s*(\/(?:[^/\\]|\\.)+\/[gimsuy]*)/g,
    (fullMatch, regexpLiteral: string) => {
      stats.specialValuesConverted++;
      // Escape the regexp string for JSON
      const escaped = regexpLiteral.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `: "${escaped}"`;
    }
  );

  return result;
}

/**
 * Convert template literals `...` to double-quoted strings "..."
 */
function convertTemplateLiterals(text: string): string {
  let result = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '`') {
      // Collect the template literal content
      i++;
      let content = '';
      while (i < text.length && text[i] !== '`') {
        if (text[i] === '\\') {
          content += text[i] + (text[i + 1] || '');
          i += 2;
        } else {
          content += text[i];
          i++;
        }
      }
      i++; // skip closing backtick

      // Escape double quotes inside and convert newlines
      content = content.replace(/"/g, '\\"');
      content = content.replace(/\n/g, '\\n');
      result += `"${content}"`;
    } else {
      result += text[i];
      i++;
    }
  }

  return result;
}

/**
 * Replace single-quoted strings with double-quoted strings.
 * Uses state tracking to avoid corrupting already double-quoted strings.
 */
function replaceSingleQuotes(text: string): string {
  let result = '';
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '"') {
      // Already a double-quoted string — pass through
      result += ch;
      i++;
      while (i < text.length) {
        if (text[i] === '\\') {
          result += text[i] + (text[i + 1] || '');
          i += 2;
        } else if (text[i] === '"') {
          result += text[i];
          i++;
          break;
        } else {
          result += text[i];
          i++;
        }
      }
    } else if (ch === "'") {
      // Single-quoted string — convert to double quotes
      result += '"';
      i++;
      while (i < text.length) {
        if (text[i] === '\\') {
          if (text[i + 1] === "'") {
            // Escaped single quote -> just single quote
            result += "'";
            i += 2;
          } else {
            result += text[i] + (text[i + 1] || '');
            i += 2;
          }
        } else if (text[i] === '"') {
          // Unescaped double quote inside single-quoted string -> escape it
          result += '\\"';
          i++;
        } else if (text[i] === "'") {
          result += '"';
          i++;
          break;
        } else {
          result += text[i];
          i++;
        }
      }
    } else {
      result += ch;
      i++;
    }
  }

  return result;
}

/**
 * Add double quotes around unquoted property keys.
 */
function quoteUnquotedKeys(text: string): string {
  // Match unquoted keys: identifier followed by colon
  // Negative lookbehind for quote ensures we don't re-quote
  return text.replace(
    /([\{,\[\n]\s*)([a-zA-Z_$][\w$]*)(\s*:)/g,
    '$1"$2"$3'
  );
}

/**
 * Remove trailing commas before } and ]
 */
function removeTrailingCommas(text: string): string {
  return text.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Recursively sort object keys alphabetically.
 */
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

function getIndentValue(option: string): string | number {
  switch (option) {
    case '4': return 4;
    case 'tab': return '\t';
    case 'minified': return 0;
    default: return 2;
  }
}

function extractErrorLine(message: string): number | null {
  // JSON.parse errors often include position info
  const posMatch = message.match(/position\s+(\d+)/i);
  if (posMatch) return null; // Position, not line
  const lineMatch = message.match(/line\s+(\d+)/i);
  if (lineMatch) return Number(lineMatch[1]);
  return null;
}

export function convertJsObjectToJson(
  input: string,
  options: JsToJsonOptions
): JsToJsonResult {
  const startTime = performance.now();
  const stats: Stats = {
    keysRemoved: 0,
    commentsStripped: 0,
    specialValuesConverted: 0,
  };

  try {
    let text = input.trim();

    if (!text) {
      return {
        json: '',
        error: null,
        errorLine: null,
        stats,
        duration: 0,
      };
    }

    // 1. Strip comments
    text = stripComments(text, stats);

    // 2. Remove function values
    text = removeFunctionValues(text, stats);

    // 3. Handle undefined values
    text = handleUndefined(text, options.undefinedHandling, stats);

    // 4. Handle special values (Infinity, NaN, Date, RegExp)
    text = handleSpecialValues(text, stats);

    // 5. Convert template literals to regular strings
    text = convertTemplateLiterals(text);

    // 6. Replace single quotes with double quotes
    text = replaceSingleQuotes(text);

    // 7. Quote unquoted property keys
    text = quoteUnquotedKeys(text);

    // 8. Remove trailing commas
    text = removeTrailingCommas(text);

    // 9. Wrap in brackets if not already an array or object
    text = text.trim();
    if (!text.startsWith('{') && !text.startsWith('[')) {
      text = '{' + text + '}';
    }

    // 10. Parse to validate
    const parsed = JSON.parse(text);

    // 11. Sort keys if requested
    const output = options.sortKeys === 'alphabetical'
      ? sortObjectKeys(parsed)
      : parsed;

    // 12. Stringify with chosen indent
    const indent = getIndentValue(options.indent);
    const json = options.indent === 'minified'
      ? JSON.stringify(output)
      : JSON.stringify(output, null, indent);

    return {
      json,
      error: null,
      errorLine: null,
      stats,
      duration: Math.round(performance.now() - startTime),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      json: '',
      error: `Invalid JavaScript object: ${message}`,
      errorLine: extractErrorLine(message),
      stats,
      duration: Math.round(performance.now() - startTime),
    };
  }
}
