---
title: "How to Set Up Drizzle ORM with Next.js and PostgreSQL"
description: "Set up Drizzle ORM with Next.js and PostgreSQL from scratch  schema definition, migrations, typed queries in server components, and drizzle.config.ts setup."
date: "2026-03-25"
author: "SnipShift Team"
tags: ["drizzle", "orm", "nextjs", "postgresql", "typescript", "database"]
keyword: "drizzle orm nextjs postgresql setup"
difficulty: "intermediate"
readTime: "8 min read"
tool: "/sql-to-typescript"
---

# How to Set Up Drizzle ORM with Next.js and PostgreSQL (From Scratch)

I switched from Prisma to Drizzle about six months ago, and I'm not going back. Don't get me wrong  Prisma is a solid tool, and if your team is already using it, there's no urgent reason to migrate. But for new projects, Drizzle's approach just clicks better with how I think about databases. The schema is regular TypeScript. The queries look like SQL. The generated types are exactly what you'd expect. And it's fast  no query engine binary, no code generation step.

The one downside? Setup guides are still kind of scarce compared to Prisma's. So here's the complete setup I use for every new Next.js + Postgres project.

## Installing Everything

You need the Drizzle ORM package, the PostgreSQL driver, and the Drizzle Kit CLI:

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

I'm using the `postgres` driver (also known as postgres.js) because it's fast, has great TypeScript support, and doesn't need any native bindings. But Drizzle also works with `node-postgres` (pg), Neon's serverless driver, or Vercel Postgres  your choice.

You'll also need a PostgreSQL database. For local development, Docker is the easiest:

```bash
docker run --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Add the connection string to your `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp
```

## Defining Your Schema

This is where Drizzle differs most from Prisma. Instead of a `.prisma` schema file, you write regular TypeScript:

```typescript
// src/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  published: boolean("published").default(false).notNull(),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

I genuinely like this approach. Your schema is just code  you can use variables, create helper functions, share column definitions across tables, add comments. No new syntax to learn, no special file format.

If you already have an existing database with SQL table definitions, [SnipShift's SQL to TypeScript converter](https://snipshift.dev/sql-to-typescript) can generate Drizzle-compatible TypeScript types from your SQL schemas. It's a nice shortcut when you're migrating an existing database to Drizzle.

## Creating the Database Client

Set up a reusable database client:

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For query purposes (connection pool)
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

> **Warning:** In development with Next.js, hot module reloading can create multiple database connections. To prevent this, use a singleton pattern:

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client ?? postgres(connectionString);

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
```

That `globalThis` trick is the same pattern you'll see in Prisma setups. It keeps a single connection pool alive across hot reloads.

## Drizzle Config and Migrations

Create the Drizzle Kit configuration:

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Now you have two options for syncing your schema to the database:

**Option 1: `db:push` (fast, for development)**

```bash
npx drizzle-kit push
```

This directly applies schema changes to your database without creating migration files. Great for rapid prototyping.

**Option 2: `db:generate` + `db:migrate` (proper migrations)**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

This generates SQL migration files in the `./drizzle` folder and then runs them. Use this for production  migration files give you a history of schema changes and can be rolled back.

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

That last one  `db:studio`  launches Drizzle Studio, a browser-based database viewer. It's honestly pretty nice for quick data inspection.

```mermaid
graph LR
    A[schema.ts changes] --> B{Environment?}
    B -->|Development| C[drizzle-kit push]
    C --> D[Database updated directly]
    B -->|Production| E[drizzle-kit generate]
    E --> F[Migration SQL files]
    F --> G[drizzle-kit migrate]
    G --> D
```

## Querying in Next.js Server Components

Here's where Drizzle really shines with Next.js. Since server components run on the server, you can query the database directly  no API layer needed:

```typescript
// app/posts/page.tsx
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function PostsPage() {
  // Simple select
  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return (
    <div>
      <h1>Published Posts</h1>
      {allPosts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <time>{post.createdAt.toLocaleDateString()}</time>
        </article>
      ))}
    </div>
  );
}
```

Everything is fully typed. `allPosts` has the type `typeof posts.$inferSelect[]`  meaning you get autocomplete on every field, and TypeScript catches typos at build time.

## Joins and Relations

Drizzle supports two styles of joins. The SQL-like approach:

```typescript
// Join posts with their authors
const postsWithAuthors = await db
  .select({
    postId: posts.id,
    postTitle: posts.title,
    authorName: users.name,
    authorEmail: users.email,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true));
