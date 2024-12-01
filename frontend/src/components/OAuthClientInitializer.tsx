'use client'

import { getRedirectHrefAtom, oauthClientAtom } from '@/atoms/Auth'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export default (): React.JSX.Element => {
  // auth
  useAtomValue(oauthClientAtom) // initialize oauth client at the very beginning
  const getRedirectHref = useSetAtom(getRedirectHrefAtom)
  const router = useRouter()
  useEffect(() => {
    // oauth redirect
    const redirectHref = getRedirectHref()
    if (redirectHref !== undefined) {
      router.replace(redirectHref)
    }
  }, [getRedirectHref])
  return <></>
}
