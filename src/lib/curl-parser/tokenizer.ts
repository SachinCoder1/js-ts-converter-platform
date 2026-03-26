/**
 * Shell tokenizer that handles single/double quotes, backslash-newline
 * continuations, and escaped characters. Returns an argv-style string array.
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    // Backslash-newline continuation (join lines)
    if (ch === '\\' && i + 1 < len && input[i + 1] === '\n') {
      i += 2;
      continue;
    }
    // Also handle \r\n
    if (ch === '\\' && i + 2 < len && input[i + 1] === '\r' && input[i + 2] === '\n') {
      i += 3;
      continue;
    }

    // Whitespace outside quotes → emit token
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    // Single-quoted string
    if (ch === "'") {
      i++; // skip opening quote
      while (i < len && input[i] !== "'") {
        current += input[i];
        i++;
      }
      i++; // skip closing quote
      continue;
    }

    // Double-quoted string
    if (ch === '"') {
      i++; // skip opening quote
      while (i < len && input[i] !== '"') {
        if (input[i] === '\\' && i + 1 < len) {
          const next = input[i + 1];
          if (next === '"' || next === '\\' || next === '$' || next === '`') {
            current += next;
            i += 2;
            continue;
          }
        }
        current += input[i];
        i++;
      }
      i++; // skip closing quote
      continue;
    }

    // Unquoted backslash escape
    if (ch === '\\' && i + 1 < len) {
      current += input[i + 1];
      i += 2;
      continue;
    }

    // Regular character
    current += ch;
    i++;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}
