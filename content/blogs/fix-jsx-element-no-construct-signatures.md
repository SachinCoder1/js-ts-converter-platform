# Fix: 'JSX Element Type Does Not Have Any Construct or Call Signatures'

You're working on a React component, everything looks fine, and then TypeScript hits you with this:

```
'MyComponent' cannot be used as a JSX element.
  Its type 'typeof MyComponent' has no construct or call signatures.
```

I've seen this error trip up experienced developers  not just beginners. It's one of those TypeScript errors where the message sounds way more intimidating than the actual problem. The root cause is almost always one of four things, and each one has a quick fix.

A team I worked with once spent two hours debugging this on a shared component library. Turned out to be a bad import. Two hours. So let's make sure that doesn't happen to you.

## Quick Reference: Causes and Fixes

Before we get into the details, here's the full picture:

| Cause | What's Happening | Fix |
|-------|-----------------|-----|
| Export mismatch | Default export vs named export confusion | Match your import to the actual export style |
| Importing a type | You imported the type/interface, not the component | Import the component itself, not its type |
| Missing React import | Old JSX transform needs `React` in scope | Add `import React from 'react'` or switch to the new JSX transform |
| Wrong component type | Component returns the wrong thing or class component is misused | Fix the return type or component definition |

Now let's walk through each one with actual code.

## Cause 1: Export Mismatch (Default vs Named)

This is the most common cause I've seen in the wild. You export a component one way and import it another way. TypeScript doesn't get a component function  it gets `undefined` or a module object  and rightfully complains that it can't construct JSX from that.

**The broken code:**

```tsx
// Button.tsx
export const Button = ({ label }: { label: string }) => {
  return <button>{label}</button>;
};
```

```tsx
// App.tsx
import Button from "./Button"; // ❌ default import, but it's a named export

const App = () => <Button label="Click me" />;
```

TypeScript sees `Button` as the entire module object here  not a component function. And a module object doesn't have construct or call signatures.

**The fix  match your import to the export:**

```tsx
// Option A: Use a named import (matches the named export)
import { Button } from "./Button"; // ✅

const App = () => <Button label="Click me" />;
```

```tsx
// Option B: Change Button.tsx to use a default export
const Button = ({ label }: { label: string }) => {
  return <button>{label}</button>;
};

export default Button; // ✅ now default import works
```

> **My take:** I strongly prefer named exports for components. They're easier to refactor, your editor can auto-import them correctly, and you avoid this exact class of bugs. Default exports are a footgun in larger codebases.

