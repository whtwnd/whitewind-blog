/* eslint-disable*/
import { ReactNode, useEffect, useRef } from 'react'

import { Link } from './link'

export function Container ({
  children,
  href
}: {
  children: ReactNode
  href?: string
}): ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const prevHeight = useRef(0)

  useEffect(() => {
    if (ref.current != null) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0]
        // eslint-disable-next-line
        if (!entry) return

        let { height } = entry.contentRect
        height += 2 // border top and bottom
        if (height !== prevHeight.current) {
          prevHeight.current = height
          window.parent.postMessage(
            { height, id: new URLSearchParams(window.location.search).get('id') },
            '*'
          )
        }
      })
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className='w-full bg-white hover:bg-neutral-50 relative transition-colors flex'
      onClick={() => {
        if ((ref.current != null) && href) {
          // forwardRef requires preact/compat - let's keep it simple
          // to keep the bundle size down
          const anchor = ref.current.querySelector('a')
          if (anchor != null) {
            anchor.click()
          }
        }
      }}
    >
      {href && <Link href={href} />}
      <div className='flex-1 px-4 pt-3 pb-2.5'>{children}</div>
    </div>
  )
}
