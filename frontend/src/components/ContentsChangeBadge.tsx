import { Tooltip } from 'flowbite-react'
import { FC } from 'react'

export const ContentsChangeBadge: FC = () => {
  return (
    <Tooltip placement='bottom' content={<p>The content has changed since the link was issued.</p>}>
      <p className='bg-pink-100 text-pink-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded'>Contents changed</p>
    </Tooltip>
  )
}

export default ContentsChangeBadge
