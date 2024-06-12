import * as React from 'react'
import * as xrpc from '@/api'
import dynamic from 'next/dynamic'
import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import { IEntryContextValue } from '@/contexts/EntryContext'
import { DefaultCardHeader } from '@/components/DefaultCardHeader'
import { GetReplacedGetBlobURL } from '@/services/commonUtils'
import VisibilityBadge from '@/components/VisibilityBadge'
const LocalTime = dynamic(async () => await import('@/components/LocalTime'), { ssr: false })

export interface BlogCardProps {
  authorInfo: IAuthorInfoContextValue
  entryInfo: IEntryContextValue
  noRound?: boolean
}

export const BlogCard: React.FC<BlogCardProps> = ({ authorInfo, entryInfo, noRound }) => {
  const entry = entryInfo.entry as xrpc.ComWhtwndBlogEntry.Record
  const profile = authorInfo.profile

  const titleSizeMap = new Map([
    [0, 'md:text-lg 2xl:text-2xl'], // short title (l<50)
    [1, 'md:text-base 2xl:text-xl'], // long title (50<l<100)
    [2, 'md:text-sm 2xl:text-lg'] // very long title (100<l)
  ])
  const l = entry.title?.length ?? 0
  const sizeClass = l < 50 ? 0 : l < 100 ? 1 : 2
  const titleSize = titleSizeMap.get(sizeClass) as string
  let entryHref = `/${authorInfo.handle ?? authorInfo.did as string}/`
  entryHref += entry.title !== undefined ? `entries/${encodeURIComponent(entry.title)}?rkey=${entryInfo.rkey as string}` : (entryInfo.rkey as string)

  let ogp: string | undefined = entry.ogp?.url
  if (ogp !== undefined) {
    const replaced = GetReplacedGetBlobURL(ogp)
    if (replaced !== undefined) {
      ogp = replaced
    }
  }
  const visibility = entry.isDraft === true ? 'author' : entry.visibility

  const imageUrlCSSProp = { '--image-url': ogp !== undefined ? `url(${ogp})` : '' }
  return (
    <div className='h-80 md:h-96 flex rounded-lg border border-gray-200 bg-white shadow-md flex-col relative'>
      {/** header image area */}
      {
            entry.ogp?.url !== undefined
              ? (
                <div
                  style={imageUrlCSSProp as React.CSSProperties}
                  className='rounded-t min-h-40 bg-[image:var(--image-url)] bg-cover bg-no-repeat bg-center relative'
                >
                  <a href={entryHref} className='absolute w-full h-full top-0 left-0' />
                </div>
                )
              : (
                <div
                  className='rounded-t-lg min-h-40 relative'
                >
                  <div className='absolute w-full h-full rounded-t-lg top-0 left-0'>
                    <DefaultCardHeader authorInfo={authorInfo} entryInfo={entryInfo} noRound={noRound} />
                  </div>
                  <a href={entryHref} className='absolute w-full h-full top-0 left-0' />
                </div>
                )
        }
      {/* draft badge */}
      <div className='absolute'>
        <VisibilityBadge visibility={visibility} />
      </div>
      {/** main area */}
      <div className='grow flex flex-col px-4 justify-between'>
        {/** metadata area */}
        <div className='grow relative flex flex-col justify-center border-b border-gray-400'>
          <h5 className={`w-full block font-semibold text-gray-700 ${titleSize} break-all`}>{entry.title ?? '(no title)'}</h5>
          <h5 className='w-full block text-gray-400 text-sm'>Last Update: <LocalTime datetime={entry.createdAt ?? new Date().toISOString()} datetimeFallback={<p>{entry.createdAt}</p>} /></h5>
          <a href={entryHref} className='absolute w-full h-full top-0 left-0' />
          {
                    entryInfo.comments !== undefined &&
                      <div className='flex align-center items-center text-gray-400 text-sm'>
                        {entryInfo.comments} reactions
                      </div>
                }
        </div>
        {/** authror area */}
        <div className='py-4 relative'>
          <div className='flex flex-row gap-4 items-center'>
            <div className='w-10 h-10 flex items-center'>
              {
                            profile?.avatar !== undefined
                              ? <img src={profile?.avatar} alt={profile?.handle} className='rounded-full border-2 border-gray-200' />
                              : (
                                <svg className='text-gray-800 fill-gray-400' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                                  <path fillRule='evenodd' d='M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z' clipRule='evenodd' />
                                </svg>
                                )
                        }
            </div>
            <div className='flex flex-col'>
              <div className='w-full block'><h5 className='w-full text-xs text-gray-500'>{profile?.displayName ?? `@${authorInfo.handle ?? ''}`}</h5></div>
              <div className='w-full block text-xs text-gray-500'>{profile?.displayName !== undefined ? `@${authorInfo.handle ?? ''}` : authorInfo.did}</div>
            </div>
          </div>
          <a href={`/${authorInfo.handle ?? authorInfo.did as string}`} className='absolute w-full h-full top-0 left-0' />
        </div>
      </div>
    </div>
  )
}

export default BlogCard
