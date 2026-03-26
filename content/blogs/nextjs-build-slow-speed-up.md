# Why Is My Next.js Build So Slow? (And How to Speed It Up)

You run `next build`, grab your coffee, check your phone, reply to a Slack message  and it's *still* going. If your Next.js build is slow, you're not alone. I've seen projects where builds ballooned from 30 seconds to over 8 minutes, and nobody could figure out why. The answer is almost never one big thing. It's a dozen small things compounding on each other.

This post walks through the most common culprits behind a slow Next.js build and gives you concrete fixes for each one. No hand-waving, no vague advice. Let's get into it.

## Start by Actually Reading the Build Output

Before you change anything, run your build with the `NEXT_DEBUG` flag or just pay close attention to what `next build` already tells you:

```bash
ANALYZE=true next build
```

If you've installed `@next/bundle-analyzer`, you'll get a visual treemap of every module in your bundle. But even without it, the default build output shows you:

- The size of each route (First Load JS)
- Which routes are statically generated vs. server-rendered
- Compile times per page

Most developers skip past this output. Don't. If you see a page shipping 350kB of First Load JS, that's your starting point. And if one route takes 10x longer to compile than the others, there's a dependency problem hiding in that route's import tree.

> **Tip:** Run `next build` with `--profile` to generate a React production profiling build. Combine this with the bundle analyzer to get a full picture of both build-time and runtime performance.

For a deeper look at what makes up your bundle, check out our guide on [how to reduce your JavaScript bundle size](/blog/reduce-javascript-bundle-size).

## Barrel File Imports  the Silent Killer of Next.js Build Speed

This is, hands down, the number one reason I've seen for a slow Next.js build. Barrel files are those `index.ts` files that re-export everything from a directory:

```typescript
// components/index.ts  a barrel file
export { Button } from './Button';
export { Modal } from './Modal';
export { Sidebar } from './Sidebar';
export { DataGrid } from './DataGrid';
export { Chart } from './Chart';
export { RichTextEditor } from './RichTextEditor';
// ... 40 more exports
```

The problem? When you write `import { Button } from '@/components'`, the bundler has to parse and evaluate *every single export* in that barrel file  even though you only wanted `Button`. If `Chart` pulls in a massive charting library and `RichTextEditor` pulls in a rich text engine, congratulations  you're now building all of that just to render a button.

The fix is dead simple. Use direct imports:

```typescript
// Before (slow  triggers barrel file resolution)
import { Button } from '@/components';

// After (fast  only pulls in what you need)
import { Button } from '@/components/Button';
```

I once cut a team's build time from 6 minutes to 90 seconds just by eliminating barrel file imports. That's not an exaggeration. The barrel files were re-exporting components that imported heavy libraries like `monaco-editor`, `recharts`, and `draft-js`. Every single page paid the cost of parsing those, even pages that didn't use them.

Next.js 13+ has `optimizePackageImports` in `next.config.js` which helps with third-party barrels:

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'date-fns'],
  },
};
```

But for your own code? Just stop using barrel files. Your IDE's auto-import will handle the paths for you.

> **Warning:** If you're using a component library like `@mui/material` or `lodash` without direct imports, you could be adding *hundreds* of kilobytes to every route. Always import from the specific subpath: `import debounce from 'lodash/debounce'`, not `import { debounce } from 'lodash'`.

## Unused Dependencies Are Dragging You Down

Run this command right now:

```bash
npx depcheck
```

I guarantee you'll find packages that are installed but never imported. Every dependency in your `node_modules` doesn't just take up disk space  it can slow down module resolution. The TypeScript compiler and bundler have to search through `node_modules` when resolving types and imports. More packages means more directories to crawl.

But the worse offenders are dependencies that *are* imported but not actually used at runtime. Maybe you installed `moment` six months ago, switched to `date-fns`, but never removed the old import buried in a utility file. That import still gets bundled.

Here's a quick audit process:

| Step | Tool | What it finds |
|------|------|---------------|
| 1. Check unused packages | `depcheck` | Installed but never imported |
| 2. Analyze bundle | `@next/bundle-analyzer` | Imported but unexpectedly large |
| 3. Find duplicates | `npm dedupe` or `yarn dedupe` | Multiple versions of the same package |
| 4. Check tree-shaking | Bundle analyzer treemap | Modules that should be shaken out but aren't |

Step 3 is underrated. I've seen projects with three different versions of `tslib` or two copies of `react-dom` because of conflicting peer dependencies. Run `npm ls react-dom` and if you see more than one version, that's a problem worth fixing.

## SWC vs Babel  Stop Using Babel Unless You Have To

Next.js switched to the SWC compiler back in version 12, and it's *dramatically* faster than Babel. We're talking 17x faster for single-file transforms and 5x faster for full builds in some benchmarks.

But here's the catch: if you have a `.babelrc` or `babel.config.js` in your project root, Next.js silently falls back to Babel. It doesn't warn you. It just gets slower.

Check if you're accidentally using Babel:

```bash
ls -la .babelrc babel.config.*
```

If those files exist, ask yourself why. The most common reasons:

1. **You needed a Babel plugin for styled-components.** Good news  Next.js has a built-in SWC transform for that. Set `compiler.styledComponents: true` in `next.config.js`.
2. **You needed decorators or class properties.** SWC supports both natively now.
3. **You have a custom plugin nobody remembers adding.** Delete it and see if anything breaks. Seriously.

The SWC compiler handles the vast majority of what Babel plugins used to do. Unless you have a truly exotic transform, you can almost certainly ditch Babel and get an instant build speed improvement.

> **Tip:** After removing your Babel config, run a full build and compare times. Most teams see a 2-4x improvement immediately. If your Next.js build is slow and you're still on Babel, this is the single highest-impact change you can make.

## Turbopack  the Future of Fast Builds

Turbopack is the Rust-based bundler that ships with recent versions of Next.js. As of Next.js 15, it's stable for development and making big strides for production builds. If you haven't tried it yet, you should.

Enable it for development:

```bash
next dev --turbo
```

What Turbopack gives you:

- **Incremental compilation**  it only rebuilds what changed, at the module level
- **Rust-native speed**  module resolution and transforms happen in Rust, not JavaScript
- **Persistent caching**  build artifacts survive between restarts

In my testing, Turbopack cuts dev server startup from ~8 seconds to under 2 seconds on a medium-sized project (around 200 routes). Hot module replacement goes from "noticeable delay" to "instant." It's a genuine step change, not incremental improvement.

For production builds, Turbopack support is actively being stabilized. Keep an eye on the Next.js release notes  once it's fully production-ready, it'll be the default. But even using it just for development saves you hours of cumulative wait time per week.

And if you're migrating a JavaScript project to TypeScript to take advantage of better tooling and type checking, [SnipShift's JS to TS converter](https://devshift.dev) can speed up that process significantly.

## Image Optimization  next/image Is Great (If You Use It Right)

The `next/image` component does a lot of heavy lifting: responsive sizing, lazy loading, format conversion to WebP/AVIF, and caching. But misconfiguring it can actually make your build slower.

Common mistakes:

**1. Not setting `width` and `height` on static imports.**

```jsx
// Slow  Next.js has to analyze the image at build time
<Image src="/hero.png" alt="Hero" fill />

