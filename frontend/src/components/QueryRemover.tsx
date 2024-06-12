'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export const QueryRemover = (): ReactNode => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  useEffect(() => {
    if (searchParams.size > 0) {
      window.history.replaceState({}, '', `${pathname}`)
    }
  }, [searchParams, pathname])
  return <></>
}
