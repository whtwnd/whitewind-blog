'use client'

import { SessionContext } from '@/contexts/SessionContext'
import { createClient, resolveHandle, resolvePDSClient } from '@/services/clientUtils'
import { Modal, Spinner } from 'flowbite-react'
import { FC, useContext, useState } from 'react'
import { isValidHandle } from '@atproto/syntax'

export interface ILogoutModalProps {
  identity: string
  open: boolean
  onClose?: () => void
}

type LogoutState = 'idle' | 'loggingOut' | 'logoutSuccess' | 'logoutFailed'

export const LogoutModal: FC<ILogoutModalProps> = ({ identity, open, onClose }) => {
  const [logoutState, setLogoutState] = useState<LogoutState>('idle')
  const [failMessage, setFailMessage] = useState('')

  const manager = useContext(SessionContext)

  const closeHandler = (): void => {
    setLogoutState('idle')
    setFailMessage('')
    onClose?.()
  }

  const logoutHandler = (): void => {
    setLogoutState('loggingOut')
    async function logout (): Promise<void> {
      let did = identity
      const entrywayClient = createClient('bsky.social')
      if (isValidHandle(did)) {
        did = await resolveHandle(did, entrywayClient)
      }

      const pds = await resolvePDSClient(identity, entrywayClient)
      if (pds === undefined) {
        throw new Error('Unable to resolve PDS')
      }
      await manager.deleteSession(did, pds)
    }
    logout()
      .then(() => {
        setLogoutState('logoutSuccess')
        setTimeout(() => {
          closeHandler()
          setLogoutState('idle')
        }, 1000)
      })
      .catch((err) => {
        setLogoutState('logoutFailed')
        setFailMessage((err as Error).message)
      })
  }

  return (
    <Modal show={open} size='md' popup dismissible onClose={closeHandler}>
      <Modal.Header className='bg-gray-100' />
      <div className='bg-gray-100 rounded'>
        <Modal.Body>
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold font-medium text-gray-700'>Sign out</h3>
            <div>Do you really want to sign out?</div>
            {
                        failMessage.length > 0 && (
                          <div className='flex justify-between text-sm font-semibold text-red-500'>
                            {failMessage}
                          </div>
                        )
                    }
            <div className='flex flex-row gap-4 w-full justify-center'>
              <button className='py-2 px-4 flex flex-row items-center content-center gap-1 rounded-lg bg-sky-400 text-gray-100 transition duration-200 hover:bg-sky-500 focus:ring-4 focus:ring-cyan-200' onClick={logoutHandler}>
                <p>Yes</p>
                {
                                logoutState === 'loggingOut'
                                  ? <>&nbsp;<Spinner size='sm' /></>
                                  : logoutState === 'logoutSuccess'
                                    ? (
                                      <>&nbsp;
                                        <svg className='w-6 h-6 text-gray-800 inline' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
                                          <path stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 11.917 9.724 16.5 19 7.5' />
                                        </svg>
                                      </>
                                      )
                                    : <></>
}
              </button>
              <button className='py-2 px-4 flex flex-row gap-1 rounded-lg bg-transparent text-sky-400 border border-sky-400 transition duration-200 hover:bg-sky-500 hover:text-white focus:ring-4 focus:ring-cyan-200' onClick={closeHandler}>No</button>
            </div>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  )
}
