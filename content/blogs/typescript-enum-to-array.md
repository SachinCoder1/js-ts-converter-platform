# How to Convert a TypeScript Enum to an Array

You'd think converting a TypeScript enum to an array would be a one-liner. And it can be  if you're working with string enums. But the moment you try it with numeric enums, things get weird fast. I've watched senior developers stare at their console output wondering why their "simple" enum has twice as many entries as expected.

The problem comes down to how TypeScript compiles enums under the hood, and once you understand that, the solution is pretty obvious. Let me show you what's going on and how to handle both cases cleanly.

## String Enums: The Easy Case

String enums behave the way you'd expect. Each key maps to a string value, and that's it. No surprises.

```typescript
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

const colorKeys = Object.keys(Color);
// ["Red", "Green", "Blue"]

const colorValues = Object.values(Color);
// ["RED", "GREEN", "BLUE"]
```

That's the whole thing. `Object.keys()` gives you the enum member names, `Object.values()` gives you the actual values. If all your enums are string enums, you can stop reading here. But most codebases aren't that simple.

## Numeric Enums: The Gotcha That Gets Everyone

Here's where it gets interesting. TypeScript compiles numeric enums with **reverse mappings**  meaning it creates entries that go both directions. The key maps to the value, and the value maps back to the key.

```typescript
enum Status {
  Active = 0,
  Inactive = 1,
  Pending = 2,
}

console.log(Object.keys(Status));
// ["0", "1", "2", "Active", "Inactive", "Pending"]

console.log(Object.values(Status));
// ["Active", "Inactive", "Pending", 0, 1, 2]
```

Yeah. Six entries instead of three. If you've ever built a dropdown from an enum and ended up with duplicate options, this is why.

The compiled JavaScript for that enum looks something like this:

```javascript
var Status;
(function (Status) {
  Status[(Status["Active"] = 0)] = "Active";
  Status[(Status["Inactive"] = 1)] = "Inactive";
  Status[(Status["Pending"] = 2)] = "Pending";
})(Status || (Status = {}));
```

So `Status[0]` returns `"Active"` and `Status["Active"]` returns `0`. TypeScript does this so you can look up names from values at runtime  handy sometimes, but it makes converting to an array a bit more work.

## Filtering Out the Reverse Mappings

The trick is simple: filter out the numeric keys. The real enum member names are always strings, so any key that parses as a number is a reverse mapping.

```typescript
enum Status {
  Active = 0,
  Inactive = 1,
  Pending = 2,
}

// Get just the names
const statusNames = Object.keys(Status).filter((key) => isNaN(Number(key)));
// ["Active", "Inactive", "Pending"]

// Get just the numeric values
const statusValues = Object.keys(Status)
  .filter((key) => !isNaN(Number(key)))
  .map(Number);
// [0, 1, 2]
```

This works reliably because TypeScript's reverse mappings always use the numeric value as the key  so checking `isNaN(Number(key))` cleanly separates real member names from reverse-mapped entries.

## A Reusable Utility Function

If you're doing this more than once  and you probably are  pull it into a helper. Here's one that handles both string and numeric enums:

```typescript
function enumToArray<T extends Record<string, string | number>>(
  enumObj: T
): { key: string; value: T[keyof T] }[] {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      key,
      value: enumObj[key as keyof T],
    }));
}

// Works with both enum types
enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
}

enum Theme {
  Light = "LIGHT",
  Dark = "DARK",
  System = "SYSTEM",
}

console.log(enumToArray(Priority));
// [{ key: "Low", value: 0 }, { key: "Medium", value: 1 }, { key: "High", value: 2 }]

console.log(enumToArray(Theme));
// [{ key: "Light", value: "LIGHT" }, { key: "Dark", value: "DARK" }, { key: "System", value: "SYSTEM" }]
```

This gives you an array of objects with both the name and value  perfect for rendering dropdowns, building select options, or mapping over enum members in JSX.

> **Tip:** If you're converting a JavaScript codebase that uses plain objects as pseudo-enums, [SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) can automatically convert those into proper TypeScript enums with correct typing.

## Quick Reference: String vs Numeric Enums

| Aspect | String Enum | Numeric Enum |
|--------|-------------|--------------|
| `Object.keys()` | Member names only | Names + reverse-mapped numbers |
| `Object.values()` | String values only | Values + reverse-mapped names |
| Reverse mapping | No | Yes |
| Needs filtering | No | Yes |
| `const enum` safe | Inlined at compile time | Inlined at compile time |

## Watch Out for `const enum`

One more thing worth mentioning. If your enum is declared as `const enum`, it gets completely erased at compile time  TypeScript inlines the values directly. That means there's no runtime object to call `Object.keys()` on.

```typescript
const enum Direction {
  Up = "UP",
  Down = "DOWN",
}

// This will error  Direction doesn't exist at runtime
// Object.keys(Direction); // ❌
```

If you need runtime access to enum members  for iteration, dropdowns, validation, whatever  don't use `const enum`. Stick with a regular enum, or consider using a plain object with `as const` instead:

```typescript
const Direction = {
  Up: "UP",
  Down: "DOWN",
} as const;

type Direction = (typeof Direction)[keyof typeof Direction];

Object.values(Direction); // ["UP", "DOWN"]  works perfectly
```

Honestly, the `as const` pattern has kind of replaced enums in a lot of the codebases I work with. It's more predictable, doesn't have the reverse mapping weirdness, and plays nicer with tree-shaking. But that's a topic for another post.

If you're migrating a codebase from JavaScript to TypeScript and trying to decide between enums and `as const` objects, the [TypeScript migration strategy guide](/blog/typescript-migration-strategy) covers that decision in more detail. And if you're still early in your migration, the [complete JS to TypeScript conversion guide](/blog/convert-javascript-to-typescript) walks through the full process step by step.

Converting a TypeScript enum to an array is one of those things that's dead simple once you know about reverse mappings. String enums  just use `Object.keys()` or `Object.values()`. Numeric enums  filter out the numeric keys first. And if you want to avoid the whole mess entirely, `as const` objects are your friend.
