---
title: "How to Self-Host a Next.js App with Docker and Coolify"
description: "Self-host your Next.js app using Docker and Coolify on a VPS  Dockerfile setup, environment variables, auto-deploy from GitHub, SSL, and Postgres."
date: "2026-03-26"
author: "SnipShift Team"
tags: ["nextjs", "docker", "coolify", "self-hosting", "vps"]
keyword: "self host nextjs docker coolify"
difficulty: "intermediate"
readTime: "8 min read"
tool: "/env-to-types"
---

# How to Self-Host a Next.js App with Docker and Coolify

I'll be blunt: Vercel is fantastic until it isn't. The moment your project outgrows the Hobby tier, or you need persistent WebSocket connections, or you're just tired of worrying about function execution limits  self-hosting starts looking really attractive.

The problem is that self-hosting has historically meant SSH-ing into a server, configuring Nginx by hand, setting up Let's Encrypt, writing systemd services, and praying that your deployment script doesn't break at 2 AM. That's where Coolify comes in.

**Coolify** is an open-source, self-hosted alternative to Vercel/Netlify/Heroku. You install it on a VPS, connect your GitHub repo, and it handles builds, deployments, SSL certificates, and even databases  all through a web UI. Think of it as running your own PaaS. And it's free.

Here's the full walkthrough for **self-hosting a Next.js app with Docker and Coolify**, from VPS setup to production deployment with a Postgres database alongside it.

## Why Self-Host? (And When Not To)

Before we get into the how, let's be honest about the trade-offs:

| Factor | Vercel | Coolify on VPS |
|--------|--------|----------------|
| Ease of setup | Zero config | 30-60 min initial setup |
| Cost (production) | $20/mo Pro | $5-12/mo VPS |
| Scaling | Automatic | Manual (but predictable) |
| Vendor lock-in | Some (Edge functions, etc.) | None |
| Full server control | No | Yes |
| WebSockets | Limited | Full support |
| Database hosting | Separate service needed | Same server or separate |
| Cold starts | Yes (serverless) | No (always running) |

Self-hosting makes sense when you want predictable costs, full control, or features that serverless platforms make hard. It doesn't make sense if you need global edge distribution out of the box or if you'd rather not think about server maintenance at all.

## Step 1: Get a VPS

You need a Linux server. Any provider works  Hetzner, DigitalOcean, Linode, Vultr. For a typical Next.js app with a database, I'd recommend:

- **Minimum:** 2 GB RAM, 1 vCPU, 20 GB disk (~$5-6/mo on Hetzner)
- **Comfortable:** 4 GB RAM, 2 vCPU, 40 GB disk (~$8-12/mo)

Hetzner is my go-to for the price-to-performance ratio, but use whatever you're comfortable with. Make sure you're running **Ubuntu 22.04 or 24.04**  that's what Coolify supports best.

After provisioning, SSH into your server and make sure it's updated:

```bash
ssh root@your-server-ip
apt update && apt upgrade -y
```

## Step 2: Install Coolify

Coolify's installation is a one-liner. Seriously.

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This installs Docker, Docker Compose, and Coolify itself. When it's done, you'll see a URL  something like `http://your-server-ip:8000`. Open that in your browser, create your admin account, and you're in.

```mermaid
graph TD
    A[VPS - Ubuntu] --> B[Coolify]
    B --> C[Docker Engine]
    C --> D[Next.js Container]
    C --> E[Postgres Container]
    C --> F[Redis Container - optional]
    B --> G[Traefik Reverse Proxy]
    G --> H[SSL via Let's Encrypt]
    G -->|Port 443| I[Internet]
```

First thing you should do: go to **Settings** and set up your domain for the Coolify dashboard itself. Point a subdomain like `coolify.yourdomain.com` to your server's IP, and Coolify will auto-provision an SSL cert via Let's Encrypt.

> **Tip:** Don't skip securing the Coolify dashboard with HTTPS and a strong password. It has full control over your server. Treat it like you'd treat your hosting provider's admin panel.

## Step 3: Write a Production Dockerfile

Next.js has a `standalone` output mode that creates a minimal production build  just the files your app needs to run, without `node_modules`. This is perfect for Docker.

First, enable standalone output in your `next.config.ts`:

```typescript
// next.config.ts
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
```

Now create your Dockerfile in the project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env vars if needed
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

This is a multi-stage build that keeps the final image small  typically under 150 MB compared to 500+ MB with a naive approach. Each stage only copies what it needs.

A few things worth noting:

- **Alpine base** keeps the image tiny. If you hit native dependency issues, switch to `node:20-slim` instead.
- **`npm ci --ignore-scripts`** is faster and more deterministic than `npm install` for CI/CD contexts.
- **Non-root user** (`nextjs`) is a security best practice. Don't run your app as root in production.
- **`HOSTNAME="0.0.0.0"`** is critical  without it, the server only listens on localhost inside the container, and nothing can reach it.

### A Quick Note on NEXT_PUBLIC_ Variables

Here's a gotcha that trips people up: `NEXT_PUBLIC_` variables are baked in at **build time**, not runtime. If you need `NEXT_PUBLIC_API_URL` to differ between environments, you need to pass it as a build argument:

```dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

And set it in Coolify's build variables, not runtime variables. Server-side env vars (without the `NEXT_PUBLIC_` prefix) work as normal runtime variables.

## Step 4: Connect GitHub and Deploy

Back in the Coolify dashboard:

1. Go to **Projects → Add New Resource → Public Repository** (or connect your GitHub account for private repos)
2. Paste your GitHub repo URL
3. Select **Docker** as the build pack
4. Set the branch (usually `main`)
5. Click **Deploy**

Coolify will clone the repo, build the Docker image using your Dockerfile, and start the container. The first build takes a few minutes  subsequent builds are faster thanks to Docker layer caching.

### Auto-Deploy on Push

To enable auto-deploy: go to your resource settings in Coolify and enable **Webhooks**. Copy the webhook URL and add it to your GitHub repo under **Settings → Webhooks**. Now every push to `main` triggers a rebuild and deploy.

Alternatively, connect your GitHub account directly through Coolify's **Sources** settings. This sets up the webhook automatically and gives you a nicer integration  you'll see deployment status in your GitHub commits.

## Step 5: Configure Environment Variables

In Coolify, go to your resource and click **Environment Variables**. Add your runtime env vars here:

```
DATABASE_URL=postgresql://user:pass@postgres-container:5432/mydb
CRON_SECRET=your-secret-here
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com
```

For `NEXT_PUBLIC_` vars, add them under **Build Variables** instead  remember, they're baked in during the build step.

If you're managing a lot of environment variables across multiple services, keeping them typed helps catch misconfigurations early. [SnipShift's Env to Types converter](https://snipshift.dev/env-to-types) can generate TypeScript types from your `.env` file, so you get autocomplete and type checking for every variable.

## Step 6: Add a Postgres Database

One of Coolify's best features: you can spin up databases alongside your app on the same server.

1. **Projects → Add New Resource → Database → PostgreSQL**
2. Coolify creates a Postgres container with generated credentials
3. Copy the **internal connection string** (it uses Docker networking, so the hostname is the container name)
4. Paste it as `DATABASE_URL` in your Next.js app's environment variables

That internal connection string looks something like:

```
postgresql://postgres:generated-password@your-postgres-id:5432/postgres
```

The key detail: since both containers are on the same Docker network, they communicate internally. No need to expose Postgres to the internet. This is more secure and faster than an external database connection.

> **Warning:** If your VPS only has 2 GB RAM and you're running Next.js + Postgres + Coolify itself, you might run tight on memory. Coolify alone uses about 500 MB. Add 300-500 MB for Postgres and 200-400 MB for your Next.js app. A 4 GB server gives you breathing room.

## Step 7: Set Up Your Domain and SSL

In Coolify, go to your resource settings and find the **Domain** section. Enter your domain:

```
https://yourdomain.com
```

Then point your domain's DNS to your server's IP address:

```
Type: A
Name: @
Value: your-server-ip

Type: A
Name: www
Value: your-server-ip
```

Coolify uses **Traefik** as a reverse proxy under the hood, and it automatically requests SSL certificates from Let's Encrypt. Within a minute or two of your DNS propagating, you'll have HTTPS working. No manual cert management needed.

For www-to-apex redirects, you can add both `https://yourdomain.com` and `https://www.yourdomain.com` in the domain field and configure the redirect in Traefik's configuration  or just handle it in your Next.js middleware.

## Coolify vs. Bare Docker: When to Use Which

You might be wondering whether you even need Coolify, or if raw Docker Compose would be simpler. Here's my take:

| Scenario | Recommendation |
|----------|---------------|
| Single app, few deploys | Bare Docker Compose is fine |
| Multiple apps on one server | Coolify saves tons of time |
| Team needs a deploy dashboard | Coolify |
| You want auto-deploy from GitHub | Coolify (or write your own CI/CD) |
| Max control, minimal overhead | Bare Docker |
| You don't want to manage Traefik/Nginx yourself | Coolify |

Coolify adds overhead  it runs its own containers for the UI, API, and Traefik proxy. On a 2 GB server, that overhead matters. But on a 4 GB server, it's negligible, and the convenience of a web UI, automatic SSL, and one-click database provisioning is worth it.

If you want the Docker Compose route instead, our [Docker Compose beginner's guide](/blog/docker-compose-beginners-guide) walks through the fundamentals.

## Deployment Checklist

Before you call it done, verify:

```bash
# Is your app responding?
curl -I https://yourdomain.com

# Is the health check passing? (if you have one)
curl https://yourdomain.com/api/health

# Are environment variables loaded?
# Check your app's logs in Coolify dashboard

# Is the database connected?
# Run a test query through your app or check Coolify's database logs
```

> **Tip:** Set up uptime monitoring after deploying. You don't want to find out your VPS went down from a user complaint. Check our [free uptime monitoring guide](/blog/free-uptime-monitoring-setup) for options. And if you haven't added a health check endpoint yet, our [health check endpoint guide](/blog/health-check-endpoint-nodejs) shows you how.

## Worth the Effort

Self-hosting a Next.js app isn't as scary as it was a few years ago. Coolify has matured a lot  the GitHub integration works, the SSL provisioning is reliable, and running a database alongside your app on a $6/month VPS beats paying $20+ for a managed database.

The tradeoff is real, though: you're responsible for updates, backups, and keeping an eye on disk space and memory. Set up monitoring, configure automatic backups for your Postgres data, and keep Coolify updated. That's the tax you pay for the freedom and cost savings. For most indie projects and small teams, it's a trade worth making.

If you're also considering deploying via GitHub Actions instead of Coolify's built-in webhooks, check out our [GitHub Actions deploy to Vercel guide](/blog/github-actions-deploy-vercel-manual)  the CI/CD patterns apply to any hosting target. And for keeping your environment config organized across local, staging, and production, our [managing multiple .env files guide](/blog/manage-multiple-env-files) is essential reading.
