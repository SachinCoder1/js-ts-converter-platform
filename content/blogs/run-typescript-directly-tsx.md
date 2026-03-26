# How to Run TypeScript Directly with tsx (No Build Step)

The first thing that annoyed me about TypeScript wasn't the type system  it was the build step. I just wanted to run a script. One file. Maybe it fetches some data, processes it, writes to a file. In JavaScript, that's `node script.js` and you're done. In TypeScript? Configure `tsconfig.json`, set up the `outDir`, compile with `tsc`, then run the output. For a 30-line script.

That friction is real, and it's why a lot of devs avoid TypeScript for scripts, migrations, one-off tools, and anything that isn't a full project. But you don't have to deal with it anymore.

**tsx** is a package that lets you **run TypeScript directly**  no compilation step, no `tsconfig.json` required, no output directory. Just `npx tsx script.ts` and go.

And before you ask: no, this has nothing to do with React's `.tsx` file extension. Confusing name, completely different thing.

## What tsx Actually Is

tsx is built on top of esbuild, which means it compiles your TypeScript to JavaScript in memory, on the fly, before executing it with Node.js. It's not an interpreter  it's a just-in-time transpiler. The output never hits your file system.

```bash
# Install globally (optional)
npm install -g tsx

# Or just run directly with npx
npx tsx script.ts
```

That's it. Write a TypeScript file, run it directly:

```typescript
// script.ts
interface User {
  name: string;
  email: string;
}

const user: User = { name: 'Alice', email: 'alice@example.com' };
console.log(`Hello, ${user.name}!`);
```

```bash
npx tsx script.ts
# Output: Hello, Alice!
```

No config needed. ESM imports, CommonJS requires, path aliases  tsx handles all of it. It even supports top-level `await` out of the box.

## tsx vs ts-node

If you've been in the TypeScript ecosystem for a while, you've probably used ts-node before. It works, but it has a reputation for config headaches. Here's how they compare:

| Feature | tsx | ts-node |
|---------|-----|---------|
| **Speed** | Fast (esbuild-based) | Slower (uses TypeScript compiler) |
| **Config Required** | None | Often needs `tsconfig.json` adjustments |
| **ESM Support** | Works out of the box | Requires `--esm` flag and config changes |
| **Type Checking** | No (transpile only) | Optional (`--type-check` flag) |
| **Path Aliases** | Automatic via tsconfig | Needs `tsconfig-paths` package |
| **Watch Mode** | Built-in (`--watch`) | Needs `nodemon` or similar |

The biggest practical difference: tsx just works. I can't count the number of times ts-node has thrown a `ERR_UNKNOWN_FILE_EXTENSION` error or demanded specific `module` / `moduleResolution` settings in `tsconfig.json`. tsx skips all of that because esbuild doesn't need your TypeScript config to transpile  it just strips the types and runs.

> **Note:** tsx doesn't type-check your code. It's a transpiler, not a type checker. If you want type checking, run `tsc --noEmit` separately. In practice, your editor catches type errors in real-time anyway, so this rarely matters for scripts.

## Watch Mode

tsx has a built-in watch mode that restarts your script when files change:

```bash
npx tsx watch src/server.ts
```

No `nodemon`, no `ts-node-dev`, no extra config. It watches your file and its imports, and restarts on change. Fast enough that by the time you switch to your terminal, it's already restarted.

This is how I run dev servers for small Node.js projects now. In your `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc"
  }
}
```

Development uses tsx (no build step), production uses compiled output. Best of both worlds.

## Bun as an Alternative

If you're already using Bun, you don't even need tsx. Bun natively runs TypeScript files:

```bash
bun run script.ts
```

Bun has its own built-in TypeScript transpiler, and it's even faster than tsx because there's no Node.js startup overhead. If your project is already on Bun, just use `bun run` and skip the extra dependency entirely.

But if you're on Node.js and don't want to switch runtimes, tsx is the answer. It gives you the "just run it" experience without changing your toolchain.

## Using tsx in package.json Scripts

One of my favorite uses for tsx is running TypeScript-based tooling scripts. Seed scripts, database migrations, code generators  all the stuff that used to be JavaScript because "it's easier to run" can now be TypeScript:

```json
{
  "scripts": {
    "seed": "tsx scripts/seed-db.ts",
    "migrate": "tsx scripts/run-migrations.ts",
    "generate": "tsx scripts/codegen.ts",
    "dev": "tsx watch src/index.ts"
  }
}
```

No intermediate build step, no `ts-node --esm --experimental-specifier-resolution=node` incantation. Just `tsx` and the file.

> **Tip:** If you're converting JavaScript scripts to TypeScript, [SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) can handle the initial conversion  add types, convert require to import, the basics. Then you can run the result directly with tsx.

If you want more context on [why TypeScript is worth adopting](/blog/why-use-typescript-2026) for scripts and tooling (not just apps), we covered the full argument there. And if you're dealing with CommonJS vs ESM confusion in your Node.js scripts  which tsx largely solves  our [CommonJS vs ES Modules guide](/blog/commonjs-vs-es-modules-node) breaks down what's actually going on under the hood.

The bottom line: there's no reason to avoid TypeScript for scripts anymore. `npx tsx your-file.ts` removes the one valid complaint people had  the build step. Now it's just TypeScript, all the way down.
