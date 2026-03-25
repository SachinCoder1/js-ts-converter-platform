export type JsxOutputFormat = 'jsx' | 'tsx';

export type ComponentWrapper = 'none' | 'function' | 'arrow';

export type QuoteStyle = 'double' | 'single';

export interface HtmlToJsxOptions {
  outputFormat: JsxOutputFormat;
  componentWrapper: ComponentWrapper;
  selfClosingStyle: 'always' | 'original';
  quoteStyle: QuoteStyle;
}

export interface HtmlToJsxResult {
  code: string;
  warnings: string[];
  stats: HtmlToJsxStats;
}

export interface HtmlToJsxStats {
  attributesConverted: number;
  stylesConverted: number;
  commentsConverted: number;
  selfClosingTagsFixed: number;
  svgAttributesConverted: number;
}
