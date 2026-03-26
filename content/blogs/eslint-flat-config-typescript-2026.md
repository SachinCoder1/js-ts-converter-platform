# How to Configure ESLint Flat Config for TypeScript in 2026

If you've tried to set up ESLint recently and felt like nothing makes sense anymore  you're not imagining things. ESLint completely overhauled its configuration system, and the old `.eslintrc` files are officially dead as of ESLint v9. The new system is called "flat config," it lives in `eslint.config.js` (or `.mjs`, `.ts`), and frankly, it confused the hell out of me the first time I tried to migrate.

But after converting three projects and one fairly gnarly monorepo, I can tell you that the new eslint flat config is genuinely better once you get past the initial "why did they change everything" phase. Here's how to set up ESLint flat config with TypeScript properly  no guessing, no stale Stack Overflow answers from 2024.

## Why ESLint Changed Everything

Quick context, because understanding the "why" makes the migration less painful.

The old `.eslintrc` system had a few real problems:

- **Config cascading was confusing.** ESLint would merge configs from parent directories, `extends` arrays, and `overrides` blocks. Debugging why a rule was on or off required a PhD in config archaeology.
- **Plugins were implicitly resolved.** You'd write `plugins: ["@typescript-eslint"]` and ESLint would magically find the package. Sounds convenient until two different configs load two different versions of the same plugin.
- **The `extends` + `overrides` combo** was messy. You'd extend a shared config, then override rules for specific file patterns, then extend again... it was configs all the way down.

Flat config fixes this by making everything explicit. No cascading, no implicit resolution, no magic. It's just an array of config objects, evaluated in order.

| Feature | Old `.eslintrc` | New Flat Config |
|---------|----------------|-----------------|
| File format | `.eslintrc.json`, `.yml`, `.js` | `eslint.config.js` / `.mjs` / `.ts` |
| Plugin loading | Implicit (string name) | Explicit (import the module) |
| Config merging | Cascading from parent dirs | Single flat array, in order |
| Extends | `extends: [...]` | Spread into the array |
| File targeting | `overrides[].files` | `files` on each config object |
| Ignores | `.eslintignore` file | `ignores` property inline |
| TypeScript support | `parser: "@typescript-eslint/parser"` | `languageOptions.parser` |

## Setting Up Flat Config with TypeScript from Scratch

Let's set up a fresh project. If you're migrating an existing `.eslintrc`, skip to the migration section below.

### Step 1: Install Dependencies

```bash
npm install -D eslint @eslint/js typescript-eslint
```

That's it. The `typescript-eslint` package (note: no `@` prefix, no `/parser` or `/eslint-plugin`  just `typescript-eslint`) is the unified package since v8. It bundles everything you need: the parser, the plugin, and helper utilities for flat config.

### Step 2: Create eslint.config.js

Here's a working eslint flat config for a TypeScript project:

```javascript
// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/", "node_modules/", "*.config.js"],
  }
);
```

And... that's the whole thing. Seriously. The `tseslint.config()` helper takes care of merging everything together and returns a flat array.

Let me break down what's happening:

1. `eslint.configs.recommended`  ESLint's built-in recommended rules (no-unused-vars, no-undef, etc.)
2. `tseslint.configs.recommended`  TypeScript-specific rules (no-explicit-any, no-unused-vars with type awareness, etc.). You spread this because it's an array of config objects.
3. The ignores object  tells ESLint to skip these paths entirely. This replaces the old `.eslintignore` file.

### Step 3: Add Type-Aware Linting (Optional but Recommended)

The basic `recommended` config doesn't use TypeScript's type checker. If you want rules that understand your types  like catching `await` on non-promises or detecting unused promises  you need the type-aware config:

```javascript
// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  }
);
```

The `projectService` option is new in typescript-eslint v8 and it's a big deal. It replaces the old `project: "./tsconfig.json"` approach with a faster, more reliable way to find the right tsconfig for each file. It just works  even in monorepos.

> **Tip:** Type-aware linting is slower because it fires up the TypeScript compiler. For large codebases, expect ESLint to take 2-5x longer. It's worth it for the bugs it catches, but you might want to run it only in CI, not on every save.

### Step 4: Add File-Specific Overrides

Need different rules for test files or config files? In flat config, you just add another object to the array with a `files` pattern:

```javascript
// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Relax rules for test files
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    // Only lint TS/JS files
    files: ["**/*.{ts,tsx,js,jsx}"],
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  }
);
```

