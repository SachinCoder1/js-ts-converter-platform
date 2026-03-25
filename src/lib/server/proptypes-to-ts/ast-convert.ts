import type { PropTypesToTsOptions, PropTypesToTsStats } from '../../types';

interface ParsedProp {
  name: string;
  type: string;
  required: boolean;
}

export function propTypesToTsAst(
  code: string,
  options: PropTypesToTsOptions,
): { code: string; stats: PropTypesToTsStats } {
  const stats: PropTypesToTsStats = {
    propsConverted: 0,
    interfacesCreated: 0,
    requiredProps: 0,
    optionalProps: 0,
  };

  // Extract component name
  const componentName = extractComponentName(code);
  if (!componentName) {
    return { code: '// Could not detect a React component', stats };
  }

  // Extract propTypes block
  const propTypesBlock = extractPropTypesBlock(code, componentName);
  if (!propTypesBlock) {
    return { code: '// No propTypes definition found', stats };
  }

  // Extract defaultProps
  const defaultProps = extractDefaultProps(code, componentName);

  // Parse individual props
  const props = parsePropTypes(propTypesBlock);

  // Apply defaultProps handling
  if (options.defaultPropsHandling === 'merge-optional') {
    for (const prop of props) {
      if (defaultProps.has(prop.name) && prop.required) {
        prop.required = false;
      }
    }
  }

  // Count stats
  stats.propsConverted = props.length;
  stats.interfacesCreated = 1;
  stats.requiredProps = props.filter(p => p.required).length;
  stats.optionalProps = props.filter(p => !p.required).length;

  // Build interface
  const interfaceName = `${componentName}Props`;
  const lines: string[] = [];
  lines.push(`interface ${interfaceName} {`);
  for (const prop of props) {
    const opt = prop.required ? '' : '?';
    lines.push(`  ${prop.name}${opt}: ${prop.type};`);
  }
  lines.push('}');

  let output = lines.join('\n');

  if (options.outputMode === 'interface-and-component') {
    output += '\n\n' + rewriteComponent(code, componentName, interfaceName, props);
  }

  return { code: output, stats };
}

function extractComponentName(code: string): string | null {
  // function ComponentName(
  const funcMatch = code.match(/function\s+([A-Z][A-Za-z0-9]*)\s*\(/);
  if (funcMatch) return funcMatch[1];

  // const ComponentName = (
  const arrowMatch = code.match(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=\s*(?:\([^)]*\)|[^=])\s*=>/);
  if (arrowMatch) return arrowMatch[1];

  // const ComponentName = function(
  const fnExprMatch = code.match(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=\s*function\s*\(/);
  if (fnExprMatch) return fnExprMatch[1];

  // class ComponentName
  const classMatch = code.match(/class\s+([A-Z][A-Za-z0-9]*)\s+extends\s+(?:React\.)?(?:Component|PureComponent)/);
  if (classMatch) return classMatch[1];

  return null;
}

function extractPropTypesBlock(code: string, componentName: string): string | null {
  const pattern = new RegExp(`${componentName}\\.propTypes\\s*=\\s*\\{`);
  const match = pattern.exec(code);
  if (!match) return null;

  let depth = 0;
  let start = match.index + match[0].length - 1; // position of opening {
  for (let i = start; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) {
        return code.slice(start + 1, i);
      }
    }
  }
  return null;
}

function extractDefaultProps(code: string, componentName: string): Set<string> {
  const defaults = new Set<string>();
  const pattern = new RegExp(`${componentName}\\.defaultProps\\s*=\\s*\\{`);
  const match = pattern.exec(code);
  if (!match) return defaults;

  let depth = 0;
  const start = match.index + match[0].length - 1;
  let blockEnd = code.length;
  for (let i = start; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) {
        blockEnd = i;
        break;
      }
    }
  }

  const block = code.slice(start + 1, blockEnd);
  // Match top-level keys (depth 0)
  const keyPattern = /^\s*(\w+)\s*:/gm;
  let keyMatch;
  while ((keyMatch = keyPattern.exec(block)) !== null) {
    // Only count keys at depth 0
    const before = block.slice(0, keyMatch.index);
    const openBraces = (before.match(/\{/g) || []).length;
    const closeBraces = (before.match(/\}/g) || []).length;
    if (openBraces === closeBraces) {
      defaults.add(keyMatch[1]);
    }
  }

  return defaults;
}

function parsePropTypes(block: string): ParsedProp[] {
  const props: ParsedProp[] = [];

  // Match each prop definition at depth 0
  const entries = splitTopLevelEntries(block);
  for (const entry of entries) {
    const colonIndex = entry.indexOf(':');
    if (colonIndex === -1) continue;

    const name = entry.slice(0, colonIndex).trim();
    if (!name || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) continue;

    const valuePart = entry.slice(colonIndex + 1).trim();
    const required = valuePart.endsWith('.isRequired') ||
      valuePart.includes('.isRequired,') ||
      valuePart.includes('.isRequired\n');
    const cleanValue = valuePart.replace(/\.isRequired\s*,?\s*$/, '').trim();
    const tsType = mapPropTypeToTs(cleanValue);

    props.push({ name, type: tsType, required });
  }

  return props;
}

