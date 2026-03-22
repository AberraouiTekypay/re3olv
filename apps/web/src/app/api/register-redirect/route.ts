import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  // Use Vercel's geolocation header (x-vercel-ip-country)
  // Fallback to 'x-re3olv-country' or generic logic
  const country = request.headers.get('x-vercel-ip-country') || 'ZA';

  let redirectPath = '/za'; // Default primary market

  if (country === 'ZA') redirectPath = '/za';
  else if (country === 'FR') redirectPath = '/fr';
  else if (country === 'ES') redirectPath = '/es';
  else if (country === 'MA') redirectPath = '/ma';

  const url = request.nextUrl.clone();
  url.pathname = redirectPath;

  return NextResponse.redirect(url);
}

// Ensure the route is executed at the edge
export const runtime = 'edge';
