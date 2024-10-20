import { ResolveEntryMetadata } from '@/services/DocProvider'
import type { Metadata } from 'next'
import { AtUri } from '@atproto/syntax'
import { permanentRedirect } from 'next/navigation'
export const metadata: Metadata = {
  title: 'Blog editor',
  robots: { index: false }
}

// prevent resolved rkey from being cached
// when duplicate name entry exists, even when one of them is deleted, the cache returns deleted rkey
export const fetchCache = 'default-no-store'

export default async function Page ({ params }: { params: { authorIdentity: string, entryTitle: string } }): Promise<JSX.Element> {
  params.authorIdentity = decodeURIComponent(params.authorIdentity)
  const entryMetadata = await ResolveEntryMetadata(params.authorIdentity, decodeURIComponent(params.entryTitle))
  const rkey = (new AtUri(entryMetadata.data.entryUri)).rkey
  permanentRedirect(`/${params.authorIdentity}/${rkey}/edit`)
}
