'use client'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import { AtUri } from '@atproto/syntax'
import { Card } from 'flowbite-react'
import { BskyAgent } from '@atproto/api'
import { ThreadViewPost, isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { createClient, resolvePDSClient } from '@/services/clientUtils'
import { BlueLinkatBoard, ComWhtwndBlogEntry } from '@/api'
import { isRecord as isWhtwndRecord } from '@/api/types/com/whtwnd/blog/entry'
import { isRecord as isLinkatBoardRecord } from '@/api/types/blue/linkat/board'
import { BlogEntry, BlogEntryProps } from '@/components/bskyembed/src/components/blogEntry'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Fallback } from '@/components/bskyembed/src/components/fallback'
import { CommentContext } from '@/contexts/CommentContext'
import { BskyCommentTree } from '@/components/BskyCommentTree'
import { LinkatBoard, LinkatBoardProps } from '@/components/bskyembed/src/components/linkatEntry'

export interface FallbackData {
  uri: string
  profile?: ProfileViewDetailed
  entry: undefined
}

export const CommentList: FC<{ entryUri: string, pds?: string }> = ({ entryUri }) => {
  const [threads, setThreads] = useState<Array<ThreadViewPost | BlogEntryProps | LinkatBoardProps | FallbackData>>([])
  const appViewClient = useRef(createClient(process.env.NEXT_PUBLIC_API_HOSTNAME as string))
  const promise = useRef<Promise<void> | undefined>()
  const { setComments } = useContext(CommentContext)

  useEffect(() => {
    async function Load (): Promise<void> {
      // get mentions
      const mentions = (await appViewClient.current.com.whtwnd.blog.getMentionsByEntry({ postUri: entryUri })).data.mentions
      const mentionAtUris = mentions.map(mention => new AtUri(mention))
      const newThreads: typeof threads = []
      const agent = new BskyAgent({
        service: 'https://public.api.bsky.app'
      })
      const resolverClient = createClient('bsky.social')

      const authors = [...(new Set(mentionAtUris.map(aturi => aturi.hostname)))]

      // fetch mention bodies
      const postUris: AtUri[] = []
      const entryUris: AtUri[] = []
      const linkatUris: AtUri[] = []
      const otherUris: AtUri[] = []
      for (const uri of mentionAtUris) {
        if (uri.collection === 'app.bsky.feed.post') {
          postUris.push(uri)
        } else if (uri.collection === 'com.whtwnd.blog.entry') {
          entryUris.push(uri)
        } else if (uri.collection === 'blue.linkat.board') {
          linkatUris.push(uri)
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
        board?: {
          uri: string
          cid: string
          value: BlueLinkatBoard.Record
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
      const linkatPromise = Promise.all(linkatUris.map(async uri => {
        const commenterPds = (await resolvePDSClient(uri.hostname, resolverClient)) ?? 'bsky.social'
        let pdsClient = clientCache.get(commenterPds)
        if (pdsClient === undefined) {
          pdsClient = createClient(commenterPds)
          clientCache.set(commenterPds, pdsClient)
        }
        const board = await pdsClient.blue.linkat.board.get({ repo: uri.hostname, rkey: uri.rkey })
        const ret: ThreadOrEntry = { board }
        return ret
      }))
      const profilePromise = Promise.all(authors.map(async author => await agent.getProfile({ actor: author }).then(resp => resp.data)))
      const [threadOrEntries, entries, boards, rawProfiles] = await Promise.all([
        threadPromise,
        entryPromise,
        linkatPromise,
        profilePromise
      ])
      const profiles = new Map(rawProfiles.map(profile => [profile.did, profile]))

      // render
      threadOrEntries.push(...otherUris.map(uri => ({ uri })))
      threadOrEntries.push(...entries)
      threadOrEntries.push(...boards)
      // oldest first (because we will pop this array from tail)
      threadOrEntries.sort((a_, b_) => {
        const now = new Date().toISOString()
        const a = isThreadViewPost(a_.thread) ? a_.thread.post.indexedAt : (isWhtwndRecord(a_) ? (a_?.value as ComWhtwndBlogEntry.Record).createdAt ?? now : now)
        const b = isThreadViewPost(b_.thread) ? b_.thread.post.indexedAt : (isWhtwndRecord(b_) ? (b_?.value as ComWhtwndBlogEntry.Record).createdAt ?? now : now)
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
        if (isWhtwndRecord(threadOrEntry?.entry?.value)) {
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
        } else if (isLinkatBoardRecord(threadOrEntry?.board?.value)) {
          const board = threadOrEntry.board
          newThreads.push({
            uri: board.uri,
            entry: board.value,
            profile: profiles.get(new AtUri(board.uri).hostname)
          })
          seen.add(board.uri)
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
                  } else if (isWhtwndRecord(threadOrEntry.entry)) {
                    return <BlogEntry {...(threadOrEntry as BlogEntryProps)} key={threadOrEntry.uri} />
                  } else if (isLinkatBoardRecord(threadOrEntry.entry)) {
                    return <LinkatBoard {...(threadOrEntry as LinkatBoardProps)} key={threadOrEntry.uri} />
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
