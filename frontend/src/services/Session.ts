import { AtpServiceClient } from '@/api'
import type { OutputSchema as RefreshSessionOutputSchema } from '@/api/types/com/atproto/server/refreshSession'
import { createClient } from '@/services/clientUtils'

const SessionDB = 'WhiteWind'
const SessionStore = 'Session'
const DBVersion = 1

interface UserData extends RefreshSessionOutputSchema {
  lastSelected: string
}

interface GetIdentityResult {
  handle: string
  did: string
  lastSelected?: string
}

export interface SessionManager {
  getSession: (did: string, client: AtpServiceClient) => Promise<UserData | undefined>
  createSession: (identifier: string, password: string, client: AtpServiceClient) => Promise<UserData | undefined>
  deleteSession: (did: string, client: AtpServiceClient) => Promise<void>
  getIdentities: () => Promise<GetIdentityResult[]>
  setLastSelected: (lastSelected: string, did: string) => Promise<void>
}

export const GenerateSessionManager = (): SessionManager => {
  let db: IDBDatabase | undefined
  const init = async (): Promise<void> => {
    const request = indexedDB.open(SessionDB, DBVersion)
    await new Promise<void>((resolve, reject) => {
      request.onerror = (event) => {
        reject(event)
      }
      request.onupgradeneeded = (event) => {
        if (event.target === null) {
          reject(new Error('event.target is null'))
          return
        }
        db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(SessionStore)) {
          const store = db.createObjectStore(SessionStore, { keyPath: 'did' })
          store.createIndex('did', 'did', { unique: true })
        }
      }
      request.onsuccess = (event) => {
        if (event.target === null) {
          reject(new Error('event.target is null'))
          return
        }
        db = (event.target as IDBOpenDBRequest).result
        resolve()
      }
    })
  }

  const getSessionStorageData = async (did: string): Promise<UserData | undefined> => {
    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }
    const transaction = db.transaction([SessionStore])
    const store = transaction.objectStore(SessionStore)
    const request = store.get(did)
    // eslint-disable-next-line
        return await new Promise<UserData | undefined>((resolve, _reject) => {
      request.onerror = (event) => {
        console.log(event)
        resolve(undefined)
      }
      // eslint-disable-next-line
            request.onsuccess = (_event) => {
        resolve(request.result as UserData)
      }
    })
  }

  const getSession = async (did: string, client: AtpServiceClient): Promise<UserData | undefined> => {
    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }
    const sess = await getSessionStorageData(did)
    if (sess === undefined) {
      return undefined
    }

    // check jwt expiry
    const isJwtValid = (jwtStr: string): boolean => {
      const jwt = jwtStr.split('.')
      if (jwt.length !== 3) {
        return false // invalid jwt
      }
      const decoded = JSON.parse(atob(jwt[1]))
      if (decoded.exp === undefined || typeof decoded.exp !== 'number') {
        return false
      }
      const expiry = decoded.exp as number
      return expiry > Date.now() / 1000 + 60 // 60 seconds buffer
    }
    // accessJwt is valid
    if (isJwtValid(sess.accessJwt)) {
      return sess
    }
    // both accessJwt and refreshJwt is invalid
    if (!isJwtValid(sess.refreshJwt)) {
      return undefined
    }
    // accessJwt is invalid but refreshJwt is valid. Try to refresh.
    const refreshed = await refreshSession(did, sess.refreshJwt, client)
    return { ...refreshed, lastSelected: sess.lastSelected }
  }

  const storeSession = async (did: string, sess: UserData): Promise<void> => {
    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }
    const transaction = db.transaction([SessionStore], 'readwrite')
    const store = transaction.objectStore(SessionStore)
    const request = store.put(sess)
    await new Promise<void>((resolve, reject) => {
      request.onerror = event => {
        reject(event)
      }
      request.onsuccess = () => {
        resolve()
      }
    })
  }

  const createSession = async (did: string, password: string, client: AtpServiceClient): Promise<UserData> => {
    const ret = await client.com.atproto.server.createSession({
      identifier: did,
      password
    })
    ret.data.email = undefined
    ret.data.emailConfirmed = undefined
    const sess = ret.data as UserData
    sess.lastSelected = new Date().toISOString()
    await storeSession(did, sess)
    return sess
  }

  const refreshSession = async (did: string, refreshJwt: string, client: AtpServiceClient): Promise<RefreshSessionOutputSchema> => {
    const ret = await client.com.atproto.server.refreshSession(undefined, {
      headers: {
        Authorization: `Bearer ${refreshJwt}`
      }
    })
    const sess = ret.data as UserData
    sess.lastSelected = new Date().toISOString()
    await storeSession(did, sess)
    return ret.data
  }

  const deleteSession = async (did: string, client: AtpServiceClient): Promise<void> => {
    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }
    let sess = await getSession(did, client)
    if (sess !== undefined) {
      try {
        client.setHeader('Authorization', `Bearer ${sess.refreshJwt}`)
        await client.com.atproto.server.deleteSession()
      } catch (err) {
        console.warn(err)
      }
    } else {
      sess = await getSessionStorageData(did)
      if (sess === undefined) {
        // no such session is stored
        return
      }
    }

    const transaction = db.transaction([SessionStore], 'readwrite')
    const store = transaction.objectStore(SessionStore)
    const request = store.delete(did)
    await new Promise<void>((resolve, reject) => {
      request.onerror = (event) => {
        console.log(event)
        reject(new Error())
      }
      // eslint-disable-next-line
            request.onsuccess = (_event) => {
        resolve()
      }
    })
  }

  const getIdentities = async (): Promise<GetIdentityResult[]> => {
    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }

    const transaction = db.transaction([SessionStore])
    const store = transaction.objectStore(SessionStore)
    const request = store.getAll()
    // eslint-disable-next-line
        const userData = await new Promise<UserData[] | undefined>((resolve, _reject) => {
      request.onerror = (event) => {
        console.log(event)
        resolve(undefined)
      }
      // eslint-disable-next-line
            request.onsuccess = (_event) => {
        resolve(request.result)
      }
    })
    if (userData === undefined) {
      return []
    }
    return userData.map(data => {
      return { handle: data.handle, did: data.did, lastSelected: data.lastSelected }
    }) ?? []
  }

  const setLastSelected = async (lastSelected: string, did: string): Promise<void> => {
    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }
    const cur = await getSession(did, createClient('bsky.social'))
    if (cur === undefined) {
      return
    }
    cur.lastSelected = lastSelected

    const transaction = db.transaction([SessionStore], 'readwrite')
    const store = transaction.objectStore(SessionStore)
    const request = store.put(cur)
    // eslint-disable-next-line
        await new Promise<void>((resolve, _reject) => {
      request.onerror = (event) => {
        console.log(event)
        resolve()
      }
      // eslint-disable-next-line
            request.onsuccess = (_event) => {
        resolve()
      }
    })
  }

  return {
    getSession, createSession, deleteSession, getIdentities, setLastSelected
  }
}
