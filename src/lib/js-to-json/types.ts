export type IndentOption = '2' | '4' | 'tab' | 'minified';
export type UndefinedHandling = 'remove' | 'null';
export type SortKeys = 'off' | 'alphabetical';

export interface JsToJsonOptions {
  indent: IndentOption;
  undefinedHandling: UndefinedHandling;
  sortKeys: SortKeys;
}

export interface JsToJsonResult {
  json: string;
  error: string | null;
  errorLine: number | null;
  stats: {
    keysRemoved: number;
    commentsStripped: number;
    specialValuesConverted: number;
  };
  duration: number;
}
