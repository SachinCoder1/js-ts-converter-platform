---
title: "How to Add a Health Check Endpoint to Your Node.js API"
description: "Build a health check endpoint for your Node.js API  check database, Redis, external services, readiness vs liveness probes, and TypeScript implementation."
date: "2026-03-26"
author: "SnipShift Team"
tags: ["nodejs", "api", "health-check", "typescript", "kubernetes"]
keyword: "health check endpoint nodejs"
difficulty: "beginner"
readTime: "4 min read"
tool: "/js-to-ts"
---

# How to Add a Health Check Endpoint to Your Node.js API

Every API I've worked on that didn't have a **health check endpoint** eventually had an incident where someone said, "Wait, is the server actually up?" And then we'd SSH in, check `pm2 list`, poke at Postgres manually, and waste 20 minutes figuring out that the Redis connection had silently died.

A health check endpoint takes 10 minutes to build and saves you hours during incidents. Monitoring services hit it to know if your app is alive. Load balancers use it to route traffic away from unhealthy instances. Kubernetes uses it to decide whether to restart your pod. It's the simplest piece of infrastructure code you'll ever write, and it pays for itself immediately.

## The Basic Health Check

Start simple. A `GET /health` endpoint that returns 200 means "the process is running and can respond to HTTP requests":

```typescript
// Express example
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
```

```typescript
// Next.js App Router
// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
```

This is better than nothing. But it only tells you the Node.js process is alive. Your database could be down, Redis could be unreachable, and this endpoint would still happily return 200.

## A Real Health Check: Checking Dependencies

A useful health check verifies the things that actually matter  database connections, cache layers, critical external services:

```typescript
// lib/health.ts
interface HealthCheckResult {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptime: number;
  checks: {
    database: "connected" | "disconnected";
    redis: "connected" | "disconnected";
    external?: "reachable" | "unreachable";
  };
}

export async function checkHealth(): Promise<HealthCheckResult> {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
  };

  // Determine overall status
  const allHealthy = Object.values(checks).every(
    (v) => v === "connected" || v === "reachable"
  );
  const allDown = Object.values(checks).every(
    (v) => v === "disconnected" || v === "unreachable"
  );

  return {
    status: allHealthy ? "ok" : allDown ? "error" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };
}

async function checkDatabase(): Promise<"connected" | "disconnected"> {
  try {
    // Replace with your actual database check
    // Drizzle: await db.execute(sql`SELECT 1`);
    // Prisma: await prisma.$queryRaw`SELECT 1`;
    // pg: await pool.query("SELECT 1");
    await db.execute(sql`SELECT 1`);
    return "connected";
  } catch {
    return "disconnected";
  }
}

async function checkRedis(): Promise<"connected" | "disconnected"> {
  try {
    await redis.ping();
    return "connected";
  } catch {
    return "disconnected";
  }
}
```

Then your route handler:

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/health";

