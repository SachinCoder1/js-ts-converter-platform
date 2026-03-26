# How to Set Up a Custom Domain on Vercel (With Cloudflare DNS)

I've set up custom domains on Vercel maybe thirty or forty times at this point. And I still manage to mess it up about once every five setups  because the interaction between Cloudflare's proxy, Vercel's SSL, and DNS propagation has just enough moving parts to trip you up when you're not paying attention.

The frustrating part? The Vercel docs tell you one thing. Cloudflare's docs tell you another. And the Stack Overflow answers are split fifty-fifty between "turn off the proxy" and "keep the proxy on." So here's the actual setup that works, with every gotcha I've hit along the way.

## Step 1: Add Your Domain in Vercel

Start in your Vercel dashboard. Go to your project, click **Settings → Domains**, and type in your domain  let's say `example.com`.

Vercel will ask you how you want to configure it. You'll typically see three options:

- `example.com` (apex domain)
- `www.example.com` (with redirect from apex)
- `www.example.com` (with redirect to apex)

**My recommendation:** use the apex domain (`example.com`) as your primary and redirect `www` to it. Most modern sites don't bother with `www` anymore, and it keeps your URLs clean. But either way works  just pick one and stick with it.

After adding the domain, Vercel will show you the DNS records you need to create. For Cloudflare setups, you'll see something like:

| Record Type | Name | Value |
|-------------|------|-------|
| CNAME | `@` | `cname.vercel-dns.com` |
| CNAME | `www` | `cname.vercel-dns.com` |

Write these down. You'll need them in Cloudflare.

> **Tip:** Some guides tell you to use an A record pointing to `76.76.21.21` for the apex domain. That works too, but CNAME flattening in Cloudflare means you can use a CNAME even for the apex  and it's one less thing to remember.

## Step 2: Configure DNS Records in Cloudflare

Head over to your Cloudflare dashboard, select your domain, and go to **DNS → Records**.

Add two records:

```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)

Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)
```

And here's where things get interesting  that **proxy status** setting.

### Proxy On vs. Proxy Off  The Great Debate

Cloudflare's orange cloud (proxy on) routes traffic through Cloudflare's network. The gray cloud (DNS only) points directly to Vercel. Here's what actually changes:

| Setting | Proxy ON (Orange Cloud) | Proxy OFF (Gray Cloud) |
|---------|------------------------|------------------------|
| SSL | Cloudflare terminates SSL | Vercel handles SSL directly |
| CDN caching | Cloudflare caches static assets | Vercel Edge Network only |
| DDoS protection | Cloudflare's DDoS mitigation active | Vercel's built-in protection only |
| Real IP address | Cloudflare IPs visible to Vercel | Your visitors' real IPs visible |
| SSL setup | Requires Full (Strict) mode | Just works |
| Vercel Analytics | May show Cloudflare IPs | Shows real visitor IPs |
| Complexity | More things can break | Simpler |

**My honest take:** start with proxy OFF (gray cloud). It's simpler, fewer things can go wrong, and Vercel's Edge Network already provides a CDN and DDoS protection. You're doubling up on CDN layers with proxy on, which can actually make things slower in some cases  double TLS handshakes, cache invalidation conflicts, that sort of thing.

If you specifically need Cloudflare's WAF rules, bot management, or page rules, then turn the proxy on. But know what you're getting into.

## Step 3: Set SSL Mode to Full (Strict)

If you do keep Cloudflare's proxy on, this step is critical. Go to **SSL/TLS → Overview** in Cloudflare and set the encryption mode to **Full (Strict)**.

```mermaid
graph LR
    A[Browser] -->|HTTPS| B[Cloudflare Edge]
    B -->|HTTPS with valid cert| C[Vercel]
    C --> D[Your App]
    style B fill:#f6a821,color:#000
    style C fill:#000,color:#fff
```

Here's why this matters:

- **Flexible mode:** Cloudflare connects to Vercel over plain HTTP. This creates a security gap and Vercel may reject the connection or behave unexpectedly.
- **Full mode:** Cloudflare connects over HTTPS but doesn't validate the certificate. Works, but you're not getting real end-to-end encryption.
- **Full (Strict) mode:** Cloudflare connects over HTTPS and validates Vercel's certificate. This is what you want.

Vercel automatically provisions a valid SSL certificate for your domain, so Full (Strict) will work without any extra configuration on your end.

