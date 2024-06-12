import ResolvePDS from '@/services/PDSResolver'
import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

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

  // const client = createClient(pds)
  // const result = await client.com.atproto.sync.getBlob({ did, cid })
  const response = await fetch(`https://${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}`)

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
