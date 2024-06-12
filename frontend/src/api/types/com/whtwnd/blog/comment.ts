/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'

export interface Record {
  content: string
  entryUri: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'com.whtwnd.blog.comment#main' ||
      v.$type === 'com.whtwnd.blog.comment')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('com.whtwnd.blog.comment#main', v)
}
