'use client'

import { ComWhtwndBlogEntry } from '@/api'
import { appStore } from '@/atoms'
import { clientInitResultAsyncAtom, getRedirectHrefAtom, writeInitResultAtom } from '@/atoms/Auth'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { CommentContext, MentioningRecord } from '@/contexts/CommentContext'
import { EntryContext } from '@/contexts/EntryContext'
import { IContextWrapperProps } from '@/views/ContextWrapper'
import { HeaderContextWrapper } from '@/views/HeaderContextWrapper'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { jsonToLex } from '@atproto/lexicon'
import { Provider, useAtomValue, useSetAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

export default ({
  children,
  pds,
  did,
  handle,
  profileString,
  entryString,
  rkey,
  cid
}: IContextWrapperProps): React.JSX.Element => {
  // auth
  const initResult = useAtomValue(clientInitResultAsyncAtom) // initialize oauth client at the very beginning
  useHydrateAtoms([[writeInitResultAtom, initResult]])
  const getRedirectHref = useSetAtom(getRedirectHrefAtom)
  const router = useRouter()
  useEffect(() => {
    // oauth redirect
    const redirectHref = getRedirectHref()
    if (redirectHref !== undefined) {
      router.replace(redirectHref)
    }
  }, [getRedirectHref])

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
            </HeaderContextWrapper>
          </CommentContext.Provider>
        </EntryContext.Provider>
      </AuthorInfoContext.Provider>
    </Provider>
  )
}
