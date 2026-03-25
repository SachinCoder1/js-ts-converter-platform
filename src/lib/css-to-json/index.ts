export interface CssToJsonOptions {
  keyFormat: 'camelCase' | 'kebab-case';
  numericValues: 'strings' | 'numbers';
  wrapper: 'none' | 'stylesheet' | 'css';
}

export interface CssToJsonResult {
  json: string;
  ruleCount: number;
  propertyCount: number;
  duration: number;
  errors: string[];
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function toCamelCase(prop: string): string {
  // Handle vendor prefixes: -webkit-transform -> WebkitTransform
  const withoutLeadingDash = prop.startsWith('-')
    ? prop.slice(1)
    : prop;
  return withoutLeadingDash.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parseValue(
  value: string,
  numericValues: 'strings' | 'numbers'
): string | number {
  const trimmed = value.trim();
  if (numericValues === 'numbers') {
    const match = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (match) return Number(match[1]);
  }
  return trimmed;
}

interface ParsedDeclaration {
  property: string;
  value: string | number;
}

function parseDeclarations(
  block: string,
  options: CssToJsonOptions
): { declarations: ParsedDeclaration[]; count: number } {
  const declarations: ParsedDeclaration[] = [];
  // Split by semicolons but respect url() and quotes
  const parts = block.split(';').filter((p) => p.trim());

  for (const part of parts) {
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue;

    const rawProp = part.slice(0, colonIndex).trim();
    const rawValue = part.slice(colonIndex + 1).trim();

    if (!rawProp || !rawValue) continue;

    const property =
      options.keyFormat === 'camelCase' ? toCamelCase(rawProp) : rawProp;
    const value = parseValue(rawValue, options.numericValues);

    declarations.push({ property, value });
  }

  return { declarations, count: declarations.length };
}

interface CssBlock {
  selector: string;
  body: string;
  children: CssBlock[];
}

function tokenizeBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  let i = 0;

  while (i < css.length) {
    // Skip whitespace
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;

    // Find the opening brace
    const braceStart = css.indexOf('{', i);
    if (braceStart === -1) break;

    const selector = css.slice(i, braceStart).trim();
    if (!selector) {
      i = braceStart + 1;
      continue;
    }

    // Find matching closing brace
    let depth = 1;
    let j = braceStart + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      if (css[j] === '}') depth--;
      j++;
    }

    const body = css.slice(braceStart + 1, j - 1).trim();

    // Check if this is an at-rule with nested blocks
    if (selector.startsWith('@') && body.includes('{')) {
      const children = tokenizeBlocks(body);
      blocks.push({ selector, body: '', children });
    } else {
      blocks.push({ selector, body, children: [] });
    }

    i = j;
  }

  return blocks;
}

function buildJsonObject(
  blocks: CssBlock[],
  options: CssToJsonOptions
): { obj: Record<string, unknown>; ruleCount: number; propertyCount: number } {
  const obj: Record<string, unknown> = {};
  let ruleCount = 0;
  let propertyCount = 0;

  for (const block of blocks) {
    if (block.children.length > 0) {
      // Nested at-rule (e.g. @media, @supports, @keyframes)
      const nested = buildJsonObject(block.children, options);
      obj[block.selector] = nested.obj;
      ruleCount += nested.ruleCount;
      propertyCount += nested.propertyCount;
    } else {
      const { declarations, count } = parseDeclarations(block.body, options);
      const ruleObj: Record<string, string | number> = {};
      for (const decl of declarations) {
        ruleObj[decl.property] = decl.value;
      }
      obj[block.selector] = ruleObj;
      ruleCount++;
      propertyCount += count;
    }
  }

  return { obj, ruleCount, propertyCount };
}

function wrapOutput(json: string, wrapper: CssToJsonOptions['wrapper']): string {
  switch (wrapper) {
    case 'stylesheet':
      return `const styles = StyleSheet.create(${json});`;
    case 'css':
      return `const styles = css(${json});`;
    default:
      return json;
  }
}

export function cssToJson(cssText: string, options: CssToJsonOptions): CssToJsonResult {
  const start = performance.now();
  const errors: string[] = [];

  if (!cssText.trim()) {
    return {
      json: '',
      ruleCount: 0,
      propertyCount: 0,
      duration: Math.round(performance.now() - start),
      errors: [],
    };
  }

  try {
    const cleaned = stripComments(cssText);

    // Validate basic brace matching
    const openCount = (cleaned.match(/{/g) || []).length;
    const closeCount = (cleaned.match(/}/g) || []).length;
    if (openCount !== closeCount) {
      errors.push(`Mismatched braces: ${openCount} opening, ${closeCount} closing`);
    }

    const blocks = tokenizeBlocks(cleaned);
    const { obj, ruleCount, propertyCount } = buildJsonObject(blocks, options);

    const jsonStr = JSON.stringify(obj, null, 2);
    const output = wrapOutput(jsonStr, options.wrapper);

    return {
      json: output,
      ruleCount,
      propertyCount,
      duration: Math.round(performance.now() - start),
      errors,
    };
  } catch (err) {
    return {
      json: '',
      ruleCount: 0,
      propertyCount: 0,
      duration: Math.round(performance.now() - start),
      errors: [err instanceof Error ? err.message : 'Unknown parsing error'],
    };
  }
}
