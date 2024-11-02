'use client'

import { ComWhtwndBlogEntry } from '@/api'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { CommentContext, MentioningRecord } from '@/contexts/CommentContext'
import { EntryContext } from '@/contexts/EntryContext'
import { SessionContextWrapper } from '@/contexts/SessionContext'
import { HeaderContextWrapper } from '@/views/HeaderContextWrapper'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { jsonToLex } from '@atproto/lexicon'
import { FC, ReactNode, useMemo, useState } from 'react'

export interface IContextWrapperProps {
  children: ReactNode
  pds?: string
  did?: string
  handle?: string
  profileString?: string
  entryString?: string
  rkey?: string
  cid?: string
}

export const ContextWrapper: FC<IContextWrapperProps> = ({
  children,
  pds,
  did,
  handle,
  profileString,
  entryString,
  rkey,
  cid
}) => {
  const [entry, setEntry] = useState(entryString !== undefined ? jsonToLex(entryString) as ComWhtwndBlogEntry.Record : undefined)

  const profile = profileString !== undefined ? jsonToLex(profileString) as ProfileViewDetailed : undefined
  const [comments, setComments] = useState<MentioningRecord[]>([])

  const contextValue = useMemo(() => {
    return {
      comments,
      setComments
    }
  }, [comments])

  return (
    <AuthorInfoContext.Provider value={{ did, handle, profile, pds }}>
      <EntryContext.Provider value={{ entry, rkey, cid, setEntry }}>
        <SessionContextWrapper>
          <CommentContext.Provider value={contextValue}>
            <HeaderContextWrapper>
              {children}
            </HeaderContextWrapper>
          </CommentContext.Provider>
        </SessionContextWrapper>
      </EntryContext.Provider>
    </AuthorInfoContext.Provider>
  )
}
