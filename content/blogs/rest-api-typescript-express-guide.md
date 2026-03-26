# How to Build a REST API with TypeScript and Express (2026 Guide)

I've probably built 20+ REST APIs with Express over the years, and every time I start a new one, I think "this time I'll get the setup right from the start." Half the time I end up restructuring things by week three anyway. But after doing this so many times, I've landed on a setup that I'm genuinely happy with  TypeScript, Express, Zod for validation, Vitest for tests, and a project structure that doesn't fall apart at 50 endpoints.

This guide is the "I wish someone had shown me this on day one" version. We'll build a complete, working **REST API with TypeScript and Express**  not a toy example, but something structured enough to grow into a real production service.

## Project Setup

Let's start from scratch. I'm going to be opinionated here  these are the choices I'd make for a new API in 2026.

```bash
mkdir my-api && cd my-api
npm init -y
```

### Install Dependencies

```bash
# Runtime
npm install express zod dotenv

# Dev
npm install -D typescript @types/express @types/node tsx vitest
```

A few notes on these choices:
- **tsx** instead of `ts-node`  it's faster and handles ESM without drama
- **vitest** instead of Jest  ESM-native, faster, better TypeScript support
- **zod** for validation  it's the standard at this point, and the type inference is incredible

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json Scripts

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Project Structure

```
src/
├── features/
│   └── users/
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.routes.ts
│       ├── user.schema.ts
│       └── user.test.ts
├── shared/
│   ├── middleware/
│   │   ├── error-handler.ts
│   │   ├── validate.ts
│   │   └── not-found.ts
│   ├── utils/
│   │   └── async-handler.ts
│   └── types/
│       └── api.ts
├── config/
│   └── env.ts
├── app.ts
└── server.ts
```

Feature-based structure from the start. Each feature gets its own folder with controller, service, routes, schema, and tests. If you want to understand why I prefer this over layer-based, check out our [Node.js project structure guide](/blog/node-js-project-structure).

## The Foundation Files

Let's build the app bottom-up, starting with the shared utilities.

### Environment Config

```typescript
// src/config/env.ts
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

Your app will crash at startup if `DATABASE_URL` is missing. That's intentional  better to fail fast with a clear error than to discover the problem at 2am when someone hits a route that queries the database.

### API Response Types

```typescript
// src/shared/types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

Using a custom `ApiError` class means you can throw typed errors from anywhere in your code and the error handler will know how to respond.

### Async Handler Wrapper

```typescript
// src/shared/utils/async-handler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Express 4 doesn't catch async errors. This wrapper does.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

If you're using Express 5, you can skip this  it handles async errors natively. But a lot of projects are still on v4, and this 6-line wrapper saves you from unhandled promise rejections.

### Validation Middleware

This is where Zod really shines. We'll create a generic middleware that validates any part of the request:

```typescript
// src/shared/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../types/api';

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query) as any;
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!details[path]) details[path] = [];
          details[path].push(err.message);
        });

        next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details));
      } else {
        next(error);
      }
    }
  };
}
```

If you have existing JSON response shapes from another API and want to generate Zod schemas from them, [SnipShift's JSON to Zod converter](https://snipshift.dev/json-to-zod) does exactly that  paste a JSON sample, get a Zod schema back. Handy when you're defining validation for an API that mirrors an existing data structure.

### Error Handler

```typescript
// src/shared/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/api';
import { env } from '../../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log the error (in production, use a real logger)
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code ?? 'ERROR',
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Unknown errors  don't leak internals in production
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
}
```

Four arguments. That's how Express knows this is an error handler. The `_next` parameter is unused but must be there for Express to recognize the signature.

## Building a Feature: Users

Now let's build a complete users feature with CRUD operations.

### Validation Schemas

```typescript
// src/features/users/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin']).default('user'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const userParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Infer types from schemas  single source of truth
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
```

This is the beauty of Zod  your validation schemas *are* your types. You define the shape once, and TypeScript infers the types from it. No duplication, no drift.

### Service Layer

```typescript
// src/features/users/user.service.ts
import { ApiError } from '../../shared/types/api';
import { CreateUserInput, UpdateUserInput, GetUsersQuery } from './user.schema';

