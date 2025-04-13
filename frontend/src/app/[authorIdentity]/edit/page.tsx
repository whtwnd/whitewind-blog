import type { Metadata } from 'next'
import { PrepareContext } from '@/services/serverUtils'
import { ContextWrapper } from '@/views/ContextWrapper'
import BlogEditorV2 from '@/views/BlogEditorV2'

import type { JSX } from 'react'

export const metadata: Metadata = {
  title: 'Blog editor'
}

export default async function Page (props: { params: Promise<{ authorIdentity: string }> }): Promise<JSX.Element> {
  const params = await props.params
  const ident = decodeURIComponent(params.authorIdentity)
  const { contextWrapperProps } = await PrepareContext({ ident })
  return (
    <ContextWrapper {...contextWrapperProps}>
      <BlogEditorV2 />
    </ContextWrapper>
  )
}
