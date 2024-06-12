// import ReplyIcon from '../../assets/bubble_filled_stroke2_corner2_rounded.svg'
import { Container } from './container'
import { Link } from './link'
import { AtUri } from '@atproto/syntax'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Embed } from '@/components/bskyembed/src/components/embed'

export interface BlogEntryProps {
  uri: string
  profile?: ProfileViewDetailed
}

export function Fallback ({ uri, profile }: BlogEntryProps) {
  const aturi = new AtUri(uri)

  return (
    <Container>
      <div className='flex-1 flex-col flex gap-2'>
        <div className='flex gap-2.5 items-center cursor-pointer'>
          <Link href={`/profile/${aturi.hostname}`} className='rounded-full'>
            <div className='w-10 h-10 overflow-hidden rounded-full bg-neutral-300 shrink-0'>
              <img
                src={profile?.avatar}
              />
            </div>
          </Link>
          <div>
            <Link
              href={`/profile/${aturi.hostname}`}
              className='font-bold text-[17px] leading-5 line-clamp-1 hover:underline underline-offset-2 decoration-2'
            >
              <p>{profile?.displayName}</p>
            </Link>
            <p>
              <Link
                href={`/profile/${aturi.hostname}`}
                className='text-[15px] text-textLight hover:underline'
              >
                @{profile?.handle}
              </Link>
            </p>

          </div>
          <div className='flex-1' />
        </div>
        <Embed
          content={
                    {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: '',
                        title: aturi.collection,
                        description: aturi.toString()
                      }
                    }
                } labels={undefined}
        />
        <p className='min-[300px]:text-base leading-6 break-word break-words whitespace-pre-wrap' />
        <div className='flex-1' />
        <div className='border-t w-full pt-2.5 flex items-center gap-5 text-sm cursor-pointer' />
      </div>
    </Container>
  )
}
