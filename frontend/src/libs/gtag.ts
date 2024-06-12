/* eslint-disable */
export const GA_TAG_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export const IS_GATAG = GA_TAG_ID !== ''

export const pageview = (path: string) => {
  window.gtag('config', GA_TAG_ID, {
    page_path: path
  })
}