// In a real app, this would be a database. Using an in-memory
// array so this guide is self-contained and runnable.
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

let users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin', createdAt: new Date() },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user', createdAt: new Date() },
];

export async function getUsers(query: GetUsersQuery) {
  let filtered = [...users];

  if (query.search) {
    const search = query.search.toLowerCase();
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const start = (query.page - 1) * query.limit;
  const paginated = filtered.slice(start, start + query.limit);

  return {
    users: paginated,
    meta: { page: query.page, limit: query.limit, total },
  };
}

export async function getUserById(id: string) {
  const user = users.find((u) => u.id === id);
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  return user;
}

export async function createUser(input: CreateUserInput) {
  const existing = users.find((u) => u.email === input.email);
  if (existing) throw new ApiError(409, 'Email already in use', 'DUPLICATE_EMAIL');

  const user: User = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date(),
  };
  users.push(user);
  return user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  if (input.email) {
    const existing = users.find((u) => u.email === input.email && u.id !== id);
    if (existing) throw new ApiError(409, 'Email already in use', 'DUPLICATE_EMAIL');
  }

  users[index] = { ...users[index], ...input };
  return users[index];
}

export async function deleteUser(id: string) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  users.splice(index, 1);
}
```

Notice the service layer is framework-agnostic  no `req`, `res`, or Express-specific types. It takes typed inputs and returns data or throws `ApiError`. This makes it testable without HTTP and portable to Fastify or Hono if you switch later.

### Controller

```typescript
// src/features/users/user.controller.ts
import { Request, Response } from 'express';
import * as userService from './user.service';
import { GetUsersQuery, CreateUserInput, UpdateUserInput } from './user.schema';

export async function getUsers(req: Request, res: Response) {
  const query = req.query as unknown as GetUsersQuery;
  const result = await userService.getUsers(query);
  res.json({ data: result.users, meta: result.meta });
}

export async function getUserById(req: Request, res: Response) {
  const user = await userService.getUserById(req.params.id);
  res.json({ data: user });
}

export async function createUser(req: Request, res: Response) {
  const user = await userService.createUser(req.body as CreateUserInput);
  res.status(201).json({ data: user });
}

export async function updateUser(req: Request, res: Response) {
  const user = await userService.updateUser(req.params.id, req.body as UpdateUserInput);
  res.json({ data: user });
}

export async function deleteUser(req: Request, res: Response) {
  await userService.deleteUser(req.params.id);
  res.status(204).end();
}
```

Controllers are thin. Parse the request, call the service, send the response. No business logic here.

### Routes

```typescript
// src/features/users/user.routes.ts
import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { validate } from '../../shared/middleware/validate';
import * as userController from './user.controller';
import {
  createUserSchema,
  updateUserSchema,
  getUsersQuerySchema,
  userParamsSchema,
} from './user.schema';

const router = Router();

router.get(
  '/',
  validate({ query: getUsersQuerySchema }),
  asyncHandler(userController.getUsers)
);

router.get(
  '/:id',
  validate({ params: userParamsSchema }),
  asyncHandler(userController.getUserById)
);

router.post(
  '/',
  validate({ body: createUserSchema }),
  asyncHandler(userController.createUser)
);

router.put(
  '/:id',
  validate({ params: userParamsSchema, body: updateUserSchema }),
  asyncHandler(userController.updateUser)
);

router.delete(
  '/:id',
  validate({ params: userParamsSchema }),
  asyncHandler(userController.deleteUser)
);

export { router as userRoutes };
```

Every route has validation middleware before the handler. Invalid requests never reach the controller  they get a clean 400 response with specific field errors.

## Wiring It Together

### App Setup

```typescript
// src/app.ts
import express from 'express';
import { userRoutes } from './features/users/user.routes';
import { errorHandler } from './shared/middleware/error-handler';

