'use client'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import { AtUri } from '@atproto/syntax'
import { Card } from 'flowbite-react'
import { BskyAgent } from '@atproto/api'
import { BlockedPost, NotFoundPost, ThreadViewPost, isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { createClient, resolvePDSClient } from '@/services/clientUtils'
import { BlueLinkatBoard, ComWhtwndBlogEntry, FyiUnravelFrontpagePost } from '@/api'
import { isRecord as isWhtwndRecord } from '@/api/types/com/whtwnd/blog/entry'
import { isRecord as isLinkatBoardRecord } from '@/api/types/blue/linkat/board'
import { BlogEntry } from '@/components/bskyembed/src/components/blogEntry'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Fallback } from '@/components/bskyembed/src/components/fallback'
import { CommentContext } from '@/contexts/CommentContext'
import { BskyCommentTree } from '@/components/BskyCommentTree'
import { LinkatBoard } from '@/components/bskyembed/src/components/linkatEntry'
import { isRecord as isFrontpagePostRecord } from '@/api/types/fyi/unravel/frontpage/post'
import { FrontpagePost } from '@/components/bskyembed/src/components/frontpagePost'

interface MentioningRecord {
  uri: AtUri
  date: string
  profile?: ProfileViewDetailed
  bsky?: ThreadViewPost | NotFoundPost | BlockedPost | {}
  whtwnd?: ComWhtwndBlogEntry.Record
  linkat?: BlueLinkatBoard.Record
  frontpage?: FyiUnravelFrontpagePost.Record
}

export interface FallbackData {
  uri: string
  profile?: ProfileViewDetailed
  entry: undefined
}

export const CommentList: FC<{ entryUri: string, pds?: string }> = ({ entryUri }) => {
  const [mentions, setMentions] = useState<MentioningRecord[]>([])
  const appViewClient = useRef(createClient(process.env.NEXT_PUBLIC_API_HOSTNAME as string))
  const promise = useRef<Promise<void> | undefined>()
  const { setComments } = useContext(CommentContext)

  useEffect(() => {
    async function Load (): Promise<void> {
      // get mentions
      const mentionUris = (await appViewClient.current.com.whtwnd.blog.getMentionsByEntry({ postUri: entryUri })).data.mentions
      const mentionAtUris = mentionUris.map(mention => new AtUri(mention))
      const newMentions: typeof mentions = []
      const agent = new BskyAgent({
        service: 'https://public.api.bsky.app'
      })
      const resolverClient = createClient('bsky.social')

      const authors = [...(new Set(mentionAtUris.map(aturi => aturi.hostname)))]

      // fetch mention bodies
      const clientCache = new Map<string, ReturnType<typeof createClient>>()
      const mentionPromise: Promise<MentioningRecord[]> = Promise.all(mentionAtUris.map(async uri => {
        if (uri.collection === 'app.bsky.feed.post') {
          const response = await (agent.getPostThread({
            uri: uri.toString(),
            depth: 1000,
            parentHeight: 0
          }))
          const date = isThreadViewPost(response.data.thread) ? response.data.thread.post.indexedAt : new Date().toISOString()
          const ret = {
            uri,
            date,
            bsky: response.data.thread
          }
          return ret
        }

        const commenterPds = (await resolvePDSClient(uri.hostname, resolverClient)) ?? 'bsky.social'
        let pdsClient = clientCache.get(commenterPds)
        if (pdsClient === undefined) {
          pdsClient = createClient(commenterPds)
          clientCache.set(commenterPds, pdsClient)
        }

        const now = new Date().toISOString()

        const { data: { value } } = await pdsClient.com.atproto.repo.getRecord({ repo: uri.hostname, collection: uri.collection, rkey: uri.rkey })
        if (isWhtwndRecord(value)) {
          return {
            uri,
            date: value.createdAt ?? now,
            whtwnd: value
          }
        } else if (isLinkatBoardRecord(value)) {
          return {
            uri,
            date: now,
            linkat: value
          }
        } else if (isFrontpagePostRecord(value)) {
          return {
            uri, date: value.createdAt, frontpage: value
          }
        } else {
          return { uri, date: now } // will show fallback
        }
      }))
      const profilePromise = Promise.all(authors.map(async author => await agent.getProfile({ actor: author }).then(resp => resp.data)))
      const [mentions, rawProfiles] = await Promise.all([
        mentionPromise,
        profilePromise
      ])
      const profiles = new Map(rawProfiles.map(profile => [profile.did, profile]))

      // render
      // oldest first (because we will pop this array from tail)
      mentions.sort((a, b) => a.date < b.date ? 1 : a.date === b.date ? 0 : -1)
      // expand bsky thread
      const seen = new Set<string>()
      while (mentions.length > 0) {
        const mention = mentions.pop()
        if (mention === undefined) {
          continue
        }
        if (profiles.has(mention.uri.hostname)) {
          mention.profile = profiles.get(mention.uri.hostname)
        }
        if (!isThreadViewPost(mention.bsky)) {
          newMentions.push(mention)
          seen.add(mention.uri.toString())
          continue
        }
        // bsky thread
        // add only top level thread
        // but visit children to drop duplicates
        // sometimes the same blog entry is mentioned more than once in thread tree
        if (!seen.has(mention.bsky.post.uri) && mention.bsky.parent === undefined) {
          newMentions.push(mention)
        }
        seen.add(mention.uri.toString())

        if (mention.bsky.replies === undefined) {
          continue
        }

        for (const reply of mention.bsky.replies) {
          if (!isThreadViewPost(reply) || seen.has(reply.post.uri)) {
            continue
          }
          reply.parent = mention.bsky
          mentions.push({ bsky: reply, uri: new AtUri(reply.post.uri), date: reply.post.indexedAt })
        }
      }
      setMentions(newMentions)
      setComments(newMentions)
    }
    if (promise.current === undefined) {
      promise.current = Load()
    }
  }, [entryUri, setComments])

  return (
    <Card>
      <h3 className='pb-1 text-xl font-semibold text-gray-700'>Reactions from everyone ({mentions.length})</h3>
      {
            mentions.length > 0 &&
              <div className='flex flex-col border-t border-gray-300 overflow-auto'>
                {mentions.map(mention => {
                  const uri = mention.uri.toString()
                  if (isThreadViewPost(mention.bsky)) {
                    return <BskyCommentTree thread={mention.bsky} key={uri} />
                  } else if (mention.whtwnd !== undefined) {
                    return <BlogEntry uri={uri} entry={mention.whtwnd} profile={mention.profile} key={uri} />
                  } else if (mention.linkat !== undefined) {
                    return <LinkatBoard uri={uri} entry={mention.linkat} profile={mention.profile} key={uri} />
                  } else if (mention.frontpage !== undefined) {
                    return <FrontpagePost uri={uri} post={mention.frontpage} profile={mention.profile} key={uri} />
                  } else {
                    return <Fallback uri={uri} key={uri} profile={mention.profile} />
                  }
                }
                )}
                <div className='pl-[40px]' />
                <div className='pl-[80px]' />
                <div className='pl-[120px]' />
                <div className='pl-[160px]' />
                <div className='pl-[200px]' />
                <div className='pl-[240px]' />
                <div className='pl-[280px]' />
                <div className='pl-[320px]' />
                <div className='pl-[360px]' />
                <div className='pl-[400px]' />
              </div>
        }
    </Card>
  )
}

export default CommentList
