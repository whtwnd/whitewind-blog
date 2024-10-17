/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  Client as XrpcClient,
  ServiceClient as XrpcServiceClient,
} from '@atproto/xrpc'
import { schemas } from './lexicons'
import { CID } from 'multiformats/cid'
import * as ComAtprotoRepoApplyWrites from './types/com/atproto/repo/applyWrites'
import * as ComAtprotoRepoCreateRecord from './types/com/atproto/repo/createRecord'
import * as ComAtprotoRepoDeleteRecord from './types/com/atproto/repo/deleteRecord'
import * as ComAtprotoRepoGetRecord from './types/com/atproto/repo/getRecord'
import * as ComAtprotoRepoListRecords from './types/com/atproto/repo/listRecords'
import * as ComAtprotoRepoPutRecord from './types/com/atproto/repo/putRecord'
import * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef'
import * as ComAtprotoRepoUploadBlob from './types/com/atproto/repo/uploadBlob'
import * as ComAtprotoLabelDefs from './types/com/atproto/label/defs'
import * as ComAtprotoServerCreateSession from './types/com/atproto/server/createSession'
import * as ComAtprotoServerDeleteSession from './types/com/atproto/server/deleteSession'
import * as ComAtprotoServerDescribeServer from './types/com/atproto/server/describeServer'
import * as ComAtprotoServerRefreshSession from './types/com/atproto/server/refreshSession'
import * as ComAtprotoSyncGetBlob from './types/com/atproto/sync/getBlob'
import * as ComAtprotoIdentityResolveHandle from './types/com/atproto/identity/resolveHandle'
import * as AppBskyActorDefs from './types/app/bsky/actor/defs'
import * as AppBskyActorGetProfile from './types/app/bsky/actor/getProfile'
import * as AppBskyFeedPost from './types/app/bsky/feed/post'
import * as AppBskyRichtextFacet from './types/app/bsky/richtext/facet'
import * as AppBskyEmbedExternal from './types/app/bsky/embed/external'
import * as AppBskyEmbedRecord from './types/app/bsky/embed/record'
import * as ComWhtwndBlogComment from './types/com/whtwnd/blog/comment'
import * as ComWhtwndBlogDefs from './types/com/whtwnd/blog/defs'
import * as ComWhtwndBlogEntry from './types/com/whtwnd/blog/entry'
import * as ComWhtwndBlogGetAuthorPosts from './types/com/whtwnd/blog/getAuthorPosts'
import * as ComWhtwndBlogGetEntryMetadataByName from './types/com/whtwnd/blog/getEntryMetadataByName'
import * as ComWhtwndBlogGetMentionsByEntry from './types/com/whtwnd/blog/getMentionsByEntry'
import * as ComWhtwndBlogNotifyOfNewEntry from './types/com/whtwnd/blog/notifyOfNewEntry'
import * as BlueLinkatBoard from './types/blue/linkat/board'

export * as ComAtprotoRepoApplyWrites from './types/com/atproto/repo/applyWrites'
export * as ComAtprotoRepoCreateRecord from './types/com/atproto/repo/createRecord'
export * as ComAtprotoRepoDeleteRecord from './types/com/atproto/repo/deleteRecord'
export * as ComAtprotoRepoGetRecord from './types/com/atproto/repo/getRecord'
export * as ComAtprotoRepoListRecords from './types/com/atproto/repo/listRecords'
export * as ComAtprotoRepoPutRecord from './types/com/atproto/repo/putRecord'
export * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef'
export * as ComAtprotoRepoUploadBlob from './types/com/atproto/repo/uploadBlob'
export * as ComAtprotoLabelDefs from './types/com/atproto/label/defs'
export * as ComAtprotoServerCreateSession from './types/com/atproto/server/createSession'
export * as ComAtprotoServerDeleteSession from './types/com/atproto/server/deleteSession'
export * as ComAtprotoServerDescribeServer from './types/com/atproto/server/describeServer'
export * as ComAtprotoServerRefreshSession from './types/com/atproto/server/refreshSession'
export * as ComAtprotoSyncGetBlob from './types/com/atproto/sync/getBlob'
export * as ComAtprotoIdentityResolveHandle from './types/com/atproto/identity/resolveHandle'
export * as AppBskyActorDefs from './types/app/bsky/actor/defs'
export * as AppBskyActorGetProfile from './types/app/bsky/actor/getProfile'
export * as AppBskyFeedPost from './types/app/bsky/feed/post'
export * as AppBskyRichtextFacet from './types/app/bsky/richtext/facet'
export * as AppBskyEmbedExternal from './types/app/bsky/embed/external'
export * as AppBskyEmbedRecord from './types/app/bsky/embed/record'
export * as ComWhtwndBlogComment from './types/com/whtwnd/blog/comment'
export * as ComWhtwndBlogDefs from './types/com/whtwnd/blog/defs'
export * as ComWhtwndBlogEntry from './types/com/whtwnd/blog/entry'
export * as ComWhtwndBlogGetAuthorPosts from './types/com/whtwnd/blog/getAuthorPosts'
export * as ComWhtwndBlogGetEntryMetadataByName from './types/com/whtwnd/blog/getEntryMetadataByName'
export * as ComWhtwndBlogGetMentionsByEntry from './types/com/whtwnd/blog/getMentionsByEntry'
export * as ComWhtwndBlogNotifyOfNewEntry from './types/com/whtwnd/blog/notifyOfNewEntry'
export * as BlueLinkatBoard from './types/blue/linkat/board'

