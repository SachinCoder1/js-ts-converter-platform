import type { TailwindConversionOptions, TailwindConversionStats } from '../tailwind-types';
import {
  staticMap,
  spacingScale,
  fontSizeMap,
  trackingMap,
  leadingMap,
  durationMap,
  delayMap,
  easeMap,
  opacityMap,
  zIndexMap,
  breakpoints,
  pseudoVariants,
  colorPalette,
  specialColors,
  fractionMap,
  sizeKeywords,
  heightKeywords,
  ringWidthMap,
} from './tailwind-map';

export interface RuleConversionResult {
  css: string;
  stats: TailwindConversionStats;
}

interface ResolvedProperty {
  css: string;
  originalClass: string;
}

interface GroupedProperties {
  base: ResolvedProperty[];
  pseudo: Map<string, ResolvedProperty[]>;
  media: Map<string, ResolvedProperty[]>;
  mediaPseudo: Map<string, Map<string, ResolvedProperty[]>>;
}

// ─── Main entry point ─────────────────────────────────────────────────────

export function convertTailwindToCSS(
  input: string,
  options: TailwindConversionOptions
): RuleConversionResult {
  if (!input.trim()) {
    return { css: '', stats: { classesConverted: 0, propertiesGenerated: 0, mediaQueries: 0, pseudoSelectors: 0, unknownClasses: 0 } };
  }

  const classes = extractClasses(input, options.inputFormat);
  const grouped = groupClasses(classes);
  const css = formatOutput(grouped, options);
  const stats = computeStats(grouped);

  return { css, stats };
}

// ─── Extract classes from input ───────────────────────────────────────────

function extractClasses(input: string, format: 'classes' | 'html'): string[] {
  if (format === 'html') {
    const classRegex = /(?:class|className)\s*=\s*["']([^"']*)["']/g;
    const allClasses: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = classRegex.exec(input)) !== null) {
      allClasses.push(...match[1].split(/\s+/).filter(Boolean));
    }
    return allClasses.length > 0 ? allClasses : input.split(/\s+/).filter(Boolean);
  }
  return input.split(/\s+/).filter(Boolean);
}

// ─── Parse and group classes by variant ───────────────────────────────────

function groupClasses(classes: string[]): GroupedProperties {
  const result: GroupedProperties = {
    base: [],
    pseudo: new Map(),
    media: new Map(),
    mediaPseudo: new Map(),
  };

  for (const cls of classes) {
    const { variants, baseClass } = parseVariants(cls);

    const css = resolveClass(baseClass);
    if (!css) continue;

    const prop: ResolvedProperty = { css, originalClass: cls };

    const responsiveVariant = variants.find(v => breakpoints[v]);
    const pseudoVariant = variants.find(v => pseudoVariants[v]);
    const isDark = variants.includes('dark');

    if (responsiveVariant && pseudoVariant) {
      const bp = breakpoints[responsiveVariant];
      if (!result.mediaPseudo.has(bp)) result.mediaPseudo.set(bp, new Map());
      const pseudoMap = result.mediaPseudo.get(bp)!;
      const pseudoSel = pseudoVariants[pseudoVariant];
      if (!pseudoMap.has(pseudoSel)) pseudoMap.set(pseudoSel, []);
      pseudoMap.get(pseudoSel)!.push(prop);
    } else if (responsiveVariant) {
      const bp = breakpoints[responsiveVariant];
      if (!result.media.has(bp)) result.media.set(bp, []);
      result.media.get(bp)!.push(prop);
    } else if (pseudoVariant || isDark) {
      const sel = isDark ? '.dark &' : pseudoVariants[pseudoVariant!];
      if (!result.pseudo.has(sel)) result.pseudo.set(sel, []);
      result.pseudo.get(sel)!.push(prop);
    } else {
      result.base.push(prop);
    }
  }

  return result;
}

function parseVariants(cls: string): { variants: string[]; baseClass: string } {
  const parts = cls.split(':');
  const baseClass = parts.pop()!;
  return { variants: parts, baseClass };
}

// ─── Resolve a single Tailwind class to CSS ───────────────────────────────

function resolveClass(cls: string): string | null {
  // 1. Check negative prefix
  const isNegative = cls.startsWith('-');
  const lookupClass = isNegative ? cls.slice(1) : cls;

  // 2. Static map
  if (staticMap[lookupClass]) return staticMap[lookupClass];

  // 3. Pattern-based resolution
  const patternResult = resolvePattern(lookupClass, isNegative);
  if (patternResult) return patternResult;

  // 4. Arbitrary value
  const arbResult = resolveArbitrary(lookupClass, isNegative);
  if (arbResult) return arbResult;

  return null;
}

