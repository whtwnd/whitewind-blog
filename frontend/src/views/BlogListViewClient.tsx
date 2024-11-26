'use client'

import { getSessionAtom } from '@/atoms'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import BlogListView from '@/views/BlogListView'
import { Spinner } from 'flowbite-react'
import { useSetAtom } from 'jotai'
import React, { FC, useContext, useEffect, useMemo, useState } from 'react'

export interface IBlogListViewClientProps {
  children: React.JSX.Element
  hasNonPublic: boolean
  stats: Map<string, number>
}

export const BlogListViewClient: FC<IBlogListViewClientProps> = ({ children, hasNonPublic, stats }) => {
  const authorInfo = useContext(AuthorInfoContext)
  const getSession = useSetAtom(getSessionAtom)
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
    void getSession(authorInfo.did).then(result => {
      setIsAuthor(result !== undefined)
    })
  }, [hasNonPublic, getSession, authorInfo])
  if (isAuthor === undefined) {
    return LoadingCache
  }

  return !isAuthor || !hasNonPublic ? children : <BlogListView authorInfo={authorInfo} allowNonPublic stats={stats} />
}

export default BlogListViewClient
