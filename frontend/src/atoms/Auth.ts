import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import clientMetadata from '@/../public/oauth/client-metadata.json'
import { BrowserOAuthClient, OAuthSession } from '@atproto/oauth-client-browser'

export interface AuthState {
  ident: string
  redirect: string
}

type InitResult = { session: OAuthSession, state?: string | null } | undefined

export interface SeenUser {
  handle: string
  lastSelected?: string
}

export interface GetIdentityResult {
  handle: string
  did: string
  lastSelected?: string
}

const loopbackMetadata = {
  client_id: `http://localhost/?redirect_uri=${encodeURIComponent('http://127.0.0.1:3000/oauth/callback')}&scope=${encodeURIComponent('atproto transition:generic')}`,
  scope: 'atproto transition:generic',
  redirect_uris: ['http://127.0.0.1:3000/oauth/callback'],
  client_name: 'Loopback client',
  response_types: ['code'],
  grant_types: ['authorization_code', 'refresh_token'],
  token_endpoint_auth_method: 'none',
  application_type: 'native',
  dpop_bound_access_tokens: true
}

const isAuthState = (obj: Record<string, any> | undefined): obj is AuthState => {
  return typeof obj?.ident === 'string' && typeof obj.redirect === 'string'
}

export const oauthClientAtom = atom(_get => new BrowserOAuthClient({ clientMetadata: process.env.NODE_ENV === 'production' ? clientMetadata : loopbackMetadata, handleResolver: 'https://public.api.bsky.app' } as any))

export const clientInitResultAsyncAtom = atom<Promise<InitResult>>(
  async get => {
    const client = get(oauthClientAtom)
    return await client.init()
  }
)

const rawRedirectHrefAtom = atom<string>()

export const getRedirectHrefAtom = atom(
  null,
  (get, set) => {
    const ret = get(rawRedirectHrefAtom)
    // null-out to prevent navigation problem
    // since Next.js reuses current JavaScript session, even the page changes, these values persist
    set(rawRedirectHrefAtom, undefined)
    return ret
  }
)

export const seenUsersAtom = atomWithStorage<Record<string, SeenUser>>('seenUsers', {}, undefined, { getOnInit: true })

export const deleteSeenUserAtom = atom(
  null,
  (get, set, did: string) => {
    const seen = get(seenUsersAtom)
    const cur = seen[did]
    if (cur === undefined) {
      return
    }
    const ret: Record<string, SeenUser> = {}
    for (const [key, seenUser] of Object.entries(seen)) {
      if (key === did) {
        continue
      }
      ret[key] = seenUser
    }
    set(seenUsersAtom, ret)
  }
)

export const setLastSelectedSeenUsersAtom = atom(
  null,
  (get, set, { did, lastSelected }: { did: string, lastSelected: string }) => {
    const seen = get(seenUsersAtom)
    const cur = seen[did]
    if (cur === undefined) {
      return
    }
    set(seenUsersAtom, { ...seen, [did]: { ...cur, lastSelected } })
  }
)

export const writeInitResultAtom = atom(
  null,
  (get, set, initResult: InitResult) => {
    if (initResult === undefined) {
      return
    }

    let ident: string = initResult.session.sub
    const state = typeof initResult.state === 'string' ? JSON.parse(initResult.state) : initResult.session.sub
    if (isAuthState(state)) {
      ident = state.ident
      set(rawRedirectHrefAtom, state.redirect)
    }
    const curSeenUsers = get(seenUsersAtom)
    const newSeenUsers = {
      ...curSeenUsers,
      [initResult.session.sub]: {
        handle: ident,
        lastSelected: (new Date()).toISOString()
      }
    }
    set(seenUsersAtom, newSeenUsers)
  }
)

export const signInAtom = atom(
  null,
  async (get, _set, { ident, redirect }: { ident: string, redirect?: string }) => {
    // init if not done yet
    await get(clientInitResultAsyncAtom)

    const client = get(oauthClientAtom)
    if (client === undefined) {
      throw new Error('Client is not available')
    }
    const state: AuthState = {
      ident,
      redirect: redirect ?? window.location.href
    }
    await client.signIn(ident, { state: JSON.stringify(state) })
  }
)

export const getSessionAtom = atom(
  null,
  async (get, set, did: string) => {
    const client = get(oauthClientAtom)
    try {
      return await client.restore(did)
    } catch (err) {
      console.error(err)
    }
  }
)

export const signOutAtom = atom(
  null,
  async (get, set, did: string) => {
    const client = get(oauthClientAtom)
    await client.revoke(did)
    set(deleteSeenUserAtom, did)
  }
)

export const identitiesAtom = atom(
  get => {
    const seen = get(seenUsersAtom)
    const ret: GetIdentityResult[] = []
    for (const [did, seenUser] of Object.entries(seen)) {
      ret.push({ did, ...seenUser })
    }
    return ret
  }
)
