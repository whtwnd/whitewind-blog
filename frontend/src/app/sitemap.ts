import { MetadataRoute } from 'next'
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'

export const dynamic = 'force-dynamic'

export default async function sitemap (): Promise<MetadataRoute.Sitemap> {
  const hostname = process.env.WHITEWIND_HOST as string
  const lastModified = new Date()

  const staticPaths: MetadataRoute.Sitemap = [{
    url: `https://${hostname}`,
    lastModified,
    changeFrequency: 'daily'
  },
  {
    url: `https://${hostname}/about`,
    lastModified,
    changeFrequency: 'weekly'
  },
  {
    url: `https://${hostname}/lexicons`,
    lastModified,
    changeFrequency: 'weekly'
  },
  {
    url: `https://${hostname}/robots.txt`,
    lastModified,
    changeFrequency: 'weekly'
  }
  ]

  const client = new DynamoDBClient({ region: 'ap-northeast-1' })
  const params = {
    TableName: 'com.whtwnd.blog.metadata',
    IndexName: 'authorsForSitemap'
  }
  const command = new ScanCommand(params)
  const data = await client.send(command)
  const userAndLastUpdate = data.Items
    ?.filter(item => (
      item.lastUpdate?.S?.length !== undefined &&
            item.lastUpdate.S.length > 0 &&
            item.handle !== undefined &&
            item.handle.S?.length !== undefined &&
            item.handle.S.length > 0
    ))
    .map((item) => [item.handle.S as string, item.lastUpdate.S as string])
  if (userAndLastUpdate === undefined) {
    return [...staticPaths]
  }

  const uniqueUserAndLastUpdate: Map<string, string> = new Map()
  for (const entry of userAndLastUpdate) {
    const lastUpdate = uniqueUserAndLastUpdate.get(entry[0])
    if (lastUpdate === undefined || lastUpdate < entry[1]) {
      uniqueUserAndLastUpdate.set(entry[0], entry[1])
    }
  }

  const blogPaths: MetadataRoute.Sitemap = []
  for (const entry of uniqueUserAndLastUpdate.entries()) {
    blogPaths.push({
      url: `https://${hostname}/${entry[0]}`,
      lastModified: entry[1],
      changeFrequency: 'daily'
    })
  }

  return [...staticPaths, ...blogPaths]
}
