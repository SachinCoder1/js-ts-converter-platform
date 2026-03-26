import type { HtmlToJsxOptions, HtmlToJsxResult, HtmlToJsxStats } from './types';

// HTML attributes that need renaming in JSX
const HTML_TO_JSX_ATTRIBUTES: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
  'tabindex': 'tabIndex',
  'readonly': 'readOnly',
  'maxlength': 'maxLength',
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'rowspan': 'rowSpan',
  'colspan': 'colSpan',
  'enctype': 'encType',
  'formaction': 'formAction',
  'formenctype': 'formEncType',
  'formmethod': 'formMethod',
  'formnovalidate': 'formNoValidate',
  'formtarget': 'formTarget',
  'frameborder': 'frameBorder',
  'novalidate': 'noValidate',
  'crossorigin': 'crossOrigin',
  'datetime': 'dateTime',
  'accesskey': 'accessKey',
  'charset': 'charSet',
  'contenteditable': 'contentEditable',
  'contextmenu': 'contextMenu',
  'hreflang': 'hrefLang',
  'httpequiv': 'httpEquiv',
  'srcdoc': 'srcDoc',
  'srclang': 'srcLang',
  'srcset': 'srcSet',
  'usemap': 'useMap',
  'autocomplete': 'autoComplete',
  'autofocus': 'autoFocus',
  'autoplay': 'autoPlay',
};

// SVG attributes that need camelCase in JSX
const SVG_ATTRIBUTES: Record<string, string> = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'font-size': 'fontSize',
  'font-family': 'fontFamily',
  'font-weight': 'fontWeight',
  'font-style': 'fontStyle',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'dominant-baseline': 'dominantBaseline',
  'alignment-baseline': 'alignmentBaseline',
  'baseline-shift': 'baselineShift',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'lighting-color': 'lightingColor',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'pointer-events': 'pointerEvents',
  'shape-rendering': 'shapeRendering',
  'image-rendering': 'imageRendering',
  'marker-start': 'markerStart',
  'marker-mid': 'markerMid',
  'marker-end': 'markerEnd',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
};

// HTML event handlers to camelCase
const EVENT_HANDLERS: Record<string, string> = {
  'onclick': 'onClick',
  'ondblclick': 'onDoubleClick',
  'onchange': 'onChange',
  'oninput': 'onInput',
  'onsubmit': 'onSubmit',
  'onreset': 'onReset',
  'onfocus': 'onFocus',
  'onblur': 'onBlur',
  'onkeydown': 'onKeyDown',
  'onkeyup': 'onKeyUp',
  'onkeypress': 'onKeyPress',
  'onmousedown': 'onMouseDown',
  'onmouseup': 'onMouseUp',
  'onmouseover': 'onMouseOver',
  'onmouseout': 'onMouseOut',
  'onmouseenter': 'onMouseEnter',
  'onmouseleave': 'onMouseLeave',
  'onmousemove': 'onMouseMove',
  'onscroll': 'onScroll',
  'onwheel': 'onWheel',
  'ondrag': 'onDrag',
  'ondragstart': 'onDragStart',
  'ondragend': 'onDragEnd',
  'ondragover': 'onDragOver',
  'ondragenter': 'onDragEnter',
  'ondragleave': 'onDragLeave',
  'ondrop': 'onDrop',
  'ontouchstart': 'onTouchStart',
  'ontouchend': 'onTouchEnd',
  'ontouchmove': 'onTouchMove',
  'oncontextmenu': 'onContextMenu',
  'onload': 'onLoad',
  'onerror': 'onError',
  'onanimationstart': 'onAnimationStart',
  'onanimationend': 'onAnimationEnd',
  'ontransitionend': 'onTransitionEnd',
  'oncopy': 'onCopy',
  'oncut': 'onCut',
  'onpaste': 'onPaste',
  'onselect': 'onSelect',
};

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function convertStyleValue(cssString: string): string {
  const properties: string[] = [];
  // Split on semicolons but respect url() contents
  let current = '';
  let parenDepth = 0;
  for (const ch of cssString) {
    if (ch === '(') parenDepth++;
    else if (ch === ')') parenDepth--;
    if (ch === ';' && parenDepth === 0) {
      if (current.trim()) properties.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) properties.push(current.trim());

  const jsxProps = properties.map(prop => {
    const colonIdx = prop.indexOf(':');
    if (colonIdx === -1) return null;
    const cssKey = prop.slice(0, colonIdx).trim();
    const value = prop.slice(colonIdx + 1).trim();
    // Convert kebab-case to camelCase
    const camelKey = cssKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    // Pure numeric (not with units) stays as number
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return `${camelKey}: ${value}`;
    }
    // Numeric with px can be converted to number
    if (/^-?\d+(\.\d+)?px$/.test(value)) {
      return `${camelKey}: ${value.replace('px', '')}`;
    }
    return `${camelKey}: '${value.replace(/'/g, "\\'")}'`;
  }).filter(Boolean);

  return `{{ ${jsxProps.join(', ')} }}`;
}

