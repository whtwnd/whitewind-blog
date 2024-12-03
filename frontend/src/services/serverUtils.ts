import { ComWhtwndBlogEntry } from '@/api'
import { LoadBlogDocument, MarkdownToPlaintext, ResolveEntryMetadata } from '@/services/DocProvider'
import ResolvePDS from '@/services/PDSResolver'
import { IContextWrapperProps } from '@/views/ContextWrapper'
import { BskyAgent, lexToJson } from '@atproto/api'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { DidResolver, HandleResolver } from '@atproto/identity'
import { AtUri, isValidHandle } from '@atproto/syntax'
import { AttributeValue, DynamoDBClient, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb'
import { Metadata } from 'next'
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types'

export async function ResolveAndLoad (authorIdentity: string, entryTitle: string, paramsRkey?: string): Promise<ComWhtwndBlogEntry.Record | undefined> {
  const entryMetadata = await ResolveEntryMetadata(authorIdentity, entryTitle)
  const rkey = (new AtUri(entryMetadata.data.entryUri)).rkey

  if (paramsRkey !== undefined && paramsRkey !== rkey) {
    throw new Error(`Given rkey (${paramsRkey}) and resolved rkey (${rkey}) are different. Falling back to /:authorIdentity/:rkey`)
  }

  const pds = await ResolvePDS(authorIdentity)
  const docRaw = (await LoadBlogDocument(authorIdentity, pds, rkey))?.[0]
  return docRaw
}

export async function GetProfile (actor: string, agent?: BskyAgent): Promise<ProfileViewDetailed | undefined> {
  const client = agent ?? new BskyAgent({ service: 'https://public.api.bsky.app' })
  const result = await client.getProfile({ actor })
  return result.success ? result.data : undefined
}

export interface IPrepareContextArgs {
  ident: string
  rkey?: string
  cid?: string
}
export interface IPrepareContextResult {
  contextWrapperProps: Omit<IContextWrapperProps, 'children'>
  docRaw?: ComWhtwndBlogEntry.Record
}
export async function PrepareContext ({ ident, rkey, cid }: IPrepareContextArgs): Promise<IPrepareContextResult> {
  const pds = await ResolvePDS(ident)

  // prepare context
  const profile = await GetProfile(ident)
  const profileString = profile !== undefined ? lexToJson(profile) as string : undefined

  let did: string
  let handle: string | undefined
  if (profile !== undefined) {
    did = profile.did
    handle = profile.handle
  } else if (isValidHandle(ident)) {
    handle = ident
    const resolver = new HandleResolver()
    const result = await resolver.resolve(ident)
    if (result === undefined) {
      throw new Error('Could not resolve did')
    }
    did = result
  } else {
    did = ident
    const resolver = new DidResolver({})
    const result = await resolver.resolve(ident)
    if (result !== null) {
      handle = result.alsoKnownAs?.[0]
    }
  }

  let entryString: string | undefined
  let docRaw: ComWhtwndBlogEntry.Record | undefined
  if (rkey !== undefined) {
    const ret = await LoadBlogDocument(ident, pds, rkey, cid)
    docRaw = ret?.[0]
    cid = ret?.[1]
    const entry: ComWhtwndBlogEntry.Record | undefined = docRaw !== undefined ? { ...docRaw } : undefined
    entryString = lexToJson(entry) as string
  }

  const contextWrapperProps = {
    pds,
    did,
    handle,
    profileString,
    entryString,
    rkey,
    cid
  }
  return {
    contextWrapperProps,
    docRaw
  }
}

export const GetStats = async (): Promise<Map<string, number>> => {
  const client = new DynamoDBClient({ region: 'ap-northeast-1' })
  // TODO use query instead of scan
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined
  const items: Array<Record<string, AttributeValue>> = []
  do {
    const params: ScanCommandInput = {
      TableName: 'com.whtwnd.blog.mentions',
      ProjectionExpression: 'subjectAtUri',
      ExclusiveStartKey: lastEvaluatedKey
    }
    const command = new ScanCommand(params)
    const data = await client.send(command)
    if (data.Items != null) {
      items.push(...data.Items)
    }
    lastEvaluatedKey = data.LastEvaluatedKey
  } while (lastEvaluatedKey !== undefined)

  // rough estimation of top entries
  const stats = new Map<string, number>()
  items.forEach(item => {
    const subject = item.subjectAtUri.S as string
    stats.set(subject, (stats.get(subject) ?? 0) + 1)
  })
  return stats
}

export async function GenerateMetadata (authorIdentity: string, entryTitle?: string, rkey?: string, cid?: string): Promise<Metadata | undefined> {
  authorIdentity = decodeURIComponent(authorIdentity)
  const agent = new BskyAgent({ service: 'https://public.api.bsky.app' })
  try {
    const profile = await agent.getProfile({ actor: authorIdentity })
    let docRaw: ComWhtwndBlogEntry.Record | undefined
    if (entryTitle !== undefined) {
      entryTitle = decodeURIComponent(entryTitle)
      docRaw = await ResolveAndLoad(authorIdentity, entryTitle)
    } else if (rkey !== undefined) {
      const pds = await ResolvePDS(authorIdentity)
      docRaw = (await LoadBlogDocument(authorIdentity, pds, rkey, cid))?.[0]
    }
    if (docRaw === undefined) {
      return undefined
    }
    entryTitle = docRaw.title
    if (docRaw.isDraft === true || docRaw.visibility === 'author') {
      return { robots: { index: false } }
    }

    const title = `${entryTitle as string} | ${profile.data.displayName ?? authorIdentity}`
    let robots
    const openGraph: OpenGraph = {
      title
    }
    let description = title
    description = String(await MarkdownToPlaintext(docRaw.content))
    if (description.length > 300) {
      description = description.slice(0, 300) + '...'
    }
    if (docRaw.ogp !== undefined) {
      const ogp = docRaw.ogp
      openGraph.images = {
        url: ogp.url,
        width: ogp.width,
        height: ogp.height
      }
    } else {
      const agent = new BskyAgent({ service: 'https://public.api.bsky.app' })
      const profile = await agent.getProfile({ actor: authorIdentity })
      const avatar = profile.data.avatar
      const prefix = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://whtwnd.com'
      let url = `${prefix}/api/og?title=${entryTitle as string}&displayname=${profile.data.displayName ?? '(no name)'}&handle=@${profile.data.handle}`
      if (avatar !== undefined) {
        url += `&avatar=${avatar}`
      }
      openGraph.images = {
        url: new URL(url),
        width: 1200,
        height: 630
      }
    }
    if (docRaw.visibility === 'url') {
      robots = { index: false }
    }
    return {
      title,
      authors: { url: `https://bsky.app/profile/${authorIdentity}`, name: authorIdentity },
      creator: authorIdentity,
      publisher: authorIdentity,
      applicationName: 'WhiteWind',
      openGraph,
      description,
      robots
    }
  } catch (err) {
    console.warn(`Error during getting the article. ${err as string}`)
  }
}
