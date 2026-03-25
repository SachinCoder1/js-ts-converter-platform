// CSS property → Tailwind class mapping

type MapperFn = (value: string) => string | null;
type ValueMap = Record<string, string>;

export const PROPERTY_MAP: Record<string, ValueMap | MapperFn> = {
  // Display
  'display': { 'flex': 'flex', 'inline-flex': 'inline-flex', 'grid': 'grid', 'inline-grid': 'inline-grid', 'block': 'block', 'inline-block': 'inline-block', 'inline': 'inline', 'none': 'hidden', 'table': 'table', 'table-row': 'table-row', 'table-cell': 'table-cell', 'contents': 'contents' },

  // Flex
  'flex-direction': { 'row': 'flex-row', 'row-reverse': 'flex-row-reverse', 'column': 'flex-col', 'column-reverse': 'flex-col-reverse' },
  'flex-wrap': { 'wrap': 'flex-wrap', 'nowrap': 'flex-nowrap', 'wrap-reverse': 'flex-wrap-reverse' },
  'flex-grow': { '0': 'grow-0', '1': 'grow' },
  'flex-shrink': { '0': 'shrink-0', '1': 'shrink' },
  'flex': { '1 1 0%': 'flex-1', '1 1 auto': 'flex-auto', '0 1 auto': 'flex-initial', 'none': 'flex-none' },
  'align-items': { 'flex-start': 'items-start', 'flex-end': 'items-end', 'center': 'items-center', 'baseline': 'items-baseline', 'stretch': 'items-stretch', 'start': 'items-start', 'end': 'items-end' },
  'align-self': { 'auto': 'self-auto', 'flex-start': 'self-start', 'flex-end': 'self-end', 'center': 'self-center', 'stretch': 'self-stretch', 'start': 'self-start', 'end': 'self-end' },
  'justify-content': { 'flex-start': 'justify-start', 'flex-end': 'justify-end', 'center': 'justify-center', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly', 'start': 'justify-start', 'end': 'justify-end' },
  'justify-items': { 'start': 'justify-items-start', 'end': 'justify-items-end', 'center': 'justify-items-center', 'stretch': 'justify-items-stretch' },

  // Grid
  'grid-template-columns': (v) => v.startsWith('repeat') ? null : `grid-cols-[${v.replace(/\s+/g, '_')}]`,

  // Gap
  'gap': (v) => mapSpacing('gap', v),
  'row-gap': (v) => mapSpacing('gap-y', v),
  'column-gap': (v) => mapSpacing('gap-x', v),

  // Spacing
  'padding': (v) => mapSpacingShorthand('p', v),
  'padding-top': (v) => mapSpacing('pt', v),
  'padding-right': (v) => mapSpacing('pr', v),
  'padding-bottom': (v) => mapSpacing('pb', v),
  'padding-left': (v) => mapSpacing('pl', v),
  'margin': (v) => mapSpacingShorthand('m', v),
  'margin-top': (v) => mapSpacing('mt', v),
  'margin-right': (v) => mapSpacing('mr', v),
  'margin-bottom': (v) => mapSpacing('mb', v),
  'margin-left': (v) => mapSpacing('ml', v),

  // Sizing
  'width': (v) => mapSize('w', v),
  'height': (v) => mapSize('h', v),
  'min-width': (v) => mapSize('min-w', v),
  'min-height': (v) => mapSize('min-h', v),
  'max-width': (v) => mapMaxWidth(v),
  'max-height': (v) => mapSize('max-h', v),

  // Position
  'position': { 'static': 'static', 'fixed': 'fixed', 'absolute': 'absolute', 'relative': 'relative', 'sticky': 'sticky' },
  'top': (v) => mapSpacing('top', v),
  'right': (v) => mapSpacing('right', v),
  'bottom': (v) => mapSpacing('bottom', v),
  'left': (v) => mapSpacing('left', v),
  'z-index': (v) => {
    const map: Record<string, string> = { '0': 'z-0', '10': 'z-10', '20': 'z-20', '30': 'z-30', '40': 'z-40', '50': 'z-50', 'auto': 'z-auto' };
    return map[v] || `z-[${v}]`;
  },

  // Typography
  'font-size': (v) => {
    const map: Record<string, string> = { '12px': 'text-xs', '14px': 'text-sm', '16px': 'text-base', '18px': 'text-lg', '20px': 'text-xl', '24px': 'text-2xl', '30px': 'text-3xl', '36px': 'text-4xl', '48px': 'text-5xl', '0.75rem': 'text-xs', '0.875rem': 'text-sm', '1rem': 'text-base', '1.125rem': 'text-lg', '1.25rem': 'text-xl', '1.5rem': 'text-2xl' };
    return map[v] || `text-[${v}]`;
  },
  'font-weight': { '100': 'font-thin', '200': 'font-extralight', '300': 'font-light', '400': 'font-normal', '500': 'font-medium', '600': 'font-semibold', '700': 'font-bold', '800': 'font-extrabold', '900': 'font-black', 'normal': 'font-normal', 'bold': 'font-bold' },
  'font-style': { 'italic': 'italic', 'normal': 'not-italic' },
  'text-align': { 'left': 'text-left', 'center': 'text-center', 'right': 'text-right', 'justify': 'text-justify', 'start': 'text-start', 'end': 'text-end' },
  'text-decoration': { 'underline': 'underline', 'line-through': 'line-through', 'none': 'no-underline', 'overline': 'overline' },
  'text-transform': { 'uppercase': 'uppercase', 'lowercase': 'lowercase', 'capitalize': 'capitalize', 'none': 'normal-case' },
  'line-height': (v) => {
    const map: Record<string, string> = { '1': 'leading-none', '1.25': 'leading-tight', '1.375': 'leading-snug', '1.5': 'leading-normal', '1.6': 'leading-relaxed', '1.625': 'leading-relaxed', '1.75': 'leading-relaxed', '2': 'leading-loose' };
    return map[v] || `leading-[${v}]`;
  },
  'letter-spacing': (v) => {
    const map: Record<string, string> = { '-0.05em': 'tracking-tighter', '-0.025em': 'tracking-tight', '0em': 'tracking-normal', '0': 'tracking-normal', '0.025em': 'tracking-wide', '0.05em': 'tracking-wider', '0.1em': 'tracking-widest' };
    return map[v] || `tracking-[${v}]`;
  },
  'white-space': { 'nowrap': 'whitespace-nowrap', 'normal': 'whitespace-normal', 'pre': 'whitespace-pre', 'pre-wrap': 'whitespace-pre-wrap', 'pre-line': 'whitespace-pre-line', 'break-spaces': 'whitespace-break-spaces' },
  'word-break': { 'break-all': 'break-all', 'keep-all': 'break-keep' },
  'overflow-wrap': { 'break-word': 'break-words' },

  // Color
  'color': (v) => mapColor('text', v),
  'background-color': (v) => mapColor('bg', v),
  'background': (v) => {
    if (v.includes('gradient') || v.includes('url(')) return null;
    return mapColor('bg', v);
  },

  // Border
  'border': (v) => {
    if (v === 'none' || v === '0') return 'border-0';
    return `border-[${v}]`;
  },
  'border-width': (v) => {
    const map: Record<string, string> = { '0': 'border-0', '0px': 'border-0', '1px': 'border', '2px': 'border-2', '4px': 'border-4', '8px': 'border-8' };
    return map[v] || `border-[${v}]`;
  },
  'border-color': (v) => mapColor('border', v),
  'border-style': { 'solid': 'border-solid', 'dashed': 'border-dashed', 'dotted': 'border-dotted', 'double': 'border-double', 'none': 'border-none' },
  'border-radius': (v) => {
    const map: Record<string, string> = { '0': 'rounded-none', '0px': 'rounded-none', '2px': 'rounded-sm', '0.125rem': 'rounded-sm', '4px': 'rounded', '0.25rem': 'rounded', '6px': 'rounded-md', '0.375rem': 'rounded-md', '8px': 'rounded-lg', '0.5rem': 'rounded-lg', '12px': 'rounded-xl', '0.75rem': 'rounded-xl', '16px': 'rounded-2xl', '1rem': 'rounded-2xl', '9999px': 'rounded-full', '50%': 'rounded-full' };
    return map[v] || `rounded-[${v}]`;
  },

  // Shadow
  'box-shadow': (v) => {
    if (v === 'none') return 'shadow-none';
    if (v.includes('0 1px 2px')) return 'shadow-sm';
    if (v.includes('0 1px 3px')) return 'shadow';
    if (v.includes('0 4px 6px')) return 'shadow-md';
    if (v.includes('0 10px 15px')) return 'shadow-lg';
    if (v.includes('0 20px 25px')) return 'shadow-xl';
    if (v.includes('0 25px 50px')) return 'shadow-2xl';
    return `shadow-[${v.replace(/\s+/g, '_')}]`;
  },

  // Overflow
  'overflow': { 'auto': 'overflow-auto', 'hidden': 'overflow-hidden', 'visible': 'overflow-visible', 'scroll': 'overflow-scroll' },
  'overflow-x': { 'auto': 'overflow-x-auto', 'hidden': 'overflow-x-hidden', 'visible': 'overflow-x-visible', 'scroll': 'overflow-x-scroll' },
  'overflow-y': { 'auto': 'overflow-y-auto', 'hidden': 'overflow-y-hidden', 'visible': 'overflow-y-visible', 'scroll': 'overflow-y-scroll' },

  // Opacity
  'opacity': (v) => {
    const num = parseFloat(v);
    if (isNaN(num)) return null;
    const pct = Math.round(num * 100);
    const map: Record<number, string> = { 0: 'opacity-0', 5: 'opacity-5', 10: 'opacity-10', 20: 'opacity-20', 25: 'opacity-25', 30: 'opacity-30', 40: 'opacity-40', 50: 'opacity-50', 60: 'opacity-60', 70: 'opacity-70', 75: 'opacity-75', 80: 'opacity-80', 90: 'opacity-90', 95: 'opacity-95', 100: 'opacity-100' };
    return map[pct] || `opacity-[${v}]`;
  },

  // Cursor
  'cursor': { 'pointer': 'cursor-pointer', 'default': 'cursor-default', 'text': 'cursor-text', 'move': 'cursor-move', 'not-allowed': 'cursor-not-allowed', 'wait': 'cursor-wait', 'grab': 'cursor-grab', 'grabbing': 'cursor-grabbing' },

  // Transition
  'transition': (v) => {
    if (v === 'none') return 'transition-none';
    if (v.includes('all')) return 'transition-all';
    if (v.includes('transform')) return 'transition-transform';
    if (v.includes('color') || v.includes('background')) return 'transition-colors';
    if (v.includes('opacity')) return 'transition-opacity';
    if (v.includes('shadow')) return 'transition-shadow';
    return 'transition';
  },
  'transition-duration': (v) => {
    const map: Record<string, string> = { '0s': 'duration-0', '75ms': 'duration-75', '100ms': 'duration-100', '150ms': 'duration-150', '200ms': 'duration-200', '0.2s': 'duration-200', '300ms': 'duration-300', '0.3s': 'duration-300', '500ms': 'duration-500', '0.5s': 'duration-500', '700ms': 'duration-700', '1000ms': 'duration-1000', '1s': 'duration-1000' };
    return map[v] || `duration-[${v}]`;
  },
  'transition-timing-function': { 'ease': 'ease-out', 'ease-in': 'ease-in', 'ease-out': 'ease-out', 'ease-in-out': 'ease-in-out', 'linear': 'ease-linear' },

  // Transform
  'transform': (v) => {
    if (v === 'none') return '';
    const classes: string[] = [];
    const translateY = v.match(/translateY\(([^)]+)\)/);
    const translateX = v.match(/translateX\(([^)]+)\)/);
    const scale = v.match(/scale\(([^)]+)\)/);
    const rotate = v.match(/rotate\(([^)]+)\)/);
    if (translateY) classes.push(mapTranslate('translate-y', translateY[1]));
    if (translateX) classes.push(mapTranslate('translate-x', translateX[1]));
    if (scale) classes.push(`scale-[${scale[1]}]`);
    if (rotate) classes.push(`rotate-[${rotate[1]}]`);
    return classes.join(' ') || null;
  },

  // List
  'list-style-type': { 'none': 'list-none', 'disc': 'list-disc', 'decimal': 'list-decimal' },

  // User Select
  'user-select': { 'none': 'select-none', 'text': 'select-text', 'all': 'select-all', 'auto': 'select-auto' },

  // Pointer Events
  'pointer-events': { 'none': 'pointer-events-none', 'auto': 'pointer-events-auto' },

  // Object fit
  'object-fit': { 'contain': 'object-contain', 'cover': 'object-cover', 'fill': 'object-fill', 'none': 'object-none', 'scale-down': 'object-scale-down' },
};

