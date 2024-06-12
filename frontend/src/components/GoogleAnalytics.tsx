'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { FC, ReactNode, useEffect } from 'react'
import { IS_GATAG, pageview } from '@/libs/gtag'

export interface IGoogleAnalyticsProps {
  children: ReactNode
}

const GoogleAnalytics: FC<IGoogleAnalyticsProps> = ({ children }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!IS_GATAG) {
      return
    }
    const url = pathname + searchParams.toString()
    pageview(url)
  }, [pathname, searchParams])

  return (
    <>
      {children}
    </>
  )
}

export default GoogleAnalytics
