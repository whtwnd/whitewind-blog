import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Blog editor'
}

export default async function Page ({ params }: { params: { authorIdentity: string, rkey: string } }): Promise<void> {
  params.authorIdentity = decodeURIComponent(params.authorIdentity)
  permanentRedirect(`/${params.authorIdentity}/${params.rkey}/edit`)
}
