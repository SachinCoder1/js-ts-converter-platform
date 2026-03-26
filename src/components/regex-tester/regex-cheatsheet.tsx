'use client';

interface CheatsheetSection {
  title: string;
  items: { syntax: string; desc: string }[];
}

const SECTIONS: CheatsheetSection[] = [
  {
    title: 'Character Classes',
    items: [
      { syntax: '.', desc: 'Any character (except newline)' },
      { syntax: '\\d', desc: 'Digit [0-9]' },
      { syntax: '\\D', desc: 'Non-digit' },
      { syntax: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
      { syntax: '\\W', desc: 'Non-word char' },
      { syntax: '\\s', desc: 'Whitespace' },
      { syntax: '\\S', desc: 'Non-whitespace' },
      { syntax: '[abc]', desc: 'Any of a, b, or c' },
      { syntax: '[^abc]', desc: 'Not a, b, or c' },
      { syntax: '[a-z]', desc: 'Range a to z' },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      { syntax: '*', desc: '0 or more' },
      { syntax: '+', desc: '1 or more' },
      { syntax: '?', desc: '0 or 1' },
      { syntax: '{n}', desc: 'Exactly n' },
      { syntax: '{n,}', desc: 'n or more' },
      { syntax: '{n,m}', desc: 'Between n and m' },
      { syntax: '*?', desc: '0 or more (lazy)' },
      { syntax: '+?', desc: '1 or more (lazy)' },
    ],
  },
  {
    title: 'Anchors',
    items: [
      { syntax: '^', desc: 'Start of string/line' },
      { syntax: '$', desc: 'End of string/line' },
      { syntax: '\\b', desc: 'Word boundary' },
      { syntax: '\\B', desc: 'Non-word boundary' },
    ],
  },
  {
    title: 'Groups & Lookaround',
    items: [
      { syntax: '(...)', desc: 'Capturing group' },
      { syntax: '(?:...)', desc: 'Non-capturing group' },
      { syntax: '(?<name>...)', desc: 'Named group' },
      { syntax: '(?=...)', desc: 'Positive lookahead' },
      { syntax: '(?!...)', desc: 'Negative lookahead' },
      { syntax: '(?<=...)', desc: 'Positive lookbehind' },
      { syntax: '(?<!...)', desc: 'Negative lookbehind' },
      { syntax: '|', desc: 'Alternation (OR)' },
    ],
  },
  {
    title: 'Flags',
    items: [
      { syntax: 'g', desc: 'Global  find all matches' },
      { syntax: 'i', desc: 'Case insensitive' },
      { syntax: 'm', desc: 'Multiline (^ $ per line)' },
      { syntax: 's', desc: 'Dotall (. matches \\n)' },
      { syntax: 'u', desc: 'Unicode mode' },
      { syntax: 'y', desc: 'Sticky (match from lastIndex)' },
    ],
  },
  {
    title: 'Escapes',
    items: [
      { syntax: '\\\\', desc: 'Literal backslash' },
      { syntax: '\\.', desc: 'Literal dot' },
      { syntax: '\\n', desc: 'Newline' },
      { syntax: '\\t', desc: 'Tab' },
      { syntax: '\\r', desc: 'Carriage return' },
      { syntax: '\\0', desc: 'Null character' },
    ],
  },
];

export function RegexCheatsheet() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SECTIONS.map((section) => (
        <div
          key={section.title}
          className="rounded-md p-3 space-y-2"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <h4
            className="text-[10px] font-semibold uppercase font-mono"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}
          >
            {section.title}
          </h4>
          <div className="space-y-1">
            {section.items.map((item) => (
              <div key={item.syntax} className="flex items-baseline gap-2">
                <code
                  className="text-xs font-mono px-1 py-0.5 rounded shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    color: 'var(--primary)',
                    minWidth: '60px',
                    display: 'inline-block',
                  }}
                >
                  {item.syntax}
                </code>
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
