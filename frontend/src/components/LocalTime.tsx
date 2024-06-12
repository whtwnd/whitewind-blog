'use client'

import { ReactNode, useLayoutEffect, useState } from 'react'

export interface ILocalTime {
  datetime: string
  datetimeFallback: ReactNode
}

const LocalTime: React.FC<ILocalTime> = ({ datetime, datetimeFallback }) => {
  const [localeString, setLocaleString] = useState<string | undefined>()

  useLayoutEffect(() => {
    setLocaleString(new Date(datetime).toLocaleString(navigator.language))
  }, [datetime])

  return (
    <time>{
        localeString ?? datetimeFallback
    }
    </time>
  )
}

export default LocalTime
