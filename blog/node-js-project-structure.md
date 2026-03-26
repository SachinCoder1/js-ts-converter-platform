---
title: "How to Structure a Node.js Project (The Way That Scales)"
description: "Learn how to structure a Node.js project that scales  flat vs nested, feature-based vs layer-based, with real folder tree examples for Express and Fastify."
date: "2026-03-25"
author: "SnipShift Team"
tags: ["nodejs", "project-structure", "express", "fastify", "typescript", "architecture"]
keyword: "node js project structure"
difficulty: "intermediate"
readTime: "8 min read"
tool: "/env-to-types"
---

# How to Structure a Node.js Project (The Way That Scales)

Every Node.js developer hits this wall eventually. You start a project with `index.js`, add a couple of route handlers, toss in a database call or two, and suddenly you've got a 900-line file that does everything. You know you need to split things up. But *how*?

I've structured (and restructured) maybe 15 Node.js projects over the past few years  APIs, microservices, monoliths, the works. And I've learned that there's no single "right" structure, but there are definitely wrong ones. The wrong ones tend to look fine at 500 lines and become absolute nightmares at 50,000.

Here's what I've learned about **Node.js project structure** that actually holds up as your codebase grows.

## Why Structure Matters More Than You Think

A quick story. I joined a team that had a Node.js API with this structure:

```
src/
  helpers.js        (1,200 lines)
  utils.js          (800 lines)
  handlers.js       (2,400 lines)
  database.js       (600 lines)
  index.js          (400 lines)
```

Five files. That's it. Every route handler was in `handlers.js`. Every database query was in `database.js`. Every helper function  from date formatting to JWT verification to CSV parsing  was in `helpers.js`.

Nobody wanted to touch it. New features took 3x longer than they should have because finding anything required Ctrl+F across monster files. Code reviews were painful because every PR touched the same files and caused merge conflicts.

Bad structure isn't just aesthetics. It directly impacts how fast your team can ship.

## The Two Main Philosophies

When you start organizing a Node.js project, you generally have two choices: **layer-based** or **feature-based** structure. Both work. They optimize for different things.

### Layer-Based (Technical Separation)

This is the classic approach. You group files by their technical role:

```
src/
├── controllers/
│   ├── user.controller.ts
│   ├── product.controller.ts
│   └── order.controller.ts
├── services/
│   ├── user.service.ts
│   ├── product.service.ts
│   └── order.service.ts
├── models/
│   ├── user.model.ts
│   ├── product.model.ts
│   └── order.model.ts
├── routes/
│   ├── user.routes.ts
│   ├── product.routes.ts
│   └── order.routes.ts
├── middleware/
│   ├── auth.ts
│   └── validation.ts
├── utils/
│   └── logger.ts
├── types/
│   └── index.ts
├── config/
│   └── database.ts
└── app.ts
```

**Pros:** Immediately clear what layer you're in. Easy to enforce patterns  all controllers look the same, all services follow the same interface.

**Cons:** Adding a feature means touching 4-5 different directories. Related code is scattered across the tree. At scale, each folder gets huge and you're scrolling past 30 files to find the one you need.

### Feature-Based (Domain Separation)

This groups code by what it *does* rather than what it *is*:

```
src/
├── features/
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.model.ts
│   │   ├── user.routes.ts
│   │   ├── user.types.ts
│   │   └── user.test.ts
│   ├── products/
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.model.ts
│   │   ├── product.routes.ts
│   │   └── product.test.ts
│   └── orders/
│       ├── order.controller.ts
│       ├── order.service.ts
│       ├── order.model.ts
│       ├── order.routes.ts
│       └── order.test.ts
├── shared/
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error-handler.ts
│   ├── utils/
│   │   └── logger.ts
│   └── types/
│       └── common.ts
├── config/
│   ├── database.ts
│   └── env.ts
└── app.ts
```

**Pros:** Everything related to "users" is in one folder. Adding a feature means creating a new folder. Deleting a feature means removing a folder. Teams can own features without stepping on each other.

**Cons:** Shared code needs a separate `shared/` or `common/` directory. Newer developers might not know where to put cross-cutting concerns.

