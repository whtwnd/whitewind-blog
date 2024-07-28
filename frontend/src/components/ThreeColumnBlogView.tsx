'use client'
import Footer from '@/components/Footer'
import EntryPageHeader from '@/components/Headers/EntryPageHeader'
import React from 'react'

export interface ThreeColumnViewProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  hero?: React.ReactNode
  ogpUrl?: string
  disableHeader?: boolean
}

const ThreeColumnBlogView: React.FC<ThreeColumnViewProps> = ({ left, center, right, ogpUrl, hero, disableHeader }) => {
  return (
    <div className='flex flex-col h-screen'> {/** header and others */}
      {disableHeader !== true && <EntryPageHeader />}
      {hero}
      <div className='w-full flex-col'> {/** footer and others */}
        <div className='flex w-full justify-center'> {/** main */}
          <div className='hidden py-4 xl:block xl:flex xl:flex-col'>
            <div className='h-[90vh] pr-4 flex justify-end sticky top-20'>
              {left}
            </div>
          </div>
          <div className='px-4 py-4 w-full max-w-[800px]'>{/* main content area */}
            {center}
          </div>
          <div className='hidden lg:block px-1 py-4 min-w-10'>
            <div className='sticky top-20'>
              {right}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
export default ThreeColumnBlogView

// {/** dummy area */}
// <div className='min-h-[calc(20vh+60px)] sm:min-h-[calc(30vh+60px)] flex justify-center items-center'>
//   <div className='flex flex-col h-full justify-center items-center'>
//     <h1 className='font-semibold text-2xl sm:text-4xl'>
//       test
//     </h1>
//   </div>
// </div>
