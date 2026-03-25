// ─── Static class → CSS map ───────────────────────────────────────────────
// Covers ~160 common utility classes with fixed values

export const staticMap: Record<string, string> = {
  // Display
  'flex': 'display: flex',
  'inline-flex': 'display: inline-flex',
  'block': 'display: block',
  'inline-block': 'display: inline-block',
  'inline': 'display: inline',
  'grid': 'display: grid',
  'inline-grid': 'display: inline-grid',
  'contents': 'display: contents',
  'hidden': 'display: none',
  'table': 'display: table',
  'table-row': 'display: table-row',
  'table-cell': 'display: table-cell',
  'list-item': 'display: list-item',
  'flow-root': 'display: flow-root',

  // Position
  'relative': 'position: relative',
  'absolute': 'position: absolute',
  'fixed': 'position: fixed',
  'sticky': 'position: sticky',
  'static': 'position: static',

  // Flex direction
  'flex-row': 'flex-direction: row',
  'flex-row-reverse': 'flex-direction: row-reverse',
  'flex-col': 'flex-direction: column',
  'flex-col-reverse': 'flex-direction: column-reverse',

  // Flex wrap
  'flex-wrap': 'flex-wrap: wrap',
  'flex-wrap-reverse': 'flex-wrap: wrap-reverse',
  'flex-nowrap': 'flex-wrap: nowrap',

  // Flex sizing
  'flex-1': 'flex: 1 1 0%',
  'flex-auto': 'flex: 1 1 auto',
  'flex-initial': 'flex: 0 1 auto',
  'flex-none': 'flex: none',

  // Grow / Shrink
  'grow': 'flex-grow: 1',
  'grow-0': 'flex-grow: 0',
  'shrink': 'flex-shrink: 1',
  'shrink-0': 'flex-shrink: 0',

  // Align items
  'items-start': 'align-items: flex-start',
  'items-end': 'align-items: flex-end',
  'items-center': 'align-items: center',
  'items-baseline': 'align-items: baseline',
  'items-stretch': 'align-items: stretch',

  // Align self
  'self-auto': 'align-self: auto',
  'self-start': 'align-self: flex-start',
  'self-end': 'align-self: flex-end',
  'self-center': 'align-self: center',
  'self-stretch': 'align-self: stretch',
  'self-baseline': 'align-self: baseline',

  // Justify content
  'justify-start': 'justify-content: flex-start',
  'justify-end': 'justify-content: flex-end',
  'justify-center': 'justify-content: center',
  'justify-between': 'justify-content: space-between',
  'justify-around': 'justify-content: space-around',
  'justify-evenly': 'justify-content: space-evenly',

  // Justify items
  'justify-items-start': 'justify-items: start',
  'justify-items-end': 'justify-items: end',
  'justify-items-center': 'justify-items: center',
  'justify-items-stretch': 'justify-items: stretch',

  // Align content
  'content-start': 'align-content: flex-start',
  'content-end': 'align-content: flex-end',
  'content-center': 'align-content: center',
  'content-between': 'align-content: space-between',
  'content-around': 'align-content: space-around',
  'content-evenly': 'align-content: space-evenly',

  // Place items / content / self
  'place-content-center': 'place-content: center',
  'place-items-center': 'place-items: center',
  'place-self-center': 'place-self: center',
  'place-self-auto': 'place-self: auto',
  'place-self-start': 'place-self: start',
  'place-self-end': 'place-self: end',

  // Overflow
  'overflow-auto': 'overflow: auto',
  'overflow-hidden': 'overflow: hidden',
  'overflow-visible': 'overflow: visible',
  'overflow-scroll': 'overflow: scroll',
  'overflow-x-auto': 'overflow-x: auto',
  'overflow-x-hidden': 'overflow-x: hidden',
  'overflow-x-scroll': 'overflow-x: scroll',
  'overflow-y-auto': 'overflow-y: auto',
  'overflow-y-hidden': 'overflow-y: hidden',
  'overflow-y-scroll': 'overflow-y: scroll',

  // Visibility
  'visible': 'visibility: visible',
  'invisible': 'visibility: hidden',
  'collapse': 'visibility: collapse',

  // Text alignment
  'text-left': 'text-align: left',
  'text-center': 'text-align: center',
  'text-right': 'text-align: right',
  'text-justify': 'text-align: justify',
  'text-start': 'text-align: start',
  'text-end': 'text-align: end',

  // Vertical align
  'align-baseline': 'vertical-align: baseline',
  'align-top': 'vertical-align: top',
  'align-middle': 'vertical-align: middle',
  'align-bottom': 'vertical-align: bottom',
  'align-text-top': 'vertical-align: text-top',
  'align-text-bottom': 'vertical-align: text-bottom',

  // Font weight
  'font-thin': 'font-weight: 100',
  'font-extralight': 'font-weight: 200',
  'font-light': 'font-weight: 300',
  'font-normal': 'font-weight: 400',
  'font-medium': 'font-weight: 500',
  'font-semibold': 'font-weight: 600',
  'font-bold': 'font-weight: 700',
  'font-extrabold': 'font-weight: 800',
  'font-black': 'font-weight: 900',

  // Font style
  'italic': 'font-style: italic',
  'not-italic': 'font-style: normal',

  // Font family
  'font-sans': "font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  'font-serif': "font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  'font-mono': "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

  // Text decoration
  'underline': 'text-decoration-line: underline',
  'overline': 'text-decoration-line: overline',
  'line-through': 'text-decoration-line: line-through',
  'no-underline': 'text-decoration-line: none',

  // Text transform
  'uppercase': 'text-transform: uppercase',
  'lowercase': 'text-transform: lowercase',
  'capitalize': 'text-transform: capitalize',
  'normal-case': 'text-transform: none',

  // Text overflow
  'truncate': 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap',
  'text-ellipsis': 'text-overflow: ellipsis',
  'text-clip': 'text-overflow: clip',

  // Whitespace
  'whitespace-normal': 'white-space: normal',
  'whitespace-nowrap': 'white-space: nowrap',
  'whitespace-pre': 'white-space: pre',
  'whitespace-pre-line': 'white-space: pre-line',
  'whitespace-pre-wrap': 'white-space: pre-wrap',
  'whitespace-break-spaces': 'white-space: break-spaces',

  // Word break
  'break-normal': 'overflow-wrap: normal; word-break: normal',
  'break-words': 'overflow-wrap: break-word',
  'break-all': 'word-break: break-all',
  'break-keep': 'word-break: keep-all',

  // Anti-aliasing
  'antialiased': '-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale',
  'subpixel-antialiased': '-webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto',

  // Transition
  'transition': 'transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms',
  'transition-all': 'transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms',
  'transition-colors': 'transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms',
  'transition-opacity': 'transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms',
  'transition-shadow': 'transition-property: box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms',
  'transition-transform': 'transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms',
  'transition-none': 'transition-property: none',

  // Border width
  'border': 'border-width: 1px',
  'border-0': 'border-width: 0px',
  'border-2': 'border-width: 2px',
  'border-4': 'border-width: 4px',
  'border-8': 'border-width: 8px',
  'border-t': 'border-top-width: 1px',
  'border-r': 'border-right-width: 1px',
  'border-b': 'border-bottom-width: 1px',
  'border-l': 'border-left-width: 1px',
  'border-x': 'border-left-width: 1px; border-right-width: 1px',
  'border-y': 'border-top-width: 1px; border-bottom-width: 1px',

  // Border style
  'border-solid': 'border-style: solid',
  'border-dashed': 'border-style: dashed',
  'border-dotted': 'border-style: dotted',
  'border-double': 'border-style: double',
  'border-hidden': 'border-style: hidden',
  'border-none': 'border-style: none',

  // Border radius
  'rounded-none': 'border-radius: 0px',
  'rounded-sm': 'border-radius: 0.125rem',
  'rounded': 'border-radius: 0.25rem',
  'rounded-md': 'border-radius: 0.375rem',
  'rounded-lg': 'border-radius: 0.5rem',
  'rounded-xl': 'border-radius: 0.75rem',
  'rounded-2xl': 'border-radius: 1rem',
  'rounded-3xl': 'border-radius: 1.5rem',
  'rounded-full': 'border-radius: 9999px',

  // Box shadow
  'shadow-sm': 'box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow': 'box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'shadow-md': 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg': 'box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'shadow-xl': 'box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'shadow-2xl': 'box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'shadow-inner': 'box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  'shadow-none': 'box-shadow: 0 0 #0000',

  // Cursor
  'cursor-auto': 'cursor: auto',
  'cursor-default': 'cursor: default',
  'cursor-pointer': 'cursor: pointer',
  'cursor-wait': 'cursor: wait',
  'cursor-text': 'cursor: text',
  'cursor-move': 'cursor: move',
  'cursor-help': 'cursor: help',
  'cursor-not-allowed': 'cursor: not-allowed',
  'cursor-none': 'cursor: none',
  'cursor-grab': 'cursor: grab',
  'cursor-grabbing': 'cursor: grabbing',

  // Pointer events
  'pointer-events-none': 'pointer-events: none',
  'pointer-events-auto': 'pointer-events: auto',

  // User select
  'select-none': 'user-select: none',
  'select-text': 'user-select: text',
  'select-all': 'user-select: all',
  'select-auto': 'user-select: auto',

  // Object fit
  'object-contain': 'object-fit: contain',
  'object-cover': 'object-fit: cover',
  'object-fill': 'object-fit: fill',
  'object-none': 'object-fit: none',
  'object-scale-down': 'object-fit: scale-down',

  // Aspect ratio
  'aspect-auto': 'aspect-ratio: auto',
  'aspect-square': 'aspect-ratio: 1 / 1',
  'aspect-video': 'aspect-ratio: 16 / 9',

  // Box sizing
  'box-border': 'box-sizing: border-box',
  'box-content': 'box-sizing: content-box',

  // Float / Clear
  'float-right': 'float: right',
  'float-left': 'float: left',
  'float-none': 'float: none',
  'clear-left': 'clear: left',
  'clear-right': 'clear: right',
  'clear-both': 'clear: both',
  'clear-none': 'clear: none',

  // Isolation
  'isolate': 'isolation: isolate',
  'isolation-auto': 'isolation: auto',

  // Table
  'table-auto': 'table-layout: auto',
  'table-fixed': 'table-layout: fixed',
  'border-collapse': 'border-collapse: collapse',
  'border-separate': 'border-collapse: separate',

  // List style
  'list-none': 'list-style-type: none',
  'list-disc': 'list-style-type: disc',
  'list-decimal': 'list-style-type: decimal',
  'list-inside': 'list-style-position: inside',
  'list-outside': 'list-style-position: outside',

  // Appearance
  'appearance-none': 'appearance: none',
  'appearance-auto': 'appearance: auto',

  // Resize
  'resize-none': 'resize: none',
  'resize-y': 'resize: vertical',
  'resize-x': 'resize: horizontal',
  'resize': 'resize: both',

  // Outline
  'outline-none': 'outline: 2px solid transparent; outline-offset: 2px',
  'outline': 'outline-style: solid',
  'outline-dashed': 'outline-style: dashed',
  'outline-dotted': 'outline-style: dotted',
  'outline-double': 'outline-style: double',

  // Mix blend
  'mix-blend-normal': 'mix-blend-mode: normal',
  'mix-blend-multiply': 'mix-blend-mode: multiply',
  'mix-blend-screen': 'mix-blend-mode: screen',
  'mix-blend-overlay': 'mix-blend-mode: overlay',

  // Background
  'bg-fixed': 'background-attachment: fixed',
  'bg-local': 'background-attachment: local',
  'bg-scroll': 'background-attachment: scroll',
  'bg-clip-border': 'background-clip: border-box',
  'bg-clip-padding': 'background-clip: padding-box',
  'bg-clip-content': 'background-clip: content-box',
  'bg-clip-text': '-webkit-background-clip: text; background-clip: text',
  'bg-repeat': 'background-repeat: repeat',
  'bg-no-repeat': 'background-repeat: no-repeat',
  'bg-repeat-x': 'background-repeat: repeat-x',
  'bg-repeat-y': 'background-repeat: repeat-y',
  'bg-auto': 'background-size: auto',
  'bg-cover': 'background-size: cover',
  'bg-contain': 'background-size: contain',
  'bg-center': 'background-position: center',
  'bg-top': 'background-position: top',
  'bg-bottom': 'background-position: bottom',
  'bg-left': 'background-position: left',
  'bg-right': 'background-position: right',

  // Grid auto
  'grid-flow-row': 'grid-auto-flow: row',
  'grid-flow-col': 'grid-auto-flow: column',
  'grid-flow-dense': 'grid-auto-flow: dense',
  'grid-flow-row-dense': 'grid-auto-flow: row dense',
  'grid-flow-col-dense': 'grid-auto-flow: column dense',

  // Will change
  'will-change-auto': 'will-change: auto',
  'will-change-scroll': 'will-change: scroll-position',
  'will-change-contents': 'will-change: contents',
  'will-change-transform': 'will-change: transform',

  // Scroll behavior
  'scroll-auto': 'scroll-behavior: auto',
  'scroll-smooth': 'scroll-behavior: smooth',

  // Snap
  'snap-start': 'scroll-snap-align: start',
  'snap-end': 'scroll-snap-align: end',
  'snap-center': 'scroll-snap-align: center',
  'snap-none': 'scroll-snap-type: none',
  'snap-x': 'scroll-snap-type: x var(--tw-scroll-snap-strictness)',
  'snap-y': 'scroll-snap-type: y var(--tw-scroll-snap-strictness)',
  'snap-mandatory': '--tw-scroll-snap-strictness: mandatory',
  'snap-proximity': '--tw-scroll-snap-strictness: proximity',

  // Touch action
  'touch-auto': 'touch-action: auto',
  'touch-none': 'touch-action: none',
  'touch-manipulation': 'touch-action: manipulation',

  // Transform origin
  'origin-center': 'transform-origin: center',
  'origin-top': 'transform-origin: top',
  'origin-top-right': 'transform-origin: top right',
  'origin-right': 'transform-origin: right',
  'origin-bottom-right': 'transform-origin: bottom right',
  'origin-bottom': 'transform-origin: bottom',
  'origin-bottom-left': 'transform-origin: bottom left',
  'origin-left': 'transform-origin: left',
  'origin-top-left': 'transform-origin: top left',

  // Container
  'container': 'width: 100%',

  // SR only
  'sr-only': 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0',
  'not-sr-only': 'position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal',

  // Inset
  'inset-0': 'inset: 0px',
  'inset-auto': 'inset: auto',
  'inset-x-0': 'left: 0px; right: 0px',
  'inset-y-0': 'top: 0px; bottom: 0px',
  'top-0': 'top: 0px',
  'right-0': 'right: 0px',
  'bottom-0': 'bottom: 0px',
  'left-0': 'left: 0px',
};