// Breakpoint mapping
export const BREAKPOINT_MAP: Record<string, string> = {
  '640px': 'sm', '768px': 'md', '1024px': 'lg', '1280px': 'xl', '1536px': '2xl',
};

// Pseudo-class mapping
export const PSEUDO_MAP: Record<string, string> = {
  'hover': 'hover', 'focus': 'focus', 'active': 'active',
  'first-child': 'first', 'last-child': 'last',
  'focus-visible': 'focus-visible', 'focus-within': 'focus-within',
  'disabled': 'disabled', 'visited': 'visited',
  'checked': 'checked', 'placeholder': 'placeholder',
};

// Spacing value mapper
const SPACING_MAP: Record<string, string> = {
  '0': '0', '0px': '0',
  '1px': 'px',
  '2px': '0.5', '0.125rem': '0.5',
  '4px': '1', '0.25rem': '1',
  '6px': '1.5', '0.375rem': '1.5',
  '8px': '2', '0.5rem': '2',
  '10px': '2.5', '0.625rem': '2.5',
  '12px': '3', '0.75rem': '3',
  '14px': '3.5', '0.875rem': '3.5',
  '16px': '4', '1rem': '4',
  '20px': '5', '1.25rem': '5',
  '24px': '6', '1.5rem': '6',
  '28px': '7', '1.75rem': '7',
  '32px': '8', '2rem': '8',
  '36px': '9', '2.25rem': '9',
  '40px': '10', '2.5rem': '10',
  '44px': '11', '2.75rem': '11',
  '48px': '12', '3rem': '12',
  '56px': '14', '3.5rem': '14',
  '64px': '16', '4rem': '16',
  '80px': '20', '5rem': '20',
  '96px': '24', '6rem': '24',
};

