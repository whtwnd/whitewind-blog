import { DefaultOgp } from '@/components/DefaultOgp'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Image generation
export async function GET (request: NextRequest): Promise<ImageResponse> {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const displayName = searchParams.get('displayname')
  const handle = searchParams.get('handle')
  const avatar = searchParams.get('avatar') ?? undefined
  if (title === null || displayName === null || handle === null) {
    throw new Error()
  }

  const prefix =
        process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://whtwnd.com'

  const [regular, semibold] = await Promise.all([
    fetch(`${prefix}/NotoSansJP-Regular.ttf`).then(async result => await result.arrayBuffer()),
    fetch(`${prefix}/NotoSansJP-SemiBold.ttf`).then(async result => await result.arrayBuffer())
  ])

  return new ImageResponse(<DefaultOgp title={title} displayName={displayName} handle={handle} avatar={avatar} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'noto-regular',
        data: regular,
        style: 'normal',
        weight: 400
      },
      {
        name: 'noto-semibold',
        data: semibold,
        style: 'normal',
        weight: 700
      }
    ]
  })
}
