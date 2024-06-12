'use client'
import Footer from '@/components/Footer'
import EntryPageHeader from '@/components/Headers/EntryPageHeader'
import React from 'react'

export interface ThreeColumnViewProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  hero?: React.ReactNode
  disableHeader?: boolean
}

const ThreeColumnBlogView: React.FC<ThreeColumnViewProps> = ({ left, center, right, hero, disableHeader }) => {
  return (
    <div className='flex flex-col h-screen'>
      {disableHeader !== true && <EntryPageHeader />}
      {hero}
      <div className='grid grid-cols-3 xl:grid-cols-5'>
        <div className='hidden xl:block grow'>
          <div className='h-[90vh] pr-4 flex justify-end sticky top-6'>
            {left}
          </div>
        </div>
        <div className='grow col-span-3 px-4 md:px-20 xl:px-4 py-4'>{/* main content area */}
          {center}
        </div>
        <div className='hidden xl:block px-1 py-4 min-w-10'>
          <div className='sticky top-20'>
            {right}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
export default ThreeColumnBlogView