function mapSpacing(prefix: string, value: string): string {
  const trimmed = value.trim();
  if (trimmed === '0 auto' || trimmed === 'auto') {
    if (prefix === 'm' || prefix === 'mx') return 'mx-auto';
    return `${prefix}-auto`;
  }
  const mapped = SPACING_MAP[trimmed];
  if (mapped !== undefined) return `${prefix}-${mapped}`;
  // Check for negative values
  if (trimmed.startsWith('-')) {
    const pos = trimmed.slice(1);
    const posMapped = SPACING_MAP[pos];
    if (posMapped !== undefined) return `-${prefix}-${posMapped}`;
  }
  return `${prefix}-[${trimmed}]`;
}

function mapSpacingShorthand(prefix: string, value: string): string {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) {
    if (parts[0] === '0 auto') return `${prefix}x-auto`;
    return mapSpacing(prefix, parts[0]);
  }
  if (parts.length === 2) {
    const y = mapSpacing(`${prefix}y`, parts[0]);
    const x = parts[1] === 'auto' ? `${prefix}x-auto` : mapSpacing(`${prefix}x`, parts[1]);
    return `${y} ${x}`;
  }
  if (parts.length === 4) {
    const classes = [
      mapSpacing(`${prefix}t`, parts[0]),
      mapSpacing(`${prefix}r`, parts[1]),
      mapSpacing(`${prefix}b`, parts[2]),
      mapSpacing(`${prefix}l`, parts[3]),
    ];
    return classes.join(' ');
  }
  return `${prefix}-[${value}]`;
}

