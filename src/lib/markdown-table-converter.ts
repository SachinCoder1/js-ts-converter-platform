export type InputFormat = 'auto' | 'markdown' | 'json' | 'csv';
export type DetectedFormat = 'markdown' | 'json' | 'csv';
export type JsonStyle = 'array-of-objects' | 'array-of-arrays' | 'nested';
export type CsvDelimiter = ',' | '\t' | ';' | '|';
export type MarkdownAlignment = 'left' | 'auto' | 'center';

export interface MarkdownTableOptions {
  inputFormat: InputFormat;
  jsonStyle: JsonStyle;
  csvDelimiter: CsvDelimiter;
  markdownAlignment: MarkdownAlignment;
  prettyPrint: boolean;
}

export const DEFAULT_OPTIONS: MarkdownTableOptions = {
  inputFormat: 'auto',
  jsonStyle: 'array-of-objects',
  csvDelimiter: ',',
  markdownAlignment: 'left',
  prettyPrint: true,
};

export interface ConversionOutput {
  output1: string;
  output2: string;
  output1Format: DetectedFormat;
  output2Format: DetectedFormat;
  detectedInput: DetectedFormat;
  error: string | null;
  duration: number;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

// ---- Format detection ----

export function detectFormat(input: string, forced: InputFormat): DetectedFormat {
  if (forced !== 'auto') return forced;
  const trimmed = input.trimStart();
  if (trimmed.startsWith('|')) return 'markdown';
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) return 'json';
  return 'csv';
}

// ---- Parsers ----

function parseMarkdownTable(input: string): TableData {
  const lines = input.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const trimmed = line.trim();
    const stripped = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
    const withoutTrailing = stripped.endsWith('|') ? stripped.slice(0, -1) : stripped;
    return withoutTrailing.split('|').map((cell) => cell.trim());
  };

  const isSeparator = (line: string): boolean =>
    /^\|?\s*[-:]+[-:\s|]*$/.test(line.trim());

  const headers = parseLine(lines[0]);
  const rows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    if (isSeparator(lines[i])) continue;
    const cells = parseLine(lines[i]);
    rows.push(padRow(cells, headers.length));
  }

  return { headers, rows };
}

function parseJson(input: string, style: JsonStyle): TableData {
  const parsed = JSON.parse(input);

  if (style === 'array-of-arrays') {
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { headers: [], rows: [] };
    }
    const headers = (parsed[0] as unknown[]).map(String);
    const rows = parsed.slice(1).map((row: unknown[]) =>
      padRow(row.map(String), headers.length)
    );
    return { headers, rows };
  }

  // array-of-objects or nested
  let objects: Record<string, unknown>[];

  if (style === 'nested' && !Array.isArray(parsed) && typeof parsed === 'object') {
    objects = [];
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'object' && item !== null) {
            objects.push(item as Record<string, unknown>);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        objects.push({ _group: key, ...(value as Record<string, unknown>) });
      }
    }
  } else {
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    objects = arr.filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null
    );
  }

  if (objects.length === 0) return { headers: [], rows: [] };

  const headerSet = new Set<string>();
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      headerSet.add(key);
    }
  }
  const headers = Array.from(headerSet);
  const rows = objects.map((obj) =>
    headers.map((h) => (obj[h] === undefined || obj[h] === null ? '' : String(obj[h])))
  );

  return { headers, rows };
}

function parseCsv(input: string, delimiter: CsvDelimiter): TableData {
  const rows = parseCsvRows(input, delimiter);
  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = rows[0];
  const dataRows = rows.slice(1).map((row) => padRow(row, headers.length));
  return { headers, rows: dataRows };
}

function parseCsvRows(input: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < input.length && input[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === delimiter) {
        current.push(field);
        field = '';
        i++;
      } else if (ch === '\r') {
        if (i + 1 < input.length && input[i + 1] === '\n') {
          i++;
        }
        current.push(field);
        field = '';
        if (current.some((c) => c.length > 0) || current.length > 1) {
          rows.push(current);
        }
        current = [];
        i++;
      } else if (ch === '\n') {
        current.push(field);
        field = '';
        if (current.some((c) => c.length > 0) || current.length > 1) {
          rows.push(current);
        }
        current = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Last field
  current.push(field);
  if (current.some((c) => c.length > 0) || current.length > 1) {
    rows.push(current);
  }

  return rows;
}

// ---- Serializers ----

function toMarkdownTable(headers: string[], rows: string[][], alignment: MarkdownAlignment): string {
  if (headers.length === 0) return '';

  const colWidths = headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      const cellLen = (row[i] || '').length;
      if (cellLen > max) max = cellLen;
    }
    return Math.max(max, 3);
  });

  const pad = (text: string, width: number) => text + ' '.repeat(Math.max(0, width - text.length));

  const headerLine =
    '| ' + headers.map((h, i) => pad(h, colWidths[i])).join(' | ') + ' |';

  const separatorLine =
    '| ' +
    colWidths
      .map((w) => {
        if (alignment === 'center') return ':' + '-'.repeat(Math.max(1, w - 2)) + ':';
        return '-'.repeat(w);
      })
      .join(' | ') +
    ' |';

  const dataLines = rows.map(
    (row) =>
      '| ' + headers.map((_, i) => pad(row[i] || '', colWidths[i])).join(' | ') + ' |'
  );

  return [headerLine, separatorLine, ...dataLines].join('\n');
}