This is where flat config really shines compared to the old system. Each config object in the array is self-contained  it says exactly which files it applies to and what rules it sets. No hidden cascading.

## Migrating from .eslintrc to Flat Config

Already have a working `.eslintrc`? Here's the step-by-step migration.

### 1. Audit Your Current Config

Before changing anything, figure out what you actually have:

```bash
# See your resolved config for a specific file
npx eslint --print-config src/index.ts
```

This shows every rule and setting after all the extends and overrides are resolved. Save this output  you'll use it to verify your migration didn't silently drop rules.

### 2. Update Packages

```bash
# Remove old packages
npm uninstall @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Install the unified package
npm install -D typescript-eslint@latest eslint@latest @eslint/js
```

The separate `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` packages still work but aren't recommended anymore. The unified `typescript-eslint` package is cleaner.

### 3. Convert Your Extends

Old `.eslintrc` extends map to flat config like this:

```javascript
// OLD .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ]
}

// NEW eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,  // Note: .flat. prefix
  prettier,
  {
    ignores: ["dist/", "node_modules/"],
  }
);
```

The key difference: in flat config, you import configs and spread them into the array. No more string-based references.

### 4. Convert Your Plugins

Plugins are now explicit imports:

```javascript
// OLD
{
  "plugins": ["@typescript-eslint", "import"]
}

// NEW
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default [
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "import": importPlugin,
    },
  },
];
```

### 5. Delete Old Files

Once your new config works:

```bash
rm .eslintrc .eslintrc.json .eslintrc.js .eslintrc.yml .eslintignore
```

```mermaid
graph LR
    A[.eslintrc + .eslintignore] --> B[Audit existing rules]
    B --> C[Update packages]
    C --> D[Create eslint.config.js]
    D --> E[Convert extends to imports]
    E --> F[Convert plugins to imports]
    F --> G[Move ignores inline]
    G --> H[Verify: eslint --print-config]
    H --> I[Delete old config files]
```

## Shared Configs in Flat Config

If your team has a shared ESLint config package, the pattern is different now. Instead of publishing a JSON config with `extends`, you export a function or array:

```javascript
// @yourcompany/eslint-config/index.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Your team's custom rules
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "warn",
      "prefer-const": "error",
    },
  }
);
```

Then in your project:

```javascript
// eslint.config.js
import companyConfig from "@yourcompany/eslint-config";

export default [
  ...companyConfig,
  {
    // Project-specific overrides
    ignores: ["dist/"],
  },
];
```

Clean. No magic resolution, no wondering which version of which plugin is being loaded.

## Common Gotchas

**"Config (unnamed) is not valid"**  You're probably exporting an object instead of an array. Flat config expects an array (or use `tseslint.config()` which handles this).

**"Parsing error: unexpected token"**  You probably forgot to set the parser for TypeScript files. Make sure `tseslint.configs.recommended` is in your config array  it sets the parser automatically.

**Plugins that don't support flat config yet**  Some older plugins haven't migrated. Check the plugin's GitHub for flat config support. The `eslint-plugin-compat` or wrapping in `fixupPluginRules` from `@eslint/compat` can help bridge the gap.

**ESLint config in TypeScript**  Yes, you can write your config as `eslint.config.ts` using the `jiti` loader. ESLint v9.7+ supports this natively with the `--flag unstable_ts_config` flag, and in newer versions it works out of the box.

## My Recommended Starter Config

Here's the eslint flat config typescript setup I use on most new projects in 2026:

```javascript
// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/", "*.config.*"],
  }
);
```

I go with `strictTypeChecked` instead of `recommended` because  hot take  if you're using TypeScript, you should actually let the linter use the type system. The "recommended" preset is fine, but `strict` catches real bugs that `recommended` misses, like floating promises and unsafe `any` propagation.

The migration from `.eslintrc` to flat config is one of those things that feels like unnecessary churn until you actually do it. And then you realize how much cleaner and more predictable the new system is. No more config inheritance nightmares. No more "where is this rule coming from?" mystery hunts.

If you're also in the middle of converting your JavaScript to TypeScript, [SnipShift's JS to TS converter](https://snipshift.dev/js-to-ts) pairs well with this setup  get your types sorted first, then let ESLint strict mode catch the rest. And for more on configuring TypeScript itself, check out our [complete tsconfig.json reference](/blog/tsconfig-json-every-option-explained) or our guide on [setting up Vitest with React Testing Library](/blog/vitest-react-testing-library-typescript) for testing your newly-typed code.
