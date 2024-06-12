'use client'

import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { SessionContext } from '@/contexts/SessionContext'
import { createClient } from '@/services/clientUtils'
import BlogViewer, { BlogViewerProps } from '@/views/BlogViewer'
import { AtUri } from '@atproto/api'
import { Spinner } from 'flowbite-react'
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ComWhtwndBlogEntry } from '@/api'
import { MarkdownToHtml } from '@/services/DocProvider'
import { NO_THEME, ThemeMapping } from '@/components/themes'

export const BlogViewerGuard: FC<Omit<BlogViewerProps, 'mdHtml'>> = (props) => {
  const authorInfo = useContext(AuthorInfoContext)
  const manager = useContext(SessionContext)
  const [isAuthor, setIsAuthor] = useState<boolean | undefined>(undefined)
  const [mdHtml, setMdHtml] = useState<JSX.Element | undefined>()
  const [theme, setTheme] = useState<ComWhtwndBlogEntry.Record['theme']>()
  const fetching = useRef(false)
  const LoadingCache = useMemo(() => (
    <div className='flex flex-row gap-4 justify-center items-center'>
      <Spinner size='lg' theme={{ color: { info: 'fill-sky-400' } }} />
      <p className='text-gray-400 text-lg'>Loading...</p>
    </div>
  ), [])

  const getMdBody = useCallback(async () => {
    if (authorInfo.did === undefined) {
      return
    }
    const client = createClient(authorInfo.pds ?? 'bsky.social')
    const sess = await manager.getSession(authorInfo.did, client)
    if (sess === undefined || props.aturi === undefined) {
      setIsAuthor(false)
      return
    }
    const aturi = new AtUri(props.aturi)
    const body = await client.com.whtwnd.blog.entry.get({ repo: authorInfo.did, rkey: aturi.rkey })
    const docRaw = body.value

    const scripts: string[] = []
    const mdHtml = await MarkdownToHtml(docRaw.content, scripts)
    setMdHtml(mdHtml.result)
    setTheme(docRaw.theme)
    setIsAuthor(true)
  }, [authorInfo.did, authorInfo.pds, manager, props.aturi])

  // has draft
  // check if the user has session of the author
  useEffect(() => {
    if (authorInfo.did === undefined) {
      setIsAuthor(false)
      return
    }
    if (fetching.current) {
      return
    }
    fetching.current = true
    void getMdBody()
  }, [getMdBody, authorInfo.did])
  if (isAuthor === undefined) {
    return LoadingCache
  }

  return !isAuthor || (mdHtml === undefined) ? <></> : <BlogViewer {...props} mdHtml={mdHtml} theme={ThemeMapping.get(theme ?? NO_THEME)} />
}

export default BlogViewerGuard
