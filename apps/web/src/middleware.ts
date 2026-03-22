import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Allow Global Home and API routes to pass through
  if (pathname === '/' || pathname.startsWith('/api')) {
    return response;
  }

  // Region detection logic
  let region: 'za' | 'ma' | 'fr' | 'es' | '' = '';
  if (pathname.startsWith('/za')) region = 'za';
  else if (pathname.startsWith('/ma')) region = 'ma';
  else if (pathname.startsWith('/fr')) region = 'fr';
  else if (pathname.startsWith('/es')) region = 'es';

  // Core Fintech Headers (Injection)
  if (region) {
    // Inject X-Data-Region for partitioned backend routing
    const dataRegion = region === 'za' ? 'af-south-1' : 'eu-central-1';
    response.headers.set('X-Data-Region', dataRegion);
    response.headers.set('X-Jurisdiction', region);
  }

  // Security Headers (Senior Architect Level)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
  );

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
