import SimpleAvatar from '@/components/SimpleAvatar'
import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import { FC } from 'react'

export interface IListHeroSection {
  authorInfo: IAuthorInfoContextValue
  maxlines?: number
  whtwndLink?: boolean
  newtab?: boolean
}

export const ListHeroSection: FC<IListHeroSection> = ({ authorInfo, maxlines, whtwndLink, newtab }) => {
  const profile = authorInfo.profile
  const description = profile?.description?.split('\n')
  const MAXLINES = maxlines ?? 1
  const href = whtwndLink !== true ? `https://bsky.app/profile/${authorInfo.handle ?? authorInfo.did as string}` : `/${authorInfo.handle ?? authorInfo.did as string}`
  return (
    <div className='p-4 w-full min-h-[20vh] sm:min-h-[30vh] flex justify-center items-center'>
      <div className='flex flex-col md:flex-row gap-4 sm:gap-8 2xl:gap-16 items-center'>
        <div className='w-24 h-24 sm:w-36 sm:h-36 flex items-center relative shrink-0'>
          <SimpleAvatar profile={profile} handle={authorInfo.handle ?? ''} />
          <a href={href} target={newtab === true ? '_blank' : undefined} className='absolute top-0 left-0 w-full h-full' rel='noreferrer' />
        </div>
        <div className='flex flex-col max-w-xl'>
          <div className='relative'>
            <div className='w-full block'><h5 className='w-full mb-1 text-2xl sm:text-4xl text-gray-700 font-semibold'>{profile?.displayName ?? `@${authorInfo.handle ?? ''}`}</h5></div>
            <p className='w-full mb-1 block text-sm sm:text-lg text-gray-500'>{profile?.displayName !== undefined ? `@${authorInfo.handle ?? ''}` : authorInfo.did}</p>
            <a href={href} target={newtab === true ? '_blank' : undefined} className='absolute top-0 left-0 w-full h-full' rel='noreferrer' />
          </div>
          {
                    description !== undefined && (
                      <div>
                        <div className='w-full mb-1 block text-sm sm:text-lg text-gray-700 break-all'>
                          {
                                description.slice(0, MAXLINES).map((line, i) => <span key={i}>{line}{i < MAXLINES - 1 ? <br key={i} /> : <></>}</span>)
                            }{(description.length > MAXLINES ? <span>...</span> : <></>)}
                        </div>
                      </div>
                    )
                }
        </div>
      </div>
    </div>
  )
}
