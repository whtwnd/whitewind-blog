'use client'

import dynamic from 'next/dynamic'
import { FC, ReactNode, Suspense } from 'react'

const ContextWrapperBody = dynamic(async () => await import('./ContextWrapperBody'), { ssr: false })

export interface IContextWrapperProps {
  children: ReactNode
  pds?: string
  did?: string
  handle?: string
  profileString?: string
  entryString?: string
  rkey?: string
  cid?: string
  fallback?: ReactNode
}

export const ContextWrapper: FC<IContextWrapperProps> = (props) => {
  return (
    <Suspense fallback={props.fallback}>
      <ContextWrapperBody {...props} />
    </Suspense>
  )
}
