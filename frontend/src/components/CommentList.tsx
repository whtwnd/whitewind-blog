'use client'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import { AtUri } from '@atproto/syntax'
import { Card } from 'flowbite-react'
import { BskyAgent } from '@atproto/api'
import { ThreadViewPost, isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { createClient, resolvePDSClient } from '@/services/clientUtils'
import { ComWhtwndBlogEntry } from '@/api'
import { isRecord } from '@/api/types/com/whtwnd/blog/entry'
import { BlogEntry, BlogEntryProps } from '@/components/bskyembed/src/components/blogEntry'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Fallback } from '@/components/bskyembed/src/components/fallback'
import { CommentContext } from '@/contexts/CommentContext'
import { BskyCommentTree } from '@/components/BskyCommentTree'

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
      // get mentions
      const mentions = (await appViewClient.current.com.whtwnd.blog.getMentionsByEntry({ postUri: entryUri })).data.mentions
      const mentionAtUris = mentions.map(mention => new AtUri(mention))
      const newThreads: Array<ThreadViewPost | BlogEntryProps | FallbackData> = []
      const agent = new BskyAgent({
        service: 'https://public.api.bsky.app'
      })
      const resolverClient = createClient('bsky.social')

      const authors = [...(new Set(mentionAtUris.map(aturi => aturi.hostname)))]

      // fetch mention bodies
      const postUris: AtUri[] = []
      const entryUris: AtUri[] = []
      const otherUris: AtUri[] = []
      for (const uri of mentionAtUris) {
        if (uri.collection === 'app.bsky.feed.post') {
          postUris.push(uri)
        } else if (uri.collection === 'com.whtwnd.blog.entry') {
          entryUris.push(uri)
        } else {
          otherUris.push(uri)
        }
      }
      type ThreadType = Awaited<ReturnType<BskyAgent['getPostThread']>>['data']['thread']
      interface ThreadOrEntry {
        thread?: ThreadType
        entry?: {
          uri: string
          cid: string
          value: ComWhtwndBlogEntry.Record
        }
        uri?: AtUri
      }
      const threadPromise = Promise.all(postUris.map(async uri => {
        const response = await (agent.getPostThread({
          uri: uri.toString(),
          depth: 1000,
          parentHeight: 0
        }))
        const ret: ThreadOrEntry = { thread: response.data.thread }
        return ret
      }))
      const clientCache = new Map<string, ReturnType<typeof createClient>>()
      const entryPromise = Promise.all(entryUris.map(async uri => {
        const commenterPds = (await resolvePDSClient(uri.hostname, resolverClient)) ?? 'bsky.social'
        let pdsClient = clientCache.get(commenterPds)
        if (pdsClient === undefined) {
          pdsClient = createClient(commenterPds)
          clientCache.set(commenterPds, pdsClient)
        }
        const entry = await pdsClient.com.whtwnd.blog.entry.get({ repo: uri.hostname, rkey: uri.rkey })
        const ret: ThreadOrEntry = { entry }
        return ret
      }))
      const profilePromise = Promise.all(authors.map(async author => await agent.getProfile({ actor: author }).then(resp => resp.data)))
      const [threadOrEntries, entries, rawProfiles] = await Promise.all([
        threadPromise,
        entryPromise,
        profilePromise
      ])
      const profiles = new Map(rawProfiles.map(profile => [profile.did, profile]))

      // render
      threadOrEntries.push(...otherUris.map(uri => ({ uri })))
      threadOrEntries.push(...entries)
      // oldest first (because we will pop this array from tail)
      threadOrEntries.sort((a_, b_) => {
        const now = new Date().toISOString()
        const a = isThreadViewPost(a_.thread) ? a_.thread.post.indexedAt : (isRecord(a_) ? (a_?.value as ComWhtwndBlogEntry.Record).createdAt ?? now : now)
        const b = isThreadViewPost(b_.thread) ? b_.thread.post.indexedAt : (isRecord(b_) ? (b_?.value as ComWhtwndBlogEntry.Record).createdAt ?? now : now)
        if (a < b) {
          return 1
        } else if (a === b) {
          return 0
        } else {
          return -1
        }
      })
      // expand bsky thread
      const seen = new Set<string>()
      while (threadOrEntries.length > 0) {
        const threadOrEntry = threadOrEntries.pop()
        if (threadOrEntry?.uri !== undefined) {
          const uri = threadOrEntry.uri
          if (!seen.has(uri.toString())) {
            const newThread: FallbackData = {
              uri: uri.toString(),
              profile: profiles.get(uri.hostname),
              entry: undefined
            }
            newThreads.push(newThread)
            seen.add(uri.toString())
          }
          continue
        }
        if (isRecord(threadOrEntry?.entry?.value)) {
          const entry = threadOrEntry.entry
          if (!seen.has(entry.uri) && entry.value.visibility === 'public') {
            newThreads.push({
              uri: entry.uri,
              entry: entry.value,
              profile: profiles.get(new AtUri(entry.uri).hostname)
            })
            seen.add(entry.uri)
          }
          continue
        }
        const thread = threadOrEntry?.thread
        if (!isThreadViewPost(thread)) {
          continue
        }
        // bsky thread
        // add only top level thread
        // but visit children to drop duplicates
        // sometimes the same blog entry is mentioned more than once in thread tree
        if (!seen.has(thread.post.uri) && thread.parent === undefined) {
          newThreads.push(thread)
        }
        seen.add(thread.post.uri)

        if (thread.replies === undefined) {
          continue
        }

        for (const reply of thread.replies) {
          if (!isThreadViewPost(reply) || seen.has(reply.post.uri)) {
            continue
          }
          reply.parent = thread
          threadOrEntries.push({ thread: reply })
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
                    return <BskyCommentTree thread={threadOrEntry} key={threadOrEntry.post.uri} />
                  } else if (threadOrEntry?.entry !== undefined) {
                    return <BlogEntry {...threadOrEntry} key={threadOrEntry.uri} />
                  } else {
                    return <Fallback {...threadOrEntry} key={threadOrEntry.uri} />
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
