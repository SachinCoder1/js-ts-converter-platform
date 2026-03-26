---
title: "How to Build an API with Hono.js and TypeScript"
description: "Build a fast, type-safe API with Hono.js and TypeScript. Covers routing, middleware, Zod validation, and deploying to Cloudflare Workers."
date: "2026-03-26"
author: "SnipShift Team"
tags: ["hono", "typescript", "api", "cloudflare-workers", "bun"]
keyword: "hono js typescript api"
difficulty: "intermediate"
readTime: "8 min read"
tool: "/curl-to-code"
---

# How to Build an API with Hono.js and TypeScript

I built my first Hono API almost by accident. I was scaffolding a quick endpoint for a Cloudflare Worker, and I didn't want to haul in Express or set up a full Fastify project for something that needed to handle three routes. Someone on my team mentioned Hono, I tried it, and I haven't reached for Express since  at least not for new projects.

Hono is a lightweight web framework that runs on basically everything: Cloudflare Workers, Vercel Edge Functions, AWS Lambda, Bun, Deno, and plain Node.js. It's around 14KB, has first-class TypeScript support (the whole thing is written in TS), and it's genuinely fast. But the thing that keeps me coming back is how little friction there is between "I want an endpoint" and "I have a typed, validated endpoint in production."

If you're looking to build a **Hono.js TypeScript API** that's fast and type-safe without the boilerplate overhead, this is the walkthrough I wish I had when I started.

## Why Hono Over Express or Fastify?

I've written a [full comparison of Express, Fastify, and Hono](/blog/express-fastify-hono-comparison) if you want the deep breakdown. But here's the short version of why I reach for Hono in 2026:

| Feature | Express | Fastify | Hono |
|---------|---------|---------|------|
| **TypeScript** | `@types/express` (bolt-on) | Built-in | Built-in (core is TS) |
| **Bundle Size** | ~200KB | ~350KB | ~14KB |
| **Edge Runtime** | No | No | Yes (CF Workers, Vercel Edge, Deno Deploy) |
| **Req/sec (synthetic)** | ~15,000 | ~45,000 | ~50,000+ |
| **Validation** | BYO | JSON Schema (built-in) | BYO or `@hono/zod-validator` |
| **Learning Curve** | Low | Medium | Low |

The big differentiator isn't raw speed  it's **portability**. You write your Hono app once, and you can deploy it to a Cloudflare Worker today, move it to Bun tomorrow, and run it on Node in CI without changing a single line. That's not a theoretical benefit. I've actually done this.

## Setting Up a Hono Project

Let's build a simple REST API  a task manager, because every tutorial needs one. I'll use Bun here, but you could use `npm` or `pnpm` just as easily.

```bash
mkdir hono-task-api && cd hono-task-api
bun init -y
bun add hono
```

Create your entry point:

```typescript
// src/index.ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Task API is running' });
});

export default app;
```

That `c` is Hono's `Context` object  it's fully typed, and it gives you everything you need: request parsing, response helpers, headers, status codes. No `req, res, next` dance.

To run this with Bun:

```bash
bun run src/index.ts
```

And that's it. You've got a running API. No `app.listen()` call needed when you're targeting Bun or Cloudflare Workers  the `export default` pattern handles it.

## Routing and Route Groups

Hono's routing is dead simple. But once your API grows past a handful of endpoints, you'll want to organize routes into groups. Here's how I structure it:

```typescript
// src/routes/tasks.ts
import { Hono } from 'hono';

// In-memory store for demo purposes
const tasks: { id: string; title: string; done: boolean }[] = [];
let nextId = 1;

const taskRoutes = new Hono();

taskRoutes.get('/', (c) => {
  return c.json(tasks);
});

taskRoutes.get('/:id', (c) => {
  const task = tasks.find((t) => t.id === c.req.param('id'));
  if (!task) return c.json({ error: 'Not found' }, 404);
  return c.json(task);
});

taskRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const task = {
    id: String(nextId++),
    title: body.title,
    done: false,
  };
  tasks.push(task);
  return c.json(task, 201);
});

taskRoutes.delete('/:id', (c) => {
  const idx = tasks.findIndex((t) => t.id === c.req.param('id'));
  if (idx === -1) return c.json({ error: 'Not found' }, 404);
  tasks.splice(idx, 1);
  return c.json({ deleted: true });
});

export { taskRoutes };
```

Then mount them in your main app:

```typescript
// src/index.ts
import { Hono } from 'hono';
import { taskRoutes } from './routes/tasks';

const app = new Hono();

app.route('/api/tasks', taskRoutes);

export default app;
```

Clean. If you're coming from Express, this is basically the same Router pattern, but with better types out of the box.

## Adding Middleware

Hono ships with a bunch of built-in middleware, and writing your own is trivial. Here's a common setup  CORS, request logging, and a simple auth check:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { taskRoutes } from './routes/tasks';

const app = new Hono();

// Built-in middleware
app.use('*', logger());
app.use('/api/*', cors({ origin: 'https://myapp.com' }));

// Custom auth middleware
app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token || token !== process.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

app.route('/api/tasks', taskRoutes);

