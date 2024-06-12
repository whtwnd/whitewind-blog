'use client'

import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { SessionContext } from '@/contexts/SessionContext'
import { createClient } from '@/services/clientUtils'
import BlogListView from '@/views/BlogListView'
import { Spinner } from 'flowbite-react'
import { FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export interface IBlogListViewClientProps {
  children: ReactNode
  hasNonPublic: boolean
  stats: Map<string, number>
}

export const BlogListViewClient: FC<IBlogListViewClientProps> = ({ children, hasNonPublic, stats }) => {
  const authorInfo = useContext(AuthorInfoContext)
  const manager = useContext(SessionContext)
  const [isAuthor, setIsAuthor] = useState<boolean | undefined>(undefined)
  const LoadingCache = useMemo(() => (
    <div className='flex flex-row gap-4 justify-center items-center'>
      <Spinner size='lg' theme={{ color: { info: 'fill-sky-400' } }} />
      <p className='text-gray-400 text-lg'>Loading...</p>
    </div>
  )
  , [])

  // has draft
  // check if the user has session of the author
  useEffect(() => {
    if (!hasNonPublic || authorInfo.did === undefined) {
      setIsAuthor(false)
      return
    }
    const client = createClient(authorInfo.pds ?? 'bsky.social')
    void manager.getSession(authorInfo.did, client).then(result => {
      setIsAuthor(result !== undefined)
    })
  }, [hasNonPublic, manager, authorInfo])
  if (isAuthor === undefined) {
    return LoadingCache
  }

  return !isAuthor || !hasNonPublic ? children : <BlogListView authorInfo={authorInfo} allowNonPublic stats={stats} />
}

export default BlogListViewClient