export class AtpBaseClient {
  xrpc: XrpcClient = new XrpcClient()

  constructor() {
    this.xrpc.addLexicons(schemas)
  }

  service(serviceUri: string | URL): AtpServiceClient {
    return new AtpServiceClient(this, this.xrpc.service(serviceUri))
  }
}

export class AtpServiceClient {
  _baseClient: AtpBaseClient
  xrpc: XrpcServiceClient
  com: ComNS
  app: AppNS
  blue: BlueNS

  constructor(baseClient: AtpBaseClient, xrpcService: XrpcServiceClient) {
    this._baseClient = baseClient
    this.xrpc = xrpcService
    this.com = new ComNS(this)
    this.app = new AppNS(this)
    this.blue = new BlueNS(this)
  }

  setHeader(key: string, value: string): void {
    this.xrpc.setHeader(key, value)
  }
}

export class ComNS {
  _service: AtpServiceClient
  atproto: ComAtprotoNS
  whtwnd: ComWhtwndNS

  constructor(service: AtpServiceClient) {
    this._service = service
    this.atproto = new ComAtprotoNS(service)
    this.whtwnd = new ComWhtwndNS(service)
  }
}

export class ComAtprotoNS {
  _service: AtpServiceClient
  repo: ComAtprotoRepoNS
  server: ComAtprotoServerNS
  sync: ComAtprotoSyncNS
  identity: ComAtprotoIdentityNS

  constructor(service: AtpServiceClient) {
    this._service = service
    this.repo = new ComAtprotoRepoNS(service)
    this.server = new ComAtprotoServerNS(service)
    this.sync = new ComAtprotoSyncNS(service)
    this.identity = new ComAtprotoIdentityNS(service)
  }
}

export class ComAtprotoRepoNS {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  applyWrites(
    data?: ComAtprotoRepoApplyWrites.InputSchema,
    opts?: ComAtprotoRepoApplyWrites.CallOptions,
  ): Promise<ComAtprotoRepoApplyWrites.Response> {
    return this._service.xrpc
      .call('com.atproto.repo.applyWrites', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoApplyWrites.toKnownErr(e)
      })
  }

  createRecord(
    data?: ComAtprotoRepoCreateRecord.InputSchema,
    opts?: ComAtprotoRepoCreateRecord.CallOptions,
  ): Promise<ComAtprotoRepoCreateRecord.Response> {
    return this._service.xrpc
      .call('com.atproto.repo.createRecord', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoCreateRecord.toKnownErr(e)
      })
  }

  deleteRecord(
    data?: ComAtprotoRepoDeleteRecord.InputSchema,
    opts?: ComAtprotoRepoDeleteRecord.CallOptions,
  ): Promise<ComAtprotoRepoDeleteRecord.Response> {
    return this._service.xrpc
      .call('com.atproto.repo.deleteRecord', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoDeleteRecord.toKnownErr(e)
      })
  }

  getRecord(
    params?: ComAtprotoRepoGetRecord.QueryParams,
    opts?: ComAtprotoRepoGetRecord.CallOptions,
  ): Promise<ComAtprotoRepoGetRecord.Response> {
    return this._service.xrpc
      .call('com.atproto.repo.getRecord', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoRepoGetRecord.toKnownErr(e)
      })
  }

  listRecords(
    params?: ComAtprotoRepoListRecords.QueryParams,
    opts?: ComAtprotoRepoListRecords.CallOptions,
  ): Promise<ComAtprotoRepoListRecords.Response> {
    return this._service.xrpc
      .call('com.atproto.repo.listRecords', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoRepoListRecords.toKnownErr(e)
      })
  }

  putRecord(
    data?: ComAtprotoRepoPutRecord.InputSchema,
    opts?: ComAtprotoRepoPutRecord.CallOptions,
  ): Promise<ComAtprotoRepoPutRecord.Response> {
    return this._service.xrpc
      .call('com.atproto.repo.putRecord', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoPutRecord.toKnownErr(e)
      })
  }

  uploadBlob(
    data?: ComAtprotoRepoUploadBlob.InputSchema,
    opts?: ComAtprotoRepoUploadBlob.CallOptions,
  ): Promise<ComAtprotoRepoUploadBlob.Response> {
    return this._service.xrpc
      .call('com.atproto.repo.uploadBlob', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoUploadBlob.toKnownErr(e)
      })
  }
}