export default app;
```

The middleware signature is `(c, next)`  same Context object, and you call `next()` to continue the chain. If you return a response before calling `next()`, it short-circuits. Simple.

> **Tip:** Hono's `cors()` middleware is much more configurable than it looks  you can pass `allowMethods`, `allowHeaders`, `credentials`, and `maxAge`. Check the docs before rolling your own CORS logic.

## Zod Validation  The Real Type Safety

Here's where things get good. Hono has an official `@hono/zod-validator` package that lets you validate request bodies, query params, and URL params  and the types flow through to your handler automatically.

```bash
bun add zod @hono/zod-validator
```

Now let's add proper validation to our task creation endpoint:

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

const taskRoutes = new Hono();

taskRoutes.post(
  '/',
  zValidator('json', CreateTaskSchema),
  (c) => {
    // body is fully typed as { title: string; priority: "low" | "medium" | "high" }
    const body = c.req.valid('json');

    const task = {
      id: String(nextId++),
      title: body.title,
      priority: body.priority,
      done: false,
    };
    tasks.push(task);
    return c.json(task, 201);
  }
);
```

That `c.req.valid('json')` call returns a properly typed object based on your Zod schema. No casting, no `as`, no `any`. If the request body doesn't match the schema, the validator returns a 400 with structured error details before your handler even runs.

You can validate query parameters the same way:

```typescript
const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

taskRoutes.get(
  '/',
  zValidator('query', PaginationSchema),
  (c) => {
    const { page, limit } = c.req.valid('query');
    // page and limit are typed as numbers, already coerced and validated
    const start = (page - 1) * limit;
    return c.json(tasks.slice(start, start + limit));
  }
);
```

This is the part that sold me. In Express, you'd parse `req.query`, validate it manually, coerce strings to numbers, handle errors... it's a whole thing. With Hono + Zod, it's three lines.

If you want to quickly generate Zod schemas from existing JSON payloads, [SnipShift's JSON to Zod converter](https://snipshift.dev/json-to-zod) can save you a bunch of typing  paste in a sample response and get a schema back instantly.

## Typed Request and Response  End to End

Here's the flow of types through a Hono.js TypeScript API:

```mermaid
graph LR
    A[Incoming Request] --> B[Zod Validator Middleware]
    B -->|Invalid| C[400 Error Response]
    B -->|Valid| D[Handler receives typed data]
    D --> E[Business Logic]
    E --> F[Typed JSON Response]
```

One pattern I use in production is defining response types alongside request schemas:

```typescript
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  done: z.boolean(),
});

type Task = z.infer<typeof TaskSchema>;

// Now your handler return type is explicit
taskRoutes.get('/:id', (c) => {
  const task = tasks.find((t) => t.id === c.req.param('id'));
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  return c.json(task satisfies Task);
});
```

The `satisfies` keyword ensures the response matches your expected shape at compile time. It's a small thing, but it catches drift between your API contract and your actual responses  the kind of bug that only shows up when a frontend dev files an angry ticket.

## Error Handling

Hono has a built-in error handler that you can customize globally:

```typescript
import { HTTPException } from 'hono/http-exception';

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});
```

And you can throw `HTTPException` from anywhere in your handlers or middleware:

```typescript
import { HTTPException } from 'hono/http-exception';

// Inside a handler or middleware
if (!user) {
  throw new HTTPException(403, { message: 'Forbidden' });
}
```

This is cleaner than the Express pattern of passing errors to `next()`. The error propagates automatically, and your global handler catches it.

## Deploying to Cloudflare Workers

This is where Hono really shines. Deploying to Cloudflare Workers is essentially free for small projects (100k requests/day on the free tier), and the cold start is near-zero because Workers don't have a cold start in the traditional sense.

Install Wrangler:

```bash
bun add -d wrangler
```

Create a `wrangler.toml`:

```toml
name = "task-api"
main = "src/index.ts"
compatibility_date = "2026-03-01"

[vars]
API_KEY = "your-api-key-here"
```

Deploy:

```bash
npx wrangler deploy
```

That's it. Your Hono API is now live on Cloudflare's edge network, running in 300+ data centers worldwide. The same code that ran on `bun run src/index.ts` locally deploys without changes.

> **Warning:** Don't put real secrets in `wrangler.toml`. Use `wrangler secret put API_KEY` to store sensitive values encrypted. The `[vars]` section is fine for non-sensitive config only.

For testing your deployed API quickly, [SnipShift's cURL to Code converter](https://snipshift.dev/curl-to-code) is handy  write a cURL command, convert it to fetch or axios, and drop it into your test suite.

## When Hono Isn't the Right Choice

I'd be dishonest if I said Hono is perfect for everything. A few cases where I'd still pick something else:

- **Massive Express middleware ecosystem dependency**: If your project relies heavily on specific Express middleware (passport.js, express-session with Redis, etc.), migrating everything has a real cost. Check compatibility first.
- **Long-running background jobs**: Hono is built for request/response. If you need persistent WebSocket connections or long-running processes, you'll want something else  or pair Hono with a separate worker process.
- **Enterprise teams new to edge computing**: If your team is comfortable with Express and the project doesn't benefit from edge deployment, introducing Hono adds a learning curve with minimal payoff.

For everything else  especially if you're building APIs for edge runtimes or you just want the best TypeScript DX in a web framework  Hono is my default pick in 2026.

If you're interested in how Hono stacks up against the other options in more detail, I wrote a [full comparison of Express, Fastify, and Hono](/blog/express-fastify-hono-comparison) that covers benchmarks and real-world tradeoffs. And if you're building REST APIs more broadly, our [guide to building REST APIs with TypeScript](/blog/rest-api-typescript-express-guide) covers patterns that apply regardless of which framework you choose.

The TypeScript ecosystem is moving toward lighter, faster, multi-runtime tools  and Hono is right at the front of that shift. Give it a shot on your next project. You might not go back.
