/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'
import * as ComWhtwndBlogDefs from './defs'

export interface Record {
  content: string
  createdAt?: string
  title?: string
  ogp?: ComWhtwndBlogDefs.Ogp
  theme?: 'github-light'
  blobs?: ComWhtwndBlogDefs.BlobMetadata[]
  /** (DEPRECATED) Marks this entry as draft to tell AppViews not to show it to anyone except for the author */
  isDraft?: boolean
  /** Tells the visibility of the article to AppView. */
  visibility: 'public' | 'url' | 'author'
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'com.whtwnd.blog.entry#main' ||
      v.$type === 'com.whtwnd.blog.entry')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('com.whtwnd.blog.entry#main', v)
}
