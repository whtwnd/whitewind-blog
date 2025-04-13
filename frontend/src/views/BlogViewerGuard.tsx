'use client'

import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { createClient } from '@/services/clientUtils'
import { AtUri } from '@atproto/api'
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX
} from 'react'
import { ComWhtwndBlogEntry } from '@/api'
import { MarkdownToHtml } from '@/services/DocProvider'
import { BlogViewerPage } from '@/services/commonComponentUtils'
import { LoadingView } from '@/components/LoadingView'
import { useSetAtom } from 'jotai'
import { getSessionAtom } from '@/atoms'

export interface IBlogViewerGuardProps {
  aturi: string
  cid?: string
}

export const BlogViewerGuard: FC<IBlogViewerGuardProps> = (props) => {
  const authorInfo = useContext(AuthorInfoContext)
  const getSession = useSetAtom(getSessionAtom)
  const [isAuthor, setIsAuthor] = useState<boolean | undefined>(undefined)
  const [mdHtml, setMdHtml] = useState<JSX.Element | undefined>()
  const [docRaw, setDocRaw] = useState<ComWhtwndBlogEntry.Record | undefined>()
  const [scripts, setScripts] = useState<string[]>([])
  const [contentChanged, setContentChanged] = useState(false)
  const fetching = useRef(false)

  const getMdBody = useCallback(async () => {
    if (authorInfo.did === undefined) {
      return
    }
    const client = createClient(authorInfo.pds ?? 'bsky.social')
    const sess = await getSession(authorInfo.did)
    if (sess === undefined || props.aturi === undefined) {
      setIsAuthor(false)
      return
    }
    const aturi = new AtUri(props.aturi)
    let body: Awaited<ReturnType<typeof client.com.whtwnd.blog.entry.get>> | undefined
    try {
      body = await client.com.whtwnd.blog.entry.get({ repo: authorInfo.did, rkey: aturi.rkey, cid: props.cid })
    } catch (err) {
      if (props.cid === undefined) {
        console.error(err)
        throw err
      }
    }
    if (body === undefined && props.cid !== undefined) {
      body = await client.com.whtwnd.blog.entry.get({ repo: authorInfo.did, rkey: aturi.rkey })
      setContentChanged(true)
    }
    if (body === undefined) {
      throw new Error('Could not retrieve entry')
    }
    const docRaw = body.value

    const scripts: string[] = []
    const mdHtml = await MarkdownToHtml(docRaw.content, scripts)
    setMdHtml(mdHtml.result)
    setDocRaw(docRaw)
    setIsAuthor(true)
    setScripts(scripts)
  }, [authorInfo.did, authorInfo.pds, getSession, props.aturi])

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
      return <LoadingView />
    }
    if (!isAuthor || (mdHtml === undefined) || docRaw === undefined || authorInfo.did === undefined) {
      return <></>
    }
    return <BlogViewerPage docRaw={docRaw} authorInfo={authorInfo} aturi={props.aturi ?? ''} scripts={scripts} mdHtml={mdHtml} contentChanged={contentChanged} />
  }, [isAuthor, authorInfo, docRaw, mdHtml, props.aturi, scripts])

  return Elem
}

export default BlogViewerGuard
