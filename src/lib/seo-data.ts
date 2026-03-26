export interface ToolSeoData {
  id: string;
  path: string;
  metaTitle: string;
  description: string;
  source: string;
  target: string;
  keywords: string[];
  relatedTools: string[];
  faqItems: { question: string; answer: string }[];
  howToSteps: string[];
}

export const TOOL_SEO_DATA: Record<string, ToolSeoData> = {
  'js-to-ts': {
    id: 'js-to-ts',
    path: '/js-to-ts',
    metaTitle: 'JS/JSX to TypeScript/TSX Converter  Free AI-Powered Tool',
    description:
      'Convert JavaScript to TypeScript and JSX to TSX instantly. AI-powered type inference generates proper interfaces, React typing, and generics. Free, no signup required.',
    source: 'JavaScript/JSX',
    target: 'TypeScript/TSX',
    keywords: [
      'javascript to typescript converter',
      'jsx to tsx converter',
      'free typescript converter',
      'online typescript converter',
      'js to ts',
      'convert javascript to typescript',
      'ai typescript converter',
      'react typescript converter',
    ],
    relatedTools: ['json-to-ts', 'proptypes-to-ts', 'html-to-jsx', 'graphql-to-ts'],
    faqItems: [
      {
        question: 'Is this JavaScript to TypeScript converter free?',
        answer:
          "Yes, SnipShift's JS to TypeScript converter is completely free with no signup required. Convert unlimited files directly in your browser.",
      },
      {
        question: 'Is my code sent to a server?',
        answer:
          'Your code is sent to our server for AI-powered type inference but is never stored. The conversion is processed in real-time and immediately discarded after generating your TypeScript output.',
      },
      {
        question: 'Does it handle React JSX to TSX conversion?',
        answer:
          'Yes! The converter fully supports JSX to TSX conversion including React component props typing, event handler types, ref types, and children prop inference.',
      },
      {
        question: 'What types does the AI infer?',
        answer:
          'The AI analyzes your code to infer primitive types, function signatures, React props and state, API response shapes, and complex generic types. It generates named interfaces rather than inline types for better readability.',
      },
      {
        question: 'Can I convert multiple files at once?',
        answer:
          'Currently the converter handles one file at a time. Paste your code, convert it, and copy the result. Each conversion is optimized for accuracy rather than batch processing.',
      },
    ],
    howToSteps: [
      'Paste your JavaScript or JSX code in the left editor',
      'Click Convert or press Ctrl+Enter to start AI-powered conversion',
      'Copy the converted TypeScript/TSX code from the right editor',
    ],
  },
  'json-to-ts': {
    id: 'json-to-ts',
    path: '/json-to-typescript',
    metaTitle: 'JSON to TypeScript Interface Generator  Free Online Tool',
    description:
      'Generate TypeScript interfaces and types from JSON instantly. Supports nested objects, arrays, optional fields, and export options. Free online JSON to TS generator.',
    source: 'JSON',
    target: 'TypeScript',
    keywords: [
      'json to typescript',
      'json to ts interface',
      'generate typescript from json',
      'json to type',
      'typescript interface generator',
      'json to typescript converter',
      'json to ts online',
      'typescript type generator',
    ],
    relatedTools: ['js-to-ts', 'json-to-zod', 'json-to-yaml', 'graphql-to-ts'],
    faqItems: [
      {
        question: 'Is this JSON to TypeScript converter free?',
        answer:
          "Yes, SnipShift's JSON to TypeScript generator is completely free with no signup required. Generate unlimited TypeScript interfaces from your JSON data.",
      },
      {
        question: 'Does it handle nested JSON objects?',
        answer:
          'Yes! The converter automatically generates separate named interfaces for nested objects, creating clean and reusable type definitions for deeply nested JSON structures.',
      },
      {
        question: 'Can I choose between interfaces and type aliases?',
        answer:
          'Yes, you can toggle between generating TypeScript interfaces or type aliases. You can also configure export keywords, optional fields, readonly properties, and custom root type names.',
      },
      {
        question: 'Is my JSON data stored?',
        answer:
          'No, your JSON data is processed entirely in your browser for basic conversions. AI-enhanced conversions are processed server-side but never stored.',
      },
    ],
    howToSteps: [
      'Paste your JSON data in the left editor',
      'Configure output options (interface vs type, export, optional fields)',
      'Copy the generated TypeScript interfaces from the right editor',
    ],
  },
  'json-to-zod': {
    id: 'json-to-zod',
    path: '/json-to-zod',
    metaTitle: 'JSON to Zod Schema Generator  Free Online Tool',
    description:
      'Generate Zod validation schemas from JSON instantly. AI adds smart validations like .email(), .url(), .datetime(). Free online Zod schema generator, no signup needed.',
    source: 'JSON',
    target: 'Zod Schema',
    keywords: [
      'json to zod',
      'zod schema generator',
      'generate zod from json',
      'json to zod converter',
      'zod validation generator',
      'json to zod online',
      'create zod schema',
      'zod type generator',
    ],
    relatedTools: ['json-to-ts', 'json-to-yaml', 'js-to-ts', 'js-object-to-json'],
    faqItems: [
      {
        question: 'Is this JSON to Zod generator free?',
        answer:
          "Yes, SnipShift's JSON to Zod generator is completely free with no signup. Generate Zod schemas from any JSON structure instantly.",
      },
      {
        question: 'Does it add smart validations?',
        answer:
          'Yes! The AI analyzes your JSON values and adds appropriate Zod validations like .email() for email strings, .url() for URLs, .datetime() for date strings, and .min()/.max() for numbers.',
      },
      {
        question: 'Does it handle nested objects and arrays?',
        answer:
          'Absolutely. The generator creates properly nested z.object() and z.array() schemas that match your JSON structure, including optional fields and nullable values.',
      },
      {
        question: 'Is my JSON data sent to a server?',
        answer:
          'For AI-enhanced conversions, your JSON is sent to our server for processing but is never stored. Basic conversions happen entirely in your browser.',
      },
    ],
    howToSteps: [
      'Paste your JSON data in the left editor',
      'Click Convert to generate the Zod schema with AI-powered validations',
      'Copy the generated Zod schema from the right editor',
    ],
  },
  'json-to-yaml': {
    id: 'json-to-yaml',
    path: '/json-to-yaml',
    metaTitle: 'JSON to YAML Converter  Free Online Tool',
    description:
      'Convert JSON to YAML format instantly. Handles nested objects, arrays, and special characters. Free online JSON to YAML converter with proper formatting. No signup required.',
    source: 'JSON',
    target: 'YAML',
    keywords: [
      'json to yaml',
      'convert json to yaml',
      'json to yaml converter',
      'json to yml',
      'json yaml converter online',
      'json to yaml online',
      'transform json to yaml',
      'json to yaml tool',
    ],
    relatedTools: ['yaml-to-json', 'json-to-ts', 'json-to-zod', 'js-object-to-json'],
    faqItems: [
      {
        question: 'Is this JSON to YAML converter free?',
        answer:
          "Yes, SnipShift's JSON to YAML converter is completely free with no signup required. Convert unlimited JSON data to YAML format.",
      },
      {
        question: 'Is my data processed locally?',
        answer:
          'Yes, the JSON to YAML conversion happens entirely in your browser. No data is sent to any server.',
      },
      {
        question: 'Does it preserve data types?',
        answer:
          'Yes, the converter properly handles strings, numbers, booleans, null values, nested objects, and arrays, converting them to their YAML equivalents with correct formatting.',
      },
      {
        question: 'Can I convert YAML back to JSON?',
        answer:
          'Yes! SnipShift also offers a YAML to JSON converter. Use it to convert in the reverse direction.',
      },
    ],
    howToSteps: [
      'Paste your JSON data in the left editor',
      'The YAML output is generated automatically in the right editor',
      'Copy the converted YAML output',
    ],
  },
  'yaml-to-json': {
    id: 'yaml-to-json',
    path: '/yaml-to-json',
    metaTitle: 'YAML to JSON Converter  Free Online Tool',
    description:
      'Convert YAML to JSON format instantly. Handles anchors, aliases, multi-line strings, and complex structures. Free online YAML to JSON converter. No signup required.',
    source: 'YAML',
    target: 'JSON',
    keywords: [
      'yaml to json',
      'convert yaml to json',
      'yaml to json converter',
      'yml to json',
      'yaml json converter online',
      'yaml to json online',
      'parse yaml to json',
      'yaml to json tool',
    ],
    relatedTools: ['json-to-yaml', 'json-to-ts', 'json-to-zod', 'js-object-to-json'],
    faqItems: [
      {
        question: 'Is this YAML to JSON converter free?',
        answer:
          "Yes, SnipShift's YAML to JSON converter is completely free with no signup required. Convert unlimited YAML files to JSON.",
      },
      {
        question: 'Is my data processed locally?',
        answer:
          'Yes, the YAML to JSON conversion happens entirely in your browser. No data is sent to any server.',
      },
      {
        question: 'Does it handle complex YAML features?',
        answer:
          'Yes, the converter supports YAML anchors, aliases, multi-line strings, flow sequences, and nested structures, converting them to proper JSON equivalents.',
      },
      {
        question: 'What if my YAML has syntax errors?',
        answer:
          'The converter provides clear error messages with line numbers when your YAML has syntax issues, helping you quickly identify and fix problems.',
      },
    ],
    howToSteps: [
      'Paste your YAML data in the left editor',
      'The JSON output is generated automatically in the right editor',
      'Copy the converted JSON output',
    ],
  },
  'css-to-json': {
    id: 'css-to-json',
    path: '/css-to-json',
    metaTitle: 'CSS to JSON Converter  Free CSS-in-JS Tool',
    description:
      'Convert CSS rules to JSON objects for CSS-in-JS. Handles selectors, media queries, and pseudo-classes. Free online CSS to JSON converter for React and styled-components.',
    source: 'CSS',
    target: 'JSON',
    keywords: [
      'css to json',
      'css to json converter',
      'css to javascript object',
      'css in js converter',
      'css to styled components',
      'convert css to json',
      'css to react style',
      'css to camelcase',
    ],
    relatedTools: ['css-to-tailwind', 'scss-to-css', 'html-to-jsx', 'tailwind-to-css'],
    faqItems: [
      {
        question: 'Is this CSS to JSON converter free?',
        answer:
          "Yes, SnipShift's CSS to JSON converter is completely free with no signup required. Convert unlimited CSS rules to JSON objects.",
      },
      {
        question: 'Does it convert property names to camelCase?',
        answer:
          'Yes, CSS properties are automatically converted to camelCase (e.g., background-color becomes backgroundColor) for use in React, styled-components, and other CSS-in-JS libraries.',
      },
      {
        question: 'Does it handle media queries?',
        answer:
          'Yes, the converter properly handles media queries, pseudo-classes, pseudo-elements, and nested selectors, preserving the full structure in the JSON output.',
      },
      {
        question: 'Is the conversion done locally?',
        answer:
          'Yes, CSS to JSON conversion happens entirely in your browser. No data is sent to any server.',
      },
    ],
    howToSteps: [
      'Paste your CSS code in the left editor',
      'Click Convert to transform CSS rules into JSON objects',
      'Copy the generated JSON with camelCase properties from the right editor',
    ],
  },
  'js-object-to-json': {
    id: 'js-object-to-json',
    path: '/js-object-to-json',
    metaTitle: 'JS Object to JSON Converter  Free Online Tool',
    description:
      'Convert JavaScript object literals to valid JSON. Handles unquoted keys, trailing commas, single quotes, and template literals. Free online JS to JSON converter.',
    source: 'JavaScript Object',
    target: 'JSON',
    keywords: [
      'js object to json',
      'javascript object to json',
      'convert js object to json',
      'js to json converter',
      'javascript to json',
      'js object to json online',
      'fix json format',
      'json formatter',
    ],
    relatedTools: ['json-to-ts', 'json-to-zod', 'json-to-yaml', 'yaml-to-json'],
    faqItems: [
      {
        question: 'Is this JS Object to JSON converter free?',
        answer:
          "Yes, SnipShift's JS Object to JSON converter is completely free with no signup required. Convert unlimited JavaScript objects to valid JSON.",
      },
      {
        question: 'What JavaScript syntax does it handle?',
        answer:
          'The converter handles unquoted keys, single-quoted strings, trailing commas, template literals, comments, computed properties, shorthand properties, and spread operators.',
      },
      {
        question: 'Is the conversion done locally?',
        answer:
          'Yes, JS Object to JSON conversion happens entirely in your browser using AST parsing. No data is sent to any server.',
      },
      {
        question: 'Does it validate the output?',
        answer:
          'Yes, the output is guaranteed to be valid JSON. The converter parses the JavaScript object and serializes it with proper JSON formatting and indentation.',
      },
    ],
    howToSteps: [
      'Paste your JavaScript object literal in the left editor',
      'Click Convert to parse and transform it into valid JSON',
      'Copy the formatted JSON output from the right editor',
    ],
  },
  'css-to-tailwind': {
    id: 'css-to-tailwind',
    path: '/css-to-tailwind',
    metaTitle: 'CSS to Tailwind CSS Converter  Free Online Tool',
    description:
      'Convert vanilla CSS to Tailwind utility classes instantly. Handles flexbox, grid, responsive, hover states, and custom values. Free online CSS to Tailwind converter.',
    source: 'CSS',
    target: 'Tailwind CSS',
    keywords: [
      'css to tailwind',
      'css to tailwind converter',
      'convert css to tailwind',
      'vanilla css to tailwind',
      'css to tailwind classes',
      'css to tailwind online',
      'tailwind css converter',
      'css to utility classes',
    ],
    relatedTools: ['tailwind-to-css', 'css-to-json', 'scss-to-css', 'html-to-jsx'],
    faqItems: [
      {
        question: 'Is this CSS to Tailwind converter free?',
        answer:
          "Yes, SnipShift's CSS to Tailwind converter is completely free with no signup required. Convert unlimited CSS to Tailwind utility classes.",
      },
      {
        question: 'Does it handle responsive and hover states?',
        answer:
          'Yes! The converter maps media queries to Tailwind responsive prefixes (sm:, md:, lg:) and pseudo-classes to state prefixes (hover:, focus:, active:).',
      },
      {
        question: 'What CSS properties are supported?',
        answer:
          'The converter supports virtually all common CSS properties including flexbox, grid, spacing, typography, colors, borders, shadows, transforms, transitions, and more.',
      },
      {
        question: 'Is my code sent to a server?',
        answer:
          'For AI-enhanced conversion, your CSS is sent to our server for processing but is never stored. The conversion is processed in real-time and discarded after generating your Tailwind output.',
      },
    ],
    howToSteps: [
      'Paste your CSS code in the left editor',
      'Click Convert to transform CSS to Tailwind utility classes',
      'Copy the generated Tailwind classes from the right editor',
    ],
  },
  'scss-to-css': {
    id: 'scss-to-css',
    path: '/scss-to-css',
    metaTitle: 'SCSS to CSS Compiler  Free Online Tool',
    description:
      'Compile SCSS/SASS to standard CSS online. Handles variables, mixins, nesting, and imports. Choose expanded or compressed output. Free SCSS compiler, no signup required.',
    source: 'SCSS/SASS',
    target: 'CSS',
    keywords: [
      'scss to css',
      'sass to css',
      'scss compiler online',
      'compile scss',
      'scss to css converter',
      'sass compiler',
      'scss to css online',
      'free scss compiler',
    ],
    relatedTools: ['css-to-tailwind', 'css-to-json', 'tailwind-to-css', 'html-to-jsx'],
    faqItems: [
      {
        question: 'Is this SCSS compiler free?',
        answer:
          "Yes, SnipShift's SCSS to CSS compiler is completely free with no signup required. Compile unlimited SCSS/SASS files to CSS.",
      },
      {
        question: 'What SCSS features are supported?',
        answer:
          'The compiler supports all standard SCSS features including variables, nesting, mixins, extends, functions, partials, operators, and control directives (@if, @for, @each).',
      },
      {
        question: 'Can I choose the output style?',
        answer:
          'Yes, you can choose between expanded (readable, indented) and compressed (minified) CSS output styles.',
      },
      {
        question: 'Is the compilation done locally?',
        answer:
          'The SCSS compilation uses Dart Sass on our server for full compatibility with the latest SCSS specification. Your code is processed in real-time and never stored.',
      },
    ],
    howToSteps: [
      'Paste your SCSS/SASS code in the left editor',
      'Choose your output style (expanded or compressed)',
      'Copy the compiled CSS from the right editor',
    ],
  },
  'html-to-jsx': {
    id: 'html-to-jsx',
    path: '/html-to-jsx',
    metaTitle: 'HTML to JSX/TSX Converter  Free Online Tool',
    description:
      'Convert HTML to valid JSX/TSX for React instantly. Handles class→className, style objects, self-closing tags, and event handlers. Free online HTML to JSX converter.',
    source: 'HTML',
    target: 'JSX/TSX',
    keywords: [
      'html to jsx',
      'html to jsx converter',
      'convert html to jsx',
      'html to react',
      'html to tsx',
      'html to jsx online',
      'html to react component',
      'html to jsx free',
    ],
    relatedTools: ['js-to-ts', 'css-to-tailwind', 'css-to-json', 'proptypes-to-ts'],
    faqItems: [
      {
        question: 'Is this HTML to JSX converter free?',
        answer:
          "Yes, SnipShift's HTML to JSX converter is completely free with no signup required. Convert unlimited HTML to valid JSX/TSX.",
      },
      {
        question: 'What HTML attributes does it convert?',
        answer:
          'The converter handles class→className, for→htmlFor, inline styles to style objects, self-closing tags, SVG attributes, data attributes, and boolean attributes.',
      },
      {
        question: 'Does it handle SVG elements?',
        answer:
          'Yes! SVG elements and their attributes (stroke-width→strokeWidth, fill-rule→fillRule, viewBox, etc.) are properly converted to JSX-compatible camelCase syntax.',
      },
      {
        question: 'Is the conversion done locally?',
        answer:
          'Yes, HTML to JSX conversion happens entirely in your browser using AST parsing. No data is sent to any server.',
      },
    ],
    howToSteps: [
      'Paste your HTML code in the left editor',
      'Click Convert to transform HTML into valid JSX/TSX',
      'Copy the converted JSX code from the right editor',
    ],
  },
  'tailwind-to-css': {
    id: 'tailwind-to-css',
    path: '/tailwind-to-css',
    metaTitle: 'Tailwind to CSS Converter  Free Online Tool',
    description:
      'Convert Tailwind CSS utility classes to vanilla CSS instantly. See the actual CSS behind any Tailwind class. Handles responsive prefixes and states. Free, no signup.',
    source: 'Tailwind CSS',
    target: 'CSS',
    keywords: [
      'tailwind to css',
      'convert tailwind to css',
      'tailwind to vanilla css',
      'what css does tailwind generate',
      'tailwind class to css',
      'reverse tailwind',
      'tailwind css converter',
      'tailwind utility to css',
    ],
    relatedTools: ['css-to-tailwind', 'scss-to-css', 'css-to-json', 'html-to-jsx'],
    faqItems: [
      {
        question: 'Is this Tailwind to CSS converter free?',
        answer:
          "Yes, SnipShift's Tailwind to CSS converter is completely free with no signup required. Convert unlimited Tailwind classes to vanilla CSS.",
      },
      {
        question: 'Does it handle responsive prefixes?',
        answer:
          'Yes! The converter properly handles responsive prefixes (sm:, md:, lg:, xl:, 2xl:) and converts them to the corresponding @media queries in vanilla CSS.',
      },
      {
        question: 'Does it handle state variants?',
        answer:
          'Yes, state variants like hover:, focus:, active:, disabled:, group-hover:, and more are converted to their corresponding CSS pseudo-class selectors.',
      },
      {
        question: 'Is my code sent to a server?',
        answer:
          'For AI-enhanced conversion, your Tailwind classes are sent to our server for processing but never stored. Basic conversion mapping happens in your browser.',
      },
    ],
    howToSteps: [
      'Paste your Tailwind CSS classes in the left editor',
      'Click Convert to reverse them to vanilla CSS properties',
      'Copy the generated CSS from the right editor',
    ],
  },
  'graphql-to-ts': {
    id: 'graphql-to-ts',
    path: '/graphql-to-typescript',
    metaTitle: 'GraphQL to TypeScript Generator  Free Online Tool',
    description:
      'Generate TypeScript types from GraphQL schemas instantly. Handles types, inputs, enums, unions, and interfaces. Free online GraphQL to TypeScript code generator.',
    source: 'GraphQL Schema',
    target: 'TypeScript',
    keywords: [
      'graphql to typescript',
      'graphql to ts',
      'graphql typescript generator',
      'graphql codegen',
      'graphql to typescript types',
      'graphql schema to typescript',
      'generate types from graphql',
      'graphql typescript converter',
    ],
    relatedTools: ['js-to-ts', 'json-to-ts', 'proptypes-to-ts', 'json-to-zod'],
    faqItems: [
      {
        question: 'Is this GraphQL to TypeScript generator free?',
        answer:
          "Yes, SnipShift's GraphQL to TypeScript generator is completely free with no signup required. Generate unlimited TypeScript types from GraphQL schemas.",
      },
      {
        question: 'What GraphQL types does it handle?',
        answer:
          'The generator handles object types, input types, enums, interfaces, unions, scalars, queries, mutations, and subscriptions, converting them all to properly typed TypeScript definitions.',
      },
      {
        question: 'How is this different from graphql-codegen?',
        answer:
          'SnipShift provides instant, zero-config TypeScript generation right in your browser. No need to install packages, write config files, or set up a build pipeline. Just paste your schema and get types.',
      },
      {
        question: 'Is my schema sent to a server?',
        answer:
          'For AI-enhanced conversion, your GraphQL schema is sent to our server for processing but is never stored. The conversion is processed in real-time and immediately discarded.',
      },
    ],
    howToSteps: [
      'Paste your GraphQL schema in the left editor',
      'Click Convert to generate TypeScript types',
      'Copy the generated TypeScript definitions from the right editor',
    ],
  },
  'regex-tester': {
    id: 'regex-tester',
    path: '/regex-tester',
    metaTitle: 'Regex Tester & Cross-Language Converter  Free Online Tool',
    description:
      'Test regular expressions live with match highlighting, AI-powered explanations, and cross-language conversion between JavaScript, Python, Go, Rust, PHP, and Java. Free, no signup.',
    source: 'Regex',
    target: 'Multi-Language',
    keywords: [
      'regex tester online',
      'regex converter',
      'javascript regex to python',
      'regex explainer',
      'regular expression tester',
      'regex cross-language converter',
      'regex match highlighter',
      'regex cheatsheet',
    ],
    relatedTools: ['js-to-ts', 'json-to-ts', 'html-to-jsx'],
    faqItems: [
      {
        question: 'Is this regex tester free?',
        answer:
          "Yes, SnipShift's Regex Tester is completely free with no signup required. Test patterns, get AI explanations, and convert between languages instantly.",
      },
      {
        question: 'Which regex flavors are supported for conversion?',
        answer:
          'The converter supports JavaScript, Python, Go, Rust, PHP, and Java regex flavors. It highlights syntax differences and caveats between languages.',
      },
      {
        question: 'How does the AI regex explanation work?',
        answer:
          'The AI analyzes your regex pattern and generates a plain English explanation of each component, including character classes, quantifiers, groups, and assertions.',
      },
      {
        question: 'Is the regex testing done on the server?',
        answer:
          'No, regex testing and match highlighting happen entirely in your browser for instant feedback. Only AI explanation and cross-language conversion use the server.',
      },
      {
        question: 'Does it support named capture groups?',
        answer:
          'Yes, the tester fully supports named capture groups and displays them separately in the match details panel with their group names.',
      },
    ],
    howToSteps: [
      'Enter your regex pattern in the input field at the top',
      'Toggle flags (g, i, m, s, u, y) as needed',
      'Paste your test string in the editor to see live match highlighting',
      'Click Explain to get an AI-powered plain English explanation',
      'Use the Convert tab to see equivalent patterns in other languages',
    ],
  },
  'proptypes-to-ts': {
    id: 'proptypes-to-ts',
    path: '/proptypes-to-typescript',
    metaTitle: 'PropTypes to TypeScript Converter  Free Online Tool',
    description:
      'Convert React PropTypes to TypeScript interfaces instantly. Handles shape, arrayOf, oneOf, isRequired, and defaultProps. Free online PropTypes to TS converter.',
    source: 'React PropTypes',
    target: 'TypeScript',
    keywords: [
      'proptypes to typescript',
      'convert proptypes to typescript',
      'react proptypes to ts',
      'proptypes to interface',
      'migrate proptypes to typescript',
      'proptypes to ts converter',
      'react typescript migration',
      'proptypes to type',
    ],
    relatedTools: ['js-to-ts', 'html-to-jsx', 'json-to-ts', 'graphql-to-ts'],
    faqItems: [
      {
        question: 'Is this PropTypes to TypeScript converter free?',
        answer:
          "Yes, SnipShift's PropTypes to TypeScript converter is completely free with no signup required. Convert unlimited React PropTypes to TypeScript interfaces.",
      },
      {
        question: 'What PropTypes does it handle?',
        answer:
          'The converter handles all PropTypes validators: string, number, bool, array, object, func, node, element, symbol, instanceOf, oneOf, oneOfType, arrayOf, objectOf, shape, exact, and isRequired.',
      },
      {
        question: 'Does it handle defaultProps?',
        answer:
          'Yes! The converter analyzes defaultProps to determine optional properties and incorporates default values into the TypeScript interface generation.',
      },
      {
        question: 'Is my code sent to a server?',
        answer:
          'For AI-enhanced conversion, your React code is sent to our server for processing but is never stored. The conversion is processed in real-time and discarded after generating your TypeScript output.',
      },
    ],
    howToSteps: [
      'Paste your React component with PropTypes in the left editor',
      'Click Convert to generate TypeScript interfaces',
      'Copy the converted TypeScript component from the right editor',
    ],
  },
  'package-to-badges': {
    id: 'package-to-badges',
    path: '/package-to-badges',
    metaTitle: 'Package.json to README Badges Generator \u2014 Auto-Generate Shields.io Badges | SnipShift',
    description:
      'Generate shields.io markdown badges from your package.json automatically. Detects frameworks, testing tools, TypeScript, linting, and more. Free online badge generator, no signup required.',
    source: 'Package.json',
    target: 'README Badges',
    keywords: [
      'readme badges generator',
      'shields.io badge generator',
      'package.json to badges',
      'npm readme badges',
      'github badges generator',
      'shields.io markdown badges',
      'auto generate readme badges',
      'package json badge generator',
    ],
    relatedTools: ['json-to-yaml', 'json-to-ts', 'html-to-jsx', 'json-to-zod'],
    faqItems: [
      {
        question: 'Is this badge generator free?',
        answer:
          "Yes, SnipShift's Package.json to Badges generator is completely free with no signup required. Generate unlimited badge sets from your package.json.",
      },
      {
        question: 'Is my package.json data sent to a server?',
        answer:
          'No. The badge generation happens entirely in your browser using JavaScript. Your package.json data never leaves your machine.',
      },
      {
        question: 'What badge types does it detect?',
        answer:
          'The generator detects npm package info, Node engine version, TypeScript, frameworks (React, Next.js, Vue, Svelte, Angular, Express, etc.), testing tools (Jest, Vitest, Cypress, Playwright), linters (ESLint, Prettier, Biome), build tools (Vite, Webpack, esbuild, Turbo), and generates npm downloads and bundle size badges.',
      },
      {
        question: 'Can I customize the badge style?',
        answer:
          'Yes, you can choose from five shields.io styles (flat, flat-square, for-the-badge, plastic, social), set a custom color, select output format (Markdown, HTML, RST), and toggle individual badge categories on or off.',
      },
      {
        question: 'Does it work with private packages?',
        answer:
          'Yes. For private packages, it generates static version and license badges instead of npm-linked badges, and skips npm downloads and bundle size badges since those require a public npm package.',
      },
    ],
    howToSteps: [
      'Paste your package.json in the left editor',
      'Customize badge style, format, and categories in the options bar',
      'Copy the generated badge markdown from the right editor into your README',
    ],
  },
  'markdown-table-converter': {
    id: 'markdown-table-converter',
    path: '/markdown-table-converter',
    metaTitle: 'Markdown Table to JSON/CSV Converter  Free Online Tool | SnipShift',
    description:
      'Convert between Markdown tables, JSON, and CSV instantly. Auto-detects input format. Handles quoted fields, escaped characters, and alignment. Free, no signup required.',
    source: 'Markdown Table',
    target: 'JSON/CSV',
    keywords: [
      'markdown table to json',
      'csv to markdown table',
      'json to markdown table',
      'markdown table generator',
      'convert csv to markdown',
      'markdown table converter',
      'json to csv converter',
      'csv to json converter',
    ],
    relatedTools: ['json-to-yaml', 'yaml-to-json', 'json-to-ts', 'html-to-jsx'],
    faqItems: [
      {
        question: 'Is this Markdown Table converter free?',
        answer:
          "Yes, SnipShift's Markdown Table converter is completely free with no signup required. Convert unlimited tables between Markdown, JSON, and CSV formats.",
      },
      {
        question: 'Is my data sent to a server?',
        answer:
          'No. All conversions happen entirely in your browser using JavaScript. Your data never leaves your machine.',
      },
      {
        question: 'What input formats are supported?',
        answer:
          'The converter auto-detects Markdown tables (pipe-delimited), JSON (array of objects or array of arrays), and CSV (with configurable delimiters including comma, tab, semicolon, and pipe).',
      },
      {
        question: 'Does it handle special characters in CSV?',
        answer:
          'Yes! The converter properly handles quoted fields, escaped commas within quotes, escaped double-quotes, newlines within quoted fields, and Unicode characters.',
      },
      {
        question: 'Can I convert in any direction?',
        answer:
          'Yes, the converter is fully bidirectional. Paste any of the three formats and get the other two as outputs. It auto-detects your input format or you can specify it manually.',
      },
    ],
    howToSteps: [
      'Paste your Markdown table, JSON array, or CSV data in the input editor',
      'The converter auto-detects the format and generates both alternative outputs',
      'Switch between output tabs to view JSON or CSV (or Markdown), then copy or download',
    ],
  },
  'env-to-types': {
    id: 'env-to-types',
    path: '/env-to-types',
    metaTitle: 'Env to TypeScript / Zod Converter  Type Your Environment Variables | SnipShift',
    description:
      'Convert .env files to TypeScript interfaces, Zod schemas, t3-env configs, or Valibot schemas. Infers types from values automatically. Free online tool, no signup.',
    source: '.env',
    target: 'TypeScript / Zod',
    keywords: [
      'env to typescript',
      'dotenv to zod',
      'type process.env',
      't3 env generator',
      'env validation typescript',
      'env to zod schema',
      'environment variables typescript',
      'valibot env schema',
    ],
    relatedTools: ['json-to-ts', 'json-to-zod', 'js-to-ts', 'openapi-to-ts'],
    faqItems: [
      {
        question: 'Is this .env to TypeScript converter free?',
        answer:
          "Yes, SnipShift's Env to Types converter is completely free with no signup required. Convert unlimited .env files to TypeScript, Zod, t3-env, or Valibot schemas.",
      },
      {
        question: 'Is my .env data sent to a server?',
        answer:
          'No. The conversion happens entirely in your browser. No environment variables or secrets ever leave your machine.',
      },
      {
        question: 'How does type inference work?',
        answer:
          'The converter analyzes each value: numeric values like PORT=3000 become number, boolean-ish values like DEBUG=true become boolean, URL patterns become string with .url() validation, and everything else becomes string.',
      },
      {
        question: 'What is the t3-env output format?',
        answer:
          'The t3-env format generates a createEnv() config compatible with @t3-oss/env-nextjs. It automatically splits variables into server and client sections based on NEXT_PUBLIC_ prefix detection.',
      },
      {
        question: 'Does it handle NEXT_PUBLIC_ variables?',
        answer:
          'Yes! When prefix detection is enabled, variables with NEXT_PUBLIC_, VITE_, or REACT_APP_ prefixes are automatically categorized as client variables in the t3-env output format.',
      },
    ],
    howToSteps: [
      'Paste your .env file content in the left editor',
      'Choose your output format (TypeScript interface, Zod, t3-env, or Valibot)',
      'Copy the generated typed schema from the right editor',
    ],
  },
  'curl-to-code': {
    id: 'curl-to-code',
    path: '/curl-to-code',
    metaTitle: 'cURL to Code Converter  JavaScript, Python, Go, Rust & More | SnipShift',
    description:
      'Convert cURL commands to JavaScript fetch, axios, Python requests, Go, Rust, PHP, and Ruby code instantly. AI-powered conversion with instant preview. Free, no signup required.',
    source: 'cURL',
    target: 'Code',
    keywords: [
      'curl to javascript',
      'curl to python',
      'curl to fetch',
      'curl to axios',
      'convert curl command to code',
      'curl to golang',
      'curl to typescript',
      'curl to rust',
      'curl to php',
      'curl converter online',
    ],
    relatedTools: ['openapi-to-ts', 'json-to-ts', 'js-to-ts'],
    faqItems: [
      {
        question: 'What languages does the cURL to Code converter support?',
        answer:
          'SnipShift converts cURL commands to 8 languages: JavaScript (fetch and axios), TypeScript (typed fetch), Python (requests), Go (net/http), Rust (reqwest), PHP (curl), and Ruby (net/http).',
      },
      {
        question: 'How do I copy a cURL command from my browser?',
        answer:
          'Open DevTools (F12), go to the Network tab, right-click any request, and select "Copy as cURL". Paste it directly into the converter.',
      },
      {
        question: 'Does it handle authentication and cookies?',
        answer:
          'Yes! The converter supports Basic auth (-u flag), Bearer tokens (Authorization header), cookies (-b flag), and all standard cURL authentication methods.',
      },
      {
        question: 'Is the conversion done client-side or server-side?',
        answer:
          'The instant preview uses client-side parsing for immediate feedback. When you click Convert, the AI generates more idiomatic, production-ready code on the server. Your code is never stored.',
      },
    ],
    howToSteps: [
      'Paste your cURL command in the left editor (e.g., from browser DevTools "Copy as cURL")',
      'Select your target language from the tabs above the output panel',
      'Click Convert or press Ctrl+Enter for AI-powered idiomatic code',
      'Copy the generated code from the right editor or download it',
    ],
  },
};
