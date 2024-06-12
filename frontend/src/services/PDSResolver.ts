import { isValidHandle } from '@atproto/syntax'
import { HandleResolver, DidResolver } from '@atproto/identity'

export default async function ResolvePDS (authorIdentity: string): Promise<string | undefined> {
  let did = authorIdentity
  if (isValidHandle(authorIdentity)) {
    const resolver = new HandleResolver({})
    const result = await resolver.resolve(authorIdentity)
    if (result === undefined) {
      return undefined
    }
    did = result
  }
  const resolver = new DidResolver({})
  const result = await resolver.resolve(did)
  if (result === null) {
    return undefined
  }
  if (result.service === undefined) {
    return undefined
  }
  for (const entry of result.service) {
    if (entry.id === '#atproto_pds') {
      return new URL(entry.serviceEndpoint as string).host
    }
  }
  return undefined
}
