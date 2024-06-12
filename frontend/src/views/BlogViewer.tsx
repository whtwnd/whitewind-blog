// import { BlogDocumentContext } from '@/hooks/useBlogDocument';
import { Typography } from '@mui/material'
import { Card } from 'flowbite-react'
// import MDEditor from '@uiw/react-md-editor'
// import { useContext } from 'react';
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown-light.css'
import React, { ReactNode, Suspense, FC } from 'react'
import { MarkdownToHtml } from '@/services/DocProvider'
import { NoTheme } from '@/components/themes/NoTheme'
import { ThemeProps } from '@/components/themes/types'
import CommentList from '@/components/CommentList'
import { BlueskyShareArea } from '@/components/BlueskyShareArea'
import Script from 'next/script'
import { BlueskyShareIconButton } from '@/components/BlueskyShareIconButton'
import { ThreadsShareIconButton } from '@/components/ThreadsShareIconButton'
import { TwitterShareIconButton } from '@/components/TwitterShareIconButton'
import { BottomAuthorCard } from '@/components/BottomAuthorCard'
import { PermalinkIconButton } from '@/components/PermalinkIconbutton'

export interface BlogViewerProps {
  mdHtml: JSX.Element
  disableComments?: boolean
  disableAuthorCard?: boolean
  disableShareButtons?: boolean
  theme?: FC<ThemeProps>
  aturi?: string
  pds?: string
  ogpUrl?: string
}

export function EnsureMdHtmlAvailable (markdown: string, component?: React.FC<{ mdHtml: JSX.Element }>, viewerProps?: Omit<BlogViewerProps, 'mdHtml'>, fallback?: ReactNode): ReactNode {
  let converted: JSX.Element | undefined
  const detectedScripts: string[] = []
  const promise = MarkdownToHtml(markdown, detectedScripts).then((md) => {
    converted = md.result
  }).catch(err => {
    console.error(err)
    converted = <></>
  })
  function Inner (): ReactNode {
    if (converted === undefined) {
      // eslint-disable-next-line
      throw promise
    }
    if (component === undefined) {
      const props = { ...viewerProps, mdHtml: converted }
      return (
        <>
          <BlogViewer {...props} />
          {detectedScripts.map((script, i) => <Script key={i} src={script} async strategy='lazyOnload' />)}
        </>
      )
    } else {
      return component({ mdHtml: converted })
    }
  }
  function Fallback (): ReactNode {
    return (
      <Typography variant='h2'>
        Generating preview...
      </Typography>
    )
  }

  return (
    <Suspense fallback={fallback ?? <Fallback />}>
      <Inner />
    </Suspense>
  )
}

/**
 * Component to display markdown. Can be used both from server side and client side
 * @param param0 Props
 * @returns JSX element
 */
function BlogViewer ({ mdHtml, disableComments, disableAuthorCard, disableShareButtons, theme, aturi, pds, ogpUrl }: BlogViewerProps): ReactNode {
  const Wrapper = theme !== undefined ? theme : NoTheme
  return (
    <div className='flex flex-col gap-4'>
      {/* main content area */}
      <Card>
        <section id='content'>
          <Wrapper mdHtml={mdHtml} />
          {/** share area */}
          {
                        disableShareButtons !== true &&
                          <div className='py-4 gap-4 flex flex-row items-center justify-center'>
                            <BlueskyShareIconButton color='rgb(10,122,255)' tooltipDirection='bottom' />
                            <TwitterShareIconButton color='black' tooltipDirection='bottom' />
                            <ThreadsShareIconButton color='black' tooltipDirection='bottom' />
                            <PermalinkIconButton tooltipDirection='bottom' />
                          </div>
                    }
        </section>
      </Card>
      {/** author area */}
      {disableAuthorCard !== true && <section id='author'><BottomAuthorCard /></section>}
      {
                disableComments !== true &&
                  <>
                    <div>
                      <section id='reaction_area'>
                        <BlueskyShareArea aturi={aturi as string} ogpUrl={ogpUrl} />
                      </section>
                    </div>
                    <div>
                      {aturi !== undefined && <section id='comment'><CommentList entryUri={aturi} pds={pds} /></section>}
                    </div>
                  </>
            }
    </div>
  )
}
export default BlogViewer
