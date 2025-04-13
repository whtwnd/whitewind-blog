import type { Metadata } from 'next'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown-light.css'
import { LoadingView } from '@/components/LoadingView'
import { ContextWrapper } from '@/views/ContextWrapper'

import type { JSX } from 'react'

export const fetchCache = 'default-no-store'

export const metadata: Metadata = {
  title: 'WhiteWind'
}

export default async function Page (): Promise<JSX.Element> {
  return (
    <ContextWrapper initOAuthClient>
      <LoadingView message='Redirecting back to the original page...' />
    </ContextWrapper>
  )
}