function resolvePattern(cls: string, negative: boolean): string | null {
  const neg = negative ? '-' : '';

  // ─── Spacing: p, px, py, pt, pr, pb, pl, m, mx, my, mt, mr, mb, ml ───
  const spacingPatterns: [RegExp, string[]][] = [
    [/^p-(.+)$/, ['padding']],
    [/^px-(.+)$/, ['padding-left', 'padding-right']],
    [/^py-(.+)$/, ['padding-top', 'padding-bottom']],
    [/^pt-(.+)$/, ['padding-top']],
    [/^pr-(.+)$/, ['padding-right']],
    [/^pb-(.+)$/, ['padding-bottom']],
    [/^pl-(.+)$/, ['padding-left']],
    [/^ps-(.+)$/, ['padding-inline-start']],
    [/^pe-(.+)$/, ['padding-inline-end']],
    [/^m-(.+)$/, ['margin']],
    [/^mx-(.+)$/, ['margin-left', 'margin-right']],
    [/^my-(.+)$/, ['margin-top', 'margin-bottom']],
    [/^mt-(.+)$/, ['margin-top']],
    [/^mr-(.+)$/, ['margin-right']],
    [/^mb-(.+)$/, ['margin-bottom']],
    [/^ml-(.+)$/, ['margin-left']],
    [/^ms-(.+)$/, ['margin-inline-start']],
    [/^me-(.+)$/, ['margin-inline-end']],
    [/^gap-(.+)$/, ['gap']],
    [/^gap-x-(.+)$/, ['column-gap']],
    [/^gap-y-(.+)$/, ['row-gap']],
  ];

  for (const [pattern, props] of spacingPatterns) {
    const match = cls.match(pattern);
    if (match) {
      const value = match[1];
      if (value === 'auto') {
        return props.map(p => `${p}: auto`).join('; ');
      }
      const resolved = spacingScale[value];
      if (resolved) {
        return props.map(p => `${p}: ${neg}${resolved}`).join('; ');
      }
    }
  }

  // ─── Space between: space-x-{n}, space-y-{n} ───
  {
    const match = cls.match(/^space-([xy])-(.+)$/);
    if (match) {
      const axis = match[1];
      const value = spacingScale[match[2]];
      if (value) {
        const prop = axis === 'x' ? 'margin-left' : 'margin-top';
        return `/* space-${axis}-${match[2]} → applied to > * + * */\n  ${prop}: ${neg}${value}`;
      }
    }
  }

  // ─── Width ───
  {
    const match = cls.match(/^w-(.+)$/);
    if (match) return resolveSizing('width', match[1], sizeKeywords, neg);
  }
  {
    const match = cls.match(/^min-w-(.+)$/);
    if (match) return resolveSizing('min-width', match[1], sizeKeywords, neg);
  }
  {
    const match = cls.match(/^max-w-(.+)$/);
    if (match) {
      const special: Record<string, string> = {
        'none': 'none', '0': '0rem', 'xs': '20rem', 'sm': '24rem', 'md': '28rem',
        'lg': '32rem', 'xl': '36rem', '2xl': '42rem', '3xl': '48rem', '4xl': '56rem',
        '5xl': '64rem', '6xl': '72rem', '7xl': '80rem', 'full': '100%',
        'min': 'min-content', 'max': 'max-content', 'fit': 'fit-content',
        'prose': '65ch', 'screen-sm': '640px', 'screen-md': '768px',
        'screen-lg': '1024px', 'screen-xl': '1280px', 'screen-2xl': '1536px',
      };
      if (special[match[1]]) return `max-width: ${special[match[1]]}`;
      return resolveSizing('max-width', match[1], sizeKeywords, neg);
    }
  }

  // ─── Height ───
  {
    const match = cls.match(/^h-(.+)$/);
    if (match) return resolveSizing('height', match[1], heightKeywords, neg);
  }
  {
    const match = cls.match(/^min-h-(.+)$/);
    if (match) return resolveSizing('min-height', match[1], heightKeywords, neg);
  }
  {
    const match = cls.match(/^max-h-(.+)$/);
    if (match) return resolveSizing('max-height', match[1], heightKeywords, neg);
  }

  // ─── Size (TW v4: size-{n} sets both width and height) ───
  {
    const match = cls.match(/^size-(.+)$/);
    if (match) {
      const val = resolveSize(match[1], sizeKeywords, neg);
      if (val) return `width: ${val}; height: ${val}`;
    }
  }

  // ─── Inset ───
  {
    const match = cls.match(/^inset-(.+)$/);
    if (match) {
      const val = resolveSize(match[1], sizeKeywords, neg);
      if (val) return `inset: ${val}`;
    }
  }
  {
    const match = cls.match(/^inset-x-(.+)$/);
    if (match) {
      const val = resolveSize(match[1], sizeKeywords, neg);
      if (val) return `left: ${val}; right: ${val}`;
    }
  }
  {
    const match = cls.match(/^inset-y-(.+)$/);
    if (match) {
      const val = resolveSize(match[1], sizeKeywords, neg);
      if (val) return `top: ${val}; bottom: ${val}`;
    }
  }
  for (const dir of ['top', 'right', 'bottom', 'left'] as const) {
    const match = cls.match(new RegExp(`^${dir}-(.+)$`));
    if (match) {
      const val = resolveSize(match[1], sizeKeywords, neg);
      if (val) return `${dir}: ${val}`;
    }
  }

  // ─── Font size: text-{size} ───
  {
    const match = cls.match(/^text-(.+)$/);
    if (match) {
      if (fontSizeMap[match[1]]) return fontSizeMap[match[1]];
      // Could be a color - handled below
      const colorResult = resolveColor('color', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Background color: bg-{color}-{shade} ───
  {
    const match = cls.match(/^bg-(.+)$/);
    if (match && !staticMap[`bg-${match[1]}`]) {
      const colorResult = resolveColor('background-color', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Border color: border-{color}-{shade} ───
  {
    const match = cls.match(/^border-(.+)$/);
    if (match && !staticMap[`border-${match[1]}`]) {
      const colorResult = resolveColor('border-color', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Ring color: ring-{color}-{shade} ───
  {
    const match = cls.match(/^ring-(.+)$/);
    if (match) {
      if (ringWidthMap[match[1]]) return ringWidthMap[match[1]];
      const colorResult = resolveColor('--tw-ring-color', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Text decoration color ───
  {
    const match = cls.match(/^decoration-(.+)$/);
    if (match) {
      const colorResult = resolveColor('text-decoration-color', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Accent color ───
  {
    const match = cls.match(/^accent-(.+)$/);
    if (match) {
      const colorResult = resolveColor('accent-color', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Caret color ───
  {
    const match = cls.match(/^caret-(.+)$/);
    if (match) {
      const colorResult = resolveColor('caret-color', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Fill / Stroke color ───
  {
    const match = cls.match(/^fill-(.+)$/);
    if (match) {
      const colorResult = resolveColor('fill', match[1]);
      if (colorResult) return colorResult;
    }
  }
  {
    const match = cls.match(/^stroke-(.+)$/);
    if (match) {
      const special: Record<string, string> = { '0': '0', '1': '1', '2': '2' };
      if (special[match[1]]) return `stroke-width: ${special[match[1]]}`;
      const colorResult = resolveColor('stroke', match[1]);
      if (colorResult) return colorResult;
    }
  }

  // ─── Outline color / width / offset ───
  {
    const match = cls.match(/^outline-(.+)$/);
    if (match) {
      if (/^\d+$/.test(match[1])) return `outline-width: ${match[1]}px`;
      const colorResult = resolveColor('outline-color', match[1]);
      if (colorResult) return colorResult;
    }
  }
  {
    const match = cls.match(/^outline-offset-(.+)$/);
    if (match && /^\d+$/.test(match[1])) return `outline-offset: ${match[1]}px`;
  }

  // ─── Tracking (letter-spacing) ───
  {
    const match = cls.match(/^tracking-(.+)$/);
    if (match && trackingMap[match[1]]) return trackingMap[match[1]];
  }

  // ─── Leading (line-height) ───
  {
    const match = cls.match(/^leading-(.+)$/);
    if (match && leadingMap[match[1]]) return leadingMap[match[1]];
  }

  // ─── Opacity ───
  {
    const match = cls.match(/^opacity-(.+)$/);
    if (match && opacityMap[match[1]]) return opacityMap[match[1]];
  }

  // ─── Z-index ───
  {
    const match = cls.match(/^z-(.+)$/);
    if (match) {
      if (zIndexMap[match[1]]) return zIndexMap[match[1]];
      if (/^\d+$/.test(match[1])) return `z-index: ${neg}${match[1]}`;
    }
  }

  // ─── Duration ───
  {
    const match = cls.match(/^duration-(.+)$/);
    if (match && durationMap[match[1]]) return durationMap[match[1]];
  }

  // ─── Delay ───
  {
    const match = cls.match(/^delay-(.+)$/);
    if (match && delayMap[match[1]]) return delayMap[match[1]];
  }

  // ─── Ease ───
  {
    const match = cls.match(/^ease-(.+)$/);
    if (match && easeMap[match[1]]) return easeMap[match[1]];
  }

  // ─── Grid columns ───
  {
    const match = cls.match(/^grid-cols-(.+)$/);
    if (match) {
      if (match[1] === 'none') return 'grid-template-columns: none';
      if (match[1] === 'subgrid') return 'grid-template-columns: subgrid';
      if (/^\d+$/.test(match[1])) return `grid-template-columns: repeat(${match[1]}, minmax(0, 1fr))`;
    }
  }
  {
    const match = cls.match(/^col-span-(.+)$/);
    if (match) {
      if (match[1] === 'full') return 'grid-column: 1 / -1';
      if (/^\d+$/.test(match[1])) return `grid-column: span ${match[1]} / span ${match[1]}`;
    }
  }
  {
    const match = cls.match(/^col-start-(.+)$/);
    if (match) return `grid-column-start: ${match[1]}`;
  }
  {
    const match = cls.match(/^col-end-(.+)$/);
    if (match) return `grid-column-end: ${match[1]}`;
  }

  // ─── Grid rows ───
  {
    const match = cls.match(/^grid-rows-(.+)$/);
    if (match) {
      if (match[1] === 'none') return 'grid-template-rows: none';
      if (match[1] === 'subgrid') return 'grid-template-rows: subgrid';
      if (/^\d+$/.test(match[1])) return `grid-template-rows: repeat(${match[1]}, minmax(0, 1fr))`;
    }
  }
  {
    const match = cls.match(/^row-span-(.+)$/);
    if (match) {
      if (match[1] === 'full') return 'grid-row: 1 / -1';
      if (/^\d+$/.test(match[1])) return `grid-row: span ${match[1]} / span ${match[1]}`;
    }
  }

  // ─── Order ───
  {
    const match = cls.match(/^order-(.+)$/);
    if (match) {
      if (match[1] === 'first') return 'order: -9999';
      if (match[1] === 'last') return 'order: 9999';
      if (match[1] === 'none') return 'order: 0';
      if (/^\d+$/.test(match[1])) return `order: ${neg}${match[1]}`;
    }
  }

  // ─── Translate ───
  {
    const match = cls.match(/^translate-x-(.+)$/);
    if (match) {
      const val = resolveSize(match[1], { ...sizeKeywords, full: '100%' }, neg);
      if (val) return `transform: translateX(${val})`;
    }
  }
  {
    const match = cls.match(/^translate-y-(.+)$/);
    if (match) {
      const val = resolveSize(match[1], { ...sizeKeywords, full: '100%' }, neg);
      if (val) return `transform: translateY(${val})`;
    }
  }

  // ─── Rotate ───
  {
    const match = cls.match(/^rotate-(.+)$/);
    if (match) {
      return `transform: rotate(${neg}${match[1]}deg)`;
    }
  }

  // ─── Scale ───
  {
    const match = cls.match(/^scale-(.+)$/);
    if (match) {
      const val = Number(match[1]) / 100;
      if (!isNaN(val)) return `transform: scale(${val})`;
    }
  }
  {
    const match = cls.match(/^scale-x-(.+)$/);
    if (match) {
      const val = Number(match[1]) / 100;
      if (!isNaN(val)) return `transform: scaleX(${val})`;
    }
  }
  {
    const match = cls.match(/^scale-y-(.+)$/);
    if (match) {
      const val = Number(match[1]) / 100;
      if (!isNaN(val)) return `transform: scaleY(${val})`;
    }
  }

  // ─── Skew ───
  {
    const match = cls.match(/^skew-x-(.+)$/);
    if (match) return `transform: skewX(${neg}${match[1]}deg)`;
  }
  {
    const match = cls.match(/^skew-y-(.+)$/);
    if (match) return `transform: skewY(${neg}${match[1]}deg)`;
  }

  // ─── Divide ───
  {
    const match = cls.match(/^divide-([xy])-(.+)$/);
    if (match) {
      const axis = match[1];
      const width = match[2] === '0' ? '0px' : match[2] === 'reverse' ? null : match[2] === '' ? '1px' : `${match[2]}px`;
      if (width) {
        const prop = axis === 'x' ? 'border-left-width' : 'border-top-width';
        return `/* divide-${axis}-${match[2]} → applied to > * + * */\n  ${prop}: ${width}`;
      }
    }
  }

  // ─── Rounded directional ───
  {
    const roundedDir: Record<string, string[]> = {
      't': ['border-top-left-radius', 'border-top-right-radius'],
      'r': ['border-top-right-radius', 'border-bottom-right-radius'],
      'b': ['border-bottom-right-radius', 'border-bottom-left-radius'],
      'l': ['border-top-left-radius', 'border-bottom-left-radius'],
      'tl': ['border-top-left-radius'],
      'tr': ['border-top-right-radius'],
      'br': ['border-bottom-right-radius'],
      'bl': ['border-bottom-left-radius'],
      'ss': ['border-start-start-radius'],
      'se': ['border-start-end-radius'],
      'ee': ['border-end-end-radius'],
      'es': ['border-end-start-radius'],
    };
    const roundedSizes: Record<string, string> = {
      'none': '0px', 'sm': '0.125rem', '': '0.25rem', 'md': '0.375rem',
      'lg': '0.5rem', 'xl': '0.75rem', '2xl': '1rem', '3xl': '1.5rem', 'full': '9999px',
    };
    const match = cls.match(/^rounded-(\w+?)(?:-(\w+))?$/);
    if (match && !staticMap[cls]) {
      const dir = roundedDir[match[1]];
      if (dir) {
        const size = roundedSizes[match[2] || ''] ?? roundedSizes[''];
        return dir.map(p => `${p}: ${size}`).join('; ');
      }
    }
  }

  // ─── Border width directional with sizes ───
  {
    const borderDirMap: Record<string, string[]> = {
      't': ['border-top-width'], 'r': ['border-right-width'],
      'b': ['border-bottom-width'], 'l': ['border-left-width'],
      'x': ['border-left-width', 'border-right-width'],
      'y': ['border-top-width', 'border-bottom-width'],
    };
    const match = cls.match(/^border-([trblxy])-(\d+)$/);
    if (match && borderDirMap[match[1]]) {
      return borderDirMap[match[1]].map(p => `${p}: ${match[2]}px`).join('; ');
    }
  }

  // ─── Ring ───
  {
    const match = cls.match(/^ring-offset-(.+)$/);
    if (match) {
      if (/^\d+$/.test(match[1])) return `--tw-ring-offset-width: ${match[1]}px`;
      const colorResult = resolveColor('--tw-ring-offset-color', match[1]);
      if (colorResult) return colorResult;
    }
  }
  {
    const match = cls.match(/^ring(?:-(\d+))?$/);
    if (match) {
      const width = match[1] || '';
      if (ringWidthMap[width]) return ringWidthMap[width];
    }
  }

  // ─── Blur / Brightness / Contrast / Saturate / Grayscale / Invert / Sepia ───
  {
    const match = cls.match(/^blur-(.+)$/);
    if (match) {
      const sizes: Record<string, string> = {
        'none': '0', 'sm': '4px', '': '8px', 'md': '12px', 'lg': '16px',
        'xl': '24px', '2xl': '40px', '3xl': '64px',
      };
      if (sizes[match[1]] !== undefined) return `filter: blur(${sizes[match[1]]})`;
    }
  }
  if (cls === 'blur') return 'filter: blur(8px)';

  {
    const match = cls.match(/^brightness-(.+)$/);
    if (match && /^\d+$/.test(match[1])) return `filter: brightness(${Number(match[1]) / 100})`;
  }
  {
    const match = cls.match(/^contrast-(.+)$/);
    if (match && /^\d+$/.test(match[1])) return `filter: contrast(${Number(match[1]) / 100})`;
  }
  {
    const match = cls.match(/^saturate-(.+)$/);
    if (match && /^\d+$/.test(match[1])) return `filter: saturate(${Number(match[1]) / 100})`;
  }
  if (cls === 'grayscale') return 'filter: grayscale(100%)';
  if (cls === 'grayscale-0') return 'filter: grayscale(0)';
  if (cls === 'invert') return 'filter: invert(100%)';
  if (cls === 'invert-0') return 'filter: invert(0)';
  if (cls === 'sepia') return 'filter: sepia(100%)';
  if (cls === 'sepia-0') return 'filter: sepia(0)';

  // ─── Backdrop filter ───
  {
    const match = cls.match(/^backdrop-blur-(.+)$/);
    if (match) {
      const sizes: Record<string, string> = {
        'none': '0', 'sm': '4px', '': '8px', 'md': '12px', 'lg': '16px',
        'xl': '24px', '2xl': '40px', '3xl': '64px',
      };
      if (sizes[match[1]] !== undefined) return `backdrop-filter: blur(${sizes[match[1]]})`;
    }
  }
  if (cls === 'backdrop-blur') return 'backdrop-filter: blur(8px)';

  // ─── Border spacing ───
  {
    const match = cls.match(/^border-spacing-(.+)$/);
    if (match) {
      const val = spacingScale[match[1]];
      if (val) return `border-spacing: ${val}`;
    }
  }

  // ─── Basis ───
  {
    const match = cls.match(/^basis-(.+)$/);
    if (match) return resolveSizing('flex-basis', match[1], sizeKeywords, neg);
  }

  // ─── Indent ───
  {
    const match = cls.match(/^indent-(.+)$/);
    if (match) {
      const val = resolveSize(match[1], sizeKeywords, neg);
      if (val) return `text-indent: ${val}`;
    }
  }

  // ─── Columns ───
  {
    const match = cls.match(/^columns-(.+)$/);
    if (match) {
      const special: Record<string, string> = {
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
        '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12',
        'auto': 'auto', '3xs': '16rem', '2xs': '18rem', 'xs': '20rem',
        'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem',
        '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem',
        '6xl': '72rem', '7xl': '80rem',
      };
      if (special[match[1]]) return `columns: ${special[match[1]]}`;
    }
  }

  return null;
}

// ─── Resolve color utility ────────────────────────────────────────────────

function resolveColor(property: string, value: string): string | null {
  // Special colors
  if (specialColors[value]) return `${property}: ${specialColors[value]}`;

  // Opacity modifier (v4 syntax): red-500/50
  const opacityMatch = value.match(/^(.+)\/(\d+)$/);
  if (opacityMatch) {
    const baseColor = resolveColorValue(opacityMatch[1]);
    if (baseColor) {
      const opacity = Number(opacityMatch[2]) / 100;
      return `${property}: ${hexToRgba(baseColor, opacity)}`;
    }
  }

  const hex = resolveColorValue(value);
  if (hex) return `${property}: ${hex}`;

  return null;
}

function resolveColorValue(value: string): string | null {
  // Direct color: "red-500"
  const parts = value.split('-');
  if (parts.length === 2) {
    const [colorName, shade] = parts;
    if (colorPalette[colorName]?.[shade]) return colorPalette[colorName][shade];
  }
  if (parts.length === 1 && specialColors[parts[0]]) return specialColors[parts[0]];
  return null;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r} ${g} ${b} / ${opacity})`;
}

// ─── Resolve arbitrary values ─────────────────────────────────────────────

function resolveArbitrary(cls: string, negative: boolean): string | null {
  const match = cls.match(/^(.+)-\[(.+)\]$/);
  if (!match) return null;

  const prefix = match[1];
  const rawValue = match[2].replace(/_/g, ' ');
  const neg = negative ? '-' : '';

  const arbitraryMap: Record<string, string> = {
    'p': 'padding', 'px': 'padding-left', 'py': 'padding-top',
    'pt': 'padding-top', 'pr': 'padding-right', 'pb': 'padding-bottom', 'pl': 'padding-left',
    'm': 'margin', 'mx': 'margin-left', 'my': 'margin-top',
    'mt': 'margin-top', 'mr': 'margin-right', 'mb': 'margin-bottom', 'ml': 'margin-left',
    'w': 'width', 'h': 'height', 'min-w': 'min-width', 'max-w': 'max-width',
    'min-h': 'min-height', 'max-h': 'max-height', 'size': 'width',
    'gap': 'gap', 'gap-x': 'column-gap', 'gap-y': 'row-gap',
    'top': 'top', 'right': 'right', 'bottom': 'bottom', 'left': 'left',
    'inset': 'inset', 'inset-x': 'left', 'inset-y': 'top',
    'text': 'font-size', 'bg': 'background-color', 'border': 'border-color',
    'rounded': 'border-radius', 'z': 'z-index', 'opacity': 'opacity',
    'translate-x': 'transform', 'translate-y': 'transform',
    'rotate': 'transform', 'scale': 'transform',
    'indent': 'text-indent', 'tracking': 'letter-spacing', 'leading': 'line-height',
    'basis': 'flex-basis', 'columns': 'columns',
  };

  const prop = arbitraryMap[prefix];
  if (!prop) return null;

  if (prefix === 'translate-x') return `transform: translateX(${neg}${rawValue})`;
  if (prefix === 'translate-y') return `transform: translateY(${neg}${rawValue})`;
  if (prefix === 'rotate') return `transform: rotate(${neg}${rawValue})`;
  if (prefix === 'scale') return `transform: scale(${rawValue})`;

  // For px/py/mx/my, apply to both axes
  if (prefix === 'px') return `padding-left: ${neg}${rawValue}; padding-right: ${neg}${rawValue}`;
  if (prefix === 'py') return `padding-top: ${neg}${rawValue}; padding-bottom: ${neg}${rawValue}`;
  if (prefix === 'mx') return `margin-left: ${neg}${rawValue}; margin-right: ${neg}${rawValue}`;
  if (prefix === 'my') return `margin-top: ${neg}${rawValue}; margin-bottom: ${neg}${rawValue}`;
  if (prefix === 'inset-x') return `left: ${neg}${rawValue}; right: ${neg}${rawValue}`;
  if (prefix === 'inset-y') return `top: ${neg}${rawValue}; bottom: ${neg}${rawValue}`;
  if (prefix === 'size') return `width: ${neg}${rawValue}; height: ${neg}${rawValue}`;

  return `${prop}: ${neg}${rawValue}`;
}

// ─── Sizing helpers ───────────────────────────────────────────────────────

function resolveSize(value: string, keywords: Record<string, string>, neg: string): string | null {
  if (keywords[value]) return `${neg}${keywords[value]}`;
  if (spacingScale[value]) return `${neg}${spacingScale[value]}`;
  if (fractionMap[value]) return fractionMap[value];
  return null;
}

function resolveSizing(prop: string, value: string, keywords: Record<string, string>, neg: string): string | null {
  const resolved = resolveSize(value, keywords, neg);
  if (resolved) return `${prop}: ${resolved}`;
  return null;
}

// ─── Output formatting ───────────────────────────────────────────────────

function formatOutput(grouped: GroupedProperties, options: TailwindConversionOptions): string {
  const lines: string[] = [];
  const { includeComments, outputFormat } = options;

  if (outputFormat === 'grouped') {
    return formatGrouped(grouped, includeComments);
  }

  // Base properties
  if (grouped.base.length > 0) {
    lines.push('.element {');
    for (const prop of grouped.base) {
      if (includeComments) lines.push(`  /* ${prop.originalClass} */`);
      for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
        lines.push(`  ${line};`);
      }
    }
    lines.push('}');
  }

  // Pseudo variants
  for (const [pseudo, props] of grouped.pseudo) {
    lines.push('');
    const selector = pseudo === '.dark &' ? `.dark .element` : `.element${pseudo}`;
    lines.push(`${selector} {`);
    for (const prop of props) {
      if (includeComments) lines.push(`  /* ${prop.originalClass} */`);
      for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
        lines.push(`  ${line};`);
      }
    }
    lines.push('}');
  }

  // Media queries
  const sortedBreakpoints = sortBreakpoints([...grouped.media.keys()]);
  for (const bp of sortedBreakpoints) {
    const props = grouped.media.get(bp)!;
    lines.push('');
    lines.push(`@media (min-width: ${bp}) {`);
    lines.push('  .element {');
    for (const prop of props) {
      if (includeComments) lines.push(`    /* ${prop.originalClass} */`);
      for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
        lines.push(`    ${line};`);
      }
    }
    lines.push('  }');

    // Media + pseudo
    const pseudoMap = grouped.mediaPseudo.get(bp);
    if (pseudoMap) {
      for (const [pseudo, pprops] of pseudoMap) {
        lines.push('');
        lines.push(`  .element${pseudo} {`);
        for (const prop of pprops) {
          if (includeComments) lines.push(`    /* ${prop.originalClass} */`);
          for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
            lines.push(`    ${line};`);
          }
        }
        lines.push('  }');
      }
    }

    lines.push('}');
  }

  // Media+pseudo for breakpoints not already rendered
  for (const [bp, pseudoMap] of grouped.mediaPseudo) {
    if (grouped.media.has(bp)) continue;
    lines.push('');
    lines.push(`@media (min-width: ${bp}) {`);
    for (const [pseudo, pprops] of pseudoMap) {
      lines.push(`  .element${pseudo} {`);
      for (const prop of pprops) {
        if (includeComments) lines.push(`    /* ${prop.originalClass} */`);
        for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
          lines.push(`    ${line};`);
        }
      }
      lines.push('  }');
    }
    lines.push('}');
  }

  return lines.join('\n');
}

function formatGrouped(grouped: GroupedProperties, includeComments: boolean): string {
  const categories: Record<string, string[]> = {
    'Layout': ['display', 'position', 'flex', 'grid', 'float', 'clear', 'isolation', 'object', 'overflow', 'visibility'],
    'Sizing': ['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height', 'aspect'],
    'Spacing': ['padding', 'margin', 'gap', 'column-gap', 'row-gap', 'inset', 'top', 'right', 'bottom', 'left'],
    'Typography': ['font', 'text', 'letter', 'line-height', 'color', 'text-align', 'text-decoration', 'text-transform', 'white-space', 'word-break', 'overflow-wrap', '-webkit-font'],
    'Backgrounds': ['background'],
    'Borders': ['border', 'rounded', 'outline'],
    'Effects': ['box-shadow', 'opacity', 'filter', 'backdrop', 'mix-blend'],
    'Transforms': ['transform'],
    'Transitions': ['transition'],
    'Interactivity': ['cursor', 'pointer-events', 'user-select', 'touch-action', 'resize', 'scroll', 'appearance'],
  };

  const lines: string[] = [];

  // Group base properties by category
  const categorized: Record<string, ResolvedProperty[]> = {};
  const uncategorized: ResolvedProperty[] = [];

  for (const prop of grouped.base) {
    let found = false;
    for (const [category, prefixes] of Object.entries(categories)) {
      const firstProp = prop.css.split(':')[0].trim();
      if (prefixes.some(p => firstProp.startsWith(p))) {
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push(prop);
        found = true;
        break;
      }
    }
    if (!found) uncategorized.push(prop);
  }

  for (const [category, props] of Object.entries(categorized)) {
    if (props.length === 0) continue;
    lines.push(`/* ${category} */`);
    lines.push('.element {');
    for (const prop of props) {
      if (includeComments) lines.push(`  /* ${prop.originalClass} */`);
      for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
        lines.push(`  ${line};`);
      }
    }
    lines.push('}');
    lines.push('');
  }

  if (uncategorized.length > 0) {
    lines.push('/* Other */');
    lines.push('.element {');
    for (const prop of uncategorized) {
      if (includeComments) lines.push(`  /* ${prop.originalClass} */`);
      for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
        lines.push(`  ${line};`);
      }
    }
    lines.push('}');
    lines.push('');
  }

  // Pseudo and media queries - same as single format
  for (const [pseudo, props] of grouped.pseudo) {
    const selector = pseudo === '.dark &' ? `.dark .element` : `.element${pseudo}`;
    lines.push(`${selector} {`);
    for (const prop of props) {
      if (includeComments) lines.push(`  /* ${prop.originalClass} */`);
      for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
        lines.push(`  ${line};`);
      }
    }
    lines.push('}');
    lines.push('');
  }

  const sortedBreakpoints = sortBreakpoints([...grouped.media.keys(), ...grouped.mediaPseudo.keys()]);
  const seen = new Set<string>();
  for (const bp of sortedBreakpoints) {
    if (seen.has(bp)) continue;
    seen.add(bp);
    const hasMedia = grouped.media.has(bp);
    const hasMediaPseudo = grouped.mediaPseudo.has(bp);
    if (!hasMedia && !hasMediaPseudo) continue;

    lines.push(`@media (min-width: ${bp}) {`);
    if (hasMedia) {
      lines.push('  .element {');
      for (const prop of grouped.media.get(bp)!) {
        if (includeComments) lines.push(`    /* ${prop.originalClass} */`);
        for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
          lines.push(`    ${line};`);
        }
      }
      lines.push('  }');
    }
    if (hasMediaPseudo) {
      for (const [pseudo, pprops] of grouped.mediaPseudo.get(bp)!) {
        lines.push(`  .element${pseudo} {`);
        for (const prop of pprops) {
          if (includeComments) lines.push(`    /* ${prop.originalClass} */`);
          for (const line of prop.css.split(';').map(s => s.trim()).filter(Boolean)) {
            lines.push(`    ${line};`);
          }
        }
        lines.push('  }');
      }
    }
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function sortBreakpoints(bps: string[]): string[] {
  const order = ['640px', '768px', '1024px', '1280px', '1536px'];
  const unique = [...new Set(bps)];
  return unique.sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

// ─── Stats computation ────────────────────────────────────────────────────

function computeStats(grouped: GroupedProperties): TailwindConversionStats {
  let classesConverted = 0;
  let propertiesGenerated = 0;
  let mediaQueries = 0;
  let pseudoSelectors = 0;

  const countProps = (props: ResolvedProperty[]) => {
    classesConverted += props.length;
    for (const p of props) {
      propertiesGenerated += p.css.split(';').filter(s => s.trim() && !s.trim().startsWith('/*')).length;
    }
  };

  countProps(grouped.base);

  for (const [, props] of grouped.pseudo) {
    pseudoSelectors++;
    countProps(props);
  }

  for (const [, props] of grouped.media) {
    mediaQueries++;
    countProps(props);
  }

  for (const [, pseudoMap] of grouped.mediaPseudo) {
    mediaQueries++;
    for (const [, props] of pseudoMap) {
      pseudoSelectors++;
      countProps(props);
    }
  }

  return {
    classesConverted,
    propertiesGenerated,
    mediaQueries,
    pseudoSelectors,
    unknownClasses: 0, // Caller should compute this
  };
}