function mapSize(prefix: string, value: string): string {
  const map: Record<string, string> = {
    '100%': `${prefix}-full`, '100vw': `${prefix}-screen`, '100vh': `${prefix}-screen`,
    'auto': `${prefix}-auto`, 'min-content': `${prefix}-min`, 'max-content': `${prefix}-max`, 'fit-content': `${prefix}-fit`,
    '50%': `${prefix}-1/2`, '33.333333%': `${prefix}-1/3`, '66.666667%': `${prefix}-2/3`,
    '25%': `${prefix}-1/4`, '75%': `${prefix}-3/4`,
  };
  if (map[value]) return map[value];
  const spacing = SPACING_MAP[value];
  if (spacing !== undefined) return `${prefix}-${spacing}`;
  return `${prefix}-[${value}]`;
}

function mapMaxWidth(value: string): string {
  const map: Record<string, string> = {
    'none': 'max-w-none', '0': 'max-w-0', '100%': 'max-w-full',
    '20rem': 'max-w-xs', '24rem': 'max-w-sm', '28rem': 'max-w-md', '32rem': 'max-w-lg',
    '36rem': 'max-w-xl', '42rem': 'max-w-2xl', '48rem': 'max-w-3xl', '56rem': 'max-w-4xl',
    '64rem': 'max-w-5xl', '72rem': 'max-w-6xl', '80rem': 'max-w-7xl',
    '320px': 'max-w-xs', '384px': 'max-w-sm', '448px': 'max-w-md', '512px': 'max-w-lg',
    '576px': 'max-w-xl', '640px': 'max-w-2xl', '672px': 'max-w-2xl', '768px': 'max-w-3xl',
  };
  return map[value] || `max-w-[${value}]`;
}

