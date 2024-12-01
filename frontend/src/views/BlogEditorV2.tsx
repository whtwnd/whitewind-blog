'use client'
import { AtpBaseClient, ComAtprotoRepoUploadBlob } from '@/api'
import { BlobMetadata } from '@/api/types/com/whtwnd/blog/defs'
import AuthorCard from '@/components/AuthorCard'
import { BottomAuthorCard } from '@/components/BottomAuthorCard'
import { DragDropUpload } from '@/components/DragDropUpload'
import EntryHeroSection from '@/components/EntryHeroSection'
import Header from '@/components/Headers/Header'
import ThreeColumnBlogView from '@/components/ThreeColumnBlogView'
import VisibilityBadge from '@/components/VisibilityBadge'
import { NO_THEME, ThemeMapping } from '@/components/themes'
import { AuthorInfoContext } from '@/contexts/AuthorInfoContext'
import { EntryContext } from '@/contexts/EntryContext'
import { HeaderContext } from '@/contexts/HeaderContext'
import { MarkdownToHtml } from '@/services/DocProvider'
import { createClient } from '@/services/clientUtils'
import { validateOGPDimension, validateOGPURL, validateTitle } from '@/services/validator'
import BlogViewer from '@/views/BlogViewer'
import { BlobRef } from '@atproto/lexicon'
import type { Record as BlogEntry } from '@/api/types/com/whtwnd/blog/entry'
import MDEditor from '@uiw/react-md-editor'
import { Dropdown, Modal, Select, TextInput, Toast, Tooltip } from 'flowbite-react'
import { ChangeEvent, EventHandler, FC, FormEvent, MouseEventHandler, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFormState } from 'react-hook-form'
import {
  IoCloudUploadOutline, IoSettingsOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoImagesOutline,
  IoSaveOutline,
  IoChevronForwardOutline,
  IoPencilOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoCheckmarkCircle,
  IoInformationCircle,
  IoCloseCircle,
  IoAlertCircle,
  IoOpenOutline,
  IoListOutline,
  IoHelpOutline,
  IoRadioButtonOnOutline,
  IoRadioButtonOffOutline
} from 'react-icons/io5'
import { AtUri } from '@atproto/api'
import { useRouter } from 'next/navigation'
import { CTAButton } from '@/components/CTAButton'
import '@/views/BlogEditorV2.css'
import { useSetAtom } from 'jotai'
import { OAuthSession } from '@atproto/oauth-client-browser'
import { getSessionAtom } from '@/atoms'