// ─── Spacing scale ────────────────────────────────────────────────────────
export const spacingScale: Record<string, string> = {
  '0': '0px', '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem',
  '2': '0.5rem', '2.5': '0.625rem', '3': '0.75rem', '3.5': '0.875rem',
  '4': '1rem', '5': '1.25rem', '6': '1.5rem', '7': '1.75rem',
  '8': '2rem', '9': '2.25rem', '10': '2.5rem', '11': '2.75rem',
  '12': '3rem', '14': '3.5rem', '16': '4rem', '20': '5rem',
  '24': '6rem', '28': '7rem', '32': '8rem', '36': '9rem',
  '40': '10rem', '44': '11rem', '48': '12rem', '52': '13rem',
  '56': '14rem', '60': '15rem', '64': '16rem', '72': '18rem',
  '80': '20rem', '96': '24rem',
  'px': '1px',
};

// ─── Font sizes ───────────────────────────────────────────────────────────
export const fontSizeMap: Record<string, string> = {
  'xs': 'font-size: 0.75rem; line-height: 1rem',
  'sm': 'font-size: 0.875rem; line-height: 1.25rem',
  'base': 'font-size: 1rem; line-height: 1.5rem',
  'lg': 'font-size: 1.125rem; line-height: 1.75rem',
  'xl': 'font-size: 1.25rem; line-height: 1.75rem',
  '2xl': 'font-size: 1.5rem; line-height: 2rem',
  '3xl': 'font-size: 1.875rem; line-height: 2.25rem',
  '4xl': 'font-size: 2.25rem; line-height: 2.5rem',
  '5xl': 'font-size: 3rem; line-height: 1',
  '6xl': 'font-size: 3.75rem; line-height: 1',
  '7xl': 'font-size: 4.5rem; line-height: 1',
  '8xl': 'font-size: 6rem; line-height: 1',
  '9xl': 'font-size: 8rem; line-height: 1',
};

