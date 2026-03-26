# How to Manage Multiple .env Files for Different Environments

Here's a scenario I've lived through at least five times: you're working on a feature locally, everything's great, you deploy to staging, and the app immediately crashes because it's pointing at your local database URL. Or worse  you accidentally push to production with test API keys and wonder why Stripe charges aren't going through.

The root cause is almost always the same: **managing multiple env files for different environments** is something every team needs to do, but nobody teaches properly. You end up with a `.env` file that's a Frankenstein of local overrides, production values, and commented-out lines that "might be needed later."

Let me show you how to set this up properly so your local, staging, and production environments each get exactly the right config  without manual swapping, without risk.

## The Standard .env File Hierarchy

Most Node.js tools recognize a standard hierarchy of `.env` files. The convention  popularized by Create React App and adopted by Next.js, Vite, and others  looks like this:

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env` | Default values for all environments | Yes (no secrets) |
| `.env.local` | Local overrides (your machine only) | **No** |
| `.env.development` | Development-specific values | Yes (no secrets) |
| `.env.development.local` | Local dev overrides | **No** |
| `.env.test` | Test environment values | Yes (no secrets) |
| `.env.test.local` | Local test overrides | **No** |
| `.env.production` | Production defaults | Yes (no secrets) |
| `.env.production.local` | Local prod overrides | **No** |

The loading priority (highest to lowest) is typically:

```mermaid
graph TD
    A[".env.{environment}.local"] -->|overrides| B[".env.local"]
    B -->|overrides| C[".env.{environment}"]
    C -->|overrides| D[".env"]
    style A fill:#e8f5e9
    style D fill:#fff3e0
```

Files ending in `.local` are never committed to git. They're for your personal machine  local database URLs, personal API keys for third-party services, debug flags you like but your teammates don't.

> **Tip:** Add `*.local` to your [.gitignore](/blog/gitignore-explained) right now if it's not already there. Seriously. Stop reading and go do it. I'll wait.

## Option 1: Next.js Built-in Support

If you're using Next.js, you get this for free. Next.js automatically loads `.env` files based on `NODE_ENV`:

```bash
# Running `next dev` loads:
.env.development.local
.env.local
.env.development
.env

# Running `next build` / `next start` loads:
.env.production.local
.env.local
.env.production
.env

# Running with NODE_ENV=test loads:
.env.test.local
.env.test
.env
```

Notice that `.env.local` is **not loaded in test mode**. This is intentional  tests should be deterministic and not affected by your personal local config.

Here's what a real project setup might look like:

```bash
# .env (committed  shared defaults, no secrets)
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.local (not committed  your personal overrides)
DATABASE_URL=postgresql://me:mypassword@localhost:5432/myapp
OPENAI_API_KEY=sk-your-personal-key-here

# .env.production (committed  production non-secrets)
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_URL=https://api.myapp.com

# .env.test (committed  test-specific values)
DATABASE_URL=postgresql://test:test@localhost:5432/myapp_test
```

The `NEXT_PUBLIC_` prefix exposes variables to the browser bundle. Anything without that prefix stays server-side only. This is a crucial security boundary  don't put API keys or database URLs behind `NEXT_PUBLIC_`.

## Option 2: dotenv-flow

For non-Next.js projects, [dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow) gives you the same file hierarchy. It's a drop-in replacement for `dotenv`:

```bash
npm install dotenv-flow
```

```javascript
// At the top of your entry file
require('dotenv-flow').config();

