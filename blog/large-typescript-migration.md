---
title: "Migrating a 50,000-Line JavaScript Codebase to TypeScript"
description: "A detailed case study of a large TypeScript migration: planning, tooling, timeline, team structure, lessons learned, and the mistakes to avoid."
date: "2026-03-25"
author: "SnipShift Team"
tags: ["typescript", "migration", "case-study", "enterprise"]
keyword: "large typescript migration"
difficulty: "advanced"
readTime: "12 min read"
tool: "/js-to-ts"
---

# Migrating a 50,000-Line JavaScript Codebase to TypeScript

In early 2024, I led a large typescript migration for a B2B SaaS company. The codebase was roughly 52,000 lines of JavaScript  a React frontend with a Node.js API server, both living in a monorepo. Seven developers. Zero TypeScript. And a CEO who wanted "better code quality" after a particularly ugly production incident involving a mistyped API field.

This is the story of how we did it  the timeline, the tooling choices, the team dynamics, and everything I'd do differently if I did it again. If you're facing a similar migration, this should save you a few months of learning things the hard way.

## The Codebase Before We Started

Let me paint the picture. This wasn't a dumpster fire  it was a functional, revenue-generating product with paying customers. But it had the typical problems of a fast-growing JavaScript codebase:

- **52,000 lines** across ~450 files
- **React 18 frontend** with React Router, Zustand for state, and TanStack Query for data fetching
- **Express backend** with PostgreSQL (via Knex), Redis for caching, and a handful of background workers
- **Jest for testing**  roughly 60% coverage, mostly on the backend
- **No TypeScript, no JSDoc, no PropTypes**  types existed only in the developers' heads
- **Three developers had been there since the beginning**, four were hired in the last year

The production incident that triggered the migration: a new developer added a feature that sent a `userId` (number) where the API expected a `userUuid` (string). JavaScript didn't complain. The test suite didn't catch it because the test used the same wrong field. It made it to production and corrupted about 200 customer records before anyone noticed.

That Monday, the CTO said: "We're doing TypeScript."

## Phase 1: Planning (Week 1-2)

We didn't touch a single line of code for the first two weeks. Instead, we did three things.

### Audit the Codebase

We mapped out the dependency graph of our codebase  what imports what, what's tightly coupled, what's standalone.

```bash
# Quick stats
find src -name "*.js" | wc -l  # 423 JS files
find src -name "*.jsx" | wc -l # 34 JSX files (React components)
wc -l src/**/*.js src/**/*.jsx | tail -1  # ~52,000 lines
```

We categorized every directory:

| Directory | Files | Lines | Complexity | Priority |
|-----------|-------|-------|-----------|----------|
| `src/utils/` | 28 | 1,200 | Low | Week 3-4 |
| `src/constants/` | 12 | 400 | Trivial | Week 3 |
| `src/types/` | 0 | 0 | N/A | Week 3 (create) |
| `src/api/routes/` | 45 | 8,500 | Medium | Week 5-8 |
| `src/api/services/` | 32 | 6,200 | High | Week 7-10 |
| `src/api/middleware/` | 8 | 900 | Medium | Week 5 |
| `src/db/` | 22 | 4,100 | High | Week 6-8 |
| `src/components/` | 78 | 12,000 | Medium | Week 9-14 |
| `src/pages/` | 34 | 8,200 | Medium | Week 11-14 |
| `src/hooks/` | 18 | 2,400 | Medium | Week 10-12 |
| `src/workers/` | 6 | 1,800 | High | Week 8-9 |
| Other | ~130 | ~6,300 | Mixed | Throughout |

### Set Ground Rules

We established team-wide rules before writing any TypeScript:

1. **No big bang.** Files get converted one at a time, merged individually, reviewed normally.
2. **Feature work doesn't stop.** We're converting alongside regular sprint work.
3. **Every developer converts at least 2 files per week.** Not optional.
4. **`any` is allowed with a `// TODO(ts-migration):` comment.** It gets tracked.
5. **Strict mode comes last.** Start permissive, tighten gradually.
6. **Tests must pass after every conversion.** If a conversion breaks tests, fix both.
7. **PR reviews should include type review.** Check for unnecessary `any`, missing types, and proper patterns.

### Define Core Types

Before converting any files, we spent three days defining the core types for our application. This was the highest-ROI work of the entire migration.

```typescript
// src/types/user.ts
export interface User {
  id: number;
  uuid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
```

We ended up with about 40 core interfaces covering users, organizations, subscriptions, invoices, projects, and API wrappers. Having these ready before we started converting files made everything dramatically faster  developers could import real types instead of inventing them on the fly.

## Phase 2: Setup (Week 3)

