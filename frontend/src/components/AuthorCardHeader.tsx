import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import { FC } from 'react'

export interface IAuthorCardHeaderProps {
  authorInfo: IAuthorInfoContextValue
}

export const AuthorCardHeader: FC<IAuthorCardHeaderProps> = ({ authorInfo }) => {
  const profile = authorInfo.profile
  return (
    <div className='flex flex-row gap-4 items-center'>
      <div className='w-24 h-24 flex items-center relative'>
        {
                profile?.avatar !== undefined
                  ? <img src={profile.avatar} alt={authorInfo.handle} className='rounded-full border-2 border-gray-200' />
                  : (
                    <svg className='text-gray-800 fill-gray-400' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                      <path fillRule='evenodd' d='M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z' clipRule='evenodd' />
                    </svg>
                    )
            }
        <a href={`/${authorInfo.handle ?? ''}`} className='absolute top-0 left-0 w-full h-full' />
      </div>
      <div className='flex flex-col'>
        <div className='relative'>
          <div className='w-full block'><h5 className='w-full mb-1 text-2xl font-medium text-gray-700 font-semibold'>{profile?.displayName ?? `@${authorInfo.handle ?? ''}`}</h5></div>
          <div className='w-full mb-1 block text-sm text-gray-500'>{profile?.displayName !== undefined ? `@${authorInfo.handle ?? ''}` : authorInfo.did}</div>
          <a href={`/${authorInfo.handle ?? ''}`} className='absolute top-0 left-0 w-full h-full' />
        </div>
        <a href={`https://bsky.app/profile/${authorInfo.handle ?? ''}`} target='_blank' className='w-full rounded-lg text-center border border-sky-400 text-sky-400 transition duration-200 hover:border-transparent hover:text-gray-100 hover:bg-sky-400' rel='noreferrer'>Bluesky profile</a>
      </div>
    </div>
  )
}

export default AuthorCardHeader