If you're converting a JavaScript React project to TypeScript and running into this, [SnipShift's JS to TS converter](https://snipshift.dev/js-to-ts) can help you catch these mismatches early. It won't rewrite your imports for you, but it'll surface the type errors you need to fix.

## Cause 2: Importing a Type Instead of the Component

This one is sneaky. It happens when a file exports both a component and its props type, and you accidentally grab the type instead of the component. Or  and this is more common  you're using a barrel file (`index.ts`) that re-exports things, and the re-export is wrong.

**The broken code:**

```tsx
// Card.tsx
export interface Card {
  title: string;
  body: string;
}

export const Card = ({ title, body }: Card) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
};
```

Wait  that won't even compile. You can't have an interface and a const with the same name in the same file. But here's the version that actually bites people:

```tsx
// types.ts
export interface Card {
  title: string;
  body: string;
}

// Card.tsx
import type { Card } from "./types";
export const CardComponent = ({ title, body }: Card) => {
  return <div><h2>{title}</h2><p>{body}</p></div>;
};

// index.ts (barrel file)
export { Card } from "./types";        // exports the TYPE
export { CardComponent } from "./Card"; // exports the component
```

```tsx
// App.tsx
import { Card } from "./components"; // ❌ This is the interface, not the component!

const App = () => <Card title="Hello" body="World" />;
```

**The fix:**

```tsx
// App.tsx
import { CardComponent } from "./components"; // ✅ Import the actual component

const App = () => <CardComponent title="Hello" body="World" />;
```

Or better yet, rename things so there's no ambiguity:

```tsx
// types.ts
export interface CardProps {  // ✅ Use "Props" suffix for prop types
  title: string;
  body: string;
}

// Card.tsx
import type { CardProps } from "./types";
export const Card = ({ title, body }: CardProps) => {
  return <div><h2>{title}</h2><p>{body}</p></div>;
};
```

> **Tip:** Always suffix your prop types with `Props`  `ButtonProps`, `CardProps`, `ModalProps`. It completely eliminates name collisions between types and components. Every team I've worked with that adopted this convention saw fewer import bugs.

This naming issue comes up a lot when you're [migrating JSX files to TSX](/blog/jsx-to-tsx-react-typescript). You're adding types for the first time, and it's tempting to name the props interface the same as the component.

## Cause 3: Missing React Import (Old JSX Transform)

If your project uses the older JSX transform  which was the default before React 17  then every file that contains JSX needs `import React from 'react'` at the top. Without it, TypeScript can't resolve the JSX element types, and you get this error.

**The broken code:**

```tsx
// Greeting.tsx  no React import!
const Greeting = ({ name }: { name: string }) => {
  return <h1>Hello, {name}!</h1>;
};

export default Greeting;
```

**The fix  Option A: Add the import:**

```tsx
import React from "react";

const Greeting = ({ name }: { name: string }) => {
  return <h1>Hello, {name}!</h1>;
};

export default Greeting;
```

**The fix  Option B: Switch to the new JSX transform (recommended):**

In your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

With `"react-jsx"`, TypeScript automatically imports the JSX runtime  you don't need the manual `import React` anymore. This is what most modern setups use. If you're on React 17 or later and still using `"react"` as your `jsx` setting, it's worth switching.

> **Warning:** If you switch to `"react-jsx"`, make sure your React version is 17+ and your bundler supports the new transform. Next.js, Vite, and Create React App 4+ all handle this automatically.

There's a good discussion about how component declaration style interacts with this in our post on [React.FC vs function declarations](/blog/react-fc-vs-function-declaration). The `React.FC` type, for instance, always requires React to be in scope with the old transform.

## Cause 4: Wrong Component Type

Sometimes the component itself is just... wrong. It doesn't return valid JSX, or it's a class component being used incorrectly. TypeScript is trying to tell you that whatever you're passing as a JSX element isn't actually something React can render.

**Example A  Component returns the wrong thing:**

```tsx
// Badge.tsx
export const Badge = ({ text }: { text: string }) => {
  return { text }; // ❌ Returns an object, not JSX!
};
```

```tsx
// App.tsx
import { Badge } from "./Badge";
const App = () => <Badge text="New" />; // Error!
```

**The fix:**

```tsx
export const Badge = ({ text }: { text: string }) => {
  return <span>{text}</span>; // ✅ Returns JSX
};
```

**Example B  Class component with wrong structure:**

```tsx
// LegacyPanel.tsx
export class LegacyPanel {  // ❌ Doesn't extend React.Component
  render() {
    return <div>Panel</div>;
  }
}
```

**The fix:**

```tsx
import React from "react";

interface LegacyPanelProps {
  title?: string;
}

export class LegacyPanel extends React.Component<LegacyPanelProps> {  // ✅
  render() {
    return <div>{this.props.title ?? "Panel"}</div>;
  }
}
```

And honestly  if you're dealing with class components in 2026, it might be time to convert them to function components. Class components still work, but the ecosystem has moved on. Hooks are the standard, and the tooling around function components is just better at this point.

## Bonus: Dynamic Components

There's one more scenario that catches people off guard  passing components as props or storing them in variables.

```tsx
const components: Record<string, any> = {
  header: HeaderComponent,
  footer: FooterComponent,
};

const DynamicRenderer = ({ type }: { type: string }) => {
  const Component = components[type]; // type is 'any'
  return <Component />; // ❌ TypeScript can't verify this is a valid component
};
```

**The fix  type the record properly:**

```tsx
import { ComponentType } from "react";

const components: Record<string, ComponentType> = {
  header: HeaderComponent,
  footer: FooterComponent,
};

const DynamicRenderer = ({ type }: { type: string }) => {
  const Component = components[type];
  if (!Component) return null;
  return <Component />; // ✅
};
```

Using `ComponentType` from React tells TypeScript "this is something that can be used as a JSX element." Problem solved.

## Still Stuck?

If you're migrating a codebase from JavaScript to TypeScript and hitting a wall of these errors, don't try to fix everything manually. [SnipShift's JS to TS converter](https://snipshift.dev/js-to-ts) handles the mechanical conversion  adding type annotations, fixing imports, converting PropTypes. And if you're specifically converting PropTypes to TypeScript interfaces, the [PropTypes to TypeScript tool](https://snipshift.dev/proptypes-to-typescript) will save you a ton of tedious work.

The "JSX element type does not have any construct or call signatures" error is always a type resolution problem  TypeScript can't figure out that the thing you're using as a component is actually a valid React component. Check your exports, check your imports, check your JSX transform config, and check what your component actually returns. One of those four will be the culprit.

For more on working with TypeScript and React, check out the full set of guides on [SnipShift](https://snipshift.dev).