function convertComments(html: string, stats: HtmlToJsxStats): string {
  return html.replace(/<!--([\s\S]*?)-->/g, (_match, content) => {
    stats.commentsConverted++;
    return `{/*${content}*/}`;
  });
}

function checkWarnings(html: string, warnings: string[]): void {
  if (/<script[\s>]/i.test(html)) {
    warnings.push('Inline <script> blocks detected  these need special handling in React (use useEffect or a script loader).');
  }
  if (/<style[\s>]/i.test(html)) {
    warnings.push('Inline <style> blocks detected  consider using CSS modules, styled-components, or inline styles in React.');
  }
}

function processAttributes(
  tagName: string,
  attrsString: string,
  options: HtmlToJsxOptions,
  stats: HtmlToJsxStats,
  isSvgContext: boolean,
): string {
  if (!attrsString.trim()) return attrsString;

  // Parse attributes from the string
  // Matches: attrName="value", attrName='value', attrName={value}, or bare attrName
  const attrRegex = /([a-zA-Z_][\w:.-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let result = attrsString;
  const replacements: Array<{ from: string; to: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrsString)) !== null) {
    const [fullMatch, attrName, doubleVal, singleVal, bareVal] = match;
    const value = doubleVal ?? singleVal ?? bareVal;
    const hasValue = value !== undefined;
    const lowerAttr = attrName.toLowerCase();

    let newAttr = attrName;
    const newValue = value;
    let isConverted = false;

    // Skip data-* and aria-* attributes
    if (lowerAttr.startsWith('data-') || lowerAttr.startsWith('aria-')) {
      continue;
    }

    // Handle xmlns removal on SVG
    if (lowerAttr === 'xmlns' && tagName.toLowerCase() === 'svg') {
      replacements.push({ from: fullMatch, to: '' });
      stats.attributesConverted++;
      continue;
    }

    // Handle style attribute
    if (lowerAttr === 'style' && hasValue) {
      const jsxStyle = convertStyleValue(value);
      const original = fullMatch;
      replacements.push({ from: original, to: `style=${jsxStyle}` });
      stats.stylesConverted++;
      continue;
    }

    // Handle event handlers
    if (EVENT_HANDLERS[lowerAttr]) {
      newAttr = EVENT_HANDLERS[lowerAttr];
      // Wrap the value in a function expression
      if (hasValue) {
        replacements.push({
          from: fullMatch,
          to: `${newAttr}={() => { ${value} }}`,
        });
      } else {
        replacements.push({ from: fullMatch, to: newAttr });
      }
      stats.attributesConverted++;
      continue;
    }

    // Handle SVG-specific attributes
    if (isSvgContext && SVG_ATTRIBUTES[lowerAttr]) {
      newAttr = SVG_ATTRIBUTES[lowerAttr];
      isConverted = true;
      stats.svgAttributesConverted++;
    }

    // Handle HTML → JSX attribute renames
    if (HTML_TO_JSX_ATTRIBUTES[lowerAttr]) {
      newAttr = HTML_TO_JSX_ATTRIBUTES[lowerAttr];
      isConverted = true;
      stats.attributesConverted++;
    }

    if (isConverted) {
      if (hasValue) {
        const q = options.quoteStyle === 'single' ? "'" : '"';
        replacements.push({
          from: fullMatch,
          to: `${newAttr}=${q}${newValue}${q}`,
        });
      } else {
        replacements.push({ from: fullMatch, to: newAttr });
      }
    }
  }

  // Apply replacements in reverse order to preserve positions
  for (const { from, to } of replacements.reverse()) {
    const idx = result.lastIndexOf(from);
    if (idx !== -1) {
      result = result.slice(0, idx) + to + result.slice(idx + from.length);
    }
  }

  return result;
}