// ─── Letter spacing ───────────────────────────────────────────────────────
export const trackingMap: Record<string, string> = {
  'tighter': 'letter-spacing: -0.05em',
  'tight': 'letter-spacing: -0.025em',
  'normal': 'letter-spacing: 0em',
  'wide': 'letter-spacing: 0.025em',
  'wider': 'letter-spacing: 0.05em',
  'widest': 'letter-spacing: 0.1em',
};

// ─── Line height ──────────────────────────────────────────────────────────
export const leadingMap: Record<string, string> = {
  '3': 'line-height: 0.75rem',
  '4': 'line-height: 1rem',
  '5': 'line-height: 1.25rem',
  '6': 'line-height: 1.5rem',
  '7': 'line-height: 1.75rem',
  '8': 'line-height: 2rem',
  '9': 'line-height: 2.25rem',
  '10': 'line-height: 2.5rem',
  'none': 'line-height: 1',
  'tight': 'line-height: 1.25',
  'snug': 'line-height: 1.375',
  'normal': 'line-height: 1.5',
  'relaxed': 'line-height: 1.625',
  'loose': 'line-height: 2',
};

// ─── Duration ─────────────────────────────────────────────────────────────
export const durationMap: Record<string, string> = {
  '0': 'transition-duration: 0s',
  '75': 'transition-duration: 75ms',
  '100': 'transition-duration: 100ms',
  '150': 'transition-duration: 150ms',
  '200': 'transition-duration: 200ms',
  '300': 'transition-duration: 300ms',
  '500': 'transition-duration: 500ms',
  '700': 'transition-duration: 700ms',
  '1000': 'transition-duration: 1000ms',
};