// Color mapper
const COLOR_MAP: Record<string, string> = {
  '#000': 'black', '#000000': 'black', 'black': 'black', 'rgb(0, 0, 0)': 'black', 'rgb(0,0,0)': 'black',
  '#fff': 'white', '#ffffff': 'white', 'white': 'white', 'rgb(255, 255, 255)': 'white', 'rgb(255,255,255)': 'white',
  'transparent': 'transparent', 'currentColor': 'current', 'inherit': 'inherit',
  // Gray scale
  '#f9fafb': 'gray-50', '#f3f4f6': 'gray-100', '#e5e7eb': 'gray-200', '#d1d5db': 'gray-300',
  '#9ca3af': 'gray-400', '#6b7280': 'gray-500', '#4b5563': 'gray-600', '#374151': 'gray-700',
  '#1f2937': 'gray-800', '#111827': 'gray-900', '#030712': 'gray-950',
  // Common
  '#ef4444': 'red-500', '#f59e0b': 'amber-500', '#22c55e': 'green-500', '#3b82f6': 'blue-500',
  '#1a1a1a': 'gray-900', '#333333': 'gray-700', '#666666': 'gray-500', '#999999': 'gray-400', '#cccccc': 'gray-300',
};

function mapColor(prefix: string, value: string): string {
  const trimmed = value.trim().toLowerCase();
  const named = COLOR_MAP[trimmed];
  if (named) return `${prefix}-${named}`;
  // Hex colors
  if (trimmed.startsWith('#')) return `${prefix}-[${trimmed}]`;
  // rgb/rgba
  if (trimmed.startsWith('rgb')) return `${prefix}-[${trimmed.replace(/\s/g, '')}]`;
  return `${prefix}-[${trimmed}]`;
}

function mapTranslate(prefix: string, value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('-')) {
    const pos = trimmed.slice(1);
    const mapped = SPACING_MAP[pos];
    if (mapped !== undefined) return `-${prefix}-${mapped}`;
    return `-${prefix}-[${pos}]`;
  }
  const mapped = SPACING_MAP[trimmed];
  if (mapped !== undefined) return `${prefix}-${mapped}`;
  return `${prefix}-[${trimmed}]`;
}

export function mapProperty(property: string, value: string): string | null {
  const mapper = PROPERTY_MAP[property];
  if (!mapper) return null;

  if (typeof mapper === 'function') {
    return mapper(value.trim());
  }

  return mapper[value.trim()] || null;
}
