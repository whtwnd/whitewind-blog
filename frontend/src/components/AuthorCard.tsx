import { FC } from 'react'
import { Card } from 'flowbite-react'
import AuthorCardHeader from '@/components/AuthorCardHeader'
import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import CollapsibleParagraph from '@/components/CollapsibleParagraph'

export interface IAuthorCardProps {
  authorInfo: IAuthorInfoContextValue
  collapsible?: boolean
}

export const AuthorCardContent: FC<IAuthorCardProps> = ({ authorInfo, collapsible }) => {
  const profileLines = authorInfo.profile?.description?.split('\n')
  const descriptionElem = profileLines?.map((line, i) => <span key={i}>{line}{i !== profileLines.length - 1 ? <br /> : <></>}</span>)
  return (
    <>
      <AuthorCardHeader authorInfo={authorInfo} />
      <div className='flex flex-col justify-between border-t border-gray-400'>
        <div className='flex space-x-3 flex-col gap-1 items-center text-gray-700'>
          {
                    collapsible !== true
                      ? descriptionElem
                      : <CollapsibleParagraph lines={profileLines ?? []} />
                }
        </div>
      </div>
    </>
  )
}

export const AuthorCard: FC<IAuthorCardProps> = ({ authorInfo, collapsible }) => {
  return (
    <Card className='max-w-sm'>
      <AuthorCardContent authorInfo={authorInfo} collapsible={collapsible} />
    </Card>
  )
}

export default AuthorCard
