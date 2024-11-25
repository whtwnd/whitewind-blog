'use client'

import { SessionContext } from '@/contexts/SessionContext'
import { validateIdentity } from '@/services/validator'
import { createClient, resolveHandle, resolvePDSClient } from '@/services/clientUtils'
import { Label, Modal, Spinner, TextInput } from 'flowbite-react'
import { FC, useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isValidHandle } from '@atproto/syntax'

export interface ILoginModalProps {
  open: boolean
  onClose?: (identity?: string) => void
}

interface LoginModalFormValues {
  identity: string
  password: string
}

type LoginState = 'idle' | 'loggingIn' | 'loginSuccess' | 'loginFailed'

export const LoginModal: FC<ILoginModalProps> = ({ open, onClose }) => {
  const [loginState, setLoginState] = useState<LoginState>('idle')
  const [failMessage, setFailMessage] = useState('')

  const { handleSubmit, formState, register, resetField, getValues } = useForm<LoginModalFormValues>()

  const manager = useContext(SessionContext)

  const closeHandler = (): void => {
    setLoginState('idle')
    setFailMessage('')
    const ident = getValues('identity')
    resetField('identity')
    resetField('password')
    onClose?.(ident)
  }

  const loginHandler = (data: LoginModalFormValues): void => {
    setLoginState('loggingIn')
    async function login (): Promise<void> {
      let did = data.identity
      const entrywayClient = createClient('bsky.social')
      if (isValidHandle(did)) {
        did = await resolveHandle(did, entrywayClient)
      }

      const pds = await resolvePDSClient(data.identity, entrywayClient)
      if (pds === undefined) {
        throw new Error('Unable to resolve PDS')
      }
      await manager.createSession(did, data.password, pds)
    }
    login()
      .then(() => {
        setLoginState('loginSuccess')
        setTimeout(() => {
          closeHandler()
          setLoginState('idle')
        }, 1000)
      })
      .catch((err) => {
        setLoginState('loginFailed')
        setFailMessage((err as Error).message)
      })
  }

  return (
    <Modal show={open} size='md' popup dismissible onClose={closeHandler}>
      <Modal.Header className='bg-gray-100' />
      <div className='bg-gray-100 rounded'>
        <Modal.Body>
          <form className='space-y-6'>
            <h3 className='text-xl font-semibold font-medium text-gray-700'>Sign in</h3>
            <div>
              <div className='mb-2 block'>
                <Label htmlFor='email' value='Bluesky handle or DID' />
              </div>
              <TextInput
                id='email'
                placeholder='e.g. <username>.bsky.social'
                color={formState.errors.identity === undefined ? 'gray' : 'failure'}
                theme={{ field: { input: { colors: { gray: 'border-gray-300 bg-gray-50 text-gray-900 focus:border-sky-400 focus:ring-cyan-200' } } } }}
                helperText={formState.errors.identity?.message}
                {...register(
                  'identity',
                  {
                    required: true,
                    validate: validateIdentity
                  })
                            }
              />
            </div>
            <div>
              <div className='mb-2 block'>
                <Label htmlFor='password' value='Application password' />
              </div>
              <TextInput
                id='password'
                type='password'
                color={formState.errors.password === undefined ? 'gray' : 'failure'}
                theme={{ field: { input: { colors: { gray: 'border-gray-300 bg-gray-50 text-gray-900 focus:border-sky-400 focus:ring-cyan-200' } } } }}
                helperText={formState.errors.password?.message}
                {...register(
                  'password',
                  {
                    required: true
                  }
                )}
              />
            </div>
            <div className='w-full'>
              <button
                className='flex flex-row rounded-lg bg-sky-400 text-white px-4 py-2 transition duration-200 hover:bg-sky-500 focus:ring-4 focus:ring-cyan-200'
                onClick={(e) => { void handleSubmit(loginHandler)(e) }}
                disabled={loginState === 'loggingIn'}
              >
                <p>Log in</p>
                {
                                loginState === 'loggingIn'
                                  ? <>&nbsp;<Spinner size='sm' /></>
                                  : loginState === 'loginSuccess'
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
            </div>
            {
                        failMessage.length > 0 && (
                          <div className='flex justify-between text-sm font-semibold text-red-500'>
                            {failMessage}
                          </div>
                        )
                    }
            <div className='flex justify-between text-sm font-medium text-gray-400'>
              Not registered?&nbsp;
              <a href='https://bsky.app' className='text-sky-700 hover:underline' target='_blank' rel='noreferrer'>
                Create account
              </a>
            </div>
          </form>
        </Modal.Body>
      </div>
    </Modal>
  )
}
