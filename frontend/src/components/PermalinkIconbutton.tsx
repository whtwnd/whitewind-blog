'use client'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { EntryContext } from '@/contexts/EntryContext'
import { IconButton } from '@mui/material'
import { Tooltip } from 'flowbite-react'
import { FC, useContext, useRef, useState } from 'react'

export interface IPermalinkIconButtonProps {
  tooltipDirection?: 'auto' | 'top' | 'right' | 'bottom' | 'left'
  color?: string
}

export const PermalinkIconButton: FC<IPermalinkIconButtonProps> = ({ tooltipDirection, color }) => {
  const [isLink, setIsLink] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const entryInfo = useContext(EntryContext)
  const authorInfo = useContext(AuthorInfoContext)

  const onClick = (): void => {
    void navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/${authorInfo.did as string}/${entryInfo.rkey as string}/${entryInfo.cid as string}`).then(() => {
      setIsLink(true)
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => setIsLink(false), 1000)
    })
  }

  return (
    <Tooltip content='Copy permalink' placement={tooltipDirection ?? 'left'}>
      <IconButton onClick={onClick} style={{ width: 51, height: 51 }}>
        {
                !isLink
                  ? (
                    <svg className='w-12 h-12 text-gray-500' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <path fill={color} stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961' />
                    </svg>
                    )
                  : (
                    <svg className='w-12 h-12 text-gray-500' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
                      <path fill={color} stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 11.917 9.724 16.5 19 7.5' />
                    </svg>
                    )
            }
      </IconButton>
    </Tooltip>
  )
}
