import type { Metadata } from 'next'
import { BlogLandingView } from '@/views/BlogLandingView'
import { ContextWrapper } from '@/views/ContextWrapper'
export const metadata: Metadata = {
  title: 'WhiteWind atproto blog',
  description: 'WhiteWind is an atproto blog service that anyone with a Bluesky account can use for free, without providing any personal information. You can write blogs in Markdown syntax and publish them on the internet.'
}

export default function Page (): JSX.Element {
  return (
    <>
      <ContextWrapper>
        <BlogLandingView />
      </ContextWrapper>
    </>
  )
}