interface IMenuItemProps {
  icon?: ReactNode
  text: string | string[]
  href?: string
  textColor?: string
  variant?: 'submit' | 'file'
  disableText?: boolean
  tooltipPos?: 'right' | 'bottom'
  hideInLargeScreen?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
  onUpload?: (e: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

const MenuItem: FC<IMenuItemProps> = ({ icon, text, href, textColor, variant, disableText, tooltipPos, hideInLargeScreen, onClick, onUpload, disabled }) => {
  const className = `relative flex flex-row gap-2 cursor-pointer items-center transition duration-200 hover:brightness-200 ${hideInLargeScreen === true ? 'sm:hidden' : ''}`

  const texts = !Array.isArray(text) ? [text] : text
  const renderedText = texts.map((t, i) => <p className='text-xs lg:text-sm text-nowrap' key={i}>{t}</p>)

  const content = (
    <div className={className} onClick={disabled !== true ? onClick : undefined}>
      {icon}
      {disableText !== true && <span className={`${textColor ?? 'text-gray-700'} font-semibold`}>{renderedText}</span>}
      {variant !== undefined && <input type={variant} className='absolute w-full h-full cursor-pointer opacity-0' onChange={disabled !== true ? onUpload : undefined} disabled={disabled} />}
      {href !== undefined && disabled !== true && <a href={href} className='absolute top-0 left-0 w-full h-full opacity-0' target='_blank' rel='noreferrer' />}
    </div>
  )

  return tooltipPos === undefined ? content : <Tooltip content={renderedText} placement={tooltipPos}>{content}</Tooltip>
}
const normalClass = 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 bg-gray-50 text-gray-900 focus:border-sky-400 focus:ring-cyan-200 p-2.5 sm:text-sm rounded-lg'
const errorClass = 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 p-2.5 sm:text-sm rounded-lg'

interface IPictureCardProps {
  headerUrl: string
  blobUrl: string
  name?: string
  onDeleteClick?: () => void
}
const PictureCard: FC<IPictureCardProps> = ({ headerUrl, blobUrl, name, onDeleteClick }) => {
  const [showCheckmark, setShowCheckMark] = useState(false)
  const checkMarkTimer = useRef<ReturnType<typeof setTimeout>>()
  const [modalOpen, setModalOpen] = useState(false)

  const onCopyClick: EventHandler<FormEvent> = (e) => {
    e.preventDefault()
    void navigator.clipboard.writeText(blobUrl).then(() => {
      setShowCheckMark(true)
      if (checkMarkTimer.current !== undefined) {
        return
      }
      checkMarkTimer.current = setTimeout(() => {
        setShowCheckMark(false)
        checkMarkTimer.current = undefined
      }, 1000)
    })
  }
  useEffect(() => {
    return () => {
      if (checkMarkTimer.current !== undefined) {
        clearTimeout(checkMarkTimer.current)
        checkMarkTimer.current = undefined
      }
    }
  }, [])
  const onThumbnailClick: EventHandler<FormEvent> = (e) => {
    e.preventDefault()
    setModalOpen(true)
  }
  const cssProps = { '--image-url': `url(${headerUrl})` }
  return (
    <div className='h-50 max-h-50 w-full flex rounded-lg border border-gray-200 bg-white shadow-md flex-col'>
      {/* Image thumbnail area */}
      <button
        style={cssProps as React.CSSProperties}
        className='rounded-t min-h-40 bg-[image:var(--image-url)] bg-contain bg-no-repeat bg-center' onClick={onThumbnailClick}
      />
      {/* Image description area */}
      <h5 className='w-full block text-center font-semibold text-gray-700 break-all'>{name}</h5>
      {/* Image action area */}
      <div className='w-full pt-2 pr-2 pb-2 flex flex-row gap-2 justify-end'>
        <Tooltip content='Copy URL'><button onClick={onCopyClick}>{!showCheckmark ? <IoCopyOutline size={20} /> : <IoCheckmarkOutline size={20} />}</button></Tooltip>
        <Tooltip content='Delete image'><button onClick={onDeleteClick}><IoTrashOutline size={20} /></button></Tooltip>
      </div>
      <Modal show={modalOpen} onClose={() => setModalOpen(false)} dismissible>
        <Modal.Header>{name}</Modal.Header>
        <Modal.Body>
          <img
            src={headerUrl}
            className='rounded-t bg-[image:var(--image-url)] bg-contain bg-no-repeat bg-center'
          />
        </Modal.Body>
      </Modal>
    </div>
  )
}

const ErrorMessage = ({ children }: { children: ReactNode }): ReactNode => {
  return <p className='text-sm font-semibold text-red-500'>{children}</p>
}

interface FormValues {
  title: string
  theme: 'github-light' | '(no theme)'
  ogpUrl: string
  ogpWidth: string
  ogpHeight: string
}

interface ToastContent {
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
}

const TOASTCOLOR = {
  info: 'text-sky-700 bg-sky-200',
  warning: 'text-amber-800 bg-amber-200',
  error: 'text-rose-700 bg-rose-200',
  success: 'text-green-700 bg-green-200'
}

export const BlogEditorV2: FC = () => {
  const entryInfo = useContext(EntryContext)
  const authorInfo = useContext(AuthorInfoContext)
  const { curProfile, requestAuth } = useContext(HeaderContext)
  const getSession = useSetAtom(getSessionAtom)

  // UI states
  // necessary for preview
  const [isToolPanelOpen, setToolPanelOpen] = useState(false)
  const [isSettingModalOpen, setSettingModalOpen] = useState(false)
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false)
  const [curPage, setCurPage] = useState<'editor' | 'preview' | 'pictures'>('editor')
  const [isBusy, setIsBusy] = useState(false)
  const [toastContent, setToastContentRaw] = useState<ToastContent | undefined>()
  const [isMobile, setIsMobile] = useState(false)
  const isDirtyRef = useRef(false)
  const [langCode, setLangCode] = useState('en-US')
  const cursorPosRef = useRef(0)

  // entry info
  const [content, setContent] = useState<string>(entryInfo.entry?.content ?? '')
  const [blobs, setBlobs] = useState(entryInfo.entry?.blobs)
  const [visibility, setVisibility] = useState(entryInfo.entry?.isDraft === true ? 'author' : (entryInfo.entry?.visibility ?? 'author'))

  const router = useRouter()

  const { handleSubmit, register, watch, control, getValues } = useForm<FormValues>({
    defaultValues: {
      title: entryInfo.entry?.title,
      theme: entryInfo.entry?.theme ?? 'github-light',
      ogpUrl: entryInfo.entry?.ogp?.url,
      ogpWidth: entryInfo.entry?.ogp?.width?.toString(),
      ogpHeight: entryInfo.entry?.ogp?.height?.toString()
    },
    mode: 'all'
  })
  const { errors } = useFormState({ control })

  // create subscription to form value change
  const { title, theme, ogpUrl } = watch()

  const PREVIEW_TIMER_MILLISECONDS = 500
  const AUTOSAVE_TIMER_MILLISECONDS = 10 * 1000
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>()
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>()
  const toastHideTimer = useRef<ReturnType<typeof setTimeout>>()
  const contentRef = useRef(content)
  const [mdHtml, setMdHtml] = useState<JSX.Element | undefined>()

  const setToastContent = useCallback((content: ToastContent): void => {
    if (toastHideTimer.current !== undefined) {
      clearTimeout(toastHideTimer.current)
    }
    setToastContentRaw(content)
    toastHideTimer.current = setTimeout(() => {
      setToastContentRaw(undefined)
      toastHideTimer.current = undefined
    }, 5000)
  }, [])

  const onSubmit = useCallback(async (value: FormValues, pic?: { file: File, autoInsert: boolean }, disableToast?: boolean): Promise<void> => {
    if (isBusy) {
      return
    }
    const showToast = (content: ToastContent): void => {
      if (disableToast === true) {
        return
      }
      setToastContent(content)
    }
    if (authorInfo.did === undefined) {
      showToast({ message: 'Please login to save', severity: 'error' })
      requestAuth()
      return
    }
    if (content === undefined) {
      showToast({ message: 'Content data is undefined', severity: 'error' })
      return
    }
    if (authorInfo.pds === undefined) {
      showToast({ message: 'Could not resolve PDS of the author', severity: 'error' })
      return
    }
    setIsBusy(true)

    // Use selected profile in header
    const did = authorInfo.did

    // login
    let sess: OAuthSession | undefined
    try {
      sess = await getSession(did)
    } catch (err) {
      showToast({ message: `Failed to login (${(err as Error).message})`, severity: 'error' })
    }
    if (sess === undefined) {
      showToast({ message: 'Session expired. Please fill in login info.', severity: 'warning' })
      requestAuth()
      setIsBusy(false)
      return
    }
    const client = new AtpBaseClient(async (url: string, init?: RequestInit) => await sess.fetchHandler(url, init))

    // upload image if any
    let newBlobMetadata: BlobMetadata | undefined
    let newBlobRefs: BlobMetadata[] | undefined = blobs
    if (pic?.file !== undefined) {
      showToast({ message: 'Uploading picture...', severity: 'info' })

      const picData = new Uint8Array(await pic.file.arrayBuffer())
      let uploadBlobResult: ComAtprotoRepoUploadBlob.Response | undefined
      try {
        uploadBlobResult = await client.com.atproto.repo.uploadBlob(picData, { encoding: pic.file.type })
      } catch (err) {
        showToast({ message: `Failed to upload picture (${(err as Error).message}) `, severity: 'error' })
        setIsBusy(false)
        return
      }
      if (uploadBlobResult !== undefined) {
        newBlobMetadata = {
          blobref: uploadBlobResult.data.blob,
          encoding: pic.file.type,
          name: pic.file.name
        }
        newBlobRefs =
          blobs !== undefined
            ? [...blobs, newBlobMetadata]
            : [newBlobMetadata]
        if (pic.autoInsert) {
          const picLink = `![](https://${authorInfo.pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${uploadBlobResult.data.blob.ref.toString()})`
          const newContent = contentRef.current.slice(0, cursorPosRef.current) + picLink + contentRef.current.slice(cursorPosRef.current)
          contentRef.current = newContent
          setContent(contentRef.current)
        }
      }
    }
    if (newBlobRefs !== undefined) {
      // unnest `original`
      for (const metadata of newBlobRefs) {
        const prev = metadata.blobref
        metadata.blobref = new BlobRef(prev.ref, prev.mimeType, prev.size)
      }
    }

    // create record
    const blogEntry: BlogEntry = {
      content: contentRef.current,
      createdAt: (new Date()).toISOString(),
      title: value.title,
      theme: value.theme === NO_THEME ? undefined : value.theme,
      blobs: newBlobRefs,
      visibility
    }
    if (value.ogpUrl !== undefined && value.ogpUrl.length > 0) {
      blogEntry.ogp = {
        url: value.ogpUrl,
        width: value.ogpWidth !== undefined ? parseInt(value.ogpWidth) : undefined,
        height: value.ogpHeight !== undefined ? parseInt(value.ogpHeight) : undefined
      }
    }

    let createResult: { uri: string, cid: string }

    try {
      showToast({ message: 'Writing record...', severity: 'info' })
      if (entryInfo.rkey === undefined) {
        createResult = await client.com.whtwnd.blog.entry.create({ repo: did, collection: 'com.whtwnd.blog.entry', validate: false }, blogEntry)
      } else {
        createResult = (await client.com.atproto.repo.putRecord({ repo: did, collection: 'com.whtwnd.blog.entry', rkey: entryInfo.rkey, record: blogEntry, validate: false })).data
      }
    } catch (err) {
      showToast({ message: `Failed to write record (${(err as Error).message}) `, severity: 'error' })
      setIsBusy(false)
      return
    }
    isDirtyRef.current = false

    const aturi = new AtUri(createResult.uri)

    // update blob refs this timing because until here, getBlob returns error and if the user is seeing PicturesView, it will crash
    setBlobs(newBlobRefs)

    // notify AppView of update
    const appViewClient = createClient(process.env.NEXT_PUBLIC_API_HOSTNAME as string)
    try {
      await appViewClient.com.whtwnd.blog.notifyOfNewEntry({ entryUri: createResult.uri })
    } catch (err) {
      showToast({ message: `Failed to notify WhiteWind of new entry (${(err as Error).message}) `, severity: 'error' })
      return
    } finally {
      setIsBusy(false)
    }

    // if current url author part or rkey part is different from selected profile in header, navigate to the url
    if (authorInfo.did !== did || entryInfo.rkey !== aturi.rkey) {
      const newUri = `/${authorInfo.handle ?? authorInfo.did}/${aturi.rkey}/edit`
      showToast({ message: 'Succeeded in writing the entry! Refreshing editor...', severity: 'success' })
      router.push(newUri)
    } else {
      showToast({ message: 'Succeeded in writing the entry!', severity: 'success' })
    }
  }, [isBusy, blobs, content, entryInfo.rkey, requestAuth, getSession, visibility, authorInfo.did, authorInfo.handle, router, authorInfo.pds, setToastContent])

  const onUploadClick = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const { files } = event.target
    if (files === null) {
      return
    }
    const file = files[0]
    void handleSubmit(async (data: FormValues) => await onSubmit(data, { file, autoInsert: false }))(event)
    event.target.value = ''
  }, [handleSubmit, onSubmit])

  const onDropPic = (f: File): void => {
    void handleSubmit(async (data: FormValues) => await onSubmit(data, { file: f, autoInsert: true }))()
  }

  useEffect(() => {
    setLangCode(window.navigator.language)

    const onSizeChange = (e: MediaQueryListEvent): void => {
      setIsMobile(!e.matches)
      document.body.style.overflow = e.matches ? 'hidden' : 'auto'
    }
    const mediaQuery = window.matchMedia('(min-width: 640px)')
    setIsMobile(!mediaQuery.matches)
    document.body.style.overflow = mediaQuery.matches ? 'hidden' : 'auto'
    mediaQuery.addEventListener('change', onSizeChange)

    const onLeave = (e: BeforeUnloadEvent | PageTransitionEvent): string | undefined => {
      if (!isDirtyRef.current) {
        return
      }
      e.preventDefault()
      return ''
    }
    window.addEventListener('beforeunload', onLeave)
    window.addEventListener('pagehide', onLeave)
    return () => {
      mediaQuery.removeEventListener('change', onSizeChange)
      window.removeEventListener('beforeunload', onLeave)
      window.removeEventListener('pagehide', onLeave)
    }
  }, [])

  const onEditorChange = (value?: string): void => {
    isDirtyRef.current = true
    setContent(value ?? '')
    contentRef.current = value ?? ''
  }

  const clearTimers = useCallback(() => {
    for (const timerRef of [
      previewTimerRef,
      autosaveTimerRef
    ]) {
      if (timerRef.current === undefined) {
        continue
      }
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  // on content change
  useEffect(() => {
    // preview PREVIEW_TIMER_MILLISECONDS later since first change
    if (previewTimerRef.current === undefined) {
      previewTimerRef.current = setTimeout(() => {
        void MarkdownToHtml(contentRef.current ?? '')
          .then(ret => {
            setMdHtml(ret.result)
            previewTimerRef.current = undefined
          })
      }, PREVIEW_TIMER_MILLISECONDS)
    }
    if (title === undefined || title.length === 0) {
      return
    }
    // auto save
    if (autosaveTimerRef.current !== undefined) {
      clearTimeout(autosaveTimerRef.current)
    }
    autosaveTimerRef.current = setTimeout(() => {
      if (!isDirtyRef.current) {
        autosaveTimerRef.current = undefined
        return
      }
      void onSubmit(getValues(), undefined, true)
        .finally(() => { autosaveTimerRef.current = undefined })
    }, AUTOSAVE_TIMER_MILLISECONDS)

    // clear timer on page leave or next content change
    return clearTimers
  }, [content, onSubmit, getValues])

  const onDeleteConfirmationModalClose = (confirmed: boolean): void => {
    setIsDeleteConfirmationModalOpen(false)
    if (confirmed) {
      // suppress autosave etc. immediately when the deletion is confirmed
      clearTimers()
      void onDeleteClick()
    }
  }

  const onDeleteClick = useCallback(async () => {
    if (isBusy) {
      return
    }
    if (entryInfo.rkey === undefined) {
      setToastContent({ message: 'The entry is not saved yet and nothing to delete', severity: 'info' })
      return
    }
    if (curProfile === undefined) {
      setToastContent({ message: 'Please login to save', severity: 'warning' })
      requestAuth()
      return
    }
    setIsBusy(true)

    const did = curProfile.did

    // login
    let sess: OAuthSession | undefined
    try {
      sess = await getSession(did)
    } catch (err) {
      setToastContent({ message: `Failed to login (${(err as Error).message})`, severity: 'error' })
    }
    if (sess === undefined) {
      setToastContent({ message: 'Session expired. Please fill in login info.', severity: 'warning' })
      requestAuth()
      setIsBusy(false)
      return
    }
    const client = new AtpBaseClient(async (url: string, init?: RequestInit) => await sess.fetchHandler(url, init))

    // delete record
    try {
      await client.com.whtwnd.blog.entry.delete({ repo: did, rkey: entryInfo.rkey })
      setToastContent({ message: 'Succeeded in deleting the entry. Redirecting...', severity: 'success' })
      setTimeout(() => {
        router.push(`/${authorInfo.handle ?? authorInfo.did as string}`)
      })
    } catch (err) {
      setToastContent({ message: `Failed to delete the entry (${(err as Error).message})`, severity: 'error' })
      setIsBusy(false)
    }
  }, [isBusy, authorInfo.did, authorInfo.handle, authorInfo.pds, curProfile, entryInfo.rkey, requestAuth, router, getSession, setToastContent, clearTimers])

  // Pages
  const ViewerCache = useMemo(() => <BlogViewer
    mdHtml={mdHtml ?? <></>}
    theme={ThemeMapping.get(theme ?? NO_THEME)}
    disableComments
    disableShareButtons
    disableAuthorCard
                                    />, [mdHtml, theme])

  const textInputTheme = (isError: boolean): any => { return { base: 'flex grow', field: { input: { colors: { gray: (!isError ? normalClass : errorClass) }, sizes: { sm: 'p-2 sm:text-md' } } } } }

  const editorPage = useMemo(() => {
    return (
      <>{
          isMobile &&
            <TextInput
              theme={textInputTheme(errors.title !== undefined)}
              type='text'
              placeholder='Entry title'
              sizing='sm'
              {...register('title', { required: true, validate: validateTitle })}
            />
          }
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 ring-0 focus:ring-0'>
          <div className='h-[calc(50vh-80px)] sm:h-full sm:max-h-[calc(100vh-75px)] overflow-auto order-2 md:order-1'>
            <MDEditor
              value={content}
              height='100%'
              // eslint-disable-next-line
              minHeight={"100%" as any}
              data-color-mode='light'
              preview='edit'
              onChange={onEditorChange}
              textareaProps={{
                onSelect: (e) => { cursorPosRef.current = e.currentTarget.selectionStart }
              }}
            />
          </div>
          {/* Preview */}
          <div className='h-[calc(50vh-80px)] sm:h-full sm:max-h-[calc(100vh-75px)] overflow-auto order-1 md:order-2'>{ViewerCache}</div>
        </div>
      </>
    )
  }, [isMobile, content, ViewerCache, register])

  const previewPage = useMemo(() => {
    return (
      <div className='max-h-[calc(100vh-75px)] overflow-auto'>
        <ThreeColumnBlogView
          hero={<EntryHeroSection
            title={title ?? '(no title)'}
            did={authorInfo?.did ?? '(no did)'}
            handle={authorInfo?.handle ?? '(no handle)'}
            lastUpdate={new Date().toISOString()}
            ogpUrl={ogpUrl}
            visibility={visibility}
                />}
          center={
            <div className='flex flex-col gap-4'>
              {ViewerCache}
              <section id='author'><BottomAuthorCard authorInfo={authorInfo} /></section>
            </div>
          }
          right={<AuthorCard authorInfo={authorInfo} collapsible />}
          disableHeader
        />
      </div>
    )
  }, [ViewerCache, authorInfo, ogpUrl, title, visibility])

  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])
  const picturesPage = useMemo(() => {
    const pics = blobs?.map((blobMetadata, i) => {
      const headerUrl = `${origin}/api/cache?did=${encodeURIComponent(authorInfo.did ?? '')}&cid=${encodeURIComponent(blobMetadata.blobref.ref.toString())}`
      const blobUrl = `https://${authorInfo.pds ?? 'bsky.social'}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(authorInfo.did ?? '')}&cid=${encodeURIComponent(blobMetadata.blobref.ref.toString())}`
      const onDeleteClick = (): void => {
        setBlobs(prev => prev === undefined ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)])
        setToastContent({ message: 'Deletion is not confirmed. Save entry to confirm.', severity: 'info' })
      }

      return <PictureCard key={i} headerUrl={headerUrl} blobUrl={blobUrl} name={blobMetadata.name} onDeleteClick={onDeleteClick} />
    })

    return pics !== undefined && pics.length > 0
      ? <div className='p-4 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 items-center'>{pics}</div>
      : (
        <div className='p-4 w-full h-full flex justify-center items-center'>
          <h1 className='font-medium text-gray-400 text-2xl'>No pictures</h1>
        </div>
        )
  }, [blobs, authorInfo.did, authorInfo.pds, origin, setToastContent])

  const leftMenuTooltipPos = !isToolPanelOpen ? 'right' : undefined

  // used to show settings cog in red
  const errorInSettings = (errors.ogpUrl ?? errors.ogpWidth ?? errors.ogpHeight ?? errors.theme) !== undefined

  const generateToolPanelItems = useCallback((isHeaderItem: boolean) => {
    const firstItems: IMenuItemProps[] = [
      { text: 'Editor', icon: <IoPencilOutline size={20} color='#374151' />, onClick: (e) => { e.preventDefault(); setCurPage('editor') } },
      { text: 'Preview', icon: <IoEyeOutline size={20} color='#374151' />, onClick: (e) => { e.preventDefault(); setCurPage('preview') } },
      { text: 'Uploaded pictures', icon: <IoImagesOutline size={20} color='#374151' title='Pictures' />, onClick: (e) => { e.preventDefault(); setCurPage('pictures') } }
    ]
    const secondItems: IMenuItemProps[] = [
      { text: 'Save', icon: <IoSaveOutline size={20} color='#374151' />, onClick: undefined, variant: 'submit', disabled: isBusy },
      { text: ['Upload picture', '(or drag and drop)'], icon: <IoCloudUploadOutline size={20} color='#374151' />, onClick: undefined, variant: 'file', onUpload: onUploadClick, disabled: isBusy },
      { text: 'Settings', icon: <IoSettingsOutline size={20} color={!errorInSettings ? '#374151' : '#ef4444'} />, onClick: (e) => { e.preventDefault(); setSettingModalOpen(true) }, textColor: errorInSettings ? 'text-red-500' : 'text-gray-700' }
    ]

    const thirdItems: IMenuItemProps[] = [
      { text: 'Delete', icon: <IoTrashOutline size={20} color='#374151' />, onClick: (e) => { e.preventDefault(); setIsDeleteConfirmationModalOpen(true) }, disabled: isBusy }
    ]

    const forthItems: IMenuItemProps[] = [
      { text: 'Open article', icon: <IoOpenOutline size={20} color='#374151' />, onClick: undefined, href: `/${authorInfo.handle as string}/${entryInfo.rkey as string}`, disabled: entryInfo.rkey === undefined },
      { text: 'Open entry list', icon: <IoListOutline size={20} color='#374151' />, onClick: undefined, href: `/${authorInfo.handle ?? ''}` }
    ]

    const enUsage = '/whtwnd.com/3kt3lixripz2s'
    const jaUsage = '/whtwnd.com/3kt3kd3pq5k2y'
    const fifthItems: IMenuItemProps[] = [
      { text: 'Usage', icon: <IoHelpOutline size={20} color='#374151' />, onClick: undefined, href: langCode.startsWith('ja') ? jaUsage : enUsage }
    ]

    const allItems = [firstItems, secondItems, thirdItems, forthItems, fifthItems]

    return (
      <>
        <div className={`grow flex flex-col gap-4 ${!isHeaderItem && !isToolPanelOpen ? 'items-center' : 'items-start'}`}>
          {allItems.flatMap((items, i) => {
            const ret = items.map((props, j) => {
              return <MenuItem {...props} disableText={!isHeaderItem && !isToolPanelOpen} tooltipPos={leftMenuTooltipPos} key={i * allItems.length + j} />
            })
            if (i !== allItems.length - 1) {
              ret.push(<div className='w-full my-1 border-b border-gray-300' key={100 + i} />)
            }
            return ret
          })}

        </div>
        {!isHeaderItem && (
          <div className={!isToolPanelOpen ? '' : 'flex justify-end'}>
            <button className={`transition duration-200 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-400 ${isToolPanelOpen ? 'rotate-180' : ''}`} onClick={(e) => { e.preventDefault(); setToolPanelOpen(!isToolPanelOpen) }}>
              <IoChevronForwardOutline color='#374151' />
            </button>
          </div>
        )}
      </>
    )
  }, [errorInSettings, isToolPanelOpen, leftMenuTooltipPos, onUploadClick, isBusy, authorInfo.handle, entryInfo.rkey])

  const toolPanelItems = useMemo(() => generateToolPanelItems(false), [generateToolPanelItems])
  const headerItems = useMemo(() => generateToolPanelItems(true), [generateToolPanelItems])

  const backdropZoneRef = useRef<HTMLDivElement>(null)
  const formOnSubmit = handleSubmit(async (d) => await onSubmit(d))
  return (
    <form className='flex flex-col h-[100vh]' onSubmit={(e) => { void formOnSubmit(e) }}>
      <Header title={isMobile ? '' : undefined} hidePostNewEntry mainAreaClassName='px-0 sm:px-10 sm:grow gap-4 align-center items-center' mobileChildren={headerItems} disableSwitchAccount>
        <div className='max-w-[40vw] flex items-center gap-2 relative w-full'>
          {/* Title textbox */}
          {
          !isMobile &&
            <TextInput
              theme={textInputTheme(errors.title !== undefined)}
              type='text'
              placeholder='Entry title'
              {...register('title', { required: true, validate: validateTitle })}
            />
          }
          {errors.title !== undefined && <ErrorMessage>{errors.title.message}</ErrorMessage>}
          {/* Visibility dropdown */}
          <div className='h-fit px-2 sm:px-2 text-nowrap'>
            <Dropdown
              arrowIcon={false}
              inline
              label={<VisibilityBadge visibility={visibility} showPublic />}
            >
              <Dropdown.Item className='cursor-pointer' onClick={() => { setVisibility('public') }}><VisibilityBadge visibility='public' showPublic /></Dropdown.Item>
              <Tooltip content={<p>This only applies to whtwnd.com. The raw data is public.<br />For details, visit usage page.</p>} placement={!isMobile ? 'left' : 'bottom'}><Dropdown.Item className='cursor-pointer' onClick={() => setVisibility('url')}><VisibilityBadge visibility='url' showPublic /></Dropdown.Item></Tooltip>
              <Tooltip content={<p>This only applies to whtwnd.com. The raw data is public.<br />For details, visit usage page.</p>} placement={!isMobile ? 'left' : 'bottom'}><Dropdown.Item className='cursor-pointer' onClick={() => setVisibility('author')}><VisibilityBadge visibility='author' showPublic /></Dropdown.Item></Tooltip>
            </Dropdown>
          </div>
          {/* Auto save */}
          <div>
            {
            isBusy
              ? <Tooltip content='Saving changes'><IoRadioButtonOnOutline color='#9ca3af' /></Tooltip>
              : isDirtyRef.current
                ? <Tooltip content='Not saved'><IoRadioButtonOnOutline color='#fbbf24' /></Tooltip>
                : <Tooltip content='Saved'><IoRadioButtonOffOutline color='#9ca3af' /></Tooltip>
            }
          </div>
        </div>
      </Header>
      {/* Main area */}
      <div className='flex flex-row h-full'>
        {/* Tool drawer */}
        <div className='hidden sm:flex h-full py-4 px-3 flex-col justify-end border-r border-gray-400'>
          {toolPanelItems}
        </div>
        {/* Content area */}
        <div className='max-h-[calc(100vh-75px)] w-full relative overflow-hidden' ref={backdropZoneRef}>
          {
            {
              editor: editorPage,
              preview: previewPage,
              pictures: picturesPage
            }[curPage]
          }
          <DragDropUpload onUpload={onDropPic} backdropZoneRef={backdropZoneRef} />
        </div>
        {/* Setting modal */}
        <Modal dismissible show={isSettingModalOpen} onClose={() => setSettingModalOpen(false)}>
          <Modal.Header>
            <div className='flex flex-row items-center gap-1'><IoSettingsOutline size={25} color='#374151' />Settings</div>
          </Modal.Header>
          <Modal.Body>
            <div className='flex flex-col items-center gap-4'>
              <div className='grid grid-cols-4 gap-4'>
                <div className='col-span-1 flex items-center'>Theme</div>
                <div className='col-span-3'>
                  <Select
                    theme={{ field: { select: { colors: { gray: normalClass } } } }}
                    {...register('theme')}
                  >
                    <option value='github-light'>github-light</option>
                    <option value={undefined}>(no-theme)</option>
                  </Select>
                </div>
                <div className='col-span-1 flex items-center'>Link card URL</div>
                <div className='col-span-3 flex flex-col'>
                  <TextInput
                    theme={textInputTheme(errors.ogpUrl !== undefined)}
                    type='text'
                    placeholder='Link card URL'
                    {...register('ogpUrl', { validate: validateOGPURL })}
                  />
                  {errors.ogpUrl !== undefined && <ErrorMessage>{errors.ogpUrl.message}</ErrorMessage>}
                </div>
                <div className='col-span-1 flex items-center'>Link card width / height</div>
                <div className='col-span-1 flex flex-col'>
                  <TextInput
                    theme={textInputTheme(errors.ogpWidth !== undefined)}
                    type='text'
                    placeholder='width'
                    {...register('ogpWidth', { validate: validateOGPDimension })}
                  />
                  {errors.ogpWidth !== undefined && <ErrorMessage>{errors.ogpWidth.message}</ErrorMessage>}
                </div>
                <div className='col-span-1'>
                  <TextInput
                    theme={textInputTheme(errors.ogpHeight !== undefined)}
                    type='text'
                    placeholder='height'
                    {...register('ogpHeight', { validate: validateOGPDimension })}
                  />
                  {errors.ogpHeight !== undefined && <ErrorMessage>{errors.ogpHeight.message}</ErrorMessage>}
                </div>
              </div>
              <div className='w-20'><CTAButton onClick={() => setSettingModalOpen(false)} text='OK' /></div>
            </div>
          </Modal.Body>
        </Modal>
        {/* Delete confirmation modal */}
        <Modal dismissible show={isDeleteConfirmationModalOpen} onClose={() => onDeleteConfirmationModalClose(false)} size='sm'>
          <Modal.Header>
            <div className='flex flex-row items-center gap-1'>Delete confirmation</div>
          </Modal.Header>
          <Modal.Body>
            <div className='flex flex-col gap-4 items-center'>
              <p>Do you really want to delete this entry?</p>
              <div className='flex gap-8'>
                <CTAButton onClick={() => onDeleteConfirmationModalClose(true)} text='Yes' />
                <button onClick={() => onDeleteConfirmationModalClose(false)} className='flex py-2 pl-4 pr-4 flex flex-row items-center content-center border border-sky-400 rounded-lg bg-transparent text-sky-400 transition duration-200 hover:bg-sky-400 hover:text-sky-50 focus:ring-4 focus:ring-cyan-200'>No</button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
      <Toast theme={{ root: { base: toastContent === undefined ? 'fixed bottom-10 left-10 opacity-0' : `fixed bottom-10 left-10 flex max-w-md items-center rounded-lg p-2 shadow ${TOASTCOLOR[toastContent.severity]}` } }}>
        {
          toastContent !== undefined && (() => {
            switch (toastContent.severity) {
              case 'info':
                return <IoInformationCircle size={30} className='fill-sky-800' />
              case 'warning':
                return <IoAlertCircle size={30} className='fill-amber-800' />
              case 'error':
                return <IoCloseCircle size={30} className='fill-rose-800' />
              case 'success':
                return <IoCheckmarkCircle size={30} className='fill-green-700' />
            }
          })()
        }
        <div className='ml-3 mr-1 text-md font-medium'>{toastContent?.message}</div>
      </Toast>
    </form>
  )
}

export default BlogEditorV2
