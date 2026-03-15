import ResolvePDS from '@/services/PDSResolver'
import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

// Reject private/loopback/link-local IP ranges and non-hostname values.
// This prevents the PDS resolver result from being used as an SSRF vector.
function isPublicHostname (host: string): boolean {
  // Strip port if present
  const hostname = host.split(':')[0]

  // Reject credentials-in-host
  if (hostname.includes('@')) return false

  // Reject loopback and well-known private ranges
  if (hostname === 'localhost') return false
  if (/^127\./.test(hostname)) return false
  if (/^10\./.test(hostname)) return false
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false
  if (/^192\.168\./.test(hostname)) return false
  if (/^169\.254\./.test(hostname)) return false
  if (hostname === '::1' || hostname === '0.0.0.0') return false

  return true
}

// image cache
export async function GET (request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const did = searchParams.get('did')
  const cid = searchParams.get('cid')
  if (did === null || cid === null) {
    throw new Error()
  }

  const pds = await ResolvePDS(did)
  if (pds === undefined) {
    throw new Error()
  }

  if (!isPublicHostname(pds)) {
    throw new Error()
  }

  const response = await fetch(`https://${pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`)

  const headers = new Headers()
  const contentType = response.headers.get('Content-Type') ?? response.headers.get('content-type')
  if (contentType === null) {
    notFound()
  }
  headers.set('Content-Type', contentType)

  const reader = await response.body
  if (reader === undefined) {
    notFound()
  }

  return new NextResponse(reader, { status: 200, statusText: 'OK', headers })
}
