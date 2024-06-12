import type { Metadata } from 'next'
import { schemaDict } from '@/api/lexicons'
import { Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import ThreeColumnBlogView from '@/components/ThreeColumnBlogView'
import { MarkdownToHtml } from '@/services/DocProvider'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown-light.css'

export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false
export const fetchCache = 'auto'
export const runtime = 'nodejs'
export const preferredRegion = 'all'

export const metadata: Metadata = {
  title: 'WhiteWind lexicons'
}

export default async function Page (): Promise<JSX.Element> {
  const elems: ReactNode[] = []
  for (const key in schemaDict) {
    const dotted = key.replace(/([a-z])([A-Z])/g, '$1.$2').toLowerCase()
    const splitted = dotted.split('.')
    let methodName = splitted.slice(0, 3).join('.') + '.' + splitted[3]
    if (splitted.length > 4) {
      methodName += splitted.slice(4).map(seg => seg[0].toUpperCase() + seg.slice(1)).join('')
    }

    if (!methodName.startsWith('com.whtwnd.')) {
      continue
    }

    // eslint-disable-next-line
        const contentMarkdown = '```JSON\n' + JSON.stringify((schemaDict as { [key: string]: any })[key], undefined, 2) + '\n```'

    elems.push(
      <details>
        <summary>{methodName}</summary>
        <div className='markdown-body'>{(await MarkdownToHtml(contentMarkdown)).result}</div>
      </details>
    )
  }

  return (
    <ThreeColumnBlogView center={
      <Stack>
        <Typography variant='h4'>com.whtwnd lexicons (including not used or implemented)</Typography>
        {elems}
      </Stack>
    }
    />
  )
}