// ─── Delay ────────────────────────────────────────────────────────────────
export const delayMap: Record<string, string> = {
  '0': 'transition-delay: 0s',
  '75': 'transition-delay: 75ms',
  '100': 'transition-delay: 100ms',
  '150': 'transition-delay: 150ms',
  '200': 'transition-delay: 200ms',
  '300': 'transition-delay: 300ms',
  '500': 'transition-delay: 500ms',
  '700': 'transition-delay: 700ms',
  '1000': 'transition-delay: 1000ms',
};

// ─── Easing ───────────────────────────────────────────────────────────────
export const easeMap: Record<string, string> = {
  'linear': 'transition-timing-function: linear',
  'in': 'transition-timing-function: cubic-bezier(0.4, 0, 1, 1)',
  'out': 'transition-timing-function: cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)',
};

// ─── Opacity ──────────────────────────────────────────────────────────────
export const opacityMap: Record<string, string> = Object.fromEntries(
  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(
    (v) => [String(v), `opacity: ${v / 100}`]
  )
);

// ─── Z-Index ──────────────────────────────────────────────────────────────
export const zIndexMap: Record<string, string> = {
  '0': 'z-index: 0',
  '10': 'z-index: 10',
  '20': 'z-index: 20',
  '30': 'z-index: 30',
  '40': 'z-index: 40',
  '50': 'z-index: 50',
  'auto': 'z-index: auto',
};

