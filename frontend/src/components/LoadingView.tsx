import Header from '@/components/Headers/Header'
import { Spinner } from 'flowbite-react'
import { FC } from 'react'

interface LoadingViewProps {
  message?: string
}

export const LoadingView: FC<LoadingViewProps> = ({ message }) => {
  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <div className='flex flex-col justify-center items-center h-full'>
        <div className='flex flex-row gap-4'>
          <Spinner size='lg' theme={{ color: { info: 'fill-sky-400' } }} />
          <p className='text-gray-400 text-lg'>{message ?? 'Loading...'}</p>
        </div>
      </div>
    </div>
  )
}
