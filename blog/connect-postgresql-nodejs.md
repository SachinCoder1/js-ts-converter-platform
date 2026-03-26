---
title: "How to Connect to PostgreSQL from Node.js (pg vs Prisma vs Drizzle)"
description: "Connect to PostgreSQL from Node.js using pg, Prisma, or Drizzle ORM  connection pooling, .env setup, and which ORM to pick based on your project size."
date: "2026-03-25"
author: "SnipShift Team"
tags: ["nodejs", "postgresql", "prisma", "drizzle", "database", "typescript"]
keyword: "connect postgresql node js"
difficulty: "intermediate"
readTime: "7 min read"
tool: "/sql-to-typescript"
---

# How to Connect to PostgreSQL from Node.js (pg vs Prisma vs Drizzle)

There's a moment in every Node.js project where you think "okay, I need a real database." You've been getting by with JSON files or an in-memory array, and now it's time to set up PostgreSQL. The connection part should be simple, right?

It is simple  once you know which library to use and how to avoid the gotchas. The problem is there are like four different ways to connect to Postgres from Node.js, and each one makes different tradeoffs. I've used all of them in production, so let me walk you through the options.

## The Connection String

Before we talk about libraries, let's get the basics right. Every Postgres connection starts with a connection string:

```
postgresql://username:password@hostname:5432/database_name
```

Or, broken out into parts:

```
postgresql://          # protocol
  myuser:              # username
  mypassword@          # password
  localhost:           # host
  5432/                # port (5432 is the default)
  myapp_dev            # database name
  ?sslmode=require     # optional params
```

Put this in your `.env` file  never hardcode it:

```bash
# .env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myapp_dev"
```

And validate it at startup so your app crashes immediately if it's missing, not 10 minutes later when the first query runs:

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

If you're managing a bunch of environment variables, [SnipShift's Env to Types tool](https://snipshift.dev/env-to-types) can generate TypeScript types from your `.env` file automatically  one less thing to keep in sync.

## Option 1: The Raw `pg` Client

The `pg` package (also called `node-postgres`) is the lowest-level option. It gives you a connection pool and lets you write raw SQL. No magic, no abstraction  just queries.

```bash
npm install pg
npm install -D @types/pg
```

### Basic Connection

```typescript
import { Pool } from 'pg';
import { env } from './config/env';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,           // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query helper
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
```

### Using It

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

// Simple query
const users = await query<User>('SELECT * FROM users WHERE active = $1', [true]);

// Insert with returning
const [newUser] = await query<User>(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  ['Alice', 'alice@example.com']
);

// Transaction
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, fromId]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, toId]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release(); // ALWAYS release back to pool
}
```

### Connection Pooling (This Matters More Than You Think)

That `Pool` object is doing critical work. Without it, every query opens a new TCP connection to Postgres, does the SSL handshake, authenticates, runs the query, and tears everything down. That overhead adds 20-50ms per query.

With a pool, connections are reused. The pool keeps a set of open connections and hands them out as needed. Set `max` based on your Postgres `max_connections` setting divided by the number of app instances you're running.

> **Warning:** In serverless environments (AWS Lambda, Vercel Functions), connection pooling gets complicated because each invocation might create a new pool. Use an external pooler like PgBouncer or Supabase's connection pooler for serverless deployments.

### When to Use Raw `pg`

- You're comfortable writing SQL and prefer it over ORMs
- You need maximum control over queries (complex joins, CTEs, window functions)
- You're building a small service with simple data needs
- Performance matters and you don't want ORM overhead

## Option 2: Prisma ORM

Prisma is the most popular ORM in the Node.js/TypeScript ecosystem. It takes a schema-first approach  you define your data model, Prisma generates a type-safe client.

```bash
npm install prisma @prisma/client
npx prisma init
```

### Define Your Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  published Boolean  @default(false)
}
```

### Generate and Use the Client

```bash
npx prisma migrate dev --name init  # Create migration and apply it
npx prisma generate                 # Generate the typed client
```

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fully typed  TypeScript knows exactly what this returns
const users = await prisma.user.findMany({
  where: { email: { contains: '@company.com' } },
  include: { posts: true },  // eager load relations
  orderBy: { createdAt: 'desc' },
  take: 20,
});

// Create with relation
const user = await prisma.user.create({
  data: {
    name: 'Bob',
    email: 'bob@company.com',
    posts: {
      create: [
        { title: 'My First Post', content: 'Hello world' },
      ],
    },
  },
  include: { posts: true },
});