### My Recommendation

For most teams, **start feature-based**. Layer-based feels natural when your project is small, but it breaks down around 10-15 features. Feature-based scales better because each feature is self-contained.

That said, if you're building a small API with 3-4 endpoints? Layer-based is totally fine. Don't over-architect a microservice that fits in 500 lines.

```mermaid
graph TD
    A{How many features?} -->|1-5| B[Layer-based is fine]
    A -->|5-15| C[Feature-based recommended]
    A -->|15+| D[Feature-based + module boundaries]
    B --> E[Simple, fast to navigate]
    C --> F[Self-contained features]
    D --> G[Consider monorepo or microservices]
```

## Where to Put Things (The Stuff Nobody Talks About)

The folder trees above cover the big picture, but the real questions are always about the edge cases. Where does the email sending logic go? What about validation schemas? Where do types live?

### Config and Environment

Keep all configuration in one place. I like a `config/` folder at the root of `src/`:

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

Validate your environment variables at startup with Zod. If something's missing, your app crashes immediately with a clear error instead of failing mysteriously at 2am when that one code path finally runs.

If you're managing a lot of environment variables, [SnipShift's Env to Types tool](https://snipshift.dev/env-to-types) can generate TypeScript types from your `.env` file automatically  saves you from manually keeping your types and your `.env.example` in sync.

### Types

For types, I've gone back and forth. Here's what I've settled on:

- **Feature-specific types** go in the feature folder: `features/users/user.types.ts`
- **Shared types** (API response shapes, pagination, error types) go in `shared/types/`
- **Don't create a single `types/index.ts` monster file.** Split them by domain.

```typescript
// src/shared/types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    total: number;
    limit: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

### Middleware

Middleware is shared code by nature  it runs on requests regardless of which feature handles them. Put it in `shared/middleware/`:

```
src/shared/middleware/
├── auth.ts            # JWT verification, role checking
├── error-handler.ts   # Global error handler
├── rate-limit.ts      # Rate limiting
├── request-id.ts      # Attach unique ID to each request
└── validate.ts        # Zod schema validation middleware
```

If a middleware is specific to one feature (like a special permission check for admin routes), it's fine to put it in that feature's folder. But 90% of middleware is cross-cutting.

### Utils vs Services vs Helpers

This is where naming gets religious. Here's my take:

- **Utils** are pure functions with no side effects: `formatDate()`, `slugify()`, `generateId()`
- **Services** talk to external systems: database queries, API calls, email sending
- **Helpers**  honestly, I try to avoid this name. It's too vague. Everything is a "helper." Be more specific.

## Real Project Structures

Let me show you two real-ish project structures that I've used in production.

### Express API (Feature-Based)

```
my-express-api/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── __tests__/
│   │   │       └── auth.test.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.types.ts
│   │   │   └── __tests__/
│   │   │       └── user.test.ts
│   │   └── products/
│   │       ├── product.controller.ts
│   │       ├── product.service.ts
│   │       ├── product.model.ts
│   │       ├── product.routes.ts
│   │       └── __tests__/
│   │           └── product.test.ts
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error-handler.ts
│   │   │   └── validate.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── async-handler.ts
│   │   └── types/
│   │       ├── api.ts
│   │       └── express.d.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── routes.ts          # Aggregates all feature routes
│   └── app.ts             # Express app setup
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── tsconfig.json
├── package.json
└── vitest.config.ts
```

The `routes.ts` file at the root of `src/` is the glue  it imports all feature routes and mounts them:

```typescript
// src/routes.ts
import { Router } from 'express';
import { authRoutes } from './features/auth/auth.routes';
import { userRoutes } from './features/users/user.routes';
import { productRoutes } from './features/products/product.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);

export { router };
```

### Fastify API (Plugin-Based)

Fastify's architecture is plugin-based, so the structure looks a bit different. Each feature is a Fastify plugin:

```
my-fastify-api/
├── src/
│   ├── plugins/
│   │   ├── auth/
│   │   │   ├── index.ts        # Fastify plugin export
│   │   │   ├── auth.handler.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts  # JSON Schema for validation
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   │   ├── index.ts
│   │   │   ├── user.handler.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.schema.ts
│   │   │   └── user.types.ts
│   │   └── products/
│   │       ├── index.ts
│   │       ├── product.handler.ts
│   │       ├── product.service.ts
│   │       └── product.schema.ts
│   ├── shared/
│   │   ├── hooks/             # Fastify hooks (equivalent to middleware)
│   │   │   ├── auth.hook.ts
│   │   │   └── rate-limit.ts
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   └── types/
│   │       └── common.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── swagger.ts
│   └── app.ts
├── test/
│   ├── plugins/
│   │   └── users.test.ts
│   └── helpers/
│       └── build-app.ts       # Test helper to create Fastify instance
├── .env
├── tsconfig.json
└── package.json
```

Each plugin registers itself:

```typescript
// src/plugins/users/index.ts
import { FastifyPluginAsync } from 'fastify';
import { getUsers, getUserById, createUser } from './user.handler';

const usersPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', getUsers);
  fastify.get('/:id', getUserById);
  fastify.post('/', createUser);
};

