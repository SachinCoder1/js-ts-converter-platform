---
title: "How to Type React Event Handlers in TypeScript"
description: "Quick reference for react typescript event handler types: onClick, onChange, onSubmit, onKeyDown, and more  with exact types and working examples."
date: "2026-03-25"
author: "SnipShift Team"
tags: ["typescript", "react", "events", "quick-reference"]
keyword: "react typescript event handler types"
difficulty: "intermediate"
readTime: "6 min read"
tool: "/js-to-ts"
---

# How to Type React Event Handlers in TypeScript

Every time I convert a React component from JSX to TSX, I spend at least five minutes looking up event handler types. Not because they're complicated  they're actually pretty consistent  but because there are enough of them that I can never remember whether it's `React.ChangeEvent` or `React.InputEvent` for a select dropdown. (It's `ChangeEvent`. Always `ChangeEvent`.)

So I wrote this reference for myself, and now I'm sharing it. Here are the exact react typescript event handler types you'll use in 99% of your components, with real examples for each.

## The Pattern

Every React event handler follows the same pattern:

```typescript
(event: React.EventType<HTMLElementType>) => void
```

Where:
- `React.EventType` is the event type (`MouseEvent`, `ChangeEvent`, `FormEvent`, etc.)
- `HTMLElementType` is the DOM element (`HTMLButtonElement`, `HTMLInputElement`, etc.)

That's it. Once you internalize this pattern, you just need to know which event type matches which event prop.

## onClick

The most common event handler. Works on virtually any element.

```typescript
// Button click
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Button clicked:', event.currentTarget.name);
};

// Div click (for clickable containers)
const handleDivClick = (event: React.MouseEvent<HTMLDivElement>) => {
  console.log('Div clicked at:', event.clientX, event.clientY);
};

// Anchor/link click
const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  console.log('Link href:', event.currentTarget.href);
};
```

```tsx
<button onClick={handleClick}>Click me</button>
<div onClick={handleDivClick}>Clickable area</div>
<a href="/page" onClick={handleLinkClick}>Navigate</a>
```

**Quick note about `currentTarget` vs `target`**: Use `event.currentTarget` when you want the element that has the event listener. Use `event.target` when you want the element that was actually clicked (which could be a child element). TypeScript types `currentTarget` more precisely than `target`, so prefer it when you can.

## onChange

Used for all form inputs  text inputs, checkboxes, selects, textareas. The element type in the generic changes, but the event type is always `React.ChangeEvent`.

```typescript
// Text input
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;        // string
  const name = event.target.name;          // string
  console.log(`${name}: ${value}`);
};

// Checkbox
const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const checked = event.target.checked;    // boolean
  console.log('Checked:', checked);
};

// Select dropdown
const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedValue = event.target.value;
  console.log('Selected:', selectedValue);
};

// Textarea
const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  const text = event.target.value;
  console.log('Text:', text);
};
```

```tsx
<input type="text" name="username" onChange={handleInputChange} />
<input type="checkbox" onChange={handleCheckboxChange} />
<select onChange={handleSelectChange}>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
<textarea onChange={handleTextareaChange} />
```

> **Tip:** A common mistake is using `HTMLInputElement` for a `<select>` or `<textarea>`. TypeScript won't stop you from doing this (they all have `value`), but you'll lose type safety on element-specific properties. Use the correct element type.

## onSubmit

For form submissions. This is one you almost always want to call `preventDefault()` on.

```typescript
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  // Access form data via FormData API
  const formData = new FormData(event.currentTarget);
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log('Submitting:', { email, password });
};
```

```tsx
<form onSubmit={handleSubmit}>
  <input name="email" type="email" />
  <input name="password" type="password" />
  <button type="submit">Log In</button>
</form>
```

Note it's `React.FormEvent`, not `React.SubmitEvent`. That's caught me more than once.

## onKeyDown and onKeyUp

For keyboard interactions. Useful for shortcuts, enter-to-submit patterns, and accessibility.

```typescript
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    // Submit logic
  }

  if (event.key === 'Escape') {
    // Close/cancel logic
  }
};

// On a div (for global keyboard shortcuts on a container)
const handleContainerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault();
    // Open command palette
  }
};
```

```tsx
<input onKeyDown={handleKeyDown} />
<div tabIndex={0} onKeyDown={handleContainerKeyDown}>
  {/* content */}
</div>
```

Common `event.key` values: `'Enter'`, `'Escape'`, `'Tab'`, `'ArrowUp'`, `'ArrowDown'`, `'Backspace'`, `'Delete'`. TypeScript doesn't narrow these to literal types  `event.key` is always `string`  but the values are standardized.

## onFocus and onBlur

For tracking focus state. Common in form validation  show errors on blur, hide them on focus.

