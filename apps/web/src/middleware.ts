import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Forwards the current request path to Server Components via a request header,
 * so the root layout can set the <html lang> attribute server-side (zh / en).
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale-path', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/zh/:path*', '/en/:path*'],
};
