import type { CssToTailwindOptions, CssToTailwindStats } from '../../types';
import { mapProperty, BREAKPOINT_MAP, PSEUDO_MAP } from './property-map';

interface CssRule {
  selector: string;
  declarations: Array<{ property: string; value: string }>;
  mediaQuery?: string;
  pseudoClass?: string;
}

export function cssToTailwindAst(
  css: string,
  options: CssToTailwindOptions,
): { code: string; stats: CssToTailwindStats } {
  const stats: CssToTailwindStats = {
    rulesProcessed: 0,
    classesGenerated: 0,
    arbitraryValuesUsed: 0,
    unmappedProperties: 0,
  };

  const rules = parseCss(css);
  const selectorMap = new Map<string, string[]>();

  for (const rule of rules) {
    stats.rulesProcessed++;
    const classes: string[] = [];

    for (const decl of rule.declarations) {
      const mapped = mapProperty(decl.property, decl.value);

      if (mapped === null) {
        stats.unmappedProperties++;
        if (options.arbitraryValues === 'allow') {
          const arb = `[${decl.property}:${decl.value.replace(/\s+/g, '_')}]`;
          classes.push(arb);
          stats.arbitraryValuesUsed++;
          stats.classesGenerated++;
        }
        continue;
      }

      // Multiple classes from shorthand (e.g., py-4 px-6)
      const parts = mapped.split(' ').filter(Boolean);
      for (let cls of parts) {
        if (cls.includes('[')) stats.arbitraryValuesUsed++;

        // Add prefix
        if (options.prefix) cls = `${options.prefix}${cls}`;

        // Add responsive prefix
        if (rule.mediaQuery) {
          const bp = findBreakpoint(rule.mediaQuery);
          if (bp) cls = `${bp}:${cls}`;
        }

        // Add pseudo-class prefix
        if (rule.pseudoClass) {
          const pseudo = PSEUDO_MAP[rule.pseudoClass];
          if (pseudo) cls = `${pseudo}:${cls}`;
        }

        classes.push(cls);
        stats.classesGenerated++;
      }
    }

    if (classes.length > 0) {
      const baseSelector = rule.selector.replace(/:[a-z-]+$/g, '').trim();
      const existing = selectorMap.get(baseSelector) || [];
      selectorMap.set(baseSelector, [...existing, ...classes]);
    }
  }

  const output = formatOutput(selectorMap, options);
  return { code: output, stats };
}

function parseCss(css: string): CssRule[] {
  const rules: CssRule[] = [];
  let currentCss = css;

  // Handle media queries
  const mediaRegex = /@media\s*\(([^)]+)\)\s*\{([\s\S]*?)\}/g;
  let mediaMatch;

  while ((mediaMatch = mediaRegex.exec(css)) !== null) {
    const mediaQuery = mediaMatch[1].trim();
    const mediaBody = mediaMatch[2];
    const innerRules = parseRuleBlock(mediaBody);
    for (const rule of innerRules) {
      rule.mediaQuery = mediaQuery;
      rules.push(rule);
    }
    currentCss = currentCss.replace(mediaMatch[0], '');
  }

  // Parse remaining top-level rules
  const topRules = parseRuleBlock(currentCss);
  rules.push(...topRules);

  return rules;
}

function parseRuleBlock(block: string): CssRule[] {
  const rules: CssRule[] = [];
  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let match;

  while ((match = ruleRegex.exec(block)) !== null) {
    const rawSelector = match[1].trim();
    const declarationsStr = match[2].trim();

    if (rawSelector.startsWith('@')) continue; // Skip nested at-rules

    const declarations = declarationsStr
      .split(';')
      .map(d => d.trim())
      .filter(Boolean)
      .map(d => {
        const colonIdx = d.indexOf(':');
        if (colonIdx === -1) return null;
        return {
          property: d.slice(0, colonIdx).trim(),
          value: d.slice(colonIdx + 1).trim(),
        };
      })
      .filter((d): d is { property: string; value: string } => d !== null);

    // Handle pseudo-classes
    let selector = rawSelector;
    let pseudoClass: string | undefined;
    const pseudoMatch = rawSelector.match(/:([a-z-]+)$/);
    if (pseudoMatch) {
      pseudoClass = pseudoMatch[1];
      selector = rawSelector.slice(0, pseudoMatch.index).trim();
    }

    if (declarations.length > 0) {
      rules.push({ selector, declarations, pseudoClass });
    }
  }

  return rules;
}

function findBreakpoint(mediaQuery: string): string | null {
  const minWidthMatch = mediaQuery.match(/min-width:\s*(\d+px)/);
  if (minWidthMatch) {
    return BREAKPOINT_MAP[minWidthMatch[1]] || null;
  }
  return null;
}

function formatOutput(
  selectorMap: Map<string, string[]>,
  options: CssToTailwindOptions,
): string {
  const lines: string[] = [];

  for (const [selector, classes] of selectorMap) {
    const uniqueClasses = [...new Set(classes)];

    if (options.outputFormat === 'apply') {
      lines.push(`${selector} {`);
      lines.push(`  @apply ${uniqueClasses.join(' ')};`);
      lines.push('}');
    } else if (options.outputFormat === 'html-structure') {
      const tag = selector.startsWith('.') ? 'div' : selector;
      const className = uniqueClasses.join(' ');
      lines.push(`<${tag} className="${className}">`);
      lines.push(`  <!-- ${selector} -->`);
      lines.push(`</${tag}>`);
    } else {
      // classes-only (default)
      lines.push(`/* ${selector} */`);
      lines.push(uniqueClasses.join(' '));
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}
