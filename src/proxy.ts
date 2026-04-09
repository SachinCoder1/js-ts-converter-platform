import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Forward nonce to the app via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Request ID for tracing
  const requestId = crypto.randomUUID();

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('X-Request-Id', requestId);

  // Security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()'
  );

  // Content Security Policy  nonce-based for inline scripts
  // Monaco editor requires unsafe-eval and blob: for web workers
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' 'nonce-${nonce}' 'strict-dynamic' https://cdn.jsdelivr.net https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
    "img-src 'self' data: blob: https://www.googletagmanager.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "connect-src 'self' https://cdn.jsdelivr.net https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // CORS: Block cross-origin API requests
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Allow same-origin requests (origin is null for same-origin in some browsers)
    if (origin && host && !origin.includes(host)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    response.headers.set('Cache-Control', 'no-store');

    // Flag requests without the custom client header for stricter handling
    const snipShiftClient = request.headers.get('x-snipshift-client');
    if (!snipShiftClient || snipShiftClient !== 'web') {
      response.headers.set('X-SnipShift-Untrusted', '1');
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