### Install and Configure

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node @types/express @types/jest
```

Our initial `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Add CI Type Checking

We added a type-check job to our CI pipeline immediately  even before converting any files. This way, from day one, any type errors introduced by a PR would be caught.

```yaml
typecheck:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npx tsc --noEmit
```

### Build the Progress Tracker

I wrote a simple script that ran in CI and posted migration progress to our Slack channel every Monday:

```bash
#!/bin/bash
JS=$(find src -name "*.js" -o -name "*.jsx" | wc -l | tr -d ' ')
TS=$(find src -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')
TOTAL=$((JS + TS))
PCT=$((TS * 100 / TOTAL))
ANY=$(grep -r ": any\|as any" src --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')

echo "Migration: ${PCT}% (${TS}/${TOTAL} files) | any count: ${ANY}"
```

This turned out to be one of the best decisions we made. Visible progress kept the team motivated. Every Monday, the percentage went up, and people celebrated small milestones. When we hit 50%, someone brought donuts.

```mermaid
graph LR
    A["Week 3: 0%"] --> B["Week 6: 15%"]
    B --> C["Week 9: 40%"]
    C --> D["Week 12: 65%"]
    D --> E["Week 15: 85%"]
    E --> F["Week 18: 100% converted"]
    F --> G["Week 20: strict: true"]
```

## Phase 3: The Conversion (Week 3-18)

### Weeks 3-4: Utilities and Constants

The easiest files. Constants are just exported values  adding types is trivial. Utility functions are pure functions with clear inputs and outputs.

We converted about 40 files in two weeks. Every developer picked a few files and knocked them out between feature work.

**Actual time spent per developer:** About 3-4 hours per week.

### Weeks 5-8: API Layer and Middleware

This is where the migration started paying dividends. Our Express routes had functions like:

```javascript
// Before
router.get('/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id);
  res.json({ data: user });
});
```

Converting to TypeScript meant typing the request and response:

```typescript
// After
router.get('/users/:id', async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<User>>
) => {
  const user = await userService.findById(req.params.id);
  res.json({ data: user });
});
```

During this phase, we found **three actual bugs**  places where the API was returning a different shape than the frontend expected. Two had been causing intermittent UI glitches for months. The third was a data leak where an internal field was being included in a public API response.

**Lesson:** The API layer is where TypeScript provides the most value in a full-stack app. Type the API boundary first.

### Weeks 6-8: Database Layer

Our Knex queries were the trickiest part. Knex's TypeScript support is decent but requires generic parameters:

```typescript
// Before
const users = await db('users').where({ organization_id: orgId }).select('*');

// After
const users = await db<UserRow>('users')
  .where({ organization_id: orgId })
  .select('*');
```

We also created mapper functions to convert between database column names (snake_case) and application types (camelCase):

