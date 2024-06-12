import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Dispatch, SetStateAction, createContext } from 'react'

export interface IHeaderContextValue {
  curProfile?: ProfileViewDetailed
  setCurProfile: Dispatch<SetStateAction<ProfileViewDetailed | undefined>>
  requestAuth: () => void
  setRequestAuth: Dispatch<SetStateAction<() => void>>
}

export const HeaderContext = createContext<IHeaderContextValue>({ setCurProfile: () => {}, requestAuth: () => {}, setRequestAuth: () => {} })
