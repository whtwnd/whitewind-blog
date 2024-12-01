'use client'

import { validateIdentity } from '@/services/validator'
import { Label, Modal, Spinner, TextInput } from 'flowbite-react'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSetAtom } from 'jotai'
import { signInAtom } from '@/atoms/Auth'

export interface ILoginModalProps {
  open: boolean
  signInRedirect?: string
  onClose?: () => void
}

interface OAuthLoginModalFormValues {
  identity: string
}

type LoginState = 'idle' | 'loggingIn' | 'loginSuccess' | 'loginFailed'

export const LoginModal: FC<ILoginModalProps> = ({ open, onClose, signInRedirect }) => {
  const [loginState, setLoginState] = useState<LoginState>('idle')
  const [failMessage, setFailMessage] = useState('')
  const {
    handleSubmit: handleSubmitOAuth,
    formState: formStateOAuth,
    register: registerOAuth,
    reset: resetOAuth
  } = useForm<OAuthLoginModalFormValues>()

  const signIn = useSetAtom(signInAtom)

  const closeHandler = (): void => {
    setLoginState('idle')
    setFailMessage('')
    resetOAuth()
    onClose?.()
  }

  const loginHanlderOAuth = (data: OAuthLoginModalFormValues): void => {
    setLoginState('loggingIn')
    async function login (): Promise<void> {
      try {
        await signIn({ ident: data.identity, redirect: signInRedirect ?? window.location.href })
      } catch (err) {
        setLoginState('loginFailed')
        setFailMessage((err as Error).message)
      }
    }
    void login()
  }

  return (
    <Modal show={open} size='md' popup dismissible theme={{ header: { title: 'text-xl font-semibold text-gray-700 bg-gray-100' } }} onClose={closeHandler}>
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
                color={formStateOAuth.errors.identity === undefined ? 'gray' : 'failure'}
                theme={{ field: { input: { colors: { gray: 'border-gray-300 bg-gray-50 text-gray-900 focus:border-sky-400 focus:ring-cyan-200' } } } }}
                helperText={formStateOAuth.errors.identity?.message}
                {...registerOAuth(
                  'identity',
                  {
                    required: true,
                    validate: validateIdentity
                  })
                        }
              />
            </div>
            <div className='w-full'>
              <button
                className='flex flex-row rounded-lg bg-sky-400 text-white px-4 py-2 transition duration-200 hover:bg-sky-500 focus:ring-4 focus:ring-cyan-200'
                onClick={(e) => { void handleSubmitOAuth(loginHanlderOAuth)(e) }}
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

export default LoginModal
