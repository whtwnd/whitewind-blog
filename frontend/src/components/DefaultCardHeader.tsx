import WhiteWindLogo from '@/../public/whtwnd.svg'
import { ComWhtwndBlogEntry } from '@/api'
import { BlogCardProps } from '@/components/BlogCard'
import SimpleAvatar from '@/components/SimpleAvatar'
import { FC } from 'react'

export const DefaultCardHeader: FC<BlogCardProps> = ({ authorInfo, entryInfo, noRound }) => {
  const entry = entryInfo.entry as ComWhtwndBlogEntry.Record
  const title = entry.title ?? '(no title)'

  let titleClass = 0
  if (title.length < 50) {
    titleClass = 0
  } else if (title.length < 100) {
    titleClass = 1
  } else {
    titleClass = 2
  }
  const titleFontSize = ['text-lg', 'text-sm', 'text-xs'][titleClass]
  const handleFontSize = ['text-xs', 'text-xs', 'text-xs'][titleClass]

  return (
    <div className={`w-full h-full bg-sky-900 grid grid-cols-3 items-center relative ${noRound !== true ? 'rounded-t-lg' : ''}`}>
      <div className='flex justify-center items-center shrink-0'>
        {/* <WhiteWindLogo className="w-28 p-4" /> */}
        <div className='w-28 p-4'><SimpleAvatar profile={authorInfo.profile} handle={authorInfo.handle ?? '(no handle)'} /></div>
      </div>
      <div className='col-span-2 pr-4 flex flex-col justify-center items-start'>
        <div className='pb-2'>
          <h1 className={`text-gray-200 font-semibold overflow-hidden ${titleFontSize}`}>{entry.title}</h1>
        </div>
        <div className='flex flex-col'>
          <p className={`text-gray-400 font-semibold leading-tight ${handleFontSize}`}>{`${authorInfo.profile?.displayName ?? (authorInfo.handle !== undefined ? `@${authorInfo.handle}` : authorInfo.did as string)}`}</p>
          <p className={`text-gray-400 font-semibold leading-tight ${handleFontSize}`}>{`${authorInfo.handle !== undefined ? `@${authorInfo.handle}` : authorInfo.did as string}`}</p>
        </div>
      </div>
      <div className='absolute w-full pb-1 bottom-0 flex flex-row justify-end items-center'>
        <WhiteWindLogo className='w-[5.5%] p-[1px]' />
        <p className='pl-1 pr-2 text-gray-200 font-semibold'>WhiteWind</p>
      </div>
    </div>
  )
}
