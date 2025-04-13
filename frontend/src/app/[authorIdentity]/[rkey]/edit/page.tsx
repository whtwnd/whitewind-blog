import { PrepareContext } from '@/services/serverUtils'
import BlogEditorV2 from '@/views/BlogEditorV2'
import { ContextWrapper } from '@/views/ContextWrapper'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { JSX } from 'react'
export const metadata: Metadata = {
  title: 'Blog editor',
  robots: { index: false }
}

export const fetchCache = 'default-no-store'

export default async function Page (props: { params: Promise<{ authorIdentity: string, rkey: string }> }): Promise<JSX.Element> {
  const params = await props.params

  const {
    authorIdentity,
    rkey
  } = params

  // if the user accesses the page by rkey, load document server-side to obtain entryTitle
  const ident = decodeURIComponent(authorIdentity)

  const { contextWrapperProps, docRaw } = await PrepareContext({ ident, rkey })
  if (contextWrapperProps.did === undefined) {
    throw new Error(`Could not find did for ${ident}`)
  }
  if (docRaw === undefined) {
    return <h1>Couldn't load doc</h1>
  }

  if (docRaw !== undefined) {
    return (
      <ContextWrapper {...contextWrapperProps}>
        <BlogEditorV2 />
      </ContextWrapper>
    )
  } else {
    notFound()
  }
}
