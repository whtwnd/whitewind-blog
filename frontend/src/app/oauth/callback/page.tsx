import type { Metadata } from 'next'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown-light.css'
import { ContextWrapper } from '@/views/ContextWrapper'
import { LoadingView } from '@/components/LoadingView'

export const fetchCache = 'default-no-store'

export const metadata: Metadata = {
  title: 'WhiteWind'
}

export default async function Page (): Promise<JSX.Element> {
  return (
    <ContextWrapper fallback={<LoadingView message='Loading authentication data...' />}>
      <LoadingView message='Redirecting back to the original page...' />
    </ContextWrapper>
  )
}
