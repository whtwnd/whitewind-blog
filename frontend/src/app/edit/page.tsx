import type { Metadata } from 'next'
import { ContextWrapper } from '@/views/ContextWrapper'
import BlogEditorV2 from '@/views/BlogEditorV2'

import type { JSX } from 'react'

export const metadata: Metadata = {
  title: 'Blog editor'
}

export default function Page (): JSX.Element {
  return (
    <ContextWrapper>
      <BlogEditorV2 />
    </ContextWrapper>
  )
}