```typescript
function toUser(row: UserRow): User {
  return {
    id: row.id,
    uuid: row.uuid,
    email: row.email,
    displayName: row.display_name,
    role: row.role as UserRole,
    organizationId: row.organization_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

This was tedious but valuable. Every data transformation was now explicit and type-checked.

### Weeks 9-14: React Components

We saved the frontend for last because it depended on everything else. By this point, all our API response types, hooks, and utility functions were already typed  so converting components was mostly about adding props interfaces and event handler types.

We used [SnipShift's converter](https://snipshift.dev/js-to-ts) to quickly generate initial typed versions of our simpler components. For a component with 5-6 props, it saved a few minutes per file  not life-changing individually, but across 112 component files, it added up.

The more complex components  ones with heavy state management, multiple refs, and complex event handlers  we typed by hand. There's no substitute for human understanding of business logic types.

### Weeks 15-18: Remaining Files and Cleanup

The last 15% of files are always the hardest. These were:
- Files with heavily dynamic patterns (computed property access, meta-programming)
- Test files (we converted these last)
- Config files and scripts
- A few legacy files that nobody wanted to touch

We got through them by assigning the most experienced TypeScript developer on the team to the toughest files and having everyone else handle the simpler remaining ones.

## Phase 4: Strictness (Week 18-22)

With all files converted to `.ts`/`.tsx`, we started enabling strict flags:

**Week 18: `noImplicitAny`**
- Generated ~340 errors
- Took 4 days to fix across the team
- Found 2 more bugs (functions that were silently operating on `any` data)

**Week 19: `strictNullChecks`**
- Generated ~180 errors
- Took 3 days to fix
- Found 1 bug (a race condition where data could be null between fetch and render)

**Week 20: `strict: true` (remaining flags)**
- Generated ~45 errors
- Fixed in one day

**Week 21-22: Cleanup**
- Replaced 127 remaining `any` types with proper types
- Added `noUncheckedIndexedAccess`
- Removed the `allowJs` flag
- Celebrated

> **Tip:** The jump from "all files are .ts" to "strict: true passes" took us 4 weeks. Plan for this. It's not just about fixing compiler errors  it's about learning proper TypeScript patterns and applying them consistently. For a flag-by-flag breakdown, see our guide on [TypeScript strict mode](/blog/typescript-strict-mode).

## The Numbers

Here are the final metrics from our large typescript migration:

| Metric | Value |
|--------|-------|
| Total duration | 22 weeks (5 months) |
| Files converted | 457 → 457 (.ts/.tsx) |
| Lines of code | 52,000 → ~58,000 (types added ~12%) |
| Core types defined | 42 interfaces |
| Bugs found during migration | 6 production bugs |
| Average developer time per week | 4-6 hours |
| `any` types at end of conversion | 127 |
| `any` types after cleanup | 8 (justified) |
| Post-migration runtime type errors | 0 (first 3 months) |

The 6 bugs found during migration were all type-related  wrong fields, missing null checks, implicit coercions. Conservative estimate: these bugs would have cost us 40-60 hours of debugging time if they'd been found in production instead.

## What I'd Do Differently

### Start with API Types, Not Utility Files

Everyone says "start with utils" because they're the easiest. And they are. But the highest-value files to convert first are the ones at the system boundary  your API layer, your data fetching, your database queries. That's where type mismatches cause real production bugs. I'd convert the API types and service layer in weeks 3-4 instead of waiting until weeks 5-8.

### Dedicate More Time Upfront to Core Types

We spent 3 days defining core types. I'd spend 5-7 days. The types we defined early were well-thought-out and saved time throughout the migration. The types we defined later (in a rush, mid-conversion) were sometimes inconsistent or incomplete, and we had to refactor them.

### Use Codemods for Repetitive Conversions

We converted every file by hand. For a 50,000-line codebase, that's fine  tedious but manageable. But we had about 45 Express route handlers that all followed the same pattern. A jscodeshift codemod could have converted all of them in an afternoon instead of the 3 days it took manually.

### Track `any` Count from Day One

We didn't start tracking `any` types until week 10. By then, we had accumulated about 200 of them. If we'd tracked from the start and enforced a "convert 5 `any` types per sprint" rule, the cleanup phase would have been shorter.

### Pair New Developers with Experienced Ones

Of our seven developers, three had TypeScript experience and four didn't. The ones without experience were slower to convert files and introduced more `any` types. Pairing them with experienced TypeScript developers  even just for the first few conversions  would have accelerated the whole team's learning.

## Team Dynamics and Buy-In

Not everyone was excited about the migration. One senior developer thought it was "unnecessary ceremony." Another was worried about the learning curve. Here's what actually happened:

**Week 1-4:** Mild grumbling. "This is slowing me down."
**Week 5-8:** First bugs found. Skeptic #1 starts to come around.
**Week 9-12:** IDE autocomplete is working everywhere. "Okay, this is actually nice."
**Week 15-18:** Nobody wants to go back. "How did we write JavaScript without this?"

The tipping point was around week 8, when the cumulative benefits (autocomplete, bug catches, faster code review) started outweighing the ongoing conversion cost. After that, the whole team was invested.

The developer who was most skeptical became the most enthusiastic advocate. He told me: "I didn't realize how much time I was spending just looking up function signatures. Now my editor tells me everything."

## Advice for Your Migration

If you're facing a large TypeScript migration, here's the condensed advice:

1. **Don't ask for permission to spend 100% of the team's time.** Ask for 20-30%  a few hours per developer per week  alongside regular work. It's easier to get buy-in for.
2. **Define core types before converting files.** This is the highest-ROI work.
3. **Track and celebrate progress.** Visible metrics keep teams motivated.
4. **Enable strict flags incrementally.** `noImplicitAny` first, then `strictNullChecks`, then the rest.
5. **Don't block on hard files.** Skip them and come back. Momentum matters more than completeness.
6. **Convert the API boundary first.** That's where the bugs are.

For the step-by-step framework, our [5-step TypeScript migration strategy](/blog/typescript-migration-strategy) gives you the tactical plan. And if you want to see what your code looks like with types before you start, [SnipShift's converter](https://snipshift.dev/js-to-ts) is good for building intuition  paste a JavaScript file, see the typed version.

For the broader case on why the migration is worth it, check out our piece on [the real cost of untyped JavaScript](/blog/javascript-vs-typescript-benefits).

Five months and 52,000 lines later, not a single person on the team would go back. The compiler catches bugs that used to take us hours to debug. The IDE experience is transformative. And our new hire onboarding time dropped from two weeks to about five days. That's the real story of a large TypeScript migration  it's not glamorous, but it's absolutely worth it.