```

And the relations query API (more Prisma-like):

```typescript
// First, define relations in your schema
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

Then query with `db.query`:

```typescript
const postsWithAuthors = await db.query.posts.findMany({
  where: eq(posts.published, true),
  with: {
    author: true,
  },
});
// Type: { id: number; title: string; ...; author: { id: number; name: string; ... } }[]
```

I tend to use the SQL-style joins for complex queries and the relations API for simple nested data fetching. Both are fully typed.

## Insert, Update, Delete

The mutation APIs are clean and predictable:

```typescript
// Insert
const newUser = await db
  .insert(users)
  .values({
    name: "Jane Doe",
    email: "jane@example.com",
  })
  .returning(); // Returns the inserted row(s)

// Update
await db
  .update(posts)
  .set({ published: true, updatedAt: new Date() })
  .where(eq(posts.id, 1));

// Delete
await db.delete(posts).where(eq(posts.id, 1));
```

The `.returning()` method is a PostgreSQL feature that Drizzle supports  it returns the row(s) affected by the operation, saving you a follow-up SELECT query.

## Drizzle vs Prisma: Quick Comparison

Since everyone's going to ask:

| Feature | Drizzle | Prisma |
|---------|---------|--------|
| Schema definition | TypeScript files | `.prisma` file |
| Query syntax | SQL-like | Custom API |
| Type generation | Automatic (inferred) | Requires `prisma generate` |
| Bundle size | ~50KB | ~800KB + engine binary |
| Raw SQL | First-class support | `$queryRaw` (works but clunky) |
| Migrations | SQL files | Auto-generated |
| Learning curve | Low (if you know SQL) | Low (if you don't know SQL) |
| Ecosystem maturity | Growing fast | Very mature |

My honest take: if your team knows SQL well, Drizzle will feel like home. If SQL makes your team nervous, Prisma's abstraction layer is more approachable. Neither is wrong  they're optimized for different preferences.

## Common Gotchas

**Connection limit in serverless**  If you're deploying to Vercel or similar serverless platforms, each function invocation might open a new connection. Use a connection pooler like PgBouncer, or use Neon's or Supabase's serverless drivers which handle pooling for you.

**Schema changes in production**  Always use migrations (`drizzle-kit generate` → `drizzle-kit migrate`) in production, never `push`. Push doesn't track what changed and can cause data loss on column renames.

**Date handling**  Drizzle returns `Date` objects for timestamp columns. If you're passing them to client components via server component props, they'll need to be serialized (Next.js doesn't serialize Date objects automatically). Convert to ISO strings before passing down.

> **Tip:** For connecting PostgreSQL to Node.js in other contexts, our [connect PostgreSQL to Node.js guide](/blog/connect-postgresql-nodejs) covers the fundamentals. And if you're dealing with server vs. client component patterns in Next.js, our [server vs client components guide](/blog/server-vs-client-components-nextjs) explains where database queries should live.

## That's the Full Setup

From zero to typed database queries in a Next.js server component  the whole process takes maybe 15 minutes. Define your schema in TypeScript, run a migration, and start querying. No code generation step, no binary downloads, no schema language to learn.

The Drizzle ecosystem is growing fast. The Discord community is active, the documentation keeps improving, and new features land regularly. For new Next.js + Postgres projects in 2026, it's become my default choice.

Browse more developer tools at [SnipShift](https://snipshift.dev)  we've got converters for SQL, JSON, TypeScript, and more.