// ─── Responsive breakpoints ───────────────────────────────────────────────
export const breakpoints: Record<string, string> = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
};

// ─── Pseudo-class / element variants ──────────────────────────────────────
export const pseudoVariants: Record<string, string> = {
  'hover': ':hover',
  'focus': ':focus',
  'focus-within': ':focus-within',
  'focus-visible': ':focus-visible',
  'active': ':active',
  'visited': ':visited',
  'target': ':target',
  'first': ':first-child',
  'last': ':last-child',
  'only': ':only-child',
  'odd': ':nth-child(odd)',
  'even': ':nth-child(even)',
  'first-of-type': ':first-of-type',
  'last-of-type': ':last-of-type',
  'empty': ':empty',
  'disabled': ':disabled',
  'enabled': ':enabled',
  'checked': ':checked',
  'indeterminate': ':indeterminate',
  'default': ':default',
  'required': ':required',
  'valid': ':valid',
  'invalid': ':invalid',
  'in-range': ':in-range',
  'out-of-range': ':out-of-range',
  'placeholder-shown': ':placeholder-shown',
  'autofill': ':autofill',
  'read-only': ':read-only',
  'placeholder': '::placeholder',
  'before': '::before',
  'after': '::after',
  'first-letter': '::first-letter',
  'first-line': '::first-line',
  'marker': '::marker',
  'selection': '::selection',
  'file': '::file-selector-button',
  'backdrop': '::backdrop',
};

