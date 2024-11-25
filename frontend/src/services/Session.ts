import { AtpSessionData, CredentialSession } from '@atproto/api'

const SessionDB = 'WhiteWind'
const SessionStore = 'Session'
const DBVersion = 1

interface UserData extends AtpSessionData {
  lastSelected: string
}

interface GetIdentityResult {
  handle: string
  did: string
  lastSelected?: string
}

export interface SessionManager {
  getSession: (did: string, pds: string) => Promise<CredentialSession | undefined>
  createSession: (identifier: string, password: string, pds: string) => Promise<CredentialSession>
  deleteSession: (did: string, pds: string) => Promise<void>
  getIdentities: () => Promise<GetIdentityResult[]>
  setLastSelected: (lastSelected: string, did: string) => Promise<void>
}

export const GenerateSessionManager = (): SessionManager => {
  let db: IDBDatabase | undefined

  const sessions = new Map<string, CredentialSession>()

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

  const getSession = async (did: string, pds: string): Promise<CredentialSession | undefined> => {
    const ret = sessions.get(did)
    if (ret !== undefined) {
      return ret
    }

    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }
    const userData = await getSessionStorageData(did)
    if (userData === undefined) {
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
    if (isJwtValid(userData.accessJwt)) {
      return await refreshSession(did, userData, pds)
    }
    // both accessJwt and refreshJwt is invalid
    if (!isJwtValid(userData.refreshJwt)) {
      return undefined
    }
    // accessJwt is invalid but refreshJwt is valid. Try to refresh.
    return await refreshSession(did, userData, pds)
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

  const createSession = async (did: string, password: string, pds: string): Promise<CredentialSession> => {
    const credentialSession = new CredentialSession(new URL(`https://${pds}`), globalThis.fetch, async (evt, session) => {
      if ((evt === 'create' || evt === 'update') && session !== undefined) {
        await storeSession(did, { ...session, lastSelected: new Date().toISOString() })
      }
    })
    await credentialSession.login({ identifier: did, password })
    sessions.set(did, credentialSession)
    return credentialSession
  }

  const refreshSession = async (did: string, sess: UserData, pds: string): Promise<CredentialSession> => {
    let credentialSession = sessions.get(did)
    if (credentialSession === undefined) {
      credentialSession = new CredentialSession(new URL(`https://${pds}`), globalThis.fetch, async (evt, session) => {
        if ((evt === 'create' || evt === 'update') && session !== undefined) {
          await storeSession(did, { ...session, lastSelected: new Date().toISOString() })
        }
      })
      sessions.set(did, credentialSession)
    }
    await credentialSession.resumeSession(sess)
    return credentialSession
  }

  const deleteSession = async (did: string, pds: string): Promise<void> => {
    if (db === undefined) {
      await init()
      if (db === undefined) {
        throw new Error('Could not open session')
      }
    }
    let sess: CredentialSession | undefined
    try {
      sess = await getSession(did, pds)
      if (sess !== undefined) {
        await sess.logout()
      } else {
        console.log(`Session was not found for ${did} ${pds}`)
      }
    } catch (err) {
      console.warn(err)
    }
    if (sess === undefined) {
      // no such session is stored
      return
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
    const cur = await getSessionStorageData(did)
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
