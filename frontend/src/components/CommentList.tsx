'use client'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import { AtUri } from '@atproto/syntax'
import { Card } from 'flowbite-react'
import { BskyCommentImpl } from '@/components/BskyComment'
import { BskyAgent } from '@atproto/api'
import { ThreadViewPost, isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { createClient, resolvePDSClient } from '@/services/clientUtils'
import { ComWhtwndBlogEntry } from '@/api'
import { isRecord } from '@/api/types/com/whtwnd/blog/entry'
import { BlogEntry, BlogEntryProps } from '@/components/bskyembed/src/components/blogEntry'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Fallback } from '@/components/bskyembed/src/components/fallback'
import { CommentContext } from '@/contexts/CommentContext'

export interface FallbackData {
  uri: string
  profile?: ProfileViewDetailed
  entry: undefined
}

export const CommentList: FC<{ entryUri: string, pds?: string }> = ({ entryUri }) => {
  const [threads, setThreads] = useState<Array<ThreadViewPost | BlogEntryProps | FallbackData>>([])
  const appViewClient = useRef(createClient(process.env.NEXT_PUBLIC_API_HOSTNAME as string))
  const promise = useRef<Promise<void> | undefined>()
  const { setComments } = useContext(CommentContext)

  useEffect(() => {
    async function Load (): Promise<void> {
      const mentions = (await appViewClient.current.com.whtwnd.blog.getMentionsByEntry({ postUri: entryUri })).data.mentions
      const mentionAtUris = mentions.map(mention => new AtUri(mention))
      const newThreads: Array<ThreadViewPost | BlogEntryProps | FallbackData> = []
      const agent = new BskyAgent({
        service: 'https://public.api.bsky.app'
      })
      const resolverClient = createClient('bsky.social')

      const authors = [...(new Set(mentionAtUris.map(aturi => aturi.hostname)))]

      const [threadOrEntries, rawProfiles] = await Promise.all([
        Promise.all(mentionAtUris
          .map(async uri => {
            if (uri.collection === 'app.bsky.feed.post') {
              return await (agent.getPostThread({
                uri: uri.toString(),
                depth: 1000,
                parentHeight: 0
              })).then(resp => resp.data.thread)
            } else if (uri.collection === 'com.whtwnd.blog.entry') {
              return await resolvePDSClient(uri.hostname, resolverClient).then(async commenterPds => {
                console.log(commenterPds)
                const pdsClient = createClient(commenterPds ?? 'bsky.social')
                return await pdsClient.com.whtwnd.blog.entry.get({ repo: uri.hostname, rkey: uri.rkey })
              })
            } else {
              return await Promise.resolve(uri)
            }
          })),
        Promise.all(authors.map(async author => await agent.getProfile({ actor: author }).then(resp => resp.data)))])
      const profiles = new Map(rawProfiles.map(profile => [profile.did, profile]))
      threadOrEntries.sort((a_, b_) => {
        const now = new Date().toISOString()
        const a = isThreadViewPost(a_) ? a_.post.indexedAt : (isRecord(a_) ? (a_?.value as ComWhtwndBlogEntry.Record).createdAt ?? now : now)
        const b = isThreadViewPost(b_) ? b_.post.indexedAt : (isRecord(b_) ? (b_?.value as ComWhtwndBlogEntry.Record).createdAt ?? now : now)
        if (a < b) {
          return 1
        } else if (a === b) {
          return 0
        } else {
          return -1
        }
      })
      const seen = new Set<string>()
      while (threadOrEntries.length > 0) {
        const threadOrEntry = threadOrEntries.pop()
        if (threadOrEntry instanceof AtUri) {
          if (!seen.has(threadOrEntry.toString())) {
            const newThread: FallbackData = {
              uri: threadOrEntry.toString(),
              profile: profiles.get(threadOrEntry.hostname),
              entry: undefined
            }
            newThreads.push(newThread)
            seen.add(threadOrEntry.toString())
          }
          continue
        }
        if (isRecord(threadOrEntry?.value)) {
          const entry = threadOrEntry as { uri: string, cid: string, value: ComWhtwndBlogEntry.Record }
          if (!seen.has(entry.uri)) {
            newThreads.push({
              uri: entry.uri,
              entry: entry.value,
              profile: profiles.get(new AtUri(entry.uri).hostname)
            })
            seen.add(entry.uri)
          }
          continue
        }
        if (!isThreadViewPost(threadOrEntry)) {
          continue
        }
        if (!seen.has(threadOrEntry.post.uri)) {
          newThreads.push(threadOrEntry)
          seen.add(threadOrEntry.post.uri)
        }

        if (threadOrEntry.replies === undefined) {
          continue
        }

        for (const reply of threadOrEntry.replies) {
          if (!isThreadViewPost(reply) || seen.has(reply.post.uri)) {
            continue
          }
          threadOrEntries.push(reply)
        }
      }
      setThreads(newThreads)
      setComments(newThreads)
    }
    if (promise.current === undefined) {
      promise.current = Load()
    }
  }, [entryUri, setComments])

  return (
    <Card>
      <h3 className='pb-1 text-xl font-semibold text-gray-700'>Reactions from everyone ({threads.length})</h3>
      {
            threads.length > 0 &&
              <div className='flex flex-col border-t border-gray-300 overflow-auto'>
                {threads.map(threadOrEntry => {
                  if (isThreadViewPost(threadOrEntry)) {
                    return <BskyCommentImpl thread={threadOrEntry} key={threadOrEntry.post.uri} />
                  } else if (threadOrEntry?.entry !== undefined) {
                    return <div className='bskyComment' key={threadOrEntry.uri}><BlogEntry {...threadOrEntry} key={threadOrEntry.uri} /></div>
                  } else {
                    return <div className='bskyComment' key={threadOrEntry.uri}><Fallback {...threadOrEntry} key={threadOrEntry.uri} /></div>
                  }
                }
                )}
              </div>
        }
    </Card>
  )
}

export default CommentList