// Faster  dimensions are known upfront
<Image src="/hero.png" alt="Hero" width={1200} height={630} />
```

When you use `fill` without known dimensions, Next.js has to read and analyze the image file during the build. For a few images, this is fine. For a site with hundreds of images, it adds up.

**2. Importing images from external URLs without configuring `remotePatterns`.**

If your build is slow and you're loading external images, make sure your `next.config.js` has the right remote patterns configured. Otherwise, image optimization happens on every request instead of being cached properly.

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
    ],
  },
};
```

**3. Not using a CDN or external image optimization service for large-scale sites.**

If you have thousands of images, consider offloading to Cloudinary, Imgix, or Vercel's built-in image optimization. The built-in optimizer works great for most projects, but at scale, the build-time cost of processing thousands of images can be significant.

For more on how images and other assets affect your real-world performance metrics, read our breakdown of [Core Web Vitals and how to fix them](/blog/core-web-vitals-explained-fix).

## Other Quick Wins You Might Be Missing

A few more things worth checking if your Next.js build time is still longer than you'd like:

- **TypeScript `skipLibCheck`**  Set `"skipLibCheck": true` in your `tsconfig.json`. This skips type-checking of `.d.ts` files in `node_modules` and can cut build time noticeably.
- **Reduce page count**  Every page and API route gets compiled individually. If you have hundreds of pages that could be dynamic routes, consolidate them with `[slug]` patterns.
- **Parallel route compilation**  Next.js 14+ compiles routes in parallel by default. Make sure you're on the latest version.
- **CI caching**  Cache `.next/cache` between CI runs. This directory stores build artifacts, and reusing it can cut subsequent builds by 50% or more.
- **Memory limits**  If your build crashes or slows to a crawl, you might be running out of memory. Try `NODE_OPTIONS='--max-old-space-size=8192' next build`.

> **Tip:** If your app is getting complex and you suspect runtime performance issues too  not just build speed  our [React app slow debugging checklist](/blog/react-app-slow-debugging-checklist) covers the runtime side of things.

## Putting It All Together

Here's the order I'd tackle these optimizations in, from highest to lowest impact:

1. **Remove Babel**  switch to SWC (instant win if applicable)
2. **Kill barrel file imports**  audit your imports, use direct paths
3. **Enable Turbopack** for dev  `next dev --turbo`
4. **Remove unused dependencies**  run `depcheck`, clean up your `package.json`
5. **Audit your bundle**  use `@next/bundle-analyzer` to find surprises
6. **Optimize images**  set explicit dimensions, configure remote patterns
7. **Cache in CI**  persist `.next/cache` between builds

You don't need to do all of these at once. Start with items 1 and 2  they're usually responsible for the majority of build slowness. Then work your way down the list.

A slow Next.js build isn't inevitable. It's a symptom of accumulated technical debt in your dependency graph and build configuration. The good news is that each fix is straightforward to implement and the improvements compound on each other.

If you're also converting parts of your codebase from JavaScript to TypeScript as part of a broader cleanup, check out the [JS to TS converter on SnipShift](https://devshift.dev)  it handles the tedious parts so you can focus on the architecture.

---

*Have questions or tips of your own? We're always updating our tools at [SnipShift](https://devshift.dev) to help developers ship faster. Give them a spin.*
