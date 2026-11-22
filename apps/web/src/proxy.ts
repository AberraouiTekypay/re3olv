import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function configuredOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.username || url.password || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) {
      throw new Error('must be an HTTPS URL without credentials');
    }
    return url.origin;
  } catch {
    throw new Error('Configured public service URLs must be valid HTTPS URLs');
  }
}

export function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString('base64');
  const apiOrigin = configuredOrigin(process.env.NEXT_PUBLIC_API_URL);
  const oidcOrigin = configuredOrigin(process.env.NEXT_PUBLIC_OIDC_ISSUER);
  const developmentSources = process.env.NODE_ENV === 'development'
    ? " 'unsafe-eval' http://localhost:* ws://localhost:*"
    : '';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com${developmentSources}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://www.transparenttextures.com",
    "font-src 'self' data:",
    `connect-src 'self' ${[apiOrigin, oidcOrigin].filter(Boolean).join(' ')}${developmentSources}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', csp);
  requestHeaders.set('x-nonce', nonce);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