// Transaction
const [updatedUser, newPost] = await prisma.$transaction([
  prisma.user.update({ where: { id: userId }, data: { name: 'Robert' } }),
  prisma.post.create({ data: { title: 'New post', authorId: userId } }),
]);
```

### Prisma's Strengths and Weaknesses

**Strengths:** Incredible TypeScript integration  autocomplete for every field, relation, and filter. Schema-as-truth means your types and database are always in sync. Migrations are straightforward. The query API is intuitive.

**Weaknesses:** Prisma generates its own query engine (a Rust binary), which adds ~15MB to your deployment. Complex SQL (raw joins, CTEs, lateral joins) requires falling back to `prisma.$queryRaw`. The abstraction layer adds latency  roughly 2-5ms per query compared to raw `pg`. And if your data model doesn't fit neatly into the schema DSL, you'll fight the tool.

## Option 3: Drizzle ORM

Drizzle is the newer alternative that's been gaining momentum fast. Its pitch: "If you know SQL, you know Drizzle." It maps much closer to SQL syntax than Prisma does.

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

### Define Your Schema (in TypeScript)

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: uuid('author_id').notNull().references(() => users.id),
  published: boolean('published').default(false),
});
```

### Set Up the Client

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '../config/env';

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

### Query with SQL-Like Syntax

```typescript
import { eq, like, desc } from 'drizzle-orm';
import { db } from './db';
import { users, posts } from './db/schema';

// Select with filter
const result = await db
  .select()
  .from(users)
  .where(like(users.email, '%@company.com%'))
  .orderBy(desc(users.createdAt))
  .limit(20);

// Join
const usersWithPosts = await db
  .select({
    userName: users.name,
    postTitle: posts.title,
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(eq(posts.published, true));

// Insert
const [newUser] = await db
  .insert(users)
  .values({ name: 'Charlie', email: 'charlie@company.com' })
  .returning();

// Transaction
await db.transaction(async (tx) => {
  await tx.update(users).set({ name: 'Charles' }).where(eq(users.id, userId));
  await tx.insert(posts).values({ title: 'New post', authorId: userId });
});
```

### Drizzle's Strengths and Weaknesses

**Strengths:** Zero runtime overhead  it just generates SQL strings and passes them to your driver. The query builder looks like SQL, so you don't need to learn a new query language. Schema is defined in TypeScript (no separate DSL). Tiny bundle size. Works with any SQL driver.

**Weaknesses:** Less magical than Prisma  you write more code for relations and nested queries. The migration story is good but not as polished. The ecosystem of plugins and extensions is smaller.

## Which One Should You Pick?

| Factor | Raw `pg` | Prisma | Drizzle |
|--------|---------|--------|---------|
| **Learning curve** | Need to know SQL | Low (query API) | Low (if you know SQL) |
| **Type safety** | Manual | Automatic (generated) | Automatic (schema) |
| **Performance** | Fastest | Slowest (~2-5ms overhead) | Fast (minimal overhead) |
| **Complex queries** | Full SQL power | Limited, needs `$queryRaw` | Good SQL mapping |
| **Bundle size** | Tiny (~100KB) | Large (~15MB engine) | Small (~50KB) |
| **Migrations** | Manual or third-party | Built-in | Built-in (drizzle-kit) |
| **Best for** | Small services, performance | Rapid development, large teams | SQL-lovers, serverless |

```mermaid
graph TD
    A{Project size?} -->|Small/Script| B[Raw pg]
    A -->|Medium/Large| C{Team's SQL comfort?}
    C -->|Prefer abstraction| D[Prisma]
    C -->|Comfortable with SQL| E[Drizzle]
    A -->|Serverless| F{Bundle size matter?}
    F -->|Yes| E
    F -->|No| D
```

My honest take: **Prisma** if you want maximum developer productivity and don't mind the overhead. **Drizzle** if you like SQL, care about performance, or are deploying to serverless. **Raw `pg`** if the project is small enough that an ORM would be overkill  like a cron job or a simple microservice with 5 queries.

If you have existing SQL schemas and want to generate TypeScript types from them, [SnipShift's SQL to TypeScript tool](https://snipshift.dev/sql-to-typescript) can convert your CREATE TABLE statements into typed interfaces instantly. It's useful when you're setting up either Prisma or Drizzle and want a head start on the type definitions.

## A Quick Note on Connection Pooling in Production

Regardless of which library you choose, connection pooling is non-negotiable in production. Here's the short version:

- **Traditional servers (Express, Fastify):** Use the library's built-in pooling. Set `max` connections to `(Postgres max_connections / number of app instances) - 5` (leave headroom for admin connections).
- **Serverless (Lambda, Edge):** Use an external pooler. PgBouncer is the standard. Supabase and Neon offer managed poolers. Without one, you'll exhaust your Postgres connection limit under any real load.
- **Always set timeouts.** Connection timeout (how long to wait for a free connection from the pool) and idle timeout (how long an unused connection stays open) prevent resource leaks.

For more on structuring the rest of your Node.js project around these database patterns, check out our [Node.js project structure guide](/blog/node-js-project-structure). And if you're building a full API on top of your Postgres connection, our [REST API with TypeScript and Express guide](/blog/rest-api-typescript-express-guide) walks through the complete stack from route to database.
