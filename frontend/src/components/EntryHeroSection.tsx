import { ComWhtwndBlogEntry } from '@/api'
import ContentsChangeBadge from '@/components/ContentsChangeBadge'
import LocalTime from '@/components/LocalTime'
import VisibilityBadge from '@/components/VisibilityBadge'
import { GetReplacedGetBlobURL } from '@/services/commonUtils'
import { CSSProperties, FC } from 'react'

export interface IEntryHeroSectionProps {
  title: string
  did: string
  handle?: string
  lastUpdate: string
  ogpUrl?: string
  visibility?: ComWhtwndBlogEntry.Record['visibility']
  contentChanged?: boolean
}

export const EntryHeroSection: FC<IEntryHeroSectionProps> = ({ title, did, handle, lastUpdate, ogpUrl, visibility, contentChanged }) => {
  const titleLines = title.split('\n')
  const isOgpEmpty = ogpUrl === undefined || ogpUrl.length === 0

  if (ogpUrl !== undefined) {
    const replaced = GetReplacedGetBlobURL(ogpUrl)
    ogpUrl = replaced ?? ogpUrl
  }

  const cssProps = { '--image-url': `url(${ogpUrl ?? ''})` }
  const backgroundStyle = !isOgpEmpty ? cssProps as CSSProperties : undefined
  const backgroundClassName = !isOgpEmpty ? 'bg-[image:var(--image-url)] bg-cover bg-center bg-no-repeat' : undefined
  const mainClassName = `flex justify-center ${!isOgpEmpty ? 'backdrop-blur-sm backdrop-brightness-50' : ''}`
  const titleFontClassName = `font-semibold text-2xl sm:text-4xl ${!isOgpEmpty ? 'text-white' : 'text-gray-700'}`
  const handleClassName = `text-md sm:text-lg ${!isOgpEmpty ? 'text-gray-300' : 'text-gray-400'}`
  const subtitleClassName = `w-fit text-md sm:text-lg ${!isOgpEmpty ? 'text-gray-300' : 'text-gray-400'}`

  return (
    <div style={backgroundStyle} className={backgroundClassName}>
      <div className={mainClassName}>
        <div
          className='min-h-[20vh] sm:min-h-[30vh] max-w-[800px] lg:max-w-[1225px] px-4 pt-4 flex justify-center items-center'
        >
          <div className='flex flex-col w-fit'>
            <h1 className={titleFontClassName}>{titleLines.map(
              (line, i) => i !== titleLines.length - 1 ? <p className='w-fit break-words' key={i}>{line}<br /></p> : <p className='w-fit break-words' key={i}>{line}</p>
            )}
            </h1>
            <a href={`/${handle ?? did}`} className='w-fit'><h2 className={handleClassName}>@{handle ?? did}</h2></a>
            <h2 className={subtitleClassName}><time><LocalTime datetime={lastUpdate} datetimeFallback={<p>{lastUpdate}</p>} /></time></h2>

            {/* badge area */}
            <div className='flex flex-row gap-1'>
              {visibility === 'author' && <VisibilityBadge visibility='author' />}
              {contentChanged === true && <ContentsChangeBadge />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EntryHeroSection
