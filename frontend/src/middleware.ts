import { NextRequest, NextResponse } from 'next/server'

export function middleware (request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeaderDev = `
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' embed.bsky.app;
  script-src-elem 'self' 'unsafe-inline' www.googletagmanager.com embed.bsky.app platform.twitter.com www.instagram.com;
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https: */xrpc/; 
  object-src 'none'; 
  frame-src 'self' embed.bsky.app platform.twitter.com www.youtube.com www.instagram.com bandcamp.com
`

  const cspHeaderProd = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}' strict-dynamic;
  script-src-elem 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://embed.bsky.app https://platform.twitter.com https://www.instagram.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https: */xrpc/;
  object-src 'none';
  frame-src 'self' https://embed.bsky.app https://platform.twitter.com https://www.youtube.com https://www.instagram.com https://bandcamp.com
`
  const cspHeader = process.env.NODE_ENV === 'development' ? cspHeaderDev : cspHeaderProd
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  return response
}

export const config = {
  matcher: [
    /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
}