// ─── Color palette ────────────────────────────────────────────────────────
export const colorPalette: Record<string, Record<string, string>> = {
  slate: { '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0', '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b', '600': '#475569', '700': '#334155', '800': '#1e293b', '900': '#0f172a', '950': '#020617' },
  gray: { '50': '#f9fafb', '100': '#f3f4f6', '200': '#e5e7eb', '300': '#d1d5db', '400': '#9ca3af', '500': '#6b7280', '600': '#4b5563', '700': '#374151', '800': '#1f2937', '900': '#111827', '950': '#030712' },
  zinc: { '50': '#fafafa', '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8', '400': '#a1a1aa', '500': '#71717a', '600': '#52525b', '700': '#3f3f46', '800': '#27272a', '900': '#18181b', '950': '#09090b' },
  neutral: { '50': '#fafafa', '100': '#f5f5f5', '200': '#e5e5e5', '300': '#d4d4d4', '400': '#a3a3a3', '500': '#737373', '600': '#525252', '700': '#404040', '800': '#262626', '900': '#171717', '950': '#0a0a0a' },
  stone: { '50': '#fafaf9', '100': '#f5f5f4', '200': '#e7e5e4', '300': '#d6d3d1', '400': '#a8a29e', '500': '#78716c', '600': '#57534e', '700': '#44403c', '800': '#292524', '900': '#1c1917', '950': '#0c0a09' },
  red: { '50': '#fef2f2', '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5', '400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c', '800': '#991b1b', '900': '#7f1d1d', '950': '#450a0a' },
  orange: { '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74', '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c', '800': '#9a3412', '900': '#7c2d12', '950': '#431407' },
  amber: { '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f', '950': '#451a03' },
  yellow: { '50': '#fefce8', '100': '#fef9c3', '200': '#fef08a', '300': '#fde047', '400': '#facc15', '500': '#eab308', '600': '#ca8a04', '700': '#a16207', '800': '#854d0e', '900': '#713f12', '950': '#422006' },
  lime: { '50': '#f7fee7', '100': '#ecfccb', '200': '#d9f99d', '300': '#bef264', '400': '#a3e635', '500': '#84cc16', '600': '#65a30d', '700': '#4d7c0f', '800': '#3f6212', '900': '#365314', '950': '#1a2e05' },
  green: { '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac', '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d', '800': '#166534', '900': '#14532d', '950': '#052e16' },
  emerald: { '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22' },
  teal: { '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e', '800': '#115e59', '900': '#134e4a', '950': '#042f2e' },
  cyan: { '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9', '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63', '950': '#083344' },
  sky: { '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1', '800': '#075985', '900': '#0c4a6e', '950': '#082f49' },
  blue: { '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554' },
  indigo: { '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca', '800': '#3730a3', '900': '#312e81', '950': '#1e1b4b' },
  violet: { '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065' },
  purple: { '50': '#faf5ff', '100': '#f3e8ff', '200': '#e9d5ff', '300': '#d8b4fe', '400': '#c084fc', '500': '#a855f7', '600': '#9333ea', '700': '#7e22ce', '800': '#6b21a8', '900': '#581c87', '950': '#3b0764' },
  fuchsia: { '50': '#fdf4ff', '100': '#fae8ff', '200': '#f5d0fe', '300': '#f0abfc', '400': '#e879f9', '500': '#d946ef', '600': '#c026d3', '700': '#a21caf', '800': '#86198f', '900': '#701a75', '950': '#4a044e' },
  pink: { '50': '#fdf2f8', '100': '#fce7f3', '200': '#fbcfe8', '300': '#f9a8d4', '400': '#f472b6', '500': '#ec4899', '600': '#db2777', '700': '#be185d', '800': '#9d174d', '900': '#831843', '950': '#500724' },
  rose: { '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519' },
};