// Or with ES modules
import 'dotenv-flow/config';
```

dotenv-flow loads files in the same priority order as Next.js. It detects the environment from `NODE_ENV` and loads the appropriate files. Simple.

You can also specify a custom path:

```javascript
require('dotenv-flow').config({
  path: './config',
  node_env: process.env.APP_ENV || 'development'
});
```

I like dotenv-flow because it follows the same conventions that most developers already know from Next.js. Less cognitive overhead when switching between projects.

## Option 3: env-cmd

If you prefer a more explicit approach  specifying exactly which env file to use per npm script  [env-cmd](https://github.com/toddbluhm/env-cmd) is solid:

```bash
npm install env-cmd --save-dev
```

```json
{
  "scripts": {
    "dev": "env-cmd -f .env.development node server.js",
    "test": "env-cmd -f .env.test jest",
    "start": "env-cmd -f .env.production node server.js",
    "seed": "env-cmd -f .env.development node scripts/seed.js"
  }
}
```

You can also create an `.env-cmdrc.json` file for a more structured setup:

```json
{
  "development": {
    "NODE_ENV": "development",
    "DATABASE_URL": "postgresql://dev:dev@localhost:5432/app_dev",
    "REDIS_URL": "redis://localhost:6379"
  },
  "test": {
    "NODE_ENV": "test",
    "DATABASE_URL": "postgresql://test:test@localhost:5432/app_test"
  },
  "production": {
    "NODE_ENV": "production"
  }
}
```

Then use it like: `env-cmd -e development node server.js`. This approach is more explicit and can be easier to debug, but I find managing a single JSON file gets messy as your config grows.

## CI/CD Environment Variables

Here's the part most tutorials skip: **your CI/CD pipeline shouldn't use `.env` files at all.** In production and CI environments, set environment variables through the platform's native mechanism.

### GitHub Actions

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NODE_ENV: test
      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
```

Secrets are set in GitHub repo settings → Secrets and variables → Actions. They're encrypted at rest and masked in logs.

### Vercel

Vercel has built-in environment variable management. Go to your project settings → Environment Variables, and you can set different values per environment (Production, Preview, Development):

```
DATABASE_URL     = postgres://...     [Production]
DATABASE_URL     = postgres://...     [Preview]
NEXT_PUBLIC_APP_NAME = MyApp          [All environments]
```

Vercel also supports `.env.local` for `vercel dev`, which mirrors the local development experience.

### Docker Compose

If you're running services with Docker Compose (see our [Docker Compose beginner's guide](/blog/docker-compose-beginners-guide) for the full picture), you can pass env files directly:

```yaml
services:
  api:
    build: .
    env_file:
      - .env
      - .env.${NODE_ENV:-development}
```

The key principle across all platforms: **secrets live in the platform, not in files.** Your `.env.production` file should only contain non-secret configuration like public URLs and feature flags. Actual secrets  database passwords, API keys, tokens  go into the platform's secret manager.

## Type Safety for Environment Variables

Once your `.env` files multiply, you start running into a different problem: how do you know which variables exist in which environment? How do you catch a typo in `DATBASE_URL` before it reaches production?

If you're working in TypeScript, you can generate type definitions from your `.env` files. [SnipShift's Env to Types tool](https://snipshift.dev/env-to-types) takes your `.env` file and generates either TypeScript interfaces or Zod schemas  so your editor autocompletes environment variable names and your build fails if a required variable is missing.

Here's what that looks like in practice:

```typescript
// Generated from your .env file
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  OPENAI_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

Now `env.DATABASE_URL` is typed, validated, and guaranteed to exist at startup. No more `process.env.DATABSE_URL` typos silently returning `undefined` at 3am.

## A Practical Workflow

Here's how I set up env management for every new project now:

1. **Create a `.env.example`** with all required variables (empty values or placeholders). This gets committed and serves as documentation.

2. **Copy to `.env.local`** for local development. Fill in your personal values. Never commit this file.

3. **Create `.env.test`** with test-specific values. This can be committed if it contains no secrets.

4. **Set production variables in your hosting platform**  not in files.

5. **Generate types** from your `.env.example` using [SnipShift's Env to Types](https://snipshift.dev/env-to-types), so TypeScript catches missing or mistyped variables.

6. **Validate on startup** with Zod or a similar library. Fail fast if the config is invalid.

```bash
# .env.example (committed)
DATABASE_URL=
REDIS_URL=
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=
```

```bash
# .gitignore
.env.local
.env.*.local
```

This pattern has saved me from "works on my machine" bugs more times than I can count. The `.env.example` file acts as a contract between your code and its environment, and the Zod validation ensures that contract is enforced at runtime.

If you're using GitHub Actions for CI/CD, check out our [GitHub Actions tutorial](/blog/github-actions-first-workflow) for how to wire up secrets and environment variables in your workflow files. And for keeping sensitive files out of git, our [.gitignore guide](/blog/gitignore-explained) covers the patterns you need.

Managing environment variables across multiple environments isn't glamorous work. But getting it right means fewer production incidents, easier onboarding for new team members, and one less thing to debug at 2am. Set it up once, set it up properly, and move on to the interesting problems.
