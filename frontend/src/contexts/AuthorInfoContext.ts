import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { createContext } from 'react'

export interface IAuthorInfoContextValue {
  did?: string
  handle?: string
  profile?: ProfileViewDetailed
  pds?: string
}

export const AuthorInfoContext = createContext<IAuthorInfoContextValue>({})
