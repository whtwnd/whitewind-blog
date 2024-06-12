import { ResolveEntryMetadata } from '@/services/DocProvider'
import { GenerateMetadata } from '@/services/serverUtils'
import { AtUri } from '@atproto/syntax'
import { Metadata } from 'next'

import { redirect } from 'next/navigation'
import { PageSkeleton } from '@/app/[authorIdentity]/[rkey]/page'

export const fetchCache = 'default-no-store'

interface IPageProps {
  params: { authorIdentity: string, entryTitle: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata ({ params }: IPageProps): Promise<Metadata | undefined> {
  return await GenerateMetadata(params.authorIdentity, params.entryTitle)
}

export default async function Page ({ params, searchParams }: IPageProps): Promise<JSX.Element> {
  const ident = decodeURIComponent(params.authorIdentity)
  const paramsRkey = searchParams.rkey as string | undefined
  try {
    const entryMetadata = await ResolveEntryMetadata(ident, decodeURIComponent(params.entryTitle))
    const rkey = (new AtUri(entryMetadata.data.entryUri)).rkey

    if (paramsRkey !== undefined && paramsRkey !== rkey) {
      throw new Error(`Given rkey (${paramsRkey}) and resolved rkey (${rkey}) are different. Falling back to /:authorIdentity/:rkey`)
    }

    return await PageSkeleton(params.authorIdentity, rkey)
  } catch (err) {
    console.error(err)
    if (paramsRkey === undefined) {
      console.error('Doesn\'t have rkey either...')
      throw new Error(`Could not resolve ${params.entryTitle}`)
    }
    redirect(`/${params.authorIdentity}/${paramsRkey}`)
  }
}