export async function GET() {
  const health = await checkHealth();

  const statusCode = health.status === "ok" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

A successful response looks like:

```json
{
  "status": "ok",
  "timestamp": "2026-03-26T14:30:00.000Z",
  "uptime": 86400.5,
  "checks": {
    "database": "connected",
    "redis": "connected"
  }
}
```

And when the database is down:

```json
{
  "status": "degraded",
  "timestamp": "2026-03-26T14:30:00.000Z",
  "uptime": 86400.5,
  "checks": {
    "database": "disconnected",
    "redis": "connected"
  }
}
```

The 503 status code is important  monitoring services and load balancers use the HTTP status, not the JSON body, to determine health. Return 200 for healthy, 503 for degraded or down.

```mermaid
graph TD
    A[GET /health] --> B[Check Database]
    A --> C[Check Redis]
    A --> D[Check External APIs]
    B --> E{All healthy?}
    C --> E
    D --> E
    E -->|Yes| F[200 - status: ok]
    E -->|Partial| G[503 - status: degraded]
    E -->|All down| H[503 - status: error]
```

## Readiness vs. Liveness Probes

If you're deploying to Kubernetes (or any container orchestrator), you'll encounter two types of health checks:

| Probe Type | Purpose | What It Checks | Failure Action |
|-----------|---------|----------------|----------------|
| **Liveness** | "Is the process alive?" | Process responding to HTTP | Restart the container |
| **Readiness** | "Can it serve traffic?" | Process + dependencies healthy | Remove from load balancer |

The distinction matters. A liveness probe that checks the database means Kubernetes will **restart your pod** when the database is down  which won't fix anything and might make things worse by causing a restart loop. The database being down isn't your app's fault.

So separate them:

```typescript
// GET /healthz - Liveness probe
// Just checks if the process is alive
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "alive" });
});

// GET /readyz - Readiness probe
// Checks if the app can serve real traffic
app.get("/readyz", async (req, res) => {
  const health = await checkHealth();
  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});
```

The liveness probe (`/healthz`) is dirt simple  if the process can respond, it's alive. The readiness probe (`/readyz`) does the full dependency check. Kubernetes uses liveness to decide when to restart, and readiness to decide when to send traffic.

> **Tip:** The `/healthz` and `/readyz` naming convention comes from Kubernetes and Google's internal tooling. You can use `/health` and `/ready` instead  the names don't matter to Kubernetes, only the probe configuration does.

## What NOT to Put in a Health Check

A few anti-patterns I've seen (and done):

**Don't expose secrets or internal details.** Your health check response should not include database connection strings, internal IP addresses, or version numbers that could help an attacker. Keep it to status indicators.

```typescript
// BAD - don't do this
{
  "database_url": "postgresql://user:pass@10.0.0.5:5432/prod",
  "redis_host": "10.0.0.12",
  "app_version": "2.4.1-beta",
  "node_env": "production"
}

// GOOD - just status indicators
{
  "status": "ok",
  "checks": {
    "database": "connected",
    "redis": "connected"
  }
}
```

**Don't make the health check slow.** If your health check takes 5 seconds because it's running a complex query or hitting a slow external API, monitoring tools will report false timeouts. Keep individual checks under 2 seconds with a total timeout of 5 seconds max.

**Don't check non-critical services.** If your app can function without the email service or analytics provider, don't include them in the health check. Otherwise your app shows as "degraded" when a non-essential third-party has a blip. Check only what's required for your app to serve its primary function.

**Don't require authentication.** Health check endpoints should be publicly accessible (or at least accessible to your load balancer and monitoring service without API keys). If your app requires auth on all routes, explicitly exclude the health endpoint.

## Adding a Timeout

One more thing  wrap your checks in a timeout so a hanging database connection doesn't block the health check indefinitely:

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  const timeout = new Promise<T>((resolve) =>
    setTimeout(() => resolve(fallback), ms)
  );
  return Promise.race([promise, timeout]);
}

// Usage
const dbStatus = await withTimeout(
  checkDatabase(),
  3000,       // 3 second timeout
  "disconnected" as const
);
```

This ensures your health endpoint always responds quickly, even if a dependency is hanging. Monitoring services typically have their own timeout (30 seconds), but you don't want to rely on that  a 30-second health check response is a bad signal regardless.

If you're building your health check in JavaScript and want to add proper TypeScript types  especially for the response interface  [SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) can handle the conversion automatically. Paste your plain JS health check, get back properly typed TypeScript.

## Putting It All Together

A health check endpoint is one of those things that feels optional until you need it. Then it's the first thing everyone asks about. Build it early, keep it simple, and make sure your monitoring actually hits it.

The pattern is always the same: check your critical dependencies, return a clear status, and use appropriate HTTP status codes. Whether you're on Kubernetes, Vercel, or a bare VPS, the endpoint works the same way  only the consumer changes.

For monitoring your health endpoint automatically, check out our [free uptime monitoring setup guide](/blog/free-uptime-monitoring-setup)  Better Stack and Checkly both support response body validation, so they can alert on degraded status, not just total outages. And if you're running cron jobs that should be monitored too, our [Vercel cron jobs guide](/blog/vercel-cron-job-nextjs-setup) covers the setup.
