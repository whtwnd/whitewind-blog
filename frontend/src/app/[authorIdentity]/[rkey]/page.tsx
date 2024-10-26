import { headers } from 'next/headers'

import { MarkdownToHtml } from '@/services/DocProvider'
import { GenerateMetadata, PrepareContext } from '@/services/serverUtils'
import { ContextWrapper } from '@/views/ContextWrapper'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { jsonToLex } from '@atproto/lexicon'
import { Metadata } from 'next'

import { notFound } from 'next/navigation'
import BlogViewerGuard from '@/views/BlogViewerGuard'
import { BlogViewerPage } from '@/services/commonComponentUtils'

export const fetchCache = 'default-no-store'

interface IPageProps {
  params: { authorIdentity: string, rkey: string }
}
export async function generateMetadata ({ params }: IPageProps): Promise<Metadata | undefined> {
  return await GenerateMetadata(params.authorIdentity, undefined, params.rkey)
}

export default async function Page ({ params: { authorIdentity, rkey } }: { params: { authorIdentity: string, rkey: string } }): Promise<JSX.Element> {
  return await PageSkeleton(authorIdentity, rkey)
}

export async function PageSkeleton (authorIdentity: string, rkey: string, cid?: string): Promise<JSX.Element> {
  const ident = decodeURIComponent(authorIdentity)

  let { contextWrapperProps, docRaw } = await PrepareContext({ ident, rkey, cid })
  let contentChanged = false
  if (docRaw === undefined && cid !== undefined) {
    // fallback if entry is not found and cid is specified
    const result = (await PrepareContext({ ident, rkey }))
    contextWrapperProps = result.contextWrapperProps
    docRaw = result.docRaw
    if (contextWrapperProps !== undefined) {
      contentChanged = true
    }
  }
  if (contextWrapperProps.did === undefined) {
    throw new Error(`Could not find did for ${ident}`)
  }
  if (docRaw === undefined) {
    notFound()
  }

  // render content
  const scripts: string[] = []
  const mdHtml = await MarkdownToHtml(docRaw.content, scripts)
  const aturi = `at://${contextWrapperProps.did}/com.whtwnd.blog.entry/${rkey}`

  const authorInfo = {
    did: contextWrapperProps.did,
    handle: contextWrapperProps.handle,
    profile: jsonToLex(contextWrapperProps.profileString) as ProfileViewDetailed,
    pds: contextWrapperProps.pds
  }
  const nonce = headers().get('x-nonce')

  return (
    <ContextWrapper {...contextWrapperProps}>
      <link rel="alternate" href={aturi} />
      {
            docRaw.isDraft !== true && docRaw.visibility !== 'author'
              ? <BlogViewerPage docRaw={docRaw} authorInfo={authorInfo} aturi={aturi} scripts={scripts} mdHtml={mdHtml.result} nonce={nonce ?? undefined} contentChanged={contentChanged} />
              : <BlogViewerGuard aturi={aturi} cid={cid} />
        }
    </ContextWrapper>
  )
}