export class ComAtprotoServerNS {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  createSession(
    data?: ComAtprotoServerCreateSession.InputSchema,
    opts?: ComAtprotoServerCreateSession.CallOptions,
  ): Promise<ComAtprotoServerCreateSession.Response> {
    return this._service.xrpc
      .call('com.atproto.server.createSession', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerCreateSession.toKnownErr(e)
      })
  }

  deleteSession(
    data?: ComAtprotoServerDeleteSession.InputSchema,
    opts?: ComAtprotoServerDeleteSession.CallOptions,
  ): Promise<ComAtprotoServerDeleteSession.Response> {
    return this._service.xrpc
      .call('com.atproto.server.deleteSession', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerDeleteSession.toKnownErr(e)
      })
  }

  describeServer(
    params?: ComAtprotoServerDescribeServer.QueryParams,
    opts?: ComAtprotoServerDescribeServer.CallOptions,
  ): Promise<ComAtprotoServerDescribeServer.Response> {
    return this._service.xrpc
      .call('com.atproto.server.describeServer', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoServerDescribeServer.toKnownErr(e)
      })
  }

  refreshSession(
    data?: ComAtprotoServerRefreshSession.InputSchema,
    opts?: ComAtprotoServerRefreshSession.CallOptions,
  ): Promise<ComAtprotoServerRefreshSession.Response> {
    return this._service.xrpc
      .call('com.atproto.server.refreshSession', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerRefreshSession.toKnownErr(e)
      })
  }
}

export class ComAtprotoSyncNS {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  getBlob(
    params?: ComAtprotoSyncGetBlob.QueryParams,
    opts?: ComAtprotoSyncGetBlob.CallOptions,
  ): Promise<ComAtprotoSyncGetBlob.Response> {
    return this._service.xrpc
      .call('com.atproto.sync.getBlob', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetBlob.toKnownErr(e)
      })
  }
}

export class ComAtprotoIdentityNS {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  resolveHandle(
    params?: ComAtprotoIdentityResolveHandle.QueryParams,
    opts?: ComAtprotoIdentityResolveHandle.CallOptions,
  ): Promise<ComAtprotoIdentityResolveHandle.Response> {
    return this._service.xrpc
      .call('com.atproto.identity.resolveHandle', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoIdentityResolveHandle.toKnownErr(e)
      })
  }
}

export class ComWhtwndNS {
  _service: AtpServiceClient
  blog: ComWhtwndBlogNS

  constructor(service: AtpServiceClient) {
    this._service = service
    this.blog = new ComWhtwndBlogNS(service)
  }
}

export class ComWhtwndBlogNS {
  _service: AtpServiceClient
  comment: CommentRecord
  entry: EntryRecord

  constructor(service: AtpServiceClient) {
    this._service = service
    this.comment = new CommentRecord(service)
    this.entry = new EntryRecord(service)
  }

  getAuthorPosts(
    params?: ComWhtwndBlogGetAuthorPosts.QueryParams,
    opts?: ComWhtwndBlogGetAuthorPosts.CallOptions,
  ): Promise<ComWhtwndBlogGetAuthorPosts.Response> {
    return this._service.xrpc
      .call('com.whtwnd.blog.getAuthorPosts', params, undefined, opts)
      .catch((e) => {
        throw ComWhtwndBlogGetAuthorPosts.toKnownErr(e)
      })
  }

  getEntryMetadataByName(
    params?: ComWhtwndBlogGetEntryMetadataByName.QueryParams,
    opts?: ComWhtwndBlogGetEntryMetadataByName.CallOptions,
  ): Promise<ComWhtwndBlogGetEntryMetadataByName.Response> {
    return this._service.xrpc
      .call('com.whtwnd.blog.getEntryMetadataByName', params, undefined, opts)
      .catch((e) => {
        throw ComWhtwndBlogGetEntryMetadataByName.toKnownErr(e)
      })
  }

  getMentionsByEntry(
    params?: ComWhtwndBlogGetMentionsByEntry.QueryParams,
    opts?: ComWhtwndBlogGetMentionsByEntry.CallOptions,
  ): Promise<ComWhtwndBlogGetMentionsByEntry.Response> {
    return this._service.xrpc
      .call('com.whtwnd.blog.getMentionsByEntry', params, undefined, opts)
      .catch((e) => {
        throw ComWhtwndBlogGetMentionsByEntry.toKnownErr(e)
      })
  }

