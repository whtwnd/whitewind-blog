import { GenerateMetadata } from '@/services/serverUtils'
import { Metadata } from 'next'
import { PageSkeleton } from '@/app/[authorIdentity]/[rkey]/page'

export const fetchCache = 'default-no-store'

interface IPageProps {
  params: { authorIdentity: string, rkey: string, cid: string }
}

export async function generateMetadata ({ params: { authorIdentity, rkey, cid } }: IPageProps): Promise<Metadata | undefined> {
  return await GenerateMetadata(authorIdentity, undefined, rkey, cid)
}

export default async function Page ({ params: { authorIdentity, rkey, cid } }: IPageProps): Promise<JSX.Element> {
  return await PageSkeleton(authorIdentity, rkey, cid)
}
