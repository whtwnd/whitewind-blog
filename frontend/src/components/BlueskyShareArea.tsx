'use client'
import { LoginModal } from '@/components/LoginModal'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { EntryContext } from '@/contexts/EntryContext'
import { HeaderContext } from '@/contexts/HeaderContext'
import { SessionContext } from '@/contexts/SessionContext'
import { createClient, resolvePDSClient, transformPost } from '@/services/clientUtils'
import { validateContent } from '@/services/validator'
import { AppBskyFeedPost, BlobRef, BskyAgent, ComAtprotoRepoUploadBlob } from '@atproto/api'
import { Card, Checkbox, Label, Spinner, Textarea } from 'flowbite-react'
import { FC, useContext, useState } from 'react'
import { useForm } from 'react-hook-form'

export interface IBlueskyShareButtonProps {
  aturi: string
  ogpUrl?: string
}

interface FormValues {
  comment: string
  useOgp: boolean
}

type PostState = 'idle' | 'posting' | 'postSuccess' | 'postFailure'

export const BlueskyShareArea: FC<IBlueskyShareButtonProps> = () => {
  const [postState, setPostState] = useState<PostState>('idle')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [failMessage, setFailMessage] = useState('')
  const { handleSubmit, formState, register } = useForm<FormValues>()
  const manager = useContext(SessionContext)
  const { curProfile, requestAuth } = useContext(HeaderContext)
  const { entry } = useContext(EntryContext)
  const authorInfo = useContext(AuthorInfoContext)

  const onSubmit = async (data: FormValues): Promise<void> => {
    try {
      if (entry === undefined) {
        setFailMessage('Internal error: blogpost data is missing')
        return
      }
      const entryCast = entry
      if (curProfile === undefined) {
        requestAuth?.()
        return
      }
      setPostState('posting')
      const client = createClient('bsky.social')
      const pds = await resolvePDSClient(curProfile.did, client)
      const pdsClient = createClient(pds)
      const sess = await manager.getSession(curProfile.did, pdsClient)
      if (sess === undefined) {
        requestAuth?.()
        setPostState('idle')
        return
      }
      pdsClient.setHeader('Authorization', `Bearer ${sess.accessJwt}`)
      const agent = new BskyAgent({ service: `https://${pds}` })
      const resumeResult = await agent.resumeSession(sess)
      if (!resumeResult.success) {
        requestAuth?.()
        setPostState('idle')
        return
      }

      const { text: transformed, facets } = transformPost(data.comment)

      let blobResult: ComAtprotoRepoUploadBlob.Response | undefined
      let ogpUrl = entryCast.ogp?.url ?? `/api/og?title=${entryCast.title as string}&displayname=${authorInfo.profile?.displayName ?? '(noname)'}&handle=@${authorInfo.handle ?? 'nohandle'}`
      if (authorInfo.profile?.avatar !== undefined) {
        ogpUrl += `&avatar=${authorInfo.profile.avatar}`
      }
      if (data.useOgp) {
        try {
          const fetchResult = await fetch(ogpUrl)
          const blob = await fetchResult.arrayBuffer()
          const imageType = fetchResult.headers.get('Content-Type')
          blobResult = await pdsClient.com.atproto.repo.uploadBlob(new Uint8Array(blob), {
            encoding: imageType ?? 'image/jpeg'
          })
        } catch (err) {
          console.error(err)
        }
      }

      // eslint-disable-next-line
            const descElem = document.querySelector('meta[name="description"]') as any
      let description = descElem !== null ? descElem.content as string : undefined
      if (description !== undefined && description.length > 300) {
        description = description.slice(0, 300) + '...'
      }
      const post: AppBskyFeedPost.Record = {
        text: transformed,
        createdAt: (new Date()).toISOString(),
        langs: [navigator.language],
        facets,
        embed: data.useOgp
          ? {
              $type: 'app.bsky.embed.external',
              external: {
                uri: window.location.href,
                title: document.title,
                description,
                thumb: blobResult !== undefined ? new BlobRef(blobResult.data.blob.ref, blobResult.data.blob.mimeType, blobResult.data.blob.size) : undefined
              }
            }
          : undefined
      }
      const result = await agent.post(post)
      console.log(result)
      setPostState('postSuccess')
      await new Promise<void>((resolve) => setTimeout(resolve, 1000))
      setPostState('idle')
    } catch (err) {
      console.log(err)
      setFailMessage((err as Error).message)
      setPostState('idle')
    }
  }

  const onLoginModalClose = (identity?: string): void => {
    if (identity === undefined || identity.length === 0) {
      setIsLoginModalOpen(false)
      return
    }
    setIsLoginModalOpen(false)
  }

  return (
    <Card>
      <h3 className='pb-1 text-xl font-semibold text-gray-700'>Post reaction in Bluesky</h3>
      <form className='space-y-2' onSubmit={() => { void handleSubmit(onSubmit) }}>
        <Textarea
          id='comment'
          placeholder='Leave a comment...'
          rows={4}
          theme={{ colors: { gray: 'border-gray-300 bg-gray-50 text-gray-900 focus:border-sky-400 focus:ring-cyan-200' } }}
          color={formState.errors.comment === undefined ? 'gray' : 'failure'}
          helperText={formState.errors.comment?.message}
          {...register('comment', {
            required: true,
            validate: validateContent
          })}
        />
        <div className='flex flex-row items-center gap-2'>
          <Checkbox
            id='useLinkCard'
            defaultChecked theme={{ root: { color: { info: 'text-sky-400 focus:ring-cyan-200' } } }}
            color='info'
            {...register('useOgp')}
          />
          <Label htmlFor='useLinkCard' className='flex'>
            Insert link card
          </Label>
        </div>
        {
                failMessage.length > 0 && (
                  <div className='flex justify-between text-sm font-semibold text-red-500'>
                    {failMessage}
                  </div>
                )
            }
        <p className='text-gray-400 text-xs'>*To be shown as a reaction, include article link in the post or add link card</p>
        <button className='py-2 px-4 flex flex-row items-center content-center gap-1 rounded-lg bg-sky-400 text-gray-100 stroke-gray-100 transition duration-200 hover:bg-sky-500 focus:ring-4 focus:ring-cyan-200'>
          <p className='block font-semibold text-sm'>Post</p>
          {
                    postState === 'posting'
                      ? <>&nbsp;<Spinner size='sm' /></>
                      : postState === 'postSuccess'
                        ? (
                          <>&nbsp;
                            <svg className='w-6 h-6 text-gray-800 inline' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
                              <path stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 11.917 9.724 16.5 19 7.5' />
                            </svg>
                          </>
                          )
                        : <></>
                }
        </button>
      </form>
      <LoginModal open={isLoginModalOpen} onClose={onLoginModalClose} />
    </Card>
  )
}
