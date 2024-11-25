import { AtpBaseClient, ComWhtwndBlogEntry, ComWhtwndBlogGetEntryMetadataByName } from '@/api'
import * as prod from 'react/jsx-runtime'

import { AtUri, isValidRecordKey } from '@atproto/syntax'

import rehypeReact from 'rehype-react'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import { unified, Plugin } from 'unified'
import type { Node } from 'unist'
// import { inspect } from 'unist-util-inspect'
import type { Root, Element } from 'hast'
import { isJavaScript } from 'hast-util-is-javascript'
import { Schema } from 'node_modules/rehype-sanitize/lib'
import { remark } from 'remark'
import strip from 'strip-markdown'
import { GetReplacedGetBlobURL } from '@/services/commonUtils'

const production = {
  Fragment: prod.Fragment,
  jsx: prod.jsx,
  jsxs: prod.jsxs,
  components: {
    script: () => <></>,
    ul: (props: JSX.IntrinsicElements['ul']) => <ul {...props} className='list-disc text-gray-700' />,
    ol: (props: JSX.IntrinsicElements['ol']) => <ol {...props} className='list-decimal text-gray-700' />,
    p: (props: JSX.IntrinsicElements['p']) => <p {...props} className='leading-7' />,
    iframe: (props: JSX.IntrinsicElements['iframe']) => {
      return <div className='w-full flex justify-center'><iframe {...props} className='max-w-full' /></div>
    }
  }
}

// const remarkDisplay: Plugin<void[], Node, Node> = () => {
//    return (tree) => {
//        console.log(inspect(tree))
//        tree
//    }
// }

const AllowedHosts: Set<string> = new Set([
  'embed.bsky.app',
  'platform.twitter.com',
  'www.tiktok.com',
  'www.instagram.com',
  'www.youtube.com'
])

const recursiveScriptDetector = (node: Element, scripts: string[]): boolean => {
  if (isJavaScript(node)) {
    const src = node.properties.src as string | undefined
    if (src === undefined) {
      return false
    }
    let host = ''
    if (src.startsWith('//')) {
      host = src.slice(2).split('/')[0]
    } else if (src.startsWith('https://')) {
      host = new URL(src).host
    }
    if (AllowedHosts.has(host)) {
      scripts.push(src)
    }
    return false
  }
  node.children = node.children.filter(child => {
    return child.type !== 'element' || recursiveScriptDetector(child, scripts)
  })
  return true
}

const GenerateRehypeScriptDetect = (scripts: string[]): Plugin<any, Root, Node> => {
  const rehypeScriptDetector: Plugin<any, Root, Node> = () => {
    return (tree) => {
      tree.children = tree.children.filter(child => {
        if (child.type !== 'element') {
          return true
        }
        return recursiveScriptDetector(child, scripts)
      })
    }
  }
  return rehypeScriptDetector
}

const replaceGetBlobAndFixFootnote = (child: Node): void => {
  if (child.type !== 'element') {
    return
  }
  const elem = child as Element

  // Replace image URL that starts with com.atproto.sync.getBlob with our CDN one
  const src = elem.properties.src
  if (src !== undefined && typeof src === 'string') {
    const replaced = GetReplacedGetBlobURL(src)
    if (replaced !== undefined) {
      elem.properties.src = replaced
    }
  }
  // Fix footnote link
  // rehypeGfm creates link #user-content-fn-1 or something like that. It also adds ids like #user-content-fn-1 to footnote <li> elements
  // rehypeSanitize adds "user-content-" to all HTML ids. As a result, li elements will have ids like #user-content-user-content-fn-1
  // this fixes that
  const id = elem.properties.id
  const PREFIX = 'user-content-user-content-'
  if (id !== undefined && typeof id === 'string' && id.startsWith(PREFIX)) {
    elem.properties.id = id.replace(PREFIX, 'user-content-')
  }
  elem.children.forEach(child => replaceGetBlobAndFixFootnote(child))
}

const rehypeReplaceGetBlobAndFixFootnote: Plugin<any, Root, Node> = () => {
  return (tree) => {
    tree.children.forEach(child => replaceGetBlobAndFixFootnote(child))
  }
}

const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    font: [...(defaultSchema.attributes?.font ?? []), 'color'],
    blockquote: [
      ...(defaultSchema.attributes?.blockquote ?? []),
      // bluesky
      'className',
      'dataBlueskyUri',
      'dataBlueskyCid',
      // instagram
      'dataInstgrmCaptioned',
      'dataInstgrmPermalink',
      'dataInstgrmVersion'
    ],
    iframe: [
      'width', 'height', 'title', 'frameborder', 'allow', 'referrerpolicy', 'allowfullscreen', 'style', 'seamless',
      ['src', /https:\/\/(www.youtube.com|bandcamp.com)\/.*/]
    ],
    section: ['dataFootnotes', 'className']
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'font', 'mark', 'iframe', 'section']
}
export const MarkdownToPlaintext = async (markdownContent: string): Promise<any> => {
  return await remark()
    .use(strip)
    .process(markdownContent)
}

export const MarkdownToHtml = async (markdownContent: string, scripts?: string[]): Promise<any> => {
  const rehypeScriptDetect = GenerateRehypeScriptDetect(scripts ?? [])
  return await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeScriptDetect)
  // .use(remarkDisplay)
    .use(rehypeSanitize, customSchema as Schema)
    .use(rehypeHighlight)
  // .use(rehypeStringify)
    .use(rehypeReplaceGetBlobAndFixFootnote)
    .use(rehypeReact, production as any) // for some reason, production needs to be castable to boolean, according to the compiler
    .process(markdownContent)
}

export const createClient = (hostname: string): AtpBaseClient => {
  return new AtpBaseClient(`https://${hostname}`)
}

export type MetaData = ComWhtwndBlogGetEntryMetadataByName.Response

export async function ResolveEntryMetadata (authorIdentity: string, entryTitle: string): Promise<MetaData> {
  const appViewClient = createClient(process.env.NEXT_PUBLIC_API_HOSTNAME as string)
  try {
    // maybe we can directly query database instead of calling xrpc
    const metadata = await appViewClient.com.whtwnd.blog.getEntryMetadataByName({ author: authorIdentity, entryTitle: decodeURI(entryTitle) })
    if (!metadata.success) {
      console.error(`The requested entry title ${entryTitle} wasn't found`)
      throw new Error(`The requested entry title ${entryTitle} wasn't found`)
    }
    return metadata
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function LoadBlogDocument (authorIdentity: string, pds?: string, rkey?: string, cid?: string): Promise<[ComWhtwndBlogEntry.Record, string | undefined] | undefined> {
  // determine if hostname is provided by DID
  const uri = new AtUri(`at://${authorIdentity}/com.whtwnd.blog.entry/${rkey as string}`)

  if (rkey !== undefined && !isValidRecordKey(rkey)) {
    console.log('Invalid record key')
    return
  }

  try {
    const ret = await createClient(pds ?? 'bsky.social').com.atproto.repo.getRecord({ repo: uri.hostname, collection: uri.collection, rkey: uri.rkey, cid })
    return [ret.data.value as ComWhtwndBlogEntry.Record, ret.data.cid]
  } catch (err) {
    console.error(err)
  }
}
