# How to Use Prisma with Next.js Without 'Too Many Connections' Error

If you're running Prisma with Next.js in development and you've seen this in your terminal:

```
Error: Too many database connections
```

...welcome to the club. Every single developer I know who's combined **Prisma and Next.js** has hit this error. It's practically a rite of passage.

The good news: the fix is about 8 lines of code. The bad news: the underlying problem is kind of annoying and worth understanding so you don't get bitten by it in production too.

## Why This Happens

Next.js uses hot module reloading (HMR) in development. Every time you save a file, Next.js re-evaluates your modules. If you're creating a `new PrismaClient()` at the top level of a module, each hot reload creates a brand new client  and each client opens its own set of database connections.

Save 20 times in a session (which is nothing during active development), and you've got 20 PrismaClient instances, each holding open 5-10 connections. Your PostgreSQL default is usually 100 max connections. Do the math.

```mermaid
graph TD
    A[You save a file] --> B[Next.js hot reloads module]
    B --> C[New PrismaClient created]
    C --> D[Opens 5-10 DB connections]
    D --> E{Total connections?}
    E -->|Under limit| F[Works fine... for now]
    E -->|Over limit| G["Error: Too many connections"]
    F --> A
```

The issue only affects development because production doesn't hot-reload. But if you don't fix it, you'll be restarting your dev server constantly  and that gets old fast.

## The Fix: The `globalThis` Singleton Pattern

This is the standard solution. It stores the PrismaClient instance on `globalThis` so it survives hot reloads:

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

That's it. Import `prisma` from this file everywhere instead of creating new instances.

The trick is that `globalThis` persists across hot reloads in Node.js. The first time the module loads, it creates a new `PrismaClient`. On every subsequent hot reload, it finds the existing instance on `globalThis` and reuses it. The `process.env.NODE_ENV` check ensures we only do this in development  in production, each serverless function instance should have its own client anyway.

> **Tip:** Put this file at `lib/prisma.ts` or `lib/db.ts`  wherever your project keeps shared utilities. The important thing is that every part of your app imports from the same file. Two different files each creating their own `globalThis` pattern defeats the purpose.

### Using It

```typescript
// app/api/users/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
```

That import is the same client instance across your entire app, even through hot reloads. No more connection spam.

If you're converting an existing JavaScript codebase to TypeScript and need to update these imports across many files, [SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) handles the type annotations and import syntax for you.

## Production Concerns: Connection Pooling

The `globalThis` pattern fixes development. But in production  especially on serverless platforms like Vercel or AWS Lambda  you've got a different version of the same problem. Each serverless function instance creates its own PrismaClient, and under load, you can exhaust your database's connection limit.

### Option 1: PgBouncer

PgBouncer is a connection pooler that sits between your application and PostgreSQL. Instead of each client opening direct connections, they connect to PgBouncer, which multiplexes requests across a smaller pool of actual database connections.

```
Your app (100 instances) → PgBouncer (20 connections) → PostgreSQL
```

Most managed PostgreSQL providers (Supabase, Neon, Railway) offer built-in PgBouncer. You just use a different connection string  usually on port 6543 instead of 5432:

```env
# Direct connection (for migrations)
DATABASE_URL="postgresql://user:pass@host:5432/mydb"

# Pooled connection (for application queries)
DATABASE_URL="postgresql://user:pass@host:6543/mydb?pgbouncer=true"
```

When using PgBouncer with Prisma, add `?pgbouncer=true` to your connection string. This tells Prisma to disable features that aren't compatible with PgBouncer's transaction pooling mode (like prepared statements).

### Option 2: Prisma Accelerate (Managed Proxy)

If you don't want to manage PgBouncer yourself, Prisma Accelerate is Prisma's hosted connection pooling service. It acts as a proxy between your app and your database, handling connection management for you.

```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your_key"
```

It also adds a global query cache, which can significantly speed up read-heavy endpoints. The tradeoff is you're adding another service (and potential point of failure) to your stack. For hobby projects, the free tier is usually fine. For production, evaluate whether you need the caching or just the pooling.

### Quick Comparison

| Solution | Setup Effort | Cost | Best For |
|---|---|---|---|
| `globalThis` singleton | 2 minutes | Free | Development hot reload fix |
| PgBouncer (managed) | Low (usually a checkbox) | Usually included | Production with managed DB |
| PgBouncer (self-hosted) | Medium | Free | Production with self-hosted DB |
| Prisma Accelerate | Low | Free tier / paid | Serverless + caching needs |

## Configuring Connection Limits

Even with the singleton pattern, you might want to tune Prisma's connection pool size. By default, Prisma calculates the pool size based on `num_physical_cpus * 2 + 1`. You can override this:

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

Or directly in the connection string:

```env
DATABASE_URL="postgresql://user:pass@host:5432/mydb?connection_limit=5"
```

For serverless environments, I'd keep this low  2 to 5 connections per instance. For a traditional Node.js server, the default is usually fine.

> **Warning:** Don't set the connection limit higher than your database's max connections divided by the number of application instances you expect. If your PostgreSQL allows 100 connections and you have 10 serverless instances, each should use at most 10 connections  and ideally fewer, to leave room for admin connections and migrations.

## The Complete Setup

Here's the full pattern I use on every Next.js + Prisma project:

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

The `log` configuration is a nice bonus  in development, you see every SQL query Prisma generates (useful for debugging N+1 queries), while production only logs errors.

## Wrapping Up

The **Prisma Next.js too many connections** error is a rite of passage, but it's also a 2-minute fix. Use the `globalThis` singleton for development, set up connection pooling for production (PgBouncer or Prisma Accelerate), and keep your connection limits sane.

Once your connections are sorted, you can focus on actually writing queries. Our guide on [conditional where clauses in Prisma](/blog/prisma-conditional-where-clause) covers building dynamic filters, and [handling Prisma migrations in production](/blog/prisma-migrations-production-guide) walks through the deployment workflow.

If you're also working on server vs client components in Next.js, we've got a guide on [server and client components](/blog/server-vs-client-components-nextjs) that pairs well with this setup. And for more developer tools, check out [SnipShift](https://snipshift.dev).
