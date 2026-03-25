import yaml from 'js-yaml';

export interface JsonToYamlOptions {
  indent: 2 | 4 | 8;
  flowLevel: -1 | 2;
  forceQuotes: boolean;
  sortKeys: boolean;
}

export const DEFAULT_OPTIONS: JsonToYamlOptions = {
  indent: 2,
  flowLevel: -1,
  forceQuotes: false,
  sortKeys: false,
};

export interface ConversionOutput {
  yaml: string;
  error: string | null;
  duration: number;
}

export function convertJsonToYaml(
  jsonString: string,
  options: JsonToYamlOptions = DEFAULT_OPTIONS
): ConversionOutput {
  const start = performance.now();

  if (!jsonString.trim()) {
    return { yaml: '', error: null, duration: 0 };
  }

  try {
    const parsed = JSON.parse(jsonString);
    const result = yaml.dump(parsed, {
      indent: options.indent,
      flowLevel: options.flowLevel,
      forceQuotes: options.forceQuotes,
      sortKeys: options.sortKeys,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    });
    const duration = Math.round(performance.now() - start);
    return { yaml: result, error: null, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    const message =
      err instanceof SyntaxError
        ? `Invalid JSON: ${err.message}`
        : `Conversion error: ${String(err)}`;
    return { yaml: '', error: message, duration };
  }
}
