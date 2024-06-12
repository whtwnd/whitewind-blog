import { AppBskyFeedDefs, AppBskyFeedPost, RichText } from '@atproto/api'

// import ReplyIcon from '../../assets/bubble_filled_stroke2_corner2_rounded.svg'
import LikeIcon from '../../assets/heart2_filled_stroke2_corner0_rounded.svg'
import Logo from '../../assets/logo.svg'
import RepostIcon from '../../assets/repost_stroke2_corner2_rounded.svg'
import { CONTENT_LABELS } from '../labels'
import { getRkey, niceDate } from '../utils'
import { Container } from './container'
import { Embed } from './embed'
import { Link } from './link'
import { useEffect, useState } from 'react'

interface Props {
  thread: AppBskyFeedDefs.ThreadViewPost
  error?: boolean
}

export function Post ({ thread, error }: Props) {
  const post = thread.post
  const [date, setDate] = useState('')
  useEffect(() => {
    setDate(niceDate(post.indexedAt))
  }, [post])

  const isAuthorLabeled = post.author.labels?.some(label =>
    CONTENT_LABELS.includes(label.val)
  )

  let record: AppBskyFeedPost.Record | null = null
  if (AppBskyFeedPost.isRecord(post.record)) {
    record = post.record
  }

  const href = `/profile/${post.author.did}/post/${getRkey(post)}`

  if (error === true) {
    return (
      <Container href={href}>
        <Link
          href={href}
          className='transition-transform hover:scale-110 absolute top-4 right-4'
        >
          <Logo className='h-6' />
        </Link>
        <div className='w-full py-12 gap-4 flex flex-col items-center'>
          <p className='max-w-80 text-center w-full text-textLight'>
            The author of this post has requested their posts not be displayed on
            external sites.
          </p>
          <Link
            href={href}
            className='max-w-80 rounded-lg bg-brand text-white color-white text-center py-1 px-4 w-full mx-auto'
          >
            View on Bluesky
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className='flex-1 flex-col flex gap-2' lang={record?.langs?.[0]}>
        <div className='flex gap-2.5 items-center cursor-pointer'>
          <Link href={`/profile/${post.author.did}`} className='rounded-full'>
            <div className='w-10 h-10 overflow-hidden rounded-full bg-neutral-300 shrink-0'>
              <img
                src={post.author.avatar}
                style={isAuthorLabeled ? { filter: 'blur(2.5px)' } : undefined}
              />
            </div>
          </Link>
          <div>
            <Link
              href={`/profile/${post.author.did}`}
              className='font-bold text-[17px] leading-5 line-clamp-1 hover:underline underline-offset-2 decoration-2'
            >
              <p>{post.author.displayName}</p>
            </Link>
            <p>
              <Link
                href={`/profile/${post.author.did}`}
                className='text-[15px] text-textLight hover:underline'
              >
                @{post.author.handle}
              </Link>
              ・
              <Link href={href}>
                <time
                  dateTime={new Date(post.indexedAt).toISOString()}
                  className='text-textLight mt-1 text-sm hover:underline'
                >
                  {date}
                </time>
              </Link>
            </p>

          </div>
          <div className='flex-1' />
          <Link
            href={href}
            className='transition-transform hover:scale-110 shrink-0 self-start'
          >
            <Logo className='h-8' />
          </Link>
        </div>
        <PostContent record={record} />
        <Embed content={post.embed} labels={post.labels} />
        <div className='flex items-center gap-1 cursor-pointer'>
          {!!post.likeCount && (<>
            <LikeIcon className='w-5 h-5' />
            <p className='font-bold text-neutral-500 mb-px'>
              {post.likeCount}
            </p>
          </>)}
          {!!post.repostCount && (<>
            <RepostIcon className='w-5 h-5' />
            <p className='font-bold text-neutral-500 mb-px'>
              {post.repostCount}
            </p>
          </>
          )}
        </div>
        <div className='flex-1' />
        <div className='border-t w-full pt-2.5 flex items-center gap-5 text-sm cursor-pointer' />
      </div>
    </Container>
  )
}

function PostContent ({ record }: { record: AppBskyFeedPost.Record | null }) {
  if (record == null) return null

  const rt = new RichText({
    text: record.text,
    facets: record.facets
  })

  const richText = []

  let counter = 0
  for (const segment of rt.segments()) {
    if (segment.isLink() && (segment.link != null)) {
      richText.push(
        <Link
          key={counter}
          href={segment.link.uri}
          className='text-blue-400 hover:underline'
        >
          {segment.text}
        </Link>
      )
    } else if (segment.isMention() && (segment.mention != null)) {
      richText.push(
        <Link
          key={counter}
          href={`/profile/${segment.mention.did}`}
          className='text-blue-500 hover:underline'
        >
          {segment.text}
        </Link>
      )
    } else if (segment.isTag() && (segment.tag != null)) {
      richText.push(
        <Link
          key={counter}
          href={`/tag/${segment.tag.tag}`}
          className='text-blue-500 hover:underline'
        >
          {segment.text}
        </Link>
      )
    } else {
      richText.push(segment.text)
    }

    counter++
  }

  return (
    <p className='min-[300px]:text-base leading-6 break-word break-words whitespace-pre-wrap'>
      {richText}
    </p>
  )
}
