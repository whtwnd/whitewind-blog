import { ListHeroSection } from '@/components/ListHeroSection'
import ThreeColumnListView from '@/components/ThreeColumnListView'
import { GetStats, PrepareContext } from '@/services/serverUtils'
import { ContextWrapper } from '@/views/ContextWrapper'
import { BskyAgent } from '@atproto/api'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { jsonToLex } from '@atproto/lexicon'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
const BlogListView = dynamic(async () => await import('@/views/BlogListView'))

interface IPageProps {
  params: { authorIdentity: string }
}

export async function generateMetadata ({ params }: IPageProps): Promise<Metadata> {
  const authorIdentity = decodeURIComponent(params.authorIdentity)
  let title = `Blog entries of ${authorIdentity}`
  try {
    const agent = new BskyAgent({ service: 'https://public.api.bsky.app' })
    const profile = await agent.getProfile({ actor: authorIdentity })
    title = `Blog entries of ${profile.data.displayName ?? authorIdentity}`
  } catch (err) {
    console.error(err)
  }
  return {
    title
  }
}

export const fetchCache = 'default-no-store'

export default async function Page ({ params }: IPageProps): Promise<JSX.Element> {
  const ident = decodeURIComponent(params.authorIdentity)
  const { contextWrapperProps } = await PrepareContext({ ident })
  const authorInfo = {
    did: contextWrapperProps.did,
    handle: contextWrapperProps.handle,
    profile: jsonToLex(contextWrapperProps.profileString) as ProfileViewDetailed,
    pds: contextWrapperProps.pds
  }
  return (
    <ContextWrapper {...contextWrapperProps}>
      <link rel='alternate' href={`at://${contextWrapperProps.did as string}`} />
      <ThreeColumnListView
        hero={<ListHeroSection authorInfo={authorInfo} newtab />}
        center={<BlogListView
          authorInfo={authorInfo} stats={await GetStats()}
                />}
      />
    </ContextWrapper>
  )
}