> **Warning:** If you leave SSL on "Flexible" with the proxy enabled, you'll get redirect loops  the dreaded ERR_TOO_MANY_REDIRECTS. I've seen this catch people more than any other issue. Full (Strict) fixes it immediately.

## Step 4: Set Up the WWW Redirect

If you chose `example.com` as your primary domain, you'll want `www.example.com` to redirect to it (or vice versa). Vercel handles this automatically when you add both domains in the dashboard  one as primary, one as redirect.

But if Cloudflare's proxy is on for the `www` record, Cloudflare might interfere with the redirect. Two options:

1. **Simplest:** Set the `www` CNAME to proxy OFF (gray cloud) and let Vercel handle the redirect entirely.
2. **Cloudflare redirect rule:** Create a redirect rule in Cloudflare (Rules → Redirect Rules) that 301 redirects `www.example.com/*` to `https://example.com/$1`.

I'd go with option 1 unless you have a specific reason to keep Cloudflare in the loop for www traffic.

## Troubleshooting DNS Propagation

You've set everything up. Vercel still shows "Invalid Configuration" or "Pending Verification." Don't panic  this is normal.

**DNS propagation takes time.** Typically 5 to 30 minutes, but it can take up to 48 hours in rare cases. Here's how to check:

```bash
# Check if your CNAME is resolving
dig example.com CNAME +short
# Should return: cname.vercel-dns.com.

# Check the full DNS chain
dig example.com +trace

# Quick check from multiple locations
nslookup example.com 1.1.1.1
nslookup example.com 8.8.8.8
```

If you're seeing stale records, your old DNS entries might be cached. You can try:

1. **Flush local DNS cache:** `sudo dscacheutil -flushcache` on Mac, `ipconfig /flushdns` on Windows
2. **Lower TTL in advance:** If you're migrating from another provider, set TTL to 60 seconds a day before the switch. This ensures caches expire quickly.
3. **Check Cloudflare's propagation:** Cloudflare changes usually propagate fast (under 5 minutes), but the old provider's records might still be cached downstream.

### Common Issues and Fixes

**"SSL Handshake Failed" or ERR_SSL_PROTOCOL_ERROR:**
Your Cloudflare SSL mode is probably set to Flexible. Switch to Full (Strict).

**Redirect loop (ERR_TOO_MANY_REDIRECTS):**
Same cause  Flexible SSL mode with proxy on. Also check if you have conflicting redirect rules in both Cloudflare and Vercel.

**Vercel says "Invalid Configuration" for hours:**
Make sure you're using CNAME records, not A records pointing to old IPs. Double-check that the target is `cname.vercel-dns.com` (not `cname.vercel-dns.com/`  no trailing slash in the DNS record).

**Works on some networks but not others:**
DNS propagation isn't instant everywhere. Use [DNS Checker](https://dnschecker.org) to see which regions have picked up the new records.

## Quick Reference: The Optimal Setup

For most projects, here's the config I'd recommend:

| Setting | Value |
|---------|-------|
| Apex CNAME target | `cname.vercel-dns.com` |
| WWW CNAME target | `cname.vercel-dns.com` |
| Cloudflare proxy | OFF (gray cloud) for both |
| SSL mode | Full (Strict)  set it regardless |
| Primary domain | `example.com` (apex) |
| WWW handling | Vercel auto-redirect to apex |

If you're managing a lot of environment-specific domain configs across staging and production, [SnipShift's Env to Types converter](https://snipshift.dev/env-to-types) can help you keep your `.env` files typed and organized  especially when you've got `NEXT_PUBLIC_DOMAIN` pointing to different values per environment.

## Wrapping Up

The Vercel + Cloudflare combo is genuinely great once it's configured correctly. The problem is that "correctly" involves knowing a handful of non-obvious settings  SSL mode, proxy status, CNAME flattening  that neither platform's docs explain particularly well in the context of the other.

Start simple: proxy off, Full (Strict) SSL, CNAME records. Get that working first. Then add Cloudflare features like WAF or caching rules one at a time, so you can isolate what breaks if something does. That approach has saved me hours of debugging compared to turning everything on at once and hoping for the best.

If you're also setting up GitHub Actions to deploy to Vercel without the built-in Git integration, check out our [guide on manual Vercel deployments with GitHub Actions](/blog/github-actions-deploy-vercel-manual). And for managing different environment configs across your domains, our [guide to managing multiple .env files](/blog/manage-multiple-env-files) covers the full setup.
