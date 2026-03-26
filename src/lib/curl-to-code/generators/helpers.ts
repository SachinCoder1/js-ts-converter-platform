export function buildHeadersObject(headers: Record<string, string>, auth: { username: string; password: string } | null): string {
  const entries = Object.entries(headers);
  if (entries.length === 0) return '{}';

  const lines = entries.map(([key, value]) => {
    if (auth && key === 'Authorization') {
      return `  'Authorization': \`Basic \${btoa('${auth.username}:${auth.password}')}\``;
    }
    return `  '${key}': '${escapeQuote(value)}'`;
  });

  return `{\n${lines.join(',\n')}\n}`;
}

export function escapeQuote(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => line ? pad + line : line).join('\n');
}

export function tryParseJson(body: string): unknown | null {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export function formatJsonIndented(obj: unknown, indentLevel: number = 2): string {
  return JSON.stringify(obj, null, indentLevel);
}
