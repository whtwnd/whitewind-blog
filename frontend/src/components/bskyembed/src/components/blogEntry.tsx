// import ReplyIcon from '../../assets/bubble_filled_stroke2_corner2_rounded.svg'
import Logo from '../../../../../public/header_icon.svg'
import { niceDate } from '../utils'
import { Container } from './container'
import { Embed } from './embed'
import { Link } from './link'
import { ReactNode, useEffect, useState } from 'react'
import { ComWhtwndBlogEntry } from '@/api'
import { AtUri } from '@atproto/syntax'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'

export interface BlogEntryProps {
  uri: string
  entry: ComWhtwndBlogEntry.Record
  profile?: ProfileViewDetailed
}

export function BlogEntry ({ entry, uri, profile }: BlogEntryProps): ReactNode {
  const [date, setDate] = useState('')
  useEffect(() => {
    if (entry.createdAt !== undefined) {
      setDate(niceDate(entry.createdAt))
    }
  }, [entry])

  const aturi = new AtUri(uri)
  const href = `/${aturi.hostname}/${entry.title !== undefined ? `entries/${encodeURIComponent(entry.title)}` : aturi.rkey}`

  return (
    <Container>
      <div className='flex-1 flex-col flex gap-2'>
        <div className='flex gap-2.5 items-center cursor-pointer'>
          <Link href={`https://whtwnd.com/${aturi.hostname}`} className='rounded-full'>
            <div className='w-10 h-10 overflow-hidden rounded-full bg-neutral-300 shrink-0'>
              <img
                src={profile?.avatar}
              />
            </div>
          </Link>
          <div>
            <Link
              href={`https://whtwnd.com/${aturi.hostname}`}
              className='font-bold text-[17px] leading-5 line-clamp-1 hover:underline underline-offset-2 decoration-2'
            >
              <p>{profile?.displayName}</p>
            </Link>
            <p>
              <Link
                href={`https://whtwnd.com/${aturi.hostname}`}
                className='text-[15px] text-textLight hover:underline'
              >
                @{profile?.handle}
              </Link>
              ・
              <Link href={`https://whtwnd.com${href}`}>
                <time
                  dateTime={entry.createdAt !== undefined ? new Date(entry.createdAt).toISOString() : ''}
                  className='text-textLight mt-1 text-sm hover:underline'
                >
                  {date}
                </time>
              </Link>
            </p>

          </div>
          <div className='flex-1' />
          <Link
            href={`https://whtwnd.com${href}`}
            className='transition-transform hover:scale-110 shrink-0 self-start'
          >
            <Logo className='h-8 rounded-full' />
          </Link>
        </div>
        <p className='min-[300px]:text-base leading-6 break-word break-words whitespace-pre-wrap' />
        <Embed
          content={
          {
            $type: 'app.bsky.embed.external#view',
            external: {
              uri: `https://whtwnd.com${href}`,
              title: `${entry.title ?? aturi.rkey} | ${profile?.handle ?? '(no handle)'}`,
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
