# Fix: "ERESOLVE Unable to Resolve Dependency Tree" in npm

You run `npm install`. You expect it to work. Instead, you get a wall of red text screaming about `ERESOLVE unable to resolve dependency tree`. It's one of the most common  and most frustrating  errors in the Node.js ecosystem, and it trips up beginners and seasoned developers alike.

Let's break down what's actually happening, what your options are, and how to properly fix it instead of just slapping a band-aid on it.

## What This Error Actually Means

npm has a dependency resolution algorithm. When you install a package, npm looks at that package's `peerDependencies`  these are packages the library expects *you* to have installed at a specific version range.

Here's the classic scenario. You have `react@18` in your project. You try to install some UI library that declares a peer dependency on `react@17`. npm sees the conflict: the library wants React 17, but you've got React 18. It can't satisfy both, so it throws `ERESOLVE unable to resolve dependency tree` and bails out.

The error output usually looks something like this:

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR!
npm ERR! While resolving: my-app@1.0.0
npm ERR! Found: react@18.2.0
npm ERR! node_modules/react
npm ERR!   react@"^18.2.0" from the root project
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^17.0.0" from some-ui-lib@2.3.1
npm ERR! node_modules/some-ui-lib
npm ERR!   some-ui-lib@"^2.3.0" from the root project
```

Read the output carefully  npm tells you exactly which packages are fighting. In this case, `some-ui-lib` wants `react@^17.0.0` but the project has `react@18.2.0`.

Here's a diagram of how peer dependency resolution works:

```mermaid
graph TD
    A[Your Project] -->|depends on| B[react@18.2.0]
    A -->|depends on| C[some-ui-lib@2.3.1]
    C -->|peer dependency| D[react@^17.0.0]
    B -.-|CONFLICT| D
    style B fill:#4ade80,stroke:#166534
    style D fill:#f87171,stroke:#991b1b
```

Your project pulls in React 18 directly, and `some-ui-lib` declares it needs React 17 as a peer. npm can't reconcile these two, so everything stops.

## The Quick Fixes (and Their Trade-offs)

### `--legacy-peer-deps`

```bash
npm install --legacy-peer-deps
```

This flag tells npm to ignore peer dependency conflicts entirely  it behaves like npm v6 did, where peer deps were warnings, not errors. It's the safest of the two "just make it work" flags.

**When to use it:** When you're fairly confident the library actually works with your version (many libraries have overly strict peer dep ranges), or when you need to unblock yourself *right now* and plan to fix it properly later.

A team I worked with used this flag in CI for months because a single outdated testing utility hadn't updated its peer deps for React 18  even though it worked perfectly fine. Sometimes the library authors just haven't bumped the range yet.

> **Tip:** You can make this permanent by adding it to your `.npmrc` file:
> ```
> legacy-peer-deps=true
> ```
> But be careful  this silences *all* peer dep conflicts, not just the one you're okay with.

### `--force`

```bash
npm install --force
```

This is the nuclear option. It forces npm to fetch and install packages even when there are conflicts, potentially installing multiple versions of the same package or overwriting things in `node_modules`. It'll work, but it can introduce subtle runtime bugs  two different versions of React in the same bundle is a recipe for the "hooks can only be called inside a function component" nightmare.

**When to use it:** Honestly? Almost never in a production project. I've used it when prototyping something quickly and I don't care about bundle integrity. But for real work, it's a last resort.

## Actually Fixing the Conflict

Band-aids aside, here's how you properly resolve a peer dependency conflict.

### Step 1: Read the Error

npm gives you the conflicting packages. Note down:
- Which package has the unmet peer dependency
- What version it wants
- What version you have

### Step 2: Check If There's an Update

```bash
npm outdated some-ui-lib
```

Often, the library has already released a new version with updated peer deps. A quick upgrade fixes everything:

```bash
npm install some-ui-lib@latest
```

### Step 3: If No Update Exists, Consider Downgrading

Sometimes you need to align your project with what the library supports. If `some-ui-lib` only supports React 17 and there's no update in sight, you've got a decision to make  downgrade React or find a different library.

```bash
npm install react@17 react-dom@17
```

### Step 4: Use `overrides` to Force a Resolution

npm v8.3+ supports an `overrides` field in `package.json`. This lets you tell npm "I know what I'm doing, use this version regardless of what the library asks for."

```json
{
  "overrides": {
    "some-ui-lib": {
      "react": "^18.2.0"
    }
  }
}
```

This is cleaner than `--force` because it's explicit, documented in your `package.json`, and only affects the specific dependency you're overriding.

> **Warning:** Overrides can mask real incompatibilities. If the library genuinely doesn't work with your React version, you'll get runtime errors instead of install-time errors. Test thoroughly.

### Step 5: Audit With `npm ls`

After resolving, verify there are no remaining conflicts:

```bash
npm ls react
```

This shows the dependency tree for `react` so you can confirm there's only one version installed where you expect it.

## npm vs pnpm vs Yarn: How They Handle Peer Deps

Not all package managers treat peer dependencies the same way. In my last project, switching from npm to pnpm actually resolved a dependency hell scenario because pnpm's stricter isolation prevented the conflict from even arising. Here's how they differ:

| Behavior | npm (v7+) | pnpm | Yarn (v3+) |
|---|---|---|---|
| **Peer dep conflicts** | Hard error by default | Warning by default, configurable | Warning by default |
| **Auto-install peers** | Yes (v7+) | Yes (v7.14+) | No (must install manually) |
| **Override mechanism** | `overrides` in package.json | `pnpm.overrides` in package.json | `resolutions` in package.json |
| **Strict isolation** | Flat `node_modules` | Content-addressable store + symlinks | Plug'n'Play or `node_modules` |
| **Legacy peer deps flag** | `--legacy-peer-deps` | `auto-install-peers=false` in `.npmrc` | Not needed (warnings only) |
| **Duplicate package risk** | Moderate | Low (strict isolation) | Low with PnP, moderate with node_modules |

pnpm's strict `node_modules` structure means packages can only access their declared dependencies  no phantom deps sneaking in. This strictness actually *prevents* a lot of the peer dep chaos npm users deal with. And Yarn v3 with Plug'n'Play takes a completely different approach by eliminating `node_modules` altogether.

So if you're constantly fighting `ERESOLVE` errors, it might be worth considering a different package manager. That's not a cop-out  it's a pragmatic choice. Different tools have different trade-offs.

## Preventing Future Conflicts

A few things that help:

- **Keep dependencies updated.** Run `npm outdated` regularly. Stale dependencies are the number one cause of peer dep conflicts.
- **Use a lockfile and commit it.** `package-lock.json` ensures everyone on your team gets the same dependency tree.
- **Structure your projects well.** A clean [Node.js project structure](/blog/node-js-project-structure) makes dependency management much easier  you know what's installed and why.
- **Test your upgrades.** Before bumping a major version, run your test suite. If you're evaluating testing frameworks, we've compared [Vitest vs Jest in 2026](/blog/vitest-vs-jest-2026) to help you pick the right one.

## Wrapping Up

The `ERESOLVE unable to resolve dependency tree` error is npm telling you two packages disagree about a shared dependency's version. You can work around it with `--legacy-peer-deps` or `--force`, but the real fix is updating, downgrading, or overriding the conflicting package.

Don't just `--force` and forget  that's how you end up debugging phantom issues three months later. Take five minutes to understand the conflict, and you'll save yourself hours down the road.

If you're working on converting or migrating JavaScript projects  which often surfaces these dependency conflicts  check out the tools at [SnipShift.dev](https://snipshift.dev) to speed up the process.