function processAllTags(
  html: string,
  options: HtmlToJsxOptions,
  stats: HtmlToJsxStats,
): string {
  // Track SVG context
  let inSvg = false;

  // Process opening tags (including self-closing)
  // Match: < tagName (attrs) (optional /) >
  const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*?)?)\s*(\/?)>/g;

  return html.replace(tagRegex, (fullMatch, isClosing, tagName, attrsString, selfClose) => {
    const lowerTag = tagName.toLowerCase();

    // Track SVG context
    if (lowerTag === 'svg' && !isClosing) inSvg = true;
    if (lowerTag === 'svg' && isClosing) inSvg = false;

    // Don't process closing tags (except SVG context tracking above)
    if (isClosing) return fullMatch;

    // Process attributes
    const isSvgContext = inSvg || lowerTag === 'svg';
    const newAttrs = processAttributes(tagName, attrsString, options, stats, isSvgContext);

    // Handle self-closing for void elements
    const isVoid = VOID_ELEMENTS.has(lowerTag);
    if (isVoid && options.selfClosingStyle === 'always' && !selfClose) {
      stats.selfClosingTagsFixed++;
      return `<${tagName}${newAttrs} />`;
    }

    return `<${tagName}${newAttrs}${selfClose ? ' /' : ''}>`;
  });
}

function applyWrapper(code: string, options: HtmlToJsxOptions): string {
  if (options.componentWrapper === 'none') return code;

  const indented = code.split('\n').map(line => `    ${line}`).join('\n');

  if (options.componentWrapper === 'function') {
    if (options.outputFormat === 'tsx') {
      return `function MyComponent(): React.ReactElement {\n  return (\n${indented}\n  );\n}`;
    }
    return `function MyComponent() {\n  return (\n${indented}\n  );\n}`;
  }

  if (options.componentWrapper === 'arrow') {
    if (options.outputFormat === 'tsx') {
      return `const MyComponent: React.FC = () => {\n  return (\n${indented}\n  );\n};`;
    }
    return `const MyComponent = () => {\n  return (\n${indented}\n  );\n};`;
  }

  return code;
}

function convertQuotesToSingle(code: string): string {
  // Convert double-quoted attribute values to single quotes
  // But skip style={{ ... }} objects and JSX expressions
  return code.replace(
    /(<[a-zA-Z][^>]*?)="([^"]*?)"/g,
    (match, before, value) => {
      // Don't convert style objects (they start with {{ )
      if (value.startsWith('{')) return match;
      return `${before}='${value}'`;
    },
  );
}

export function convertHtmlToJsx(
  html: string,
  options: HtmlToJsxOptions,
): HtmlToJsxResult {
  const warnings: string[] = [];
  const stats: HtmlToJsxStats = {
    attributesConverted: 0,
    stylesConverted: 0,
    commentsConverted: 0,
    selfClosingTagsFixed: 0,
    svgAttributesConverted: 0,
  };

  if (!html.trim()) {
    return { code: '', warnings, stats };
  }

  let result = html;

  // Step 1: Convert comments
  result = convertComments(result, stats);

  // Step 2: Check for script/style warnings
  checkWarnings(result, warnings);

  // Step 3: Process all tags (attributes, self-closing, SVG)
  result = processAllTags(result, options, stats);

  // Step 4: Apply component wrapper
  result = applyWrapper(result, options);

  // Step 5: Convert quotes if needed
  if (options.quoteStyle === 'single') {
    result = convertQuotesToSingle(result);
  }

  return { code: result, warnings, stats };
}
