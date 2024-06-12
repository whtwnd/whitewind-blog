'use client'

import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { SessionContext } from '@/contexts/SessionContext'
import { createClient } from '@/services/clientUtils'
import { BlogViewerProps } from '@/views/BlogViewer'
import { AtUri } from '@atproto/api'
import { Spinner } from 'flowbite-react'
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ComWhtwndBlogEntry } from '@/api'
import { MarkdownToHtml } from '@/services/DocProvider'
import { BlogViewerPage } from '@/services/commonComponentUtils'
import Header from '@/components/Headers/Header'

export const BlogViewerGuard: FC<Omit<BlogViewerProps, 'mdHtml'>> = (props) => {
  const authorInfo = useContext(AuthorInfoContext)
  const manager = useContext(SessionContext)
  const [isAuthor, setIsAuthor] = useState<boolean | undefined>(undefined)
  const [mdHtml, setMdHtml] = useState<JSX.Element | undefined>()
  const [docRaw, setDocRaw] = useState<ComWhtwndBlogEntry.Record | undefined>()
  const [scripts, setScripts] = useState<string[]>([])
  const fetching = useRef(false)
  const LoadingCache = useMemo(() => (
    <div className='flex flex-col h-screen'>
      <Header />
      <div className='flex flex-col justify-center items-center h-full'>
        <div className='flex flex-row gap-4'>
          <Spinner size='lg' theme={{ color: { info: 'fill-sky-400' } }} />
          <p className='text-gray-400 text-lg'>Loading...</p>
        </div>
      </div>
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
    setDocRaw(docRaw)
    setIsAuthor(true)
    setScripts(scripts)
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

  const Elem = useMemo(() => {
    if (isAuthor === undefined) {
      return LoadingCache
    }
    if (!isAuthor || (mdHtml === undefined) || docRaw === undefined || authorInfo.did === undefined) {
      return <></>
    }
    return <BlogViewerPage docRaw={docRaw} authorInfo={authorInfo} aturi={props.aturi ?? ''} scripts={scripts} mdHtml={mdHtml} />
  }, [isAuthor, LoadingCache, authorInfo, docRaw, mdHtml, props.aturi, scripts])

  return Elem
}

export default BlogViewerGuard
