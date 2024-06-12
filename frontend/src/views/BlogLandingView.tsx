import WhiteWindLogo from '@/../public/whtwnd.svg'
import CommentList from '@/components/CommentList'
import Footer from '@/components/Footer'
import Header from '@/components/Headers/Header'
import { ReactNode } from 'react'

export const BlogLandingView = (): ReactNode => {
  return (
    <div>
      <Header />
      {/** Introduction section */}
      <div className='w-full h-[80vh] bg-sky-900 flex flex-col lg:flex-row justify-center gap-10 items-center'>
        <div className='flex justify-center'>
          <WhiteWindLogo className='w-40 lg:w-[20vw]' />
        </div>
        <div className='w-full lg:w-fit flex flex-col justify-center items-center'>
          <div className='flex flex-col items-center lg:items-start justify-center px-[3vw]'>
            <div className='w-min lg:py-4'>
              <h1 className='py-2 lg:pr-4 text-gray-200 text-4xl lg:text-[4vw] font-semibold border-r-4 border-r-white animate-typing overflow-hidden whitespace-nowrap'>WhiteWind</h1>
            </div>
            <p className='max-w-80 pb-4 lg:max-w-full text-gray-400 text-2xl lg:text-[2vw] font-semibold leading-tight'>Fly your blog riding the wind, across the platforms,<br /> without passing control</p>
            <a href='/'><button className='max-w-60 p-4 font-semibold border-transparent rounded-3xl text-gray-200 bg-sky-500 text-xl transition duration-200 hover:bg-sky-700 focus:ring-4 focus:ring-cyan-200 text-nowrap'>Read entries</button></a>
          </div>
        </div>
      </div>
      <div className='w-full lg:h-[80vh] p-10 bg-sky-200 flex flex-col lg:flex-row items-center'>
        <div className='lg:pl-10 px-[3vw] flex flex-col justify-center'>
          <div><h1 className='text-gray-700 text-4xl lg:text-5xl font-semibold'>Publish your blog to the entire atproto world</h1></div>
          <p className='py-2 lg:pt-5 text-gray-500 text-xl lg:text-2xl font-semibold'>WhiteWind is a Markdown blog service using <span className='underline decoration-dotted'><a href='https://atproto.com/' target='_blank' rel='noreferrer'>atproto</a></span>, which is also used by <a href='https://bsky.app' target='_blank' rel='noreferrer'><span className='underline decoration-dotted'>Bluesky</span></a>. Your article is immediately delivered to all the federated atproto services once you click the save button.</p>
        </div>
        <div className='w-full h-full flex'>
          <iframe
            src='/whtwnd.com/entries/Introduction%20to%20atproto%201:%20What%20is%20PDS？%20What%20Features%20Does%20It%20Have？'
            className='w-full h-[50vh] lg:w-[40vw] lg:h-[80vh] rounded-xl'
          />
        </div>
      </div>
      <div className='w-full lg:h-[80vh] p-10 bg-sky-900 flex flex-col justify-center lg:flex-row'>
        <div className='h-[50vh] lg:h-[80vh] lg:w-[100vw] flex order-2 lg:order-1'>
          <CommentList entryUri='at://did:plc:vpjkockzv7nxnc5o4furet2x/com.whtwnd.blog.entry/3kqxqo2nuen2r' pds='bsky.social' />
        </div>
        <div className='lg:pl-10 flex flex-col justify-center px-[3vw] order-1 lg:order-2'>
          <div><h1 className='text-gray-200 text-4xl lg:text-5xl font-semibold'>View all atproto reactions without making efforts</h1></div>
          <p className='py-2 lg:pt-5 text-gray-400 text-xl lg:text-2xl font-semibold'>Never search your blog url on every platform to check reactions. Literally all the reactions (comments, likes and so on) from atproto services are collected by the WhiteWind system and shown in your blog page.</p>
        </div>
      </div>
      <div className='w-full lg:h-[50vh] p-10 bg-sky-200 flex flex-col items-center justify-center'>
        <div className='lg:pl-10 flex flex-col justify-center px-[3vw]'>
          <div><h1 className='text-gray-700 text-4xl lg:text-5xl font-semibold'>Deliver your blog without passing control</h1></div>
          <p className='pt-5 text-gray-500 text-xl lg:text-2xl font-semibold'>Your blog article is owned only by you. WhiteWind blog data is stored in your PDS, which is a storage space you are given when you start using atproto service (such as Bluesky). Your article will never be modified, deleted or lost by WhiteWind or the like. Even WhiteWind finishes the service, the blog data remains on your PDS. Using <span className='underline decoration-dotted'><a href='https://github.com/haileyok/blug' target='_blank' rel='noreferrer'>third-party tools</a></span>, you can even host your blog on your own domain.</p>
        </div>
      </div>
      <div className='w-full lg:h-[50vh] p-10 bg-sky-900 flex flex-col justify-center items-center'>
        <div className='lg:pl-10 flex flex-col justify-center px-[3vw]'>
          <div><h1 className='text-gray-200 text-4xl lg:text-5xl font-semibold'>No registration for WhiteWind is required</h1></div>
          <p className='pt-5 text-gray-400 text-xl lg:text-2xl font-semibold'>Have you ever been overwhelmed by a lot of advertisement e-mails by a service? Are you tired of managing a lot of accounts in various services? To use WhiteWind, all you need is <a href='https://bsky.app' target='_blank' rel='noreferrer'><span className='underline decoration-dotted'>Bluesky</span></a> account. Because WhiteWind never knows your personal information, we will never send spammy e-mail messages.</p>
        </div>
      </div>
      <div className='w-full h-[40vh] bg-sky-200 flex flex-row items-center justify-center gap-16'>
        <a href='/'><button className='max-w-60 p-4 font-semibold border-transparent rounded-3xl text-gray-200 bg-sky-500 text-xl transition duration-200 hover:bg-sky-700 focus:ring-4 focus:ring-sky-400'>Read entries</button></a>
        <a href='/whtwnd.com/3kt3lixripz2s'><button className='max-w-60 p-4 font-semibold border-transparent rounded-3xl text-gray-200 bg-sky-500 text-xl transition duration-200 hover:bg-sky-700 focus:ring-4 focus:ring-sky-400'>Check usage</button></a>
      </div>
      <Footer />
    </div>
  )
}

export default BlogLandingView