function splitTopLevelEntries(block: string): string[] {
  const entries: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;

    if (ch === ',' && depth === 0) {
      if (current.trim()) entries.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) entries.push(current.trim());

  return entries;
}

function mapPropTypeToTs(value: string): string {
  const v = value.replace(/^PropTypes\./, '').trim();

  // Simple types
  if (v === 'string') return 'string';
  if (v === 'number') return 'number';
  if (v === 'bool') return 'boolean';
  if (v === 'func') return '(...args: unknown[]) => unknown';
  if (v === 'array') return 'unknown[]';
  if (v === 'object') return 'Record<string, unknown>';
  if (v === 'node') return 'React.ReactNode';
  if (v === 'element') return 'React.ReactElement';
  if (v === 'any') return 'unknown';
  if (v === 'symbol') return 'symbol';

  // arrayOf(X)
  const arrayOfMatch = v.match(/^arrayOf\(([\s\S]+)\)$/);
  if (arrayOfMatch) {
    const inner = mapPropTypeToTs(arrayOfMatch[1].trim());
    return `${inner}[]`;
  }

  // objectOf(X)
  const objectOfMatch = v.match(/^objectOf\(([\s\S]+)\)$/);
  if (objectOfMatch) {
    const inner = mapPropTypeToTs(objectOfMatch[1].trim());
    return `Record<string, ${inner}>`;
  }

  // oneOf([...])
  const oneOfMatch = v.match(/^oneOf\(\[([\s\S]+)\]\)$/);
  if (oneOfMatch) {
    const values = splitTopLevelEntries(oneOfMatch[1]);
    const mapped = values.map(val => {
      const trimmed = val.trim();
      // String literal
      if (/^['"]/.test(trimmed)) return trimmed.replace(/^'|'$/g, "'");
      // Number literal
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) return trimmed;
      // Boolean
      if (trimmed === 'true' || trimmed === 'false') return trimmed;
      // null
      if (trimmed === 'null') return 'null';
      return trimmed;
    });
    return mapped.join(' | ');
  }

  // oneOfType([...])
  const oneOfTypeMatch = v.match(/^oneOfType\(\[([\s\S]+)\]\)$/);
  if (oneOfTypeMatch) {
    const types = splitTopLevelEntries(oneOfTypeMatch[1]);
    const mapped = types.map(t => mapPropTypeToTs(t.trim()));
    return mapped.join(' | ');
  }

  // shape({...}) or exact({...})
  const shapeMatch = v.match(/^(?:shape|exact)\(\{([\s\S]+)\}\)$/);
  if (shapeMatch) {
    const innerProps = parsePropTypes(shapeMatch[1]);
    const fields = innerProps.map(p => {
      const opt = p.required ? '' : '?';
      return `${p.name}${opt}: ${p.type}`;
    });
    return `{ ${fields.join('; ')} }`;
  }

  // instanceOf(X)
  const instanceOfMatch = v.match(/^instanceOf\((\w+)\)$/);
  if (instanceOfMatch) return instanceOfMatch[1];

  return 'unknown';
}

function rewriteComponent(
  code: string,
  componentName: string,
  interfaceName: string,
  props: ParsedProp[],
): string {
  // Build a simplified component stub with typed props
  const propNames = props.map(p => p.name).join(', ');

  // Try to extract the function body
  const funcPattern = new RegExp(
    `function\\s+${componentName}\\s*\\(\\s*(?:\\{[^}]*\\}|\\w+)\\s*\\)\\s*\\{`,
  );
  const funcMatch = funcPattern.exec(code);

  if (funcMatch) {
    // Find the function body
    let depth = 0;
    const bodyStart = funcMatch.index + funcMatch[0].length;
    let bodyEnd = code.length;
    // Start after the opening brace
    depth = 1;
    for (let i = bodyStart; i < code.length; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') {
        depth--;
        if (depth === 0) {
          bodyEnd = i;
          break;
        }
      }
    }

    const body = code.slice(bodyStart, bodyEnd);

    // Remove propTypes and defaultProps assignments
    const cleanBody = body
      .replace(new RegExp(`${componentName}\\.propTypes\\s*=\\s*\\{[\\s\\S]*?\\};?`, 'g'), '')
      .replace(new RegExp(`${componentName}\\.defaultProps\\s*=\\s*\\{[\\s\\S]*?\\};?`, 'g'), '');

    return `function ${componentName}({ ${propNames} }: ${interfaceName}) {${cleanBody}}`;
  }

  return `function ${componentName}({ ${propNames} }: ${interfaceName}) {\n  // Component body\n}`;
}
