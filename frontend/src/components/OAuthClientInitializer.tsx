'use client'

import { getRedirectHrefAtom, oauthClientAtom } from '@/atoms/Auth'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function isSameOrigin (href: string): boolean {
  try {
    return new URL(href).origin === window.location.origin
  } catch {
    return false
  }
}

export default (): React.JSX.Element => {
  // auth
  useAtomValue(oauthClientAtom) // initialize oauth client at the very beginning
  const getRedirectHref = useSetAtom(getRedirectHrefAtom)
  const router = useRouter()
  useEffect(() => {
    // oauth redirect — only follow same-origin URLs to prevent open redirect
    const redirectHref = getRedirectHref()
    if (redirectHref !== undefined && isSameOrigin(redirectHref)) {
      router.replace(redirectHref)
    }
  }, [getRedirectHref])
  return <></>
}
