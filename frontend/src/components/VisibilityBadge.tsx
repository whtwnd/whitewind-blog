import { ComWhtwndBlogEntry } from '@/api'
import { FC } from 'react'

export interface IEntryBadgeProps {
  visibility: ComWhtwndBlogEntry.Record['visibility']
  showPublic?: boolean
}

export const VisibilityBadge: FC<IEntryBadgeProps> = ({ visibility, showPublic }) => {
  if (visibility === 'url') {
    return <span className='bg-blue-100 text-blue-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded'>Anyone with the link</span>
  } else if (visibility === 'author') {
    return <span className='bg-yellow-100 text-yellow-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded'>Author only</span>
  } else if (showPublic === true) {
    return <span className='bg-green-100 text-green-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded'>Public</span>
  } else {
    return <></>
  }
}

export default VisibilityBadge
