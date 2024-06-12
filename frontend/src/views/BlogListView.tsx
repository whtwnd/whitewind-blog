import { useMemo } from 'react'
import * as React from 'react'
import { Spinner } from 'flowbite-react'
import type { Record } from '@/api/types/com/atproto/repo/listRecords'
import type { Record as BlogEntry } from '@/api/types/com/whtwnd/blog/entry'
import { AtUri } from '@atproto/syntax'
import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import { IEntryContextValue } from '@/contexts/EntryContext'
import BlogCard from '@/components/BlogCard'
import { BlogListViewClient } from '@/views/BlogListViewClient'
import { requestUntilGetAll } from '@/services/commonUtils'

const compareEntries = (entryA: BlogEntry, entryB: BlogEntry): number => {
  // descendant order
  // -1: entryA should come before entryB (entryA is later than entryB)
  // 1: entryB should come before entryA (entryA is earlier than entryB)
  if (entryA.createdAt !== undefined && entryB.createdAt !== undefined) {
    return entryA.createdAt < entryB.createdAt ? 1 : entryA.createdAt === entryB.createdAt ? 0 : -1
  } else if (entryA.createdAt === undefined && entryB.createdAt !== undefined) {
    return 1
  } else if (entryA.createdAt !== undefined && entryB.createdAt === undefined) {
    return -1
  } else if (entryA.title !== undefined && entryB.title !== undefined) {
    return entryA.title < entryB.title ? -1 : entryA.title === entryB.title ? 0 : 1
  } else if (entryA.title === undefined && entryB.title !== undefined) {
    return 1
  } else if (entryA.title !== undefined && entryB.title === undefined) {
    return -1
  } else {
    return 0
  }
}

const generateBlogListImpl = (authorInfo: IAuthorInfoContextValue, allowNonPublic: boolean, stats: Map<string, number>): React.FC => {
  if (authorInfo.did === undefined) {
    return () => <h2>Must specify author</h2>
  }
  const ident = authorInfo.handle ?? authorInfo.did

  const listRecordsPromise = Promise.all([requestUntilGetAll(authorInfo), stats])
  let listRecordsResponse: Record[] | undefined

  const BlogListImpl: React.FC = () => {
    if (listRecordsResponse === undefined) {
      // eslint-disable-next-line
      throw listRecordsPromise.then(([resp, statsResult]) => { listRecordsResponse = resp; stats = statsResult })
    }

    // determine href
    // uri to title
    const hrefs = new Map<string, string>()
    const seenTitles = new Set<string>()
    listRecordsResponse = listRecordsResponse.sort((a, b) => compareEntries(a.value as BlogEntry, b.value as BlogEntry))
    let hasNonPublic = false
    for (const record of listRecordsResponse) {
      const entry = record.value as BlogEntry
      const uri = new AtUri(record.uri)
      if (entry.title !== undefined && !seenTitles.has(entry.title)) {
        seenTitles.add(entry.title)
        hrefs.set(record.uri, `/${ident}/entries/${entry.title}?rkey=${uri.rkey}`)
      } else {
        hrefs.set(record.uri, `/${ident}/${uri.rkey}`)
      }
      hasNonPublic = hasNonPublic || (entry.isDraft === true || entry.visibility !== 'public')
    }
    if (allowNonPublic || !hasNonPublic) {
      return (
        <div className='px-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {listRecordsResponse.map((record, i) => {
            const entry = record.value as BlogEntry
            const entryInfo: IEntryContextValue = { entry, rkey: new AtUri(record.uri).rkey, comments: stats?.get(record.uri) }
            return (
              <BlogCard
                authorInfo={authorInfo}
                entryInfo={entryInfo}
                key={i}
              />
            )
          })}
        </div>
      )
    }
    // not allow draft
    return (
      <BlogListViewClient hasNonPublic={hasNonPublic} stats={stats}>
        <div className='px-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {listRecordsResponse.filter(record => {
            const entry = record.value as BlogEntry
            return entry.isDraft !== true && (entry.visibility === undefined || entry.visibility === 'public')
          }).map((record, i) => {
            const entry = record.value as BlogEntry
            const entryInfo: IEntryContextValue = { entry, rkey: new AtUri(record.uri).rkey, comments: stats?.get(record.uri) }
            return (
              <BlogCard
                authorInfo={authorInfo}
                entryInfo={entryInfo}
                key={i}
              />
            )
          })}
        </div>
      </BlogListViewClient>
    )
  }
  return BlogListImpl
}

interface BlogListViewProps {
  authorInfo: IAuthorInfoContextValue
  allowNonPublic?: boolean
  stats: Map<string, number>
}

const LoadingFallback: React.FC = () => {
  return (
    <div className='flex flex-row gap-4 justify-center items-center'>
      <Spinner size='lg' theme={{ color: { info: 'fill-sky-400' } }} />
      <p className='text-gray-400 text-lg'>Loading...</p>
    </div>
  )
}

const BlogListView: React.FC<BlogListViewProps> = ({ authorInfo, allowNonPublic, stats }) => {
  const BlogList = useMemo(() => generateBlogListImpl(authorInfo, allowNonPublic === true, stats), [authorInfo, allowNonPublic, stats])

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <BlogList />
    </React.Suspense>
  )
}

export default BlogListView
