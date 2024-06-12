import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import { createClient } from '@/services/clientUtils'
import type { Record } from '@/api/types/com/atproto/repo/listRecords'

export const GetReplacedGetBlobURL = (url: string): string | undefined => {
  try {
    const urlObj = new URL(url)
    const searchParams = urlObj.searchParams

    const did = searchParams.get('did')
    const cid = searchParams.get('cid')
    if (urlObj.pathname === '/xrpc/com.atproto.sync.getBlob' && did !== undefined && cid !== undefined) {
      return `/api/cache?did=${did as string}&cid=${cid as string}`
    }
  } catch (err) {
    void err
  }
  return undefined
}

export async function requestUntilGetAll (authorInfo: IAuthorInfoContextValue): Promise<Record[]> {
  const pdshost = authorInfo.pds ?? 'bsky.social'
  const client = createClient(pdshost)
  const responses: Record[] = []
  let cond = true
  let cursor: string | undefined
  do {
    const response = await client.com.atproto.repo.listRecords({ repo: authorInfo.did as string, collection: 'com.whtwnd.blog.entry', cursor })
    if (!response.success || response.data.records.length === 0) {
      break
    }
    responses.push(...(response.data.records))
    cond = (cursor = response.data.cursor) === undefined
  } while (cond)
  return responses
}
