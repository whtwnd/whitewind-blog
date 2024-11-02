import { BlueLinkatBoard, ComWhtwndBlogEntry, FyiUnravelFrontpagePost } from '@/api'
import { AtUri } from '@atproto/api'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { BlockedPost, NotFoundPost, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { Dispatch, SetStateAction, createContext } from 'react'

export interface MentioningRecord {
  uri: AtUri
  date: string
  profile?: ProfileViewDetailed
  bsky?: ThreadViewPost | NotFoundPost | BlockedPost | {}
  whtwnd?: ComWhtwndBlogEntry.Record
  linkat?: BlueLinkatBoard.Record
  frontpage?: FyiUnravelFrontpagePost.Record
}

export interface CommentContextValue {
  comments: MentioningRecord[]
  setComments: Dispatch<SetStateAction<MentioningRecord[]>>
}

export const CommentContext = createContext<CommentContextValue>({ comments: [], setComments: () => {} })