const app = express();

// Global middleware
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feature routes
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `${req.method} ${req.path} not found` } });
});

// Error handler (must be last)
app.use(errorHandler);

export { app };
```

### Server Entry Point

```typescript
// src/server.ts
import { app } from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
```

Separating `app.ts` and `server.ts` is important  it lets you import the app in tests without starting the HTTP server.

```mermaid
graph TD
    A[Request] --> B[express.json]
    B --> C{Route matched?}
    C -->|No| D[404 Handler]
    C -->|Yes| E[Validation Middleware]
    E -->|Invalid| F[ApiError 400]
    E -->|Valid| G[Controller]
    G --> H[Service]
    H -->|Success| I[Response 200/201]
    H -->|Error| J[ApiError]
    F --> K[Error Handler]
    J --> K
    K --> L[Error Response]
```

## Testing with Vitest

Let's write tests for the users feature. Vitest works great with TypeScript and ESM out of the box.

```typescript
// src/features/users/user.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

// You'll need: npm install -D supertest @types/supertest

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('returns a list of users', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('supports pagination', async () => {
      const res = await request(app).get('/api/users?page=1&limit=1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.limit).toBe(1);
    });

    it('rejects invalid page numbers', async () => {
      const res = await request(app).get('/api/users?page=-1');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Charlie', email: 'charlie@test.com' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Charlie');
      expect(res.body.data.role).toBe('user'); // default role
    });

    it('rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Test', email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.error.details).toHaveProperty('email');
    });

    it('rejects missing name', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/users/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('rejects invalid UUID format', async () => {
      const res = await request(app).get('/api/users/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });
});
```

Run them:

```bash
npx vitest run
```

The tests use `supertest` to make HTTP requests directly to the Express app  no server needed. Fast, reliable, and they test the full middleware chain including validation and error handling.

> **Tip:** If you're using cURL to manually test your endpoints during development, [SnipShift's cURL to Code converter](https://snipshift.dev/curl-to-code) can turn those curl commands into `fetch` or `supertest` calls. Saves time when converting manual tests into automated ones.

## Deployment

For deployment, you have a few options depending on your infrastructure.

### Build and Run

```bash
npm run build    # Compiles TypeScript to dist/
npm start        # Runs dist/server.js with Node
```

### Docker

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Multi-stage build keeps the image small  only production dependencies and compiled JS in the final image.

### Environment Variables in Production

Use your platform's secret management:
- **Docker/K8s:** Environment variables or mounted secrets
- **AWS:** Parameter Store or Secrets Manager
- **Vercel/Railway:** Dashboard environment settings

Never commit `.env` to git. Add it to `.gitignore` and commit a `.env.example` instead:

```bash
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp
```

## What We Built

Here's a quick recap of the architecture:

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Routes** | HTTP method + path + middleware chain | `router.post('/', validate, handler)` |
| **Validation** | Input validation via Zod schemas | `createUserSchema.parse(body)` |
| **Controller** | Parse request, call service, send response | `userService.createUser(body)` |
| **Service** | Business logic, database calls | Check duplicates, insert user |
| **Error Handler** | Catch errors, send clean responses | `ApiError(409, 'Email taken')` |

This separation means each layer is independently testable, swappable, and understandable. You can replace Express with Fastify by only touching the routes and app setup  the services and schemas stay the same.

If you're wondering how to convert existing JSON API responses into TypeScript interfaces, [SnipShift's JSON to TypeScript tool](https://snipshift.dev/json-to-typescript) can generate them from a sample response  useful when you're building a client for your API or documenting the response shapes.

The patterns here  validation middleware, error handling, service separation  work regardless of your framework choice. If you're evaluating alternatives, our [Express vs Fastify vs Hono comparison](/blog/express-fastify-hono-comparison) covers which framework fits which use case. And if you need to add a database, our [PostgreSQL connection guide](/blog/connect-postgresql-nodejs) picks up right where this guide's in-memory array leaves off.
