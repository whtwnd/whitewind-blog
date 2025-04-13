import { Source_Serif_4, Source_Sans_3 } from 'next/font/google'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import type { Metadata } from 'next'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import lightTheme from '@/theme'
import { ProgressBarWrapper } from '@/components/ProgressBarWrapper'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { Suspense, type JSX } from 'react'
import '@/app/globals.css'
import { TailwindIndicator } from '@/components/TailwindIndicator'
import Script from 'next/script'
import { headers } from 'next/headers'
import { GA_TAG_ID } from '@/libs/gtag'
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source_serif',
  weight: ['400', '500']
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source_sans',
  weight: ['400', '500']
})

export const metadata: Metadata = {
  title: {
    default: 'WhiteWind',
    template: '%s | WhiteWind blog'
  },
  icons: { icon: '/whtwnd.svg' }
}

export default async function RootLayout (
  {
    children
  }: {
    children: React.ReactNode
  }
): Promise<JSX.Element> {
  const nonce = (await headers()).get('x-nonce')
  const GAScripts = (
    <><Script
      strategy='lazyOnload'
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_TAG_ID}`}
      nonce={nonce ?? undefined}
      />
      <Script id='gtag-init' strategy='afterInteractive' nonce={nonce ?? undefined}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TAG_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
  const markup = (
    <AppRouterCacheProvider>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        {children}
        <TailwindIndicator />
        <ProgressBarWrapper />
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
  return (
    <html lang='en' className={`${sourceSerif.variable} ${sourceSans.variable}`}><head><Suspense fallback={<></>}><GoogleAnalytics>{GAScripts}</GoogleAnalytics></Suspense></head><body className='bg-gray-100'>{markup}</body></html>
  )
}
