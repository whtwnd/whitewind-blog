'use client'
import { FC, ReactNode, Suspense, useMemo } from 'react'
import '@/components/bskyembed.css'
import { AppBskyFeedDefs, BskyAgent } from '@atproto/api'
import { Post } from '@/components/bskyembed/src/components/post'

const GenerateBskyComment = (postAtUri: string): FC => {
  let promise: Promise<void> | undefined
  let result: IBskyCommentImplProps | undefined

  async function loadCommentInfo (): Promise<void> {
    const agent = new BskyAgent({
      service: 'https://public.api.bsky.app'
    })
    const data = (await agent.getPostThread({
      uri: postAtUri,
      depth: 0,
      parentHeight: 0
    })).data
    if (!AppBskyFeedDefs.isThreadViewPost(data.thread)) {
      throw new Error('Expected a ThreadViewPost')
    }
    const pwiOptOut = !((data.thread.post.author.labels?.find(
      label => label.val === '!no-unauthenticated'
    )) == null)
    result = { thread: data.thread, error: pwiOptOut }
  }

  const Inner = (): ReactNode => {
    if (promise === undefined) {
      promise = loadCommentInfo()
    }
    if (result === undefined) {
      // eslint-disable-next-line
      throw promise
    }
    return <BskyCommentImpl {...result} />
  }

  const BskyComment: FC = () => {
    return (
      <Suspense>
        <Inner />
      </Suspense>
    )
  }

  return BskyComment
}

export const BskyComment: FC<{ postAtUri: string }> = ({ postAtUri }) => {
  const Comment = useMemo(() => GenerateBskyComment(postAtUri), [postAtUri])
  return <Comment />
}

interface IBskyCommentImplProps {
  thread: AppBskyFeedDefs.ThreadViewPost
  error?: boolean
}

export const BskyCommentImpl: FC<IBskyCommentImplProps> = ({ thread, error }) => {
  return <div className='bskyComment'><Post thread={thread} error={error} /></div>
}

export default BskyComment
