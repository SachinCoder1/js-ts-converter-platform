# How to Persist State in React Across Page Refreshes

You build a nice filter UI. The user selects "dark mode," picks their preferred language, adjusts a sidebar width. They hit refresh. Everything resets. The look on their face  you know the one.

React state lives in memory. When the page refreshes, memory clears, and `useState` hands you the initial value like nothing happened. If you want state to persist across page refreshes, you need to store it somewhere outside of React's runtime.

There are several places you can put it, and the right choice depends on the data. Here are six approaches, each with TypeScript, starting from the simplest.

## 1. localStorage + useEffect

The most common approach. localStorage is synchronous, stores strings, and persists until the user clears their browser data. It's available in every browser and holds about 5MB per origin.

```typescript
import { useState, useEffect } from 'react';

function ThemeSelector() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage (runs only once)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  // Sync to localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}
```

Two things to notice. First, the lazy initializer in `useState`  that function runs once on mount and reads from localStorage. Second, the `typeof window !== 'undefined'` check  this prevents crashes during server-side rendering where `localStorage` doesn't exist.

This works, but you're going to write this pattern in every component that needs persistence. That's where a custom hook comes in.

## 2. Custom usePersistentState Hook

Abstract the localStorage logic into a reusable hook. This is the version I copy between projects:

```typescript
import { useState, useEffect, useCallback } from 'react';

function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      // Corrupted data or parsing error  fall back to default
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage might be full or blocked
      console.warn(`Failed to persist state for key: ${key}`);
    }
  }, [key, state]);

  return [state, setState];
}
```

Now any component can persist state in one line:

```typescript
function Settings() {
  const [theme, setTheme] = usePersistentState<'light' | 'dark'>('theme', 'light');
  const [fontSize, setFontSize] = usePersistentState<number>('fontSize', 16);
  const [sidebarOpen, setSidebarOpen] = usePersistentState<boolean>('sidebar', true);

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Theme: {theme}
      </button>
      <input
        type="range"
        min={12}
        max={24}
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
      />
    </div>
  );
}
```

The generic `<T>` means TypeScript knows `theme` is `'light' | 'dark'`, `fontSize` is `number`, and `sidebarOpen` is `boolean`  all inferred from the default value or the explicit type parameter.

> **Tip:** Always wrap `JSON.parse` and `localStorage` calls in try/catch. Users can manually edit localStorage, browser extensions can corrupt it, and private browsing modes on some older mobile browsers throw errors on any storage access.

## 3. Zustand with Persist Middleware

If you're already using Zustand for state management, its `persist` middleware handles all of this for you  including serialization, rehydration, and even storage migration between versions.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  theme: 'light' | 'dark';
  fontSize: number;
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: number) => void;
  toggleSidebar: () => void;
}

const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 16,
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'settings-storage', // localStorage key
    }
  )
);
```

That's it. Every time state changes, Zustand persists it to localStorage. On page load, it rehydrates from localStorage. No manual useEffect, no JSON.parse  the middleware handles everything.

You can even customize the storage backend:

```typescript
const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => sessionStorage), // Or any custom storage
    }
  )
);
```

For a more complete guide to Zustand and global state in React, see our post on [React global state without Redux](/blog/react-global-state-without-redux).

## 4. URL State (Search Params)

For state that represents the "view" of a page  filters, sort orders, active tabs, pagination  the URL is often the best place. It survives refreshes, it's shareable, and browser back/forward navigation just works.

```typescript
import { useSearchParams } from 'next/navigation';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

function ProductFilters() {
  const searchParams = useSearchParams();
  const sort = (searchParams.get('sort') as SortOption) ?? 'newest';
  const category = searchParams.get('category') ?? 'all';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  return (
    <div>
      <select
        value={sort}
        onChange={(e) => updateParam('sort', e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}
```

URL state is best for values that make sense in a link. Someone sharing `https://yourapp.com/products?category=shoes&sort=price-asc` should see the same view. Don't put sensitive data or internal UI state (like whether a tooltip is open) in the URL.

## 5. Cookies (Server-Readable)

Cookies have one major advantage over localStorage  they're sent with every HTTP request, so your server can read them. This matters for things like theme preference or locale when you need the server to render the correct initial HTML.

```typescript
// Setting a cookie (client-side)
function setThemeCookie(theme: 'light' | 'dark'): void {
  document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

// Reading a cookie (client-side)
function getThemeCookie(): 'light' | 'dark' {
  const match = document.cookie.match(/theme=(light|dark)/);
  return match?.[1] === 'dark' ? 'dark' : 'light';
}

// Reading in a Next.js Server Component
import { cookies } from 'next/headers';

async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value === 'dark' ? 'dark' : 'light';

  return (
    <html className={theme}>
      <body>{children}</body>
    </html>
  );
}
```

The killer use case: avoiding the flash of wrong theme. With localStorage, the server renders the default theme, then the client reads localStorage and switches  causing a visible flash. With cookies, the server knows the theme during SSR and renders correctly from the start.

> **Warning:** Cookies are limited to about 4KB per cookie. Don't try to store complex objects  keep it to simple preferences like theme, locale, or auth tokens.

## 6. IndexedDB (For Large Data)

LocalStorage maxes out around 5MB and only stores strings. If you need to persist large datasets  think cached API responses, offline data, images, or file handles  IndexedDB is the right tool. It stores structured data and can hold hundreds of megabytes.

The raw IndexedDB API is notoriously painful to work with. I'd use a wrapper like `idb`:

```typescript
import { openDB, type IDBPDatabase } from 'idb';

interface CachedData {
  key: string;
  value: unknown;
  timestamp: number;
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB('app-cache', 1, {
    upgrade(db) {
      db.createObjectStore('cache', { keyPath: 'key' });
    },
  });
}

async function persistData<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('cache', {
    key,
    value,
    timestamp: Date.now(),
  } satisfies CachedData);
}

async function loadData<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const result = await db.get('cache', key);
  return result ? (result.value as T) : null;
}
```

IndexedDB is async (unlike localStorage), so you'll need to handle loading states when reading from it. It's overkill for a theme toggle  but it's the right choice for persisting large cached datasets or draft documents that the user is editing.

## Which Storage Method Should You Use?

| Method | Max Size | Sync/Async | SSR-Readable | Best For |
|--------|---------|:----------:|:------------:|----------|
| localStorage | ~5MB | Sync | No | User preferences, small state |
| Custom hook | ~5MB | Sync | No | Reusable localStorage pattern |
| Zustand persist | ~5MB | Sync | No | When you already use Zustand |
| URL params | ~2KB | Sync | Yes | Filters, sort, pagination |
| Cookies | ~4KB | Sync | Yes | Theme, locale, auth tokens |
| IndexedDB | 100MB+ | Async | No | Large data, offline storage |

For most React apps, the custom `usePersistentState` hook covers 80% of persistence needs. Add URL state for anything that should be shareable, cookies for anything the server needs to read, and IndexedDB only if you're dealing with substantial amounts of data.

If you're typing your localStorage interactions with TypeScript, our post on [type-safe localStorage in TypeScript](/blog/type-safe-localstorage-typescript) goes deeper into validation and schema evolution. And if you're building custom hooks and want to get the return types right, check out [typing custom hook returns in TypeScript](/blog/type-custom-hook-return-typescript).

State doesn't have to die on refresh. Pick the right storage for the job, and your users will thank you  even if they never know you did it.
