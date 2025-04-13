import { GenerateMetadata } from '@/services/serverUtils'
import { Metadata } from 'next'
import { PageSkeleton } from '@/app/[authorIdentity]/[rkey]/page'

import type { JSX } from 'react'

export const fetchCache = 'default-no-store'

interface IPageProps {
  params: Promise<{ authorIdentity: string, rkey: string, cid: string }>
}

export async function generateMetadata (props: IPageProps): Promise<Metadata | undefined> {
  const params = await props.params

  const {
    authorIdentity,
    rkey,
    cid
  } = params

  return await GenerateMetadata(authorIdentity, undefined, rkey, cid)
}

export default async function Page (props: IPageProps): Promise<JSX.Element> {
  const params = await props.params

  const {
    authorIdentity,
    rkey,
    cid
  } = params

  return await PageSkeleton(authorIdentity, rkey, cid)
}
