'use client'
import React, { useContext } from 'react'
import Favorite from '@mui/icons-material/Favorite'
import RepeatIcon from '@mui/icons-material/Repeat'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import { CommentContext } from '@/contexts/CommentContext'
import { isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { BlueskyShareIconButton } from '@/components/BlueskyShareIconButton'
import { ThreadsShareIconButton } from '@/components/ThreadsShareIconButton'
import { TwitterShareIconButton } from '@/components/TwitterShareIconButton'
import { PermalinkIconButton } from '@/components/PermalinkIconbutton'

export interface LeftOverlayProps {
  authorIdentity: string
  rkey: string
  ogpUrl?: string
  disabled?: boolean
}

const LeftOverlayBlogViewer: React.FC<LeftOverlayProps> = () => {
  const { comments } = useContext(CommentContext)
  let likes = 0
  let reposts = 0
  const numComments = comments.length
  for (const comment of comments) {
    if (isThreadViewPost(comment)) {
      likes += comment.post.likeCount ?? 0
      reposts += comment.post.repostCount ?? 0
    }
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <BlueskyShareIconButton />
      <TwitterShareIconButton />
      <ThreadsShareIconButton />
      <div className='group relative cursor-pointer flex flex-row gap-1'>
        <PermalinkIconButton tooltipDirection='top' />
        <div className='hidden absolute left-12 group-hover:block'>
          <PermalinkIconButton strict color='#030712' tooltipDirection='top' />
        </div>
      </div>
      <div className='flex align-center items-center h-10'>
        <ChatBubbleIcon color='action' />
        <span className='ml-1'>{numComments}</span>
      </div>
      <div className='flex align-center items-center h-10'>
        <Favorite color='action' />
        <span className='ml-1'>{likes}</span>
      </div>
      <div className='flex align-center items-center h-10'>
        <RepeatIcon color='action' />
        <span className='ml-1'>{reposts}</span>
      </div>
    </div>
  )
}
export default LeftOverlayBlogViewer
