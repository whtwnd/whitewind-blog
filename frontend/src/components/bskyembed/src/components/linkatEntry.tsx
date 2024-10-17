// import ReplyIcon from '../../assets/bubble_filled_stroke2_corner2_rounded.svg'
import { Container } from './container'
import { Embed } from './embed'
import { Link } from './link'
import { ReactNode } from 'react'
import { BlueLinkatBoard } from '@/api'
import { AtUri } from '@atproto/syntax'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'

export interface LinkatBoardProps {
  uri: string
  entry: BlueLinkatBoard.Record
  profile?: ProfileViewDetailed
}

export function LinkatBoard ({ entry, uri, profile }: LinkatBoardProps): ReactNode {
  const aturi = new AtUri(uri)
  const href = `https://linkat.blue/${profile?.handle ?? aturi.hostname}`

  const cardText = entry.cards.filter(card => card.url?.includes(window.location.pathname))[0].text

  return (
    <Container>
      <div className='flex-1 flex-col flex gap-2'>
        <div className='flex gap-2.5 items-center cursor-pointer'>
          <Link href={href} className='rounded-full'>
            <div className='w-10 h-10 overflow-hidden rounded-full bg-neutral-300 shrink-0'>
              <img
                src={profile?.avatar}
              />
            </div>
          </Link>
          <div>
            <Link
              href={href}
              className='font-bold text-[17px] leading-5 line-clamp-1 hover:underline underline-offset-2 decoration-2'
            >
              <p>{profile?.displayName}</p>
            </Link>
            <p>
              <Link
                href={href}
                className='text-[15px] text-textLight hover:underline'
              >
                @{profile?.handle}
              </Link>
            </p>

          </div>
          <div className='flex-1' />
          <Link
            href={href}
            className='transition-transform hover:scale-110 shrink-0 self-start'
          >
            <img src='/linkat.jpg' className='h-8 rounded-full' />
          </Link>
        </div>
        <p className='min-[300px]:text-base leading-6 break-word break-words whitespace-pre-wrap' />
        <Embed
          content={
          {
            $type: 'app.bsky.embed.external#view',
            external: {
              uri: href,
              title: `${cardText ?? profile?.displayName ?? aturi.rkey} | ${profile?.handle ?? '(no handle)'}`,
              description: ''
            }
          }
        } labels={undefined}
        />
        <div className='flex-1' />
        <div className='border-t w-full pt-2.5 flex items-center gap-5 text-sm cursor-pointer' />
      </div>
    </Container>
  )
}
