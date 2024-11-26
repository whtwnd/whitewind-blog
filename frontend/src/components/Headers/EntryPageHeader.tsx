'use client'

import { identitiesAtom } from '@/atoms'
import Header from '@/components/Headers/Header'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { useAtomValue } from 'jotai'
import { FC, useCallback, useContext, useEffect, useState } from 'react'

const OtherEntriesFromThisAuthor: FC = () => {
  const { handle, did } = useContext(AuthorInfoContext)
  return (
    <a href={`/${handle ?? did as string}`}>
      <div className='py-2 pl-3 pr-4 flex flex-row items-center content-center gap-1 stroke-gray-700 transition duration-200 hover:text-gray-400 hover:stroke-gray-400'>
        <svg className='w-6 h-6 text-gray-800' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 12h14M5 12l4-4m-4 4 4 4' />
        </svg>
        <p className='block font-semibold text-sm'>Other entries from this author</p>
      </div>
    </a>
  )
}

const EditEntry: FC = () => {
  const { did } = useContext(AuthorInfoContext)
  const identities = useAtomValue(identitiesAtom)
  const [isEditable, setIsEditable] = useState(false)

  const LoadProfiles = useCallback(async () => {
    setIsEditable(identities.map(id => id.did).find(val => val === did) !== undefined)
  }, [identities, did])

  useEffect(() => {
    void LoadProfiles()
  }, [LoadProfiles])
  if (!isEditable) {
    return <></>
  }
  return (
    <a href={window.location.href + '/edit'}>
      <div className='py-2 pl-3 pr-4 flex flex-row items-center content-center gap-1 stroke-gray-700 transition duration-200 hover:text-gray-400 hover:stroke-gray-400'>
        <svg className='w-6 h-6 text-gray-800' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z' />
        </svg>

        <p className='block font-semibold text-sm'>Edit entry</p>
      </div>
    </a>
  )
}

export const EntryPageHeader: FC = () => {
  return (
    <Header mainAreaClassName='grow hidden md:flex justify-end'>
      <OtherEntriesFromThisAuthor />
      <EditEntry />
    </Header>
  )
}

export default EntryPageHeader
