# How to Use Enums in TypeScript (And When to Avoid Them)

Few TypeScript features generate as much debate as enums. Half the community thinks they're essential. The other half wants them removed from the language entirely. I've been somewhere in the middle for a while, but I'll share where I've landed  and more importantly, give you enough context to make your own call.

**TypeScript enums** let you define a set of named constants. Sounds simple. But the implementation details, the compiled output, and the subtle gotchas make this one of those features where the devil really is in the details.

## Numeric Enums: The Default

If you declare an enum without assigning values, TypeScript creates a **numeric enum** starting from 0:

```typescript
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

const move = Direction.Up; // 0
```

You can set custom starting values too:

```typescript
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  InternalError = 500
}

function handleResponse(status: HttpStatus) {
  if (status === HttpStatus.NotFound) {
    showError("Page not found");
  }
}
```

Numeric enums look clean in your TypeScript code. But here's where things get weird  look at what the compiler outputs:

```javascript
// Compiled JavaScript output
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
  Direction[Direction["Left"] = 2] = "Left";
  Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
```

That's... a lot of JavaScript for four constants. And it creates a **reverse mapping**  you can go from value to name:

```typescript
Direction[0]; // "Up"
Direction["Up"]; // 0
```

This reverse mapping is sometimes useful for debugging, but it also means numeric enums are one of the few TypeScript features that emit *extra* runtime code. TypeScript is supposed to be a type-level-only addition to JavaScript, and enums break that rule.

### The Numeric Enum Footgun

Here's the dangerous part that catches people. Numeric enums accept *any* number, not just the defined values:

```typescript
enum Status {
  Active = 1,
  Inactive = 2
}

// This compiles without error  but 99 isn't a valid Status!
const s: Status = 99; // No error. Wait, what?
```

TypeScript just... lets this through. It's a known design limitation, and it means numeric enums don't actually provide the type safety you'd expect. A function that accepts `Status` will happily accept `42` or `-1` or any number at all.

## String Enums: The Better Option

String enums fix the biggest problem with numeric enums  they don't allow arbitrary values:

```typescript
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}

const c: Color = "PURPLE"; // Error: Type '"PURPLE"' is not assignable to type 'Color'
const d: Color = Color.Red; // Works
```

The compiled output is also cleaner  no reverse mapping:

```javascript
var Color;
(function (Color) {
  Color["Red"] = "RED";
  Color["Green"] = "GREEN";
  Color["Blue"] = "BLUE";
})(Color || (Color = {}));
```

String enums give you readable values in logs and debugging (`"RED"` is more helpful than `0`), actual type safety, and no reverse mapping weirdness. If you're going to use enums, string enums are the way to go.

> **Tip:** Some teams use SCREAMING_CASE for the values (`"RED"`, `"GREEN"`) and PascalCase for the keys. Others match them (`Red = "Red"`). Pick one convention and stick with it.

## Const Enums: The Disappearing Kind

If the runtime overhead of enums bothers you, `const enum` is the compromise:

```typescript
const enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR"
}

const level = LogLevel.Debug;
```

The compiler inlines the values directly. No runtime object, no IIFE  the compiled output is just:

```javascript
const level = "DEBUG"; // That's it. The enum is gone.
```

Sounds perfect, right? Well, there are catches:

- **No reverse mapping**  you can't look up names from values
- **No iterating**  you can't `Object.values(LogLevel)` because there is no object
- **Breaks with `isolatedModules`**  tools like Babel, esbuild, and SWC can't inline const enums across files because they compile one file at a time
- **`--preserveConstEnums` exists for a reason**  many modern build setups need this flag, which defeats the purpose

That last point is the killer. If you're using Vite, Next.js, or any project with `"isolatedModules": true` in `tsconfig.json`, const enums across file boundaries just don't work. And `isolatedModules` is on by default in most modern setups.

## The `as const` Alternative

Here's where the debate gets interesting. You can get most of what enums offer using plain objects with `as const`:

```typescript
const Direction = {
  Up: "UP",
  Down: "DOWN",
  Left: "LEFT",
  Right: "RIGHT",
} as const;

// Extract the type from the object
type Direction = (typeof Direction)[keyof typeof Direction];
// Result: "UP" | "DOWN" | "LEFT" | "RIGHT"
```

