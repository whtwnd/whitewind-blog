import { ComWhtwndBlogEntry } from '@/api'
import AuthorCard from '@/components/AuthorCard'
import EntryHeroSection from '@/components/EntryHeroSection'
import LeftOverlayBlogViewer from '@/components/LeftOverlayBlogViewer'
import { QueryRemover } from '@/components/QueryRemover'
import ThreeColumnBlogView from '@/components/ThreeColumnBlogView'
import { NO_THEME, ThemeMapping } from '@/components/themes'
import { IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import BlogViewer from '@/views/BlogViewer'
import { AtUri } from '@atproto/api'
import Script from 'next/script'
import { FC } from 'react'

export interface BuildBlogViewerArgs {
  docRaw: ComWhtwndBlogEntry.Record
  authorInfo: IAuthorInfoContextValue
  aturi: string
  scripts: string[]
  mdHtml: JSX.Element
  nonce?: string
  contentChanged?: boolean
}

export const BlogViewerPage: FC<BuildBlogViewerArgs> = ({ docRaw, authorInfo, aturi, scripts, mdHtml, nonce, contentChanged }) => {
  return (
    <>
      <ThreeColumnBlogView
        hero={<EntryHeroSection
          title={docRaw.title ?? '(no title)'}
          did={authorInfo.did ?? ''}
          handle={authorInfo.handle}
          lastUpdate={docRaw.createdAt ?? new Date().toISOString()}
          ogpUrl={docRaw.ogp?.url}
          visibility={docRaw.isDraft === true ? 'author' : docRaw.visibility}
          contentChanged={contentChanged}
              />}
        left={<LeftOverlayBlogViewer
          authorIdentity={authorInfo.did ?? ''}
          rkey={new AtUri(aturi).rkey}
          ogpUrl={docRaw.ogp?.url}
              />}
        center={<BlogViewer mdHtml={mdHtml} theme={ThemeMapping.get(docRaw?.theme ?? NO_THEME)} aturi={aturi} pds={authorInfo.pds} ogpUrl={docRaw.ogp?.url} />}
        right={<AuthorCard authorInfo={authorInfo} collapsible />}
      />
      <QueryRemover />
      {scripts.map(scriptName => <Script async src={scriptName} strategy='lazyOnload' key={scriptName} nonce={nonce} />)}
    </>
  )
}
