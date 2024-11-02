// import ReplyIcon from '../../assets/bubble_filled_stroke2_corner2_rounded.svg'
import Logo from '../../../../../public/frontpage-logo.svg'
import { Container } from './container'
import { Link } from './link'
import { ReactNode } from 'react'
import { FyiUnravelFrontpagePost } from '@/api'
import { AtUri } from '@atproto/syntax'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { formatDistance } from 'date-fns'

export interface FrontpagePostProps {
  uri: string
  post: FyiUnravelFrontpagePost.Record
  profile?: ProfileViewDetailed
}

export function FrontpagePost ({ post, uri, profile }: FrontpagePostProps): ReactNode {
  const aturi = new AtUri(uri)
  const href = `https://frontpage.fyi/post/${profile?.handle ?? aturi.hostname}/${aturi.rkey}`

  return (
    <Container>
      <div className='flex-1 flex-col flex gap-2'>
        <div className='flex items-center cursor-pointer'>
          <article className='flex items-center gap-4 shadow-sm rounded-lg pt-4 pl-4 pb-4 flex-grow'>
            <div className='w-full'>
              <h2 className='mb-1 text-xl'>
                <a
                  href={href}
                  className='hover:underline flex flex-wrap items-center gap-x-2 frontpageHeading'
                  target='_blank' rel='noreferrer'
                >
                  {post.title}{' '}
                  <span className='text-gray-500 dark:text-gray-400 font-normal text-sm md:text-base'>
                    ({new URL(post.url).host})
                  </span>
                </a>
              </h2>
              <div className='flex flex-wrap text-gray-500 dark:text-gray-400 sm:gap-4 frontpageInfo'>
                <div className='flex gap-2 flex-wrap md:flex-nowrap'>
                  <div className='flex gap-2 items-center'>
                    <span aria-hidden>•</span>
                    <Link href={`https://frontpage.fyi/profile/${profile?.handle ?? aturi.hostname}`} className='hover:underline' target='_blank' rel='noreferrer'>
                      by {profile?.handle ?? aturi.hostname}
                    </Link>
                  </div>
                </div>
                <div className='w-full flex items-center justify-between gap-2 md:gap-4 sm:w-auto'>
                  <div className='flex gap-2'>
                    <span aria-hidden>•</span>
                    {/* <TimeAgo createdAt={createdAt} side='bottom' /> */}
                    <time dateTime={post.createdAt}>{formatDistance(new Date(), new Date(post.createdAt))} ago</time>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href={href}
              className='transition-transform hover:scale-110 shrink-0 self-start'
              target='_blank' rel='noreferrer'
            >
              <Logo className='h-12 rounded-full' />
            </Link>
          </article>
        </div>
        <div className='flex-1' />
        <div className='border-t w-full pt-2.5 flex items-center gap-5 text-sm cursor-pointer' />
      </div>
    </Container>
  )
}
