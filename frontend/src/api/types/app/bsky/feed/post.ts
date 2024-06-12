/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'
import * as AppBskyRichtextFacet from '../richtext/facet'
import * as AppBskyEmbedExternal from '../embed/external'
import * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs'

export interface Record {
  /** The primary post content. May be an empty string, if there are embeds. */
  text: string
  /** Annotations of text (mentions, URLs, hashtags, etc) */
  facets?: AppBskyRichtextFacet.Main[]
  embed?: AppBskyEmbedExternal.Main | { $type: string; [k: string]: unknown }
  /** Indicates human language of post primary text content. */
  langs?: string[]
  labels?:
    | ComAtprotoLabelDefs.SelfLabels
    | { $type: string; [k: string]: unknown }
  /** Additional hashtags, in addition to any included in post text and facets. */
  tags?: string[]
  /** Client-declared timestamp when this post was originally created. */
  createdAt: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.bsky.feed.post#main' || v.$type === 'app.bsky.feed.post')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.bsky.feed.post#main', v)
}