  notifyOfNewEntry(
    data?: ComWhtwndBlogNotifyOfNewEntry.InputSchema,
    opts?: ComWhtwndBlogNotifyOfNewEntry.CallOptions,
  ): Promise<ComWhtwndBlogNotifyOfNewEntry.Response> {
    return this._service.xrpc
      .call('com.whtwnd.blog.notifyOfNewEntry', opts?.qp, data, opts)
      .catch((e) => {
        throw ComWhtwndBlogNotifyOfNewEntry.toKnownErr(e)
      })
  }
}

export class CommentRecord {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ComWhtwndBlogComment.Record }[]
  }> {
    const res = await this._service.xrpc.call('com.atproto.repo.listRecords', {
      collection: 'com.whtwnd.blog.comment',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: ComWhtwndBlogComment.Record }> {
    const res = await this._service.xrpc.call('com.atproto.repo.getRecord', {
      collection: 'com.whtwnd.blog.comment',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: ComWhtwndBlogComment.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'com.whtwnd.blog.comment'
    const res = await this._service.xrpc.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'com.whtwnd.blog.comment', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._service.xrpc.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'com.whtwnd.blog.comment', ...params },
      { headers },
    )
  }
}

export class EntryRecord {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ComWhtwndBlogEntry.Record }[]
  }> {
    const res = await this._service.xrpc.call('com.atproto.repo.listRecords', {
      collection: 'com.whtwnd.blog.entry',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: ComWhtwndBlogEntry.Record }> {
    const res = await this._service.xrpc.call('com.atproto.repo.getRecord', {
      collection: 'com.whtwnd.blog.entry',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: ComWhtwndBlogEntry.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'com.whtwnd.blog.entry'
    const res = await this._service.xrpc.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'com.whtwnd.blog.entry', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._service.xrpc.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'com.whtwnd.blog.entry', ...params },
      { headers },
    )
  }
}

export class AppNS {
  _service: AtpServiceClient
  bsky: AppBskyNS

  constructor(service: AtpServiceClient) {
    this._service = service
    this.bsky = new AppBskyNS(service)
  }
}

export class AppBskyNS {
  _service: AtpServiceClient
  actor: AppBskyActorNS
  feed: AppBskyFeedNS
  richtext: AppBskyRichtextNS
  embed: AppBskyEmbedNS

  constructor(service: AtpServiceClient) {
    this._service = service
    this.actor = new AppBskyActorNS(service)
    this.feed = new AppBskyFeedNS(service)
    this.richtext = new AppBskyRichtextNS(service)
    this.embed = new AppBskyEmbedNS(service)
  }
}

export class AppBskyActorNS {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  getProfile(
    params?: AppBskyActorGetProfile.QueryParams,
    opts?: AppBskyActorGetProfile.CallOptions,
  ): Promise<AppBskyActorGetProfile.Response> {
    return this._service.xrpc
      .call('app.bsky.actor.getProfile', params, undefined, opts)
      .catch((e) => {
        throw AppBskyActorGetProfile.toKnownErr(e)
      })
  }
}

export class AppBskyFeedNS {
  _service: AtpServiceClient
  post: PostRecord

  constructor(service: AtpServiceClient) {
    this._service = service
    this.post = new PostRecord(service)
  }
}

export class PostRecord {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyFeedPost.Record }[]
  }> {
    const res = await this._service.xrpc.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.feed.post',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyFeedPost.Record }> {
    const res = await this._service.xrpc.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.feed.post',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: AppBskyFeedPost.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.bsky.feed.post'
    const res = await this._service.xrpc.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.bsky.feed.post', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._service.xrpc.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.bsky.feed.post', ...params },
      { headers },
    )
  }
}

export class AppBskyRichtextNS {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }
}

export class AppBskyEmbedNS {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }
}

export class BlueNS {
  _service: AtpServiceClient
  linkat: BlueLinkatNS

  constructor(service: AtpServiceClient) {
    this._service = service
    this.linkat = new BlueLinkatNS(service)
  }
}

export class BlueLinkatNS {
  _service: AtpServiceClient
  board: BoardRecord

  constructor(service: AtpServiceClient) {
    this._service = service
    this.board = new BoardRecord(service)
  }
}

export class BoardRecord {
  _service: AtpServiceClient

  constructor(service: AtpServiceClient) {
    this._service = service
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: BlueLinkatBoard.Record }[]
  }> {
    const res = await this._service.xrpc.call('com.atproto.repo.listRecords', {
      collection: 'blue.linkat.board',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: BlueLinkatBoard.Record }> {
    const res = await this._service.xrpc.call('com.atproto.repo.getRecord', {
      collection: 'blue.linkat.board',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: BlueLinkatBoard.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'blue.linkat.board'
    const res = await this._service.xrpc.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'blue.linkat.board', rkey: 'self', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._service.xrpc.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'blue.linkat.board', ...params },
      { headers },
    )
  }
}
