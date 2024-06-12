import * as xrpc from '@/api'
import { isValidHandle } from '@atproto/syntax'
import { ServiceClient } from '@atproto/xrpc'
import type { DidDocument } from '@atproto/identity'

export const createClient = (hostname: string): xrpc.AtpServiceClient => {
  const baseClient = new xrpc.AtpBaseClient()
  const serviceClient = new ServiceClient(baseClient.xrpc, `https://${hostname}`)
  const atpServiceClient = new xrpc.AtpServiceClient(baseClient, serviceClient)
  return atpServiceClient
}

export const resolveHandle = async (identifier: string, client: xrpc.AtpServiceClient): Promise<string> => {
  let did = identifier
  if (isValidHandle(identifier)) {
    const resolveResult = await client.com.atproto.identity.resolveHandle({ handle: identifier })
    did = resolveResult.data.did
  }
  return did
}

export const resolvePDSClient = async (identifier: string, client: xrpc.AtpServiceClient): Promise<string> => {
  if (isValidHandle(identifier)) {
    identifier = await resolveHandle(identifier, client)
  }

  const isPlc = identifier.startsWith('did:plc')
  const isWeb = identifier.startsWith('did:web')
  if (!isPlc && !isWeb) {
    throw new Error('Unsupported did method')
  }
  let result: DidDocument | undefined
  if (isPlc) {
    result = await (await fetch(`https://plc.directory/${identifier}`)).json() as DidDocument
  } else if (isWeb) {
    const parsedId = identifier.split(':').slice(2).join(':')
    const parts = parsedId.split(':').map(decodeURIComponent)
    const DOC_PATH = '/.well-known/did.json'
    if (parts.length > 1) {
      throw new Error('Did with path is not supported')
    }
    const path = parts[0] + DOC_PATH
    result = await (await fetch(`https://${path}`, { headers: { 'accept-encoding': 'json' } })).json() as DidDocument
  }
  if (result === undefined) {
    throw new Error('Unable to resolve DID')
  }
  if (result.service === undefined) {
    throw new Error("'service' section was not found onthe DID document")
  }
  for (const entry of result.service) {
    if (entry.id === '#atproto_pds') {
      return new URL(entry.serviceEndpoint as string).host
    }
  }
  throw new Error('#atproto_pds section was not found on the DID document')
}

export const transformPost = (text: string): { text: string, facets: xrpc.AppBskyRichtextFacet.Main[] } => {
  // Encode the string into UTF-8 bytes
  const encoder = new TextEncoder()

  function findUrlPositions (text: string): Array<{ start: number, end: number }> {
    // This pattern matches 'http://' or 'https://', followed by any allowed characters in URLs
    // until it encounters a character not typically part of a URL, such as space, or end of the string.
    // It's a simplified approach and might not perfectly match every valid URL character,
    // especially considering Unicode characters and punycode.
    const urlPattern = /https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/g
    let matches
    const positions = []

    while ((matches = urlPattern.exec(text)) !== null) {
      // The start position of the current match
      const start = matches.index
      // The end position calculated by adding the match's length to the start position
      const end = start + matches[0].length
      positions.push({ start, end })
    }

    return positions
  }
  const facets: xrpc.AppBskyRichtextFacet.Main[] = []
  const matches = findUrlPositions(text).sort((a, b) => a.start - b.start)

  // split text by matched urls
  const splitted: string[] = []
  let prevEnd = 0
  for (const { start, end } of matches) {
    if (prevEnd < start) {
      splitted.push(text.substring(prevEnd, start))
    }
    splitted.push(text.substring(start, end))
    prevEnd = end
  }
  if (prevEnd < text.length) {
    splitted.push(text.substring(prevEnd, text.length))
  }

  let curByteIndex = 0
  for (let i = 0; i < splitted.length; i++) {
    const segment = splitted[i]
    if (!segment.startsWith('http')) {
      curByteIndex += encoder.encode(segment).length
      continue
    }
    let newSegment = segment.replace('https://', '').replace('http://', '')
    if (newSegment.length > 25) {
      newSegment = newSegment.slice(0, 25) + '...'
    }
    splitted[i] = newSegment
    const segmentSize = encoder.encode(newSegment).length
    facets.push({
      index: {
        byteStart: curByteIndex,
        byteEnd: curByteIndex + segmentSize
      },
      features: [
        {
          $type: 'app.bsky.richtext.facet#link',
          uri: segment
        }
      ]
    })
    curByteIndex += segmentSize
  }

  return { text: splitted.join(''), facets }
}
