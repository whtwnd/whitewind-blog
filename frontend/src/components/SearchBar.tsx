'use client'

import { validateIdentity } from '@/services/validator'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next-nprogress-bar'

export const SearchBar: FC = () => {
  const { handleSubmit, formState, register } = useForm<{ identity: string }>()
  const router = useRouter()

  const onSubmit = ({ identity }: { identity: string }): void => {
    router.push(`/${identity}`)
  }

  const normalClass = 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 bg-gray-50 text-gray-900 focus:border-sky-400 focus:ring-cyan-200 p-2.5 text-sm rounded-l-lg'
  const errorClass = 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 p-2.5 text-sm rounded-l-lg'

  return (
    <div className='p-4 flex flex-col justify-center items-center'>
      <form className='flex flex-row justify-center' onSubmit={() => { void handleSubmit(onSubmit) }}>
        <div className='w-[50vw] lg:w-[30vw] flex relative w-full'>
          <input
            className={formState.errors.identity === undefined ? normalClass : errorClass}
            type='text'
            placeholder='Author handle or DID (e.g. &lt;username&gt;.bsky.social)'
            {...register('identity', {
              required: true,
              validate: validateIdentity
            })}
          />
        </div>
        <button className='py-2 pl-3 pr-4 flex flex-row items-center content-center gap-1 rounded-r-lg border-gray-300 bg-sky-400 font-semibold text-gray-100 stroke-gray-100 transition duration-200 hover:bg-sky-500'>Search</button>
      </form>
      <div className='flex justify-between text-sm font-semibold text-red-500'>
        {formState.errors.identity !== undefined ? formState.errors.identity.message : <p />}
      </div>
    </div>
  )
}
