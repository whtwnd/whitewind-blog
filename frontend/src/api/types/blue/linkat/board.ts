/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../util'
import { lexicons } from '../../../lexicons'
import { CID } from 'multiformats/cid'

export interface Record {
  /** List of cards in the board. */
  cards: Card[]
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'blue.linkat.board#main' || v.$type === 'blue.linkat.board')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('blue.linkat.board#main', v)
}

export interface Card {
  /** URL of the link */
  url?: string
  /** Text of the card */
  text?: string
  [k: string]: unknown
}

export function isCard(v: unknown): v is Card {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'blue.linkat.board#card'
}

export function validateCard(v: unknown): ValidationResult {
  return lexicons.validate('blue.linkat.board#card', v)
}
