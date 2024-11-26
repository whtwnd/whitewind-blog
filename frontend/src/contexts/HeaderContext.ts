import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Dispatch, SetStateAction, createContext } from 'react'

export interface IHeaderContextValue {
  curProfile?: ProfileViewDetailed
  setCurProfile: Dispatch<SetStateAction<ProfileViewDetailed | undefined>>
  requestAuth: (redirectUri?: string) => void
  setRequestAuth: Dispatch<SetStateAction<(redirectUri?: string) => void>>
}

export const HeaderContext = createContext<IHeaderContextValue>({ setCurProfile: () => {}, requestAuth: () => {}, setRequestAuth: () => {} })
