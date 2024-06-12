import { ComWhtwndBlogEntry } from '@/api'
import { Dispatch, SetStateAction, createContext } from 'react'

export interface IEntryContextValue {
  entry?: ComWhtwndBlogEntry.Record
  setEntry?: Dispatch<SetStateAction<ComWhtwndBlogEntry.Record | undefined>>
  rkey?: string
  cid?: string
  comments?: number
}

export const EntryContext = createContext<IEntryContextValue>({})
