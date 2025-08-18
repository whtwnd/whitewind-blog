import { ComWhtwndBlogEntry } from '@/api'
import { FC } from 'react'
import ToolTip from './ToolTip'
import { Link } from '@mui/material'

export interface IEntryBadgeProps {
  visibility: ComWhtwndBlogEntry.Record['visibility']
  showPublic?: boolean
}

export const VisibilityBadge: FC<IEntryBadgeProps> = ({ visibility, showPublic }) => {
  if (visibility === 'url') {
    return <span className='bg-blue-100 text-blue-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded'>Anyone with the link <ToolTip>This article will only be viewable on WhiteWind by those who have the direct link. However, it will still be publicly accessible via your personal data server (PDS).<br /><br /><Link href="https://whtwnd.com/whtwnd.com/3kt3lixripz2s" target="_blank" rel="noopener noreferrer">Learn more</Link></ToolTip></span>
  } else if (visibility === 'author') {
    return <span className='bg-yellow-100 text-yellow-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded'>Author only <ToolTip>This article will only be viewable on WhiteWind by you. However, it will still be publicly accessible via your personal data server (PDS).<br /><br /><Link href="https://whtwnd.com/whtwnd.com/3kt3lixripz2s" target="_blank" rel="noopener noreferrer">Learn more</Link></ToolTip></span>
  } else if (showPublic === true) {
    return <span className='bg-green-100 text-green-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded'>Public</span>
  } else {
    return <></>
  }
}

export default VisibilityBadge
