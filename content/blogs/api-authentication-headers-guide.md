# How to Add Authentication Headers to API Calls (Bearer Token, API Key)

Somewhere around the third time I manually added `Authorization: Bearer ${token}` to a fetch call and typo'd it as `Authorizaton`, I decided it was time to build a proper system for API authentication headers. That one missing 'i' cost me about 45 minutes of debugging  staring at 401 responses and questioning my entire career because "the token is definitely valid, I just checked."

If you've ever dealt with API authentication, you know the deal. Every API has its own way of expecting credentials  some want a Bearer token, some want an API key in a custom header, some want it as a query parameter, and a few legacy APIs still expect Basic auth. And if you're calling multiple APIs in the same app, you're juggling all of these at once.

This guide covers the authentication methods you'll actually encounter in the wild, how to implement them properly in JavaScript and TypeScript, and  most importantly  how to avoid the dumb mistakes that eat hours of debugging time.

## Bearer Token Authentication

Bearer tokens are by far the most common API authentication method you'll run into. OAuth2 access tokens, JWTs, session tokens  they all typically get sent as Bearer tokens.

The format is simple:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Here's how to add it to a fetch call:

```javascript
const response = await fetch('https://api.example.com/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

Simple enough. But the real question is: **where does `accessToken` come from, and where do you store it?**

### Storing Tokens Safely

This is where a lot of developers get it wrong. I've seen tokens stored in `localStorage`, in global variables, in plain cookies, even hardcoded in the source code (yes, in production).

| Storage Method | Security Level | Use Case |
|---|---|---|
| `httpOnly` cookie | Best | Server-rendered apps, SSR |
| In-memory variable | Good | SPAs with short-lived tokens |
| `localStorage` | Risky | Avoid for sensitive tokens |
| `sessionStorage` | Risky | Slightly better than localStorage |
| URL query param | Terrible | Never do this |

For most SPAs, the pattern I recommend is:

1. Store the access token **in memory** (a JavaScript variable or React context)
2. Store the refresh token in an **httpOnly, Secure, SameSite cookie**
3. When the access token expires, use the refresh token to get a new one

```typescript
// Simple in-memory token store
let accessToken: string | null = null;

export function setToken(token: string) {
  accessToken = token;
}

export function getToken(): string | null {
  return accessToken;
}

export function clearToken() {
  accessToken = null;
}
```

Yes, the access token disappears on page refresh. That's the point  it forces a refresh token flow, which is more secure than persisting the token somewhere an XSS attack could grab it.

> **Warning:** Never store JWTs or access tokens in `localStorage` if your app has any risk of XSS. A single XSS vulnerability means an attacker can read everything in localStorage. HttpOnly cookies are invisible to JavaScript  that's why they're safer.

## API Key Authentication

API keys are simpler than Bearer tokens  you get a key from the provider's dashboard and include it with your requests. But there are two ways APIs expect them, and using the wrong one is a common source of "why is this returning 401?" confusion.

### API Key in a Header

Most modern APIs expect the key in a custom header:

```javascript
// Common header names  each API picks its own
const response = await fetch('https://api.example.com/data', {
  headers: {
    'X-API-Key': 'sk_live_abc123def456',
  },
});

// Stripe uses Bearer auth with the API key
const stripeResponse = await fetch('https://api.stripe.com/v1/charges', {
  headers: {
    'Authorization': `Bearer sk_live_abc123def456`,
  },
});

// Some APIs use a custom auth header
const twilioResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer sk-abc123def456`,
    'Content-Type': 'application/json',
  },
});
```

### API Key as a Query Parameter

Some APIs  especially older ones or those optimized for simplicity  expect the key as a query parameter:

```javascript
// Google Maps style
const response = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?address=NYC&key=${API_KEY}`
);
```

This approach is less secure because the API key ends up in server logs, browser history, and potentially cached by CDNs. If you have a choice, always prefer header-based authentication.

> **Tip:** When you're testing API calls with different auth methods, copying cURL examples from API docs and converting them to fetch code by hand gets old fast. [SnipShift's cURL to Code converter](https://snipshift.dev/curl-to-code) handles all the auth header translation for you  paste a cURL with `-H "Authorization: Bearer ..."` and get clean JavaScript, TypeScript, Python, or Go code back.

## Basic Authentication

Basic auth is the oldest HTTP authentication scheme, and you'll still encounter it  especially with internal APIs, CI/CD webhooks, and services like Jira or Bitbucket.

It works by encoding `username:password` in Base64 and sending it in the `Authorization` header:

```javascript
// Basic auth with fetch
const credentials = btoa(`${username}:${password}`);

const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Basic ${credentials}`,
  },
});
```

```mermaid
graph LR
    A["Username + Password"] --> B["Base64 Encode"]
    B --> C["'Basic dXNlcjpwYXNz'"]
    C --> D["Authorization Header"]
    D --> E["API Request"]
```

A critical thing to understand: **Base64 is encoding, not encryption.** Anyone who intercepts the request can decode the credentials trivially. Basic auth is only safe over HTTPS  and even then, I'd only use it for server-to-server communication, never from a browser.

```javascript
// Decoding is trivial  this is NOT security
atob('dXNlcjpwYXNz'); // "user:pass"
```

## OAuth2 Flow Overview

OAuth2 is a whole authentication *framework*, not just a header format. But since it's how most "Sign in with Google/GitHub/etc." flows work, it's worth understanding the basics.

The most common flow for web apps is the **Authorization Code flow**:

```mermaid
sequenceDiagram
    participant User
    participant App as Your App
    participant Auth as Auth Server
    participant API as API Server

    User->>App: Click "Sign in with GitHub"
    App->>Auth: Redirect to /authorize
    Auth->>User: Show login/consent screen
    User->>Auth: Approve access
    Auth->>App: Redirect with ?code=abc123
    App->>Auth: POST /token (code + client_secret)
    Auth->>App: Access token + Refresh token
    App->>API: GET /user (Bearer token)
    API->>App: User data
```

The key thing for this guide: once you have the access token from the OAuth2 flow, you use it exactly like a Bearer token:

```javascript
// After OAuth2 flow completes, you have an access token
const response = await fetch('https://api.github.com/user', {
  headers: {
    'Authorization': `Bearer gho_xxxxxxxxxxxxxxxxxxxx`,
    'Accept': 'application/vnd.github.v3+json',
  },
});
```

The complexity with OAuth2 isn't in sending the header  it's in the token exchange flow, refresh logic, and handling token expiration. But once you've got the token, it's just a Bearer header like everything else.

## Building an Auth Interceptor

If you're making API calls from multiple places in your app  which you almost certainly are  you don't want to manually attach auth headers every time. That's how you end up with that typo I mentioned at the start.

### Fetch Wrapper

Here's a clean pattern for a fetch wrapper that handles auth automatically:

```typescript
type AuthType = 'bearer' | 'api-key' | 'basic';

interface AuthConfig {
  type: AuthType;
  token?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  headerName?: string; // for custom API key header names
}

function createAuthHeaders(auth: AuthConfig): Record<string, string> {
  switch (auth.type) {
    case 'bearer':
      return { 'Authorization': `Bearer ${auth.token}` };
    case 'api-key':
      return { [auth.headerName || 'X-API-Key']: auth.apiKey! };
    case 'basic':
      const encoded = btoa(`${auth.username}:${auth.password}`);
      return { 'Authorization': `Basic ${encoded}` };
  }
}

async function authFetch(
  url: string,
  options: RequestInit = {},
  auth: AuthConfig
): Promise<Response> {
  const authHeaders = createAuthHeaders(auth);

  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
```

Usage is clean:

