import { GenerateSessionManager, SessionManager } from '@/services/Session'
import { FC, ReactNode, createContext, useRef } from 'react'

export type ISessionContextValue = SessionManager

export const SessionContext = createContext<ISessionContextValue>({
  getSession: async () => await Promise.resolve(undefined),
  createSession: async () => await Promise.resolve(undefined),
  deleteSession: async () => await Promise.resolve(undefined),
  getIdentities: async () => await Promise.resolve([]),
  setLastSelected: async () => await Promise.resolve()
})

export const SessionContextWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const manager = useRef(GenerateSessionManager())

  return (
    <SessionContext.Provider value={manager.current}>
      {children}
    </SessionContext.Provider>
  )
}
