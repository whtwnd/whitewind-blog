/** @type {import('next').NextConfig} */

const apiHeaders = [
  {
    source: '/api/og',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    ]
  },
  {
    source: '/api/cache',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    ]
  },
  {
    source: '/api/notification',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    ]
  }
]

const nextConfig = {
  output: 'standalone', // Outputs a Single-Page Application (SPA).
  // distDir: './dist', // Changes the build output directory to `./dist/`.
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack'
        }
      ]
    })
    return config
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    disableStaticImages: true // importした画像の型定義設定を無効にする
  },
  headers: async () => {
    // eslint-disable-next-line
        return process.env.NODE_ENV === 'development' ? apiHeaders : [
      // default cache header
      {
        source: '/:authorIdentity*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=86400'
          }
        ]
      },
      ...apiHeaders,
      // override cache header
      {
        source: '/_next/static/:staticFile*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/whtwnd.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=31536000'
          }
        ]
      },
      {
        source: '/lexicons',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=31536000'
          }
        ]
      },
      {
        source: '/oauth/callback',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=31536000'
          }
        ]
      },
      {
        source: '/edit',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/:authorIdentity/edit',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/:authorIdentity/:rkey/edit',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/:authorIdentity/entries/:entryTitle/edit',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  }
}

export default nextConfig