```typescript
const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  console.log('Focused:', event.currentTarget.name);
  // Clear error state when user starts editing
};

const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
  const value = event.target.value;
  // Validate on blur
  if (!value) {
    setError('This field is required');
  }
};
```

```tsx
<input
  name="email"
  onFocus={handleFocus}
  onBlur={handleBlur}
/>
```

`React.FocusEvent` also has `relatedTarget`  the element that focus is moving to (on blur) or moving from (on focus). It's typed as `EventTarget | null`, which is kind of annoying if you need to check it, but that's the DOM API for you.

## onDrag Events

If you're building drag-and-drop interfaces without a library:

```typescript
const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
  event.dataTransfer.setData('text/plain', 'some-id');
};

const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault(); // Required to allow drop
};

const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  const data = event.dataTransfer.getData('text/plain');
  console.log('Dropped:', data);
};
```

Honestly, for anything beyond basic drag-and-drop, I'd recommend using a library like `@dnd-kit/core` or `react-beautiful-dnd`. They handle the event typing for you and deal with all the browser quirks.

## onScroll

For scroll-based interactions like infinite loading or sticky headers:

```typescript
const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

  if (isNearBottom) {
    loadMoreItems();
  }
};
```

Note it's `React.UIEvent`, not `React.ScrollEvent`  there's no `ScrollEvent` in React's type definitions. This is one of those things that's easy to get wrong.

## The Complete Quick Reference Table

| Event Prop | Event Type | Common Elements |
|-----------|-----------|----------------|
| `onClick` | `React.MouseEvent<El>` | `HTMLButtonElement`, `HTMLDivElement`, `HTMLAnchorElement` |
| `onDoubleClick` | `React.MouseEvent<El>` | Same as onClick |
| `onChange` | `React.ChangeEvent<El>` | `HTMLInputElement`, `HTMLSelectElement`, `HTMLTextAreaElement` |
| `onSubmit` | `React.FormEvent<El>` | `HTMLFormElement` |
| `onKeyDown` | `React.KeyboardEvent<El>` | `HTMLInputElement`, `HTMLDivElement` |
| `onKeyUp` | `React.KeyboardEvent<El>` | Same as onKeyDown |
| `onFocus` | `React.FocusEvent<El>` | `HTMLInputElement`, `HTMLButtonElement` |
| `onBlur` | `React.FocusEvent<El>` | Same as onFocus |
| `onDragStart` | `React.DragEvent<El>` | `HTMLDivElement` |
| `onDragOver` | `React.DragEvent<El>` | `HTMLDivElement` |
| `onDrop` | `React.DragEvent<El>` | `HTMLDivElement` |
| `onScroll` | `React.UIEvent<El>` | `HTMLDivElement` |
| `onMouseEnter` | `React.MouseEvent<El>` | Any element |
| `onMouseLeave` | `React.MouseEvent<El>` | Any element |
| `onTouchStart` | `React.TouchEvent<El>` | Any element |
| `onCopy` | `React.ClipboardEvent<El>` | `HTMLInputElement`, `HTMLDivElement` |
| `onPaste` | `React.ClipboardEvent<El>` | Same as onCopy |

## Inline Handlers vs Named Handlers

You don't always need a named handler function. For simple cases, inline handlers work fine and TypeScript infers the types automatically:

```tsx
// TypeScript infers the event type  no annotation needed
<button onClick={(e) => console.log(e.currentTarget.name)}>
  Click
</button>

<input onChange={(e) => setQuery(e.target.value)} />

<form onSubmit={(e) => {
  e.preventDefault();
  handleLogin();
}}>
```

When you write the handler inline, TypeScript knows the exact event type from the JSX prop. It's only when you extract the handler to a separate function that you need to manually annotate the parameter type.

My rule of thumb: if the handler is more than one line, extract it to a named function. One-liners are fine inline.

## The "I Can't Remember" Trick

Here's a trick I use when I genuinely can't remember the right event type: let TypeScript tell you.

```tsx
// Step 1: Write the handler inline with the wrong type
<input onChange={(e: any) => {}} />

// Step 2: Hover over 'onChange' in your IDE
// It shows: onChange?: React.ChangeEventHandler<HTMLInputElement>

// Step 3: Use that type for your named handler
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ...
};
```

Or even simpler  assign an inline handler first, then extract it. Your IDE's refactoring tools will carry the type forward automatically.

If you're converting a whole component from JSX to TSX and want to see all the handler types at once, [SnipShift's converter](https://snipshift.dev/js-to-ts) handles this automatically  it infers the correct React event types for each handler based on how they're used.

For the broader picture of typing React components  props, hooks, children, and more  check out our guide on [JSX to TSX conversion](/blog/jsx-to-tsx-react-typescript). And for typing React hooks specifically, we have a dedicated reference on [typing useState, useRef, and useEffect](/blog/typescript-react-hooks-types).
