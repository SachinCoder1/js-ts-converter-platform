import yaml from 'js-yaml';

export interface YamlToJsonOptions {
  indent: 2 | 4 | 'tab' | 'minified';
  multiDocument: 'array' | 'separate';
  sortKeys: boolean;
}

export const DEFAULT_YAML_TO_JSON_OPTIONS: YamlToJsonOptions = {
  indent: 2,
  multiDocument: 'array',
  sortKeys: false,
};

export interface YamlToJsonOutput {
  json: string;
  error: string | null;
  duration: number;
  documentCount: number;
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

const MAX_YAML_DEPTH = 20;

export function checkYamlDepth(obj: unknown, currentDepth: number = 0): boolean {
  if (currentDepth > MAX_YAML_DEPTH) return false;
  if (Array.isArray(obj)) {
    return obj.every(item => checkYamlDepth(item, currentDepth + 1));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.values(obj as Record<string, unknown>).every(
      val => checkYamlDepth(val, currentDepth + 1)
    );
  }
  return true;
}

function getIndent(indent: YamlToJsonOptions['indent']): string | number | undefined {
  if (indent === 'tab') return '\t';
  if (indent === 'minified') return undefined;
  return indent;
}

export function convertYamlToJson(
  yamlString: string,
  options: YamlToJsonOptions = DEFAULT_YAML_TO_JSON_OPTIONS
): YamlToJsonOutput {
  const start = performance.now();

  if (!yamlString.trim()) {
    return { json: '', error: null, duration: 0, documentCount: 0 };
  }

  try {
    const documents: unknown[] = [];
    yaml.loadAll(yamlString, (doc) => {
      documents.push(doc);
    });

    // Check for YAML bombs (excessive nesting)
    for (const doc of documents) {
      if (!checkYamlDepth(doc)) {
        return {
          json: '',
          error: 'YAML exceeds maximum nesting depth of 20 levels',
          duration: Math.round(performance.now() - start),
          documentCount: 0,
        };
      }
    }

    const indent = getIndent(options.indent);
    const documentCount = documents.length;

    if (documentCount === 0) {
      return { json: '', error: null, duration: 0, documentCount: 0 };
    }

    let result: string;

    if (documentCount === 1) {
      const data = options.sortKeys ? sortObjectKeys(documents[0]) : documents[0];
      result = JSON.stringify(data, null, indent);
    } else if (options.multiDocument === 'array') {
      const data = options.sortKeys
        ? documents.map(sortObjectKeys)
        : documents;
      result = JSON.stringify(data, null, indent);
    } else {
      // 'separate' mode  each document as its own JSON block
      result = documents
        .map((doc) => {
          const data = options.sortKeys ? sortObjectKeys(doc) : doc;
          return JSON.stringify(data, null, indent);
        })
        .join('\n\n');
    }

    const duration = Math.round(performance.now() - start);
    return { json: result, error: null, duration, documentCount };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    if (err instanceof yaml.YAMLException) {
      const mark = err.mark;
      const lineInfo = mark ? ` (line ${mark.line + 1}, column ${mark.column + 1})` : '';
      return { json: '', error: `Invalid YAML${lineInfo}: ${err.reason}`, duration, documentCount: 0 };
    }
    return { json: '', error: `Conversion error: ${String(err)}`, duration, documentCount: 0 };
  }
}