// Special colors
export const specialColors: Record<string, string> = {
  'white': '#ffffff',
  'black': '#000000',
  'transparent': 'transparent',
  'current': 'currentColor',
  'inherit': 'inherit',
};

// ─── Width / Height fractional values ─────────────────────────────────────
export const fractionMap: Record<string, string> = {
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '2/4': '50%',
  '3/4': '75%',
  '1/5': '20%',
  '2/5': '40%',
  '3/5': '60%',
  '4/5': '80%',
  '1/6': '16.666667%',
  '2/6': '33.333333%',
  '3/6': '50%',
  '4/6': '66.666667%',
  '5/6': '83.333333%',
  '1/12': '8.333333%',
  '2/12': '16.666667%',
  '3/12': '25%',
  '4/12': '33.333333%',
  '5/12': '41.666667%',
  '6/12': '50%',
  '7/12': '58.333333%',
  '8/12': '66.666667%',
  '9/12': '75%',
  '10/12': '83.333333%',
  '11/12': '91.666667%',
};

// ─── Special size values ──────────────────────────────────────────────────
export const sizeKeywords: Record<string, string> = {
  'auto': 'auto',
  'full': '100%',
  'screen': '100vw',
  'svw': '100svw',
  'lvw': '100lvw',
  'dvw': '100dvw',
  'min': 'min-content',
  'max': 'max-content',
  'fit': 'fit-content',
};

export const heightKeywords: Record<string, string> = {
  'auto': 'auto',
  'full': '100%',
  'screen': '100vh',
  'svh': '100svh',
  'lvh': '100lvh',
  'dvh': '100dvh',
  'min': 'min-content',
  'max': 'max-content',
  'fit': 'fit-content',
};

// ─── Ring ─────────────────────────────────────────────────────────────────
export const ringWidthMap: Record<string, string> = {
  '0': 'box-shadow: var(--tw-ring-inset) 0 0 0 0px var(--tw-ring-color)',
  '1': 'box-shadow: var(--tw-ring-inset) 0 0 0 1px var(--tw-ring-color)',
  '2': 'box-shadow: var(--tw-ring-inset) 0 0 0 2px var(--tw-ring-color)',
  '': 'box-shadow: var(--tw-ring-inset) 0 0 0 3px var(--tw-ring-color)',
  '4': 'box-shadow: var(--tw-ring-inset) 0 0 0 4px var(--tw-ring-color)',
  '8': 'box-shadow: var(--tw-ring-inset) 0 0 0 8px var(--tw-ring-color)',
};
