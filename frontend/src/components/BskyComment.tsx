'use client'
import { FC } from 'react'
import { AppBskyFeedDefs } from '@atproto/api'
import { Post } from '@/components/bskyembed/src/components/post'

interface IBskyCommentImplProps {
  thread: AppBskyFeedDefs.ThreadViewPost
  error?: boolean
}

export const BskyCommentImpl: FC<IBskyCommentImplProps> = ({ thread, error }) => {
  return <div className='bskyComment'><Post thread={thread} error={error} /></div>
}
