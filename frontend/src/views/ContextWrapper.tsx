'use client'

import { ComWhtwndBlogEntry } from '@/api'
import { appStore } from '@/atoms'
import { LoadingView } from '@/components/LoadingView'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { CommentContext, MentioningRecord } from '@/contexts/CommentContext'
import { EntryContext } from '@/contexts/EntryContext'
import { HeaderContextWrapper } from '@/views/HeaderContextWrapper'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { jsonToLex } from '@atproto/lexicon'
import { Provider } from 'jotai'
import dynamic from 'next/dynamic'
import React, { ReactNode, Suspense, useMemo, useState } from 'react'
const OAuthClientInitializer = dynamic(async () => await import('../components/OAuthClientInitializer'), { ssr: false })

export interface IContextWrapperProps {
  children: ReactNode
  pds?: string
  did?: string
  handle?: string
  profileString?: string
  entryString?: string
  rkey?: string
  cid?: string
  initOAuthClient?: boolean
}

export const ContextWrapper = ({
  children,
  pds,
  did,
  handle,
  profileString,
  entryString,
  rkey,
  cid,
  initOAuthClient
}: IContextWrapperProps): React.JSX.Element => {
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
    <Provider store={appStore}>
      <AuthorInfoContext.Provider value={{ did, handle, profile, pds }}>
        <EntryContext.Provider value={{ entry, rkey, cid, setEntry }}>
          <CommentContext.Provider value={contextValue}>
            <HeaderContextWrapper>
              {children}
              {
                initOAuthClient === true &&
                  <Suspense fallback={<LoadingView message='Loading authentication data...' />}>
                    <OAuthClientInitializer />
                  </Suspense>
              }
            </HeaderContextWrapper>
          </CommentContext.Provider>
        </EntryContext.Provider>
      </AuthorInfoContext.Provider>
    </Provider>
  )
}
