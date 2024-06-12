import type { Metadata } from 'next'
import { PrepareContext } from '@/services/serverUtils'
import { ContextWrapper } from '@/views/ContextWrapper'
import BlogEditorV2 from '@/views/BlogEditorV2'

export const metadata: Metadata = {
  title: 'Blog editor'
}

export default async function Page ({ params }: { params: { authorIdentity: string } }): Promise<JSX.Element> {
  const ident = decodeURIComponent(params.authorIdentity)
  const { contextWrapperProps } = await PrepareContext({ ident })
  return (
    <ContextWrapper {...contextWrapperProps}>
      <BlogEditorV2 />
    </ContextWrapper>
  )
}