function toJson(headers: string[], rows: string[][], style: JsonStyle, prettyPrint: boolean): string {
  if (headers.length === 0) return '[]';

  let data: unknown;

  if (style === 'array-of-arrays') {
    data = [headers, ...rows];
  } else if (style === 'nested') {
    const groupKey = headers[0];
    const groups: Record<string, Record<string, string>[]> = {};
    for (const row of rows) {
      const key = row[0] || 'default';
      if (!groups[key]) groups[key] = [];
      const obj: Record<string, string> = {};
      for (let i = 1; i < headers.length; i++) {
        obj[headers[i]] = row[i] || '';
      }
      groups[key].push(obj);
    }
    data = groups;
  } else {
    data = rows.map((row) => {
      const obj: Record<string, string> = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = row[i] || '';
      }
      return obj;
    });
  }

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

function toCsv(headers: string[], rows: string[][], delimiter: CsvDelimiter): string {
  if (headers.length === 0) return '';

  const escapeField = (field: string): string => {
    if (
      field.includes(delimiter) ||
      field.includes('"') ||
      field.includes('\n') ||
      field.includes('\r')
    ) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  };

  const lines = [headers.map(escapeField).join(delimiter)];
  for (const row of rows) {
    lines.push(
      headers.map((_, i) => escapeField(row[i] || '')).join(delimiter)
    );
  }

  return lines.join('\n');
}

// ---- Helpers ----

function padRow(row: string[], length: number): string[] {
  if (row.length >= length) return row.slice(0, length);
  return [...row, ...Array(length - row.length).fill('')];
}

function getOutputFormats(detected: DetectedFormat): [DetectedFormat, DetectedFormat] {
  switch (detected) {
    case 'markdown':
      return ['json', 'csv'];
    case 'json':
      return ['markdown', 'csv'];
    case 'csv':
      return ['markdown', 'json'];
  }
}

function serializeFormat(
  format: DetectedFormat,
  table: TableData,
  options: MarkdownTableOptions
): string {
  switch (format) {
    case 'markdown':
      return toMarkdownTable(table.headers, table.rows, options.markdownAlignment);
    case 'json':
      return toJson(table.headers, table.rows, options.jsonStyle, options.prettyPrint);
    case 'csv':
      return toCsv(table.headers, table.rows, options.csvDelimiter);
  }
}

// ---- Main conversion ----

export function convertMarkdownTable(
  input: string,
  options: MarkdownTableOptions = DEFAULT_OPTIONS
): ConversionOutput {
  const start = performance.now();

  if (!input.trim()) {
    return {
      output1: '',
      output2: '',
      output1Format: 'json',
      output2Format: 'csv',
      detectedInput: 'markdown',
      error: null,
      duration: 0,
    };
  }

  try {
    const detected = detectFormat(input, options.inputFormat);
    const [fmt1, fmt2] = getOutputFormats(detected);

    let table: TableData;
    switch (detected) {
      case 'markdown':
        table = parseMarkdownTable(input);
        break;
      case 'json':
        table = parseJson(input, options.jsonStyle);
        break;
      case 'csv':
        table = parseCsv(input, options.csvDelimiter);
        break;
    }

    if (table.headers.length === 0) {
      const duration = Math.round(performance.now() - start);
      return {
        output1: '',
        output2: '',
        output1Format: fmt1,
        output2Format: fmt2,
        detectedInput: detected,
        error: 'No table data found in input',
        duration,
      };
    }

    const output1 = serializeFormat(fmt1, table, options);
    const output2 = serializeFormat(fmt2, table, options);
    const duration = Math.round(performance.now() - start);

    return {
      output1,
      output2,
      output1Format: fmt1,
      output2Format: fmt2,
      detectedInput: detected,
      error: null,
      duration,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    const detected = detectFormat(input, options.inputFormat);
    const [fmt1, fmt2] = getOutputFormats(detected);
    const message =
      err instanceof SyntaxError
        ? `Invalid ${detected.toUpperCase()}: ${err.message}`
        : `Conversion error: ${String(err)}`;
    return {
      output1: '',
      output2: '',
      output1Format: fmt1,
      output2Format: fmt2,
      detectedInput: detected,
      error: message,
      duration,
    };
  }
}