That `type Direction` line looks gnarly the first time you see it, I know. But once you understand the pattern, it becomes second nature. And it gives you real advantages:

| Feature | `enum` | `as const` object |
|---------|--------|-------------------|
| Runtime object to iterate | Yes | Yes |
| Type safety | Yes (string) / Partial (numeric) | Yes |
| Works with `isolatedModules` | Partially | Yes |
| Tree-shakeable | No | Yes |
| Standard JavaScript | No (TS-specific syntax) | Yes (plain object) |
| Reverse mapping | Yes (numeric only) | No (but easy to add) |
| Bundle size impact | Adds runtime code | Just a const object |

The **tree-shaking** point matters more than people realize. Bundlers like Vite and webpack can't tree-shake traditional enums because the IIFE pattern creates side effects. With `as const`, you get a plain object that bundlers understand perfectly.

```mermaid
graph TD
    A[Need named constants?] --> B{Will values change at runtime?}
    B -->|Yes| C[Use a regular object - not an enum]
    B -->|No| D{Need to iterate over values?}
    D -->|Yes| E{Using isolatedModules?}
    E -->|Yes| F[Use as const object]
    E -->|No| G[enum or as const both work]
    D -->|No| H{Is it a simple set of strings?}
    H -->|Yes| I[Use a union type]
    H -->|No| F
```

## Union Types: When You Don't Need an Object at All

For a lot of use cases, you don't even need a runtime value  a union type is enough:

```typescript
type Status = "active" | "inactive" | "pending";

function setStatus(status: Status) {
  // Full type safety, autocomplete, everything
}

setStatus("active");  // Works
setStatus("deleted"); // Error
```

No runtime code. No import overhead. Just types. Union types are my go-to for most cases where I'd reach for an enum.

The limitation is that union types don't give you a runtime object to iterate over. You can't do `Object.values(Status)` because `Status` doesn't exist at runtime. If you need to populate a dropdown or validate user input against the list of valid values, you need either an `as const` object or an enum.

Here's the pattern I use when I need both:

```typescript
const STATUSES = ["active", "inactive", "pending"] as const;
type Status = (typeof STATUSES)[number];
// Status = "active" | "inactive" | "pending"

// Now you can iterate AND have type safety
STATUSES.forEach((status) => {
  console.log(status); // TypeScript knows this is Status
});
```

## My Recommendation (Opinionated)

After working with TypeScript across a bunch of projects, here's where I've landed on the enum question:

**For most cases:** Use union types. They're simple, they have zero runtime cost, and they give you full type safety with autocomplete.

**When you need runtime values** (iterating, dropdowns, validation): Use `as const` objects. They work everywhere, they tree-shake properly, and they play nice with `isolatedModules`.

**When to use actual enums:** Honestly? Almost never in new code. The main reason to use them is if your team already uses them and consistency matters more than theoretical purity. And that's a valid reason  switching patterns mid-codebase is worse than using a slightly suboptimal pattern consistently.

**Never use numeric enums.** The arbitrary number assignment bug alone disqualifies them for any code that cares about type safety.

Hot take: if TypeScript were designed today, I don't think enums would exist. The `as const` pattern and union types cover every use case with less magic, less compiled output, and fewer gotchas. But enums are in the language, they're not going away, and plenty of codebases use them successfully. So use them if they work for your team  just know the trade-offs.

> **Warning:** If you're working with an API that returns enum-like string values, don't try to match them against a TypeScript enum directly. API responses are strings at runtime. Use a validation layer (Zod, for instance) to parse the string into your type system, or use a union type that matches the raw string values.

## Converting Between Enums and Other Patterns

If you've got existing enums and want to convert them to `as const`, or vice versa, it's a pretty mechanical transformation. And if you're converting a JavaScript codebase to TypeScript and need to decide which pattern to use for your constants, [SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) can generate typed constants from your existing JavaScript objects  a quick way to get a starting point without typing everything out manually.

For more on this topic, we've got a guide on [converting TypeScript enums to arrays](/blog/typescript-enum-to-array) if you need to iterate over enum values. And our [interface vs type guide](/blog/typescript-interface-vs-type) covers more of the "which construct should I use when" decision-making that comes up constantly in TypeScript projects.

One more related resource: if you're curious about generics  which pair naturally with `as const` for building type-safe utility functions  check out our [TypeScript generics guide](/blog/typescript-generics-explained).
