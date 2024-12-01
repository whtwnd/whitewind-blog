'use client'

import { HeaderContext } from '@/contexts/HeaderContext'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { FC, ReactNode, useState } from 'react'

export const HeaderContextWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const [curProfile, setCurProfile] = useState<ProfileViewDetailed | undefined>()
  const initialRequestAuth = (): void => {}
  const [requestAuth, setRequestAuth] = useState<(redirectUri?: string) => void>(initialRequestAuth)
  return (
    <HeaderContext.Provider value={{ curProfile, setCurProfile, requestAuth, setRequestAuth }}>
      {children}
    </HeaderContext.Provider>
  )
}