```typescript
// Bearer token
const users = await authFetch('/api/users', {}, {
  type: 'bearer',
  token: getToken(),
});

// API key
const data = await authFetch('https://api.weather.com/forecast', {}, {
  type: 'api-key',
  apiKey: process.env.WEATHER_API_KEY,
  headerName: 'X-API-Key',
});
```

### Axios Interceptors

If you're using axios, interceptors are even more elegant  they automatically attach headers to every request without wrapping each call:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
});

// Request interceptor  runs before every request
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor  handle 401s globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh the token
      const newToken = await refreshAccessToken();
      if (newToken) {
        setToken(newToken);
        // Retry the original request with the new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      }
      // Refresh failed  redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

That response interceptor is gold. When a request gets a 401, it automatically attempts to refresh the token and retry the request. The user doesn't see a thing  the app just keeps working. I've used this pattern in every production React app I've built in the past three years.

## Token Refresh Flow

Speaking of token refresh  this is the part that most tutorials gloss over but every production app needs. Access tokens expire (they should  short-lived tokens limit the damage from a leak). When they do, you need to get a new one without making the user log in again.

```typescript
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // Prevent multiple simultaneous refresh requests
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include', // sends the httpOnly refresh cookie
      });

      if (!response.ok) {
        return null; // refresh failed
      }

      const { accessToken } = await response.json();
      return accessToken;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
```

The `isRefreshing` guard is important. Without it, if three API calls fail with 401 at the same time, you'd send three refresh requests. With the guard, the second and third calls wait for the first refresh to complete and reuse its result.

## Common Authentication Mistakes

After debugging auth issues across many projects, here are the mistakes I see most often:

1. **Storing tokens in localStorage**  XSS can steal them. Use httpOnly cookies for refresh tokens and in-memory for access tokens.

2. **Not handling token expiration**  Your app works perfectly for 59 minutes, then everything breaks. Build the refresh flow from day one.

3. **Sending credentials over HTTP**  Basic auth over HTTP is literally sending passwords in plain text. Always use HTTPS.

4. **API keys in frontend code**  If your API key is in a JavaScript bundle, it's public. Use a backend proxy for sensitive API keys.

5. **Not revoking tokens on logout**  Clearing the token from the client isn't enough. Hit the server's logout/revoke endpoint too.

6. **Forgetting `credentials: 'include'`**  If your auth uses cookies, fetch won't send them cross-origin by default. You need this option.

```typescript
// Without this, cookies don't get sent on cross-origin requests
const response = await fetch('https://api.example.com/data', {
  credentials: 'include', // <-- don't forget this
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

| Auth Method | Where to Store | When to Use |
|---|---|---|
| Bearer (JWT) | Memory + httpOnly refresh cookie | Most modern APIs, OAuth2 |
| API Key | Environment variable (server-side only) | Third-party API integration |
| Basic Auth | Never store  compute per-request | Legacy APIs, server-to-server |
| OAuth2 tokens | Same as Bearer | "Sign in with X" flows |

## Wrapping Up

API authentication headers aren't complicated in isolation  it's just a string in an HTTP header. What makes it tricky is doing it *correctly* in a way that's secure, handles token expiration, and doesn't require you to copy-paste auth logic across fifty components.

The patterns in this guide  a typed auth wrapper, axios interceptors with automatic refresh, and proper token storage  cover about 95% of what you'll need in a production web app. The other 5% is edge cases specific to whatever auth provider you're using (and their docs will cover that).

If you're working with API documentation that includes cURL examples and you want to quickly convert those to proper fetch or axios calls with auth headers already set up, [SnipShift's cURL to Code converter](https://snipshift.dev/curl-to-code) handles all the header translation  including Bearer tokens, API keys, and Basic auth.

For related reading, check out our guide on [handling API errors gracefully](/blog/handle-api-errors-javascript)  because a 401 response is just an error that needs handling  and our breakdown of [HTTP status codes](/blog/http-status-codes-explained) so you know exactly what each auth-related status code means. You can explore all our developer tools at [SnipShift](https://snipshift.dev).
