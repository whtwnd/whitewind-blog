import { ComWhtwndBlogEntry } from '@/api'
import { LoadBlogDocument, MarkdownToPlaintext, ResolveEntryMetadata } from '@/services/DocProvider'
import ResolvePDS from '@/services/PDSResolver'
import { IContextWrapperProps } from '@/views/ContextWrapper'
import { BskyAgent, lexToJson } from '@atproto/api'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { DidResolver, HandleResolver } from '@atproto/identity'
import { AtUri, isValidHandle } from '@atproto/syntax'
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
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
  const params = {
    TableName: 'com.whtwnd.blog.mentions'
  }
  const command = new ScanCommand(params)
  const data = await client.send(command)

  // rough estimation of top entries
  const statsRough = new Map<string, [number, string[]]>()
  data.Items?.forEach(item => {
    const subject = item.subjectAtUri.S as string
    const cur = statsRough.get(subject) ?? [0, [item.postAtUri.S as string]]
    statsRough.set(subject, [cur[0] + 1, [...cur[1], item.postAtUri.S as string]])
  })
  const top15 = Array.from(statsRough.entries())
    .sort((a, b) => {
      return -a[1][0] + b[1][0]
    })
    .slice(0, 15)
  const flattened: Array<{ subject: string, uri: string }> = []
  for (const [subject, [count, uris]] of top15) {
    void count
    for (const uri of uris) {
      flattened.push({ subject, uri })
    }
  }

  const stats = new Map<string, number>()
  const agent = new BskyAgent({ service: 'https://public.api.bsky.app' })
  const threads = await Promise.all(flattened.map(async ({ subject, uri }) => {
    if (new AtUri(uri).collection !== 'app.bsky.feed.post') {
      return undefined
    }
    try {
      const result = await agent.getPostThread({
        uri,
        parentHeight: 0,
        depth: 1000
      })
      return { uri: subject, data: result.data }
    } catch (err) {
      console.error(err)
      return undefined
    }
  }) ?? [])

  const seen = new Set<string>()
  if (threads === undefined) {
    return stats
  }
  while (threads.length > 0) {
    const t = threads.pop()
    if (t === undefined) {
      continue
    }
    const { uri, data } = t
    if (!isThreadViewPost(data.thread)) {
      continue
    }
    if (!seen.has(data.thread.post.uri)) {
      stats.set(uri, (stats.get(uri) ?? 0) + 1)
    }
    seen.add(data.thread.post.uri)
    data.thread.replies?.forEach(reply => {
      threads.push({ uri, data: { success: true, thread: reply } })
    })
  }
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
