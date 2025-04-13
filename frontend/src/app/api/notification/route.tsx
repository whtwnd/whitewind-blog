import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { Notification } from '@/components/NotificationModal'

// Returns notifications that aren't expired
export async function GET (request: NextRequest) {
  const client = new DynamoDBClient({ region: 'ap-northeast-1' })
  const { searchParams } = new URL(request.url)
  const fromRaw = searchParams.get('from')
  const toRaw = searchParams.get('to')

  const data = await client.send(new QueryCommand({
    TableName: process.env.NOTIFICATION_TABLE,
    IndexName: 'indexBySeq',
    KeyConditionExpression: '#type = :type and #seq BETWEEN :from AND :to',
    ExpressionAttributeNames: {
      '#type': 'type',
      '#seq': 'seq'
    },
    ExpressionAttributeValues: {
      ':type': {S:'notification'},
      ':from': { N: fromRaw ?? '0' },
      ':to': {N: toRaw ?? '100000'}
    }
  }))

  const response:Notification[]=data.Items
    ?.filter(item=>item.expiresAt.S!==undefined && item.expiresAt.S>new Date().toISOString())
    ?.map(item=>({
    seq: item.seq.N ? parseInt(item.seq.N) : -1,
    type: item.type.S,
    title: item.title.S,
    content: item.content.S,
    createdAt: item.createdAt.S,
    expiresAt:item.expiresAt.S
  } as Notification))??[]

  return NextResponse.json(response)
}
