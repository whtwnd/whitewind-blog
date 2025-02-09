import type { Metadata } from 'next'
import { ContextWrapper } from '@/views/ContextWrapper'
import { createClient } from '@/services/DocProvider'
import { AtUri, BskyAgent } from '@atproto/api'
import ResolvePDS from '@/services/PDSResolver'
import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import { IEntryContextValue } from '@/contexts/EntryContext'
import BlogCard from '@/components/BlogCard'
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { SearchBar } from '@/components/SearchBar'
import Footer from '@/components/Footer'
import { GetStats } from '@/services/serverUtils'
import TopPageHeader from '@/components/Headers/TopPageHeader'
export const metadata: Metadata = {
  title: 'WhiteWind atproto blog',
  description: 'WhiteWind is an atproto blog service that anyone with a Bluesky account can use for free, without providing any personal information. You can write blogs in Markdown syntax and publish them on the internet.'
}

interface EntryMetadata {
  authorDid: string
  rkey: string
  comments?: number
}

type EntryData = Array<{
  authorInfo: IAuthorInfoContextValue
  entryInfo: IEntryContextValue
}>

const RetrieveEntries = async (metadata: EntryMetadata[], top = 10, orderby: 'date' | 'comment' = 'date'): Promise<EntryData> => {
  const ENDPOINT = 'public.api.bsky.app'
  const agent = new BskyAgent({ service: `https://${ENDPOINT}` })

  const authors = Array.from(new Set(metadata.slice(0, top).map(m => m.authorDid)))
  const [pdses, profiles] = await Promise.all([
    Promise.allSettled(authors.map(async author => await ResolvePDS(author))),
    Promise.allSettled(authors.map(async author => await agent.getProfile({ actor: author })))
  ])
  const pdsMap = new Map(authors.map((author, i) => [author, pdses[i].status==='fulfilled' ? pdses[i].value : undefined]))
  const profileMap = new Map(authors.map((author, i) => [author, profiles[i].status==='fulfilled' ? profiles[i].value.data : undefined]))

  let reserved = metadata.slice(top)
  const target = metadata.slice(0, top)

  const results = await Promise.all(target.map(async (meta) => {
    do {
      for (let i = 0; i < 3; i++) {
        try {
          const rkey = meta.rkey
          const pds = pdsMap.get(meta.authorDid) ?? (await ResolvePDS(meta.authorDid))
          const profile = profileMap.get(meta.authorDid) ?? (await agent.getProfile({ actor: meta.authorDid })).data
          // store it in case cache miss
          profileMap.set(meta.authorDid, profile)
          if (pds === undefined) {
            meta = reserved[0]
            reserved = reserved.slice(1)
            continue
          }
          const client = createClient(pds)
          const result = await client.com.whtwnd.blog.entry.get({ repo: meta.authorDid, rkey }).then(entry => { return { entry: entry.value, pds, rkey, comments: meta.comments, profile } })
          if (result.entry.isDraft === true || result.entry.visibility === 'url' || result.entry.visibility === 'author') {
            break // treat as failed
          }
          return result
        } catch (err) {
          console.error(err)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      // failed to load, fallback
      meta = reserved[0]
      reserved = reserved.slice(1)
    } while (reserved.length > 0)
    return undefined
  }))
  results.sort((a, b) => orderby === 'date' ? CompareEntry(a?.entry.createdAt, b?.entry.createdAt) : CompareEntry(a?.comments, b?.comments))
  const ret: Array<{ authorInfo: IAuthorInfoContextValue, entryInfo: IEntryContextValue }> = []
  for (let i = 0; i < results.length; i++) {
    const entry = results[i]
    const profile = results[i]?.profile
    if (entry?.entry === undefined || profile === undefined) {
      continue
    }
    const authorInfo = {
      did: profile.did,
      handle: profile.handle,
      profile,
      pds: entry?.pds
    }
    const entryInfo = {
      entry: entry.entry,
      rkey: entry?.rkey,
      comments: entry?.comments
    }
    ret.push({ authorInfo, entryInfo })
  }
  return ret
}

const CompareEntry = (a?: string | number, b?: string | number): number => {
  if (a === undefined && b === undefined) {
    return -1
  } else if (a === undefined) {
    return 1
  } else if (b === undefined) {
    return -1
  }
  if (a > b) {
    return -1
  } else if (a === b) {
    return 0
  } else {
    return 1
  }
}

const GetLatestEntries = async (stats: Map<string, number>): Promise<EntryData> => {
  const client = new DynamoDBClient({ region: 'ap-northeast-1' })
  // const params: QueryCommandInput = {
  //    TableName: 'com.whtwnd.blog.metadata',
  //    IndexName: 'entriesByDate',
  //    KeyConditionExpression: "dummy= :dummyValue",
  //    ExpressionAttributeValues: {
  //        ":dummyValue": { "S": "" }
  //    },
  //    ScanIndexForward: false,
  //    Limit: 5,
  // };
  // const command = new QueryCommand(params)
  const params = {
    TableName: 'com.whtwnd.blog.metadata'
  }
  const command = new ScanCommand(params)
  const data = await client.send(command)
  const metadata = data.Items
    ?.sort((a, b) => {
      return CompareEntry(a.lastUpdate.S as string, b.lastUpdate.S as string)
    })
    ?.map((item) => {
      return {
        authorDid: item.authorDid.S as string,
        rkey: item.rkey.S as string,
        comments: stats.get(`at://${item.authorDid.S as string}/com.whtwnd.blog.entry/${item.rkey.S as string}`)
      }
    })
  if (metadata === undefined) {
    throw new Error('Could not retrieve latest entries')
  }
  return await RetrieveEntries(metadata, 10, 'date')
}

const GetHotEntries = async (stats: Map<string, number>): Promise<EntryData> => {
  const metadata: EntryMetadata[] = Array.from(stats.entries())
    .sort((e1, e2) => -e1[1] + e2[1])
    .map(entry => {
      const uri = new AtUri(entry[0])
      return {
        authorDid: uri.hostname,
        rkey: uri.rkey,
        comments: entry[1]
      }
    })

  if (metadata === undefined) {
    throw new Error('Could not retrieve latest entries')
  }
  return await RetrieveEntries(metadata, 10, 'comment')
}

export default async function Page (): Promise<JSX.Element> {
  // const mockData = await GenerateMockCards()
  const stats = await GetStats()
  const [latestData, hotData] = await Promise.all([GetLatestEntries(stats), GetHotEntries(stats)])

  return (
    <>
      <ContextWrapper>
        <div className='flex flex-col h-screen'>
          <TopPageHeader />
          {/* Search area */}
          <div className='w-full'>
            <SearchBar />
          </div>
          <div className='w-full grow flex flex-col gap-10 pb-10 px-10 sm:px-20 lg:flex-row'>
            {/* Latest area */}
            <div className='w-full lg:w-1/2 h-full w-full flex flex-col items-center'>
              <p className='text-4xl font-semibold text-gray-700 pr-6'>🆕 Latest</p>
              <div className='grow pt-4 w-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-5 gap-4'>
                {
                  latestData.map(({ authorInfo, entryInfo }, i) => <BlogCard authorInfo={authorInfo} entryInfo={entryInfo} key={i} />)
                }
              </div>
            </div>
            {/* Trending area */}
            <div className='w-full lg:w-1/2 h-full w-full overflow-auto flex flex-col items-center'>
              <p className='text-4xl font-semibold text-gray-700 pr-6'>🔥 Popular</p>
              <div className='grow pt-4 w-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-5 gap-4'>
                {
                  hotData.map(({ authorInfo, entryInfo }, i) => <BlogCard authorInfo={authorInfo} entryInfo={entryInfo} key={i} />)
                }
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ContextWrapper>
    </>
  )
}
