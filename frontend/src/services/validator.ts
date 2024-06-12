import { createClient, transformPost } from '@/services/clientUtils'
import { ensureValidDid, isValidHandle } from '@atproto/syntax'

export const validatePdsHost = async (value: string | boolean | number | undefined): Promise<string | true> => {
  if (typeof value !== 'string') {
    return 'invalid data type for PDS hostname'
  }
  if (value !== undefined) {
    try {
      await createClient(value).com.atproto.server.describeServer()
      return true
    } catch {
      // do nothing
    }
  }
  return 'invalid hostname'
}
export const validateIdentity = async (value: string | boolean | number | undefined): Promise<string | true> => {
  if (typeof value !== 'string') {
    return 'invalid type for handle or DID'
  }
  if (value === undefined) {
    return 'Input either your handle or DID'
  }
  // is it handle?
  if (isValidHandle(value)) {
    return true
  } else {
    // const resolver = new DidResolver({})
    try {
      ensureValidDid(value)
      if (value.startsWith('did:plc')) {
        const result = await fetch(`https://plc.directory/${value}`)
        if (!result.ok) {
          return 'Invalid DID'
        }
        return true
      } else if (value.startsWith('did:web')) {
        const hostname = value.replace('did:web:', '').replace(':', '/')
        const url = new URL(`https://${hostname}/.well-known/did.json`)
        const json = await (await fetch(url)).json()
        if (json.did !== value) {
          return 'Invalid DID'
        }
        return true
      }
    } catch {
      return 'Invalid DID'
    }
    return true
  }
}

export const validateTitle = async (value: string | boolean | number | undefined): Promise<string | true> => {
  if (typeof value !== 'string') {
    return 'Invalid type for title'
  }
  return (value.length < 1000) || 'Title length must be <1000'
}

export const validateOGPURL = async (value: string | boolean | number | undefined): Promise<string | true> => {
  if (value === undefined || (typeof value === 'string' && value.length === 0)) {
    return true
  }
  if (typeof value !== 'string') {
    return 'invalid type for OGP URL'
  }
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' || 'URL protocol must be http or https'
  } catch (err) {
    // do nothing
  }
  return 'OGP URL must be http or https URL'
}

export const validateOGPDimension = async (value: string | boolean | number | undefined): Promise<string | true> => {
  if (value === undefined || (typeof value === 'string' && value.length === 0)) {
    return true
  }
  if (typeof value !== 'string') {
    return 'Invalid type for OGP dimension'
  }
  return Number.isInteger(Number(value)) || 'OGP width and height must be integer'
}

export const validateContent = async (value: string | boolean | number | undefined): Promise<string | true> => {
  if (typeof value !== 'string') {
    throw new Error('Unexpected boolean value')
  }
  if (value === undefined) {
    return 'Please fill post message'
  }

  const { text } = transformPost(value)
  if (text.length > 300) {
    return `Content too long (${text.length} > 300)`
  }
  return true
}
