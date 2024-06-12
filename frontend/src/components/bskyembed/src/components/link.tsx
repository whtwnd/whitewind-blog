import React from 'react'

export function Link ({
  href,
  className,
  ...props
}: {
  href: string
  className?: string
} & React.HTMLProps<HTMLAnchorElement>) {
  return (
    <a
      href={`${href.startsWith('http') ? href : `https://bsky.app${href}`
        }`}
      target='_blank'
      rel='noopener noreferrer nofollow'
      onClick={evt => evt.stopPropagation()}
      className={`cursor-pointer ${className || ''}`}
      {...props}
    />
  )
}
