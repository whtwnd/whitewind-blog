'use client'
import { FC, useRef } from 'react'
import useTruncatedElement from '@/hooks/useTruncatedElement'

export interface ICollapsibleParagraphProps {
  lines: string[]
}

export const CollapsibleParagraph: FC<ICollapsibleParagraphProps> = ({ lines }) => {
  const ref = useRef<HTMLParagraphElement>(null)
  const { isTruncated, isReadingMore, setIsReadingMore } = useTruncatedElement({
    ref,
    initial: lines !== undefined && lines?.length > 1
  })
  return (
    <div className='flex flex-col justify-between'>
      <div className='mt-4 flex space-x-3 flex-col gap-1 items-center'>
        <p ref={ref} className={`break-all text-sm ${!isReadingMore ? 'line-clamp-3' : ''}`}>
          {lines?.map((line, i) => <span key={i}>{line}{i !== lines.length - 1 ? <br /> : <></>}</span>)}
        </p>
        {isTruncated && !isReadingMore && (
          <button className='px-2 w-fit rounded border border-sky-400 text-sky-400 transition duration-200 hover:bg-sky-400 hover:text-gray-100' onClick={() => setIsReadingMore(true)}>
            Read more
          </button>
        )}
      </div>
    </div>
  )
}

export default CollapsibleParagraph
