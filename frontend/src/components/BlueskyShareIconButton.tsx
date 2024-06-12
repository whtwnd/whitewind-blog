'use client'
import { Link } from '@/components/bskyembed/src/components/link'
import { IconButton } from '@mui/material'
import { Tooltip } from 'flowbite-react'
import { FC, useEffect, useState } from 'react'

export interface IBlueskyShareIconButtonProps {
  tooltipDirection?: 'auto' | 'top' | 'right' | 'bottom' | 'left'
  color?: string
}

export const BlueskyShareIconButton: FC<IBlueskyShareIconButtonProps> = ({ tooltipDirection, color }) => {
  const [shareContent, setShareContent] = useState('')

  useEffect(() => {
    setShareContent(encodeURIComponent(`${document.title}\n${window.location.href}`))
  }, [])
  return (
    <Tooltip content='Share in Bluesky' placement={tooltipDirection ?? 'left'}>
      <Link href={`https://bsky.app/intent/compose?text=${shareContent}`} target='_blank' rel='noreferrer'>
        <IconButton style={{ width: 51, height: 51 }}>
          <svg xmlns='http://www.w3.org/2000/svg' width='100%' fill='none' viewBox='0 0 320 286'><path fill={color ?? 'currentColor'} d='M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.948-86.633 90.636-114.439C277.107-.917 320-16.44 320 32.957c0 9.865-5.603 82.875-8.889 94.729-11.423 41.208-53.045 51.719-90.071 45.357 64.719 11.12 81.182 47.953 45.627 84.785-80 82.874-106.667-44.333-106.667-44.333s-26.667 127.207-106.667 44.333c-35.555-36.832-19.092-73.665 45.627-84.785-37.026 6.362-78.648-4.149-90.071-45.357C5.603 115.832 0 42.822 0 32.957 0-16.44 42.893-.917 69.364 19.147Z' /></svg>
        </IconButton>
      </Link>
    </Tooltip>
  )
}
