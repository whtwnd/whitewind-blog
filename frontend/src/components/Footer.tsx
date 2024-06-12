'use client'
import { Footer as FlowBiteFooter } from 'flowbite-react'
import { ReactNode } from 'react'

export const Footer = (): ReactNode => {
  return (
    <div className='w-full flex flex-row justify-center'>
      <FlowBiteFooter container theme={{ root: { base: 'w-full bg-gray-700 shadow md:flex md:items-center md:justify-between' } }}>
        <FlowBiteFooter.Copyright href='/' by='WhiteWind' year={new Date().getFullYear()} />
        <FlowBiteFooter.LinkGroup>
          <FlowBiteFooter.Link href='/about'>About</FlowBiteFooter.Link>
          <FlowBiteFooter.Link href='/whtwnd.com/3kt3lixripz2s'>Usage (en)</FlowBiteFooter.Link>
          <FlowBiteFooter.Link href='/whtwnd.com/3kt3kd3pq5k2y'>Usage (ja)</FlowBiteFooter.Link>
        </FlowBiteFooter.LinkGroup>
      </FlowBiteFooter>
    </div>
  )
}

export default Footer