export default usersPlugin;
```

## Common Mistakes I See

Let me save you from the traps I've fallen into.

### 1. The "One File Per Function" Extreme

I've seen projects where every single function gets its own file. `getUserById.ts`, `getUserByEmail.ts`, `getUsersByOrg.ts`  all separate files, each exporting a single function. This creates folder trees with 200+ files and makes navigation painful. Group related functions in the same file. A `user.service.ts` with 150 lines and 5 functions is better than 5 separate files.

### 2. The Barrel File Trap

```typescript
// features/users/index.ts  the barrel file
export * from './user.controller';
export * from './user.service';
export * from './user.model';
export * from './user.types';
```

Barrel files (`index.ts` that re-export everything) seem clean but cause problems  circular dependencies, slower compilation, and bundlers pulling in more than they need. I've stopped using them in most projects. Just import from the specific file.

### 3. Putting Business Logic in Controllers

Your controllers should be thin. They parse the request, call a service, and send a response. The actual logic lives in services.

```typescript
// ❌ Fat controller
export async function createUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return res.status(409).json({ error: 'Email taken' });
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await db.user.create({ data: { email, password: hashedPassword } });
  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET);
  // ... 20 more lines
}

// ✅ Thin controller, fat service
export async function createUser(req: Request, res: Response) {
  const user = await userService.register(req.body);
  res.status(201).json({ data: user });
}
```

### 4. No Validation Layer

Every request should be validated before it hits your business logic. Put validation schemas next to the feature they belong to  `user.validation.ts` or `user.schema.ts`.

## The Files Everyone Forgets

A few files that should exist in every Node.js project but often don't:

- **`.env.example`**  A template of your `.env` file with placeholder values. New developers will thank you.
- **`src/config/env.ts`**  Validates and exports typed environment variables (shown above).
- **`src/shared/types/express.d.ts`**  Augments the Express `Request` type if you're attaching `user`, `requestId`, etc.
- **`src/shared/utils/async-handler.ts`**  Wraps async route handlers to catch errors (Express doesn't do this natively in v4).

> **Tip:** Use [SnipShift's Env to Types tool](https://snipshift.dev/env-to-types) to generate type definitions from your `.env` file  one less thing to keep in sync manually.

## Pick a Structure and Commit to It

The worst project structure isn't layer-based or feature-based  it's *no structure*, where each developer puts files wherever feels right that day. Pick an approach, document it in your README or a `CONTRIBUTING.md`, and enforce it in code reviews.

For new projects in 2026, I'd go with feature-based structure, TypeScript, and ES Modules. It's the combination that gives you the most room to grow without a painful reorganization later.

If you're also setting up your API layer, check out our comparison of [Express vs Fastify vs Hono](/blog/express-fastify-hono-comparison)  your framework choice influences some structural decisions (especially Fastify's plugin system vs Express's middleware approach).

And if your project structure includes a lot of SQL, take a look at our guide on [connecting to PostgreSQL from Node.js](/blog/connect-postgresql-nodejs)  it covers where your database layer should live and how to keep it clean.
