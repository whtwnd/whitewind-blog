'use client'
import Footer from '@/components/Footer'
import AuthorPageHeader from '@/components/Headers/AuthorPageHeader'
import React from 'react'

export interface ThreeColumnViewProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  hero?: React.ReactNode
}

const ThreeColumnListView: React.FC<ThreeColumnViewProps> = ({ left, center, right, hero }) => {
  return (
    <div className='flex flex-col h-screen'>
      <AuthorPageHeader />
      <div className='grid grid-cols-3 lg:grid-cols-5'>
        <div className='grid-item hidden lg:block' />
        <div className='grid-item col-span-3 flex justify-center'>{hero}</div>
        <div className='grid-item hidden lg:block' />
      </div>
      <div className='grow grid grid-cols-3 lg:grid-cols-5'>
        <div className='grid-item hidden lg:block'>{left}</div>
        <div className='grid-item col-span-3'>{center}</div>
        <div className='grid-item hidden lg:block'>{right}</div>
      </div>
      <Footer />
    </div>
  )
}
export default ThreeColumnListView
