/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'
import * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef'

export interface Main {
  record: ComAtprotoRepoStrongRef.Main
  [k: string]: unknown
}

export function isMain(v: unknown): v is Main {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.bsky.embed.record#main' ||
      v.$type === 'app.bsky.embed.record')
  )
}

export function validateMain(v: unknown): ValidationResult {
  return lexicons.validate('app.bsky.embed.record#main', v)
}

export interface View {
  record: ViewNotFound | { $type: string; [k: string]: unknown }
  [k: string]: unknown
}

export function isView(v: unknown): v is View {
  return (
    isObj(v) && hasProp(v, '$type') && v.$type === 'app.bsky.embed.record#view'
  )
}

export function validateView(v: unknown): ValidationResult {
  return lexicons.validate('app.bsky.embed.record#view', v)
}

export interface ViewNotFound {
  uri: string
  notFound: true
  [k: string]: unknown
}

export function isViewNotFound(v: unknown): v is ViewNotFound {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'app.bsky.embed.record#viewNotFound'
  )
}

export function validateViewNotFound(v: unknown): ValidationResult {
  return lexicons.validate('app.bsky.embed.record#viewNotFound', v)
}
