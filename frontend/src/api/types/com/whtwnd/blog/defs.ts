/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'

export interface BlogEntry {
  content: string
  createdAt?: string
  [k: string]: unknown
}

export function isBlogEntry(v: unknown): v is BlogEntry {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.whtwnd.blog.defs#blogEntry'
  )
}

export function validateBlogEntry(v: unknown): ValidationResult {
  return lexicons.validate('com.whtwnd.blog.defs#blogEntry', v)
}

export interface Comment {
  content: string
  entryUri: string
  [k: string]: unknown
}

export function isComment(v: unknown): v is Comment {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.whtwnd.blog.defs#comment'
  )
}

export function validateComment(v: unknown): ValidationResult {
  return lexicons.validate('com.whtwnd.blog.defs#comment', v)
}

export interface Ogp {
  url: string
  width?: number
  height?: number
  [k: string]: unknown
}

export function isOgp(v: unknown): v is Ogp {
  return (
    isObj(v) && hasProp(v, '$type') && v.$type === 'com.whtwnd.blog.defs#ogp'
  )
}

export function validateOgp(v: unknown): ValidationResult {
  return lexicons.validate('com.whtwnd.blog.defs#ogp', v)
}

export interface BlobMetadata {
  blobref: BlobRef
  name?: string
  [k: string]: unknown
}

export function isBlobMetadata(v: unknown): v is BlobMetadata {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.whtwnd.blog.defs#blobMetadata'
  )
}

export function validateBlobMetadata(v: unknown): ValidationResult {
  return lexicons.validate('com.whtwnd.blog.defs#blobMetadata', v)
}
