'use client'

import * as React from 'react'
import {useCallback, useState, useEffect} from 'react'
import { Modal } from 'flowbite-react'
import { Pagination } from 'flowbite-react'
import { atomWithStorage } from 'jotai/utils'
import { atom, useAtom, useStore } from 'jotai'
import { MarkdownToHtml } from '@/services/DocProvider'
import { GitHubLightTheme } from '@/components/themes'
import BlogViewer from '@/views/BlogViewer'

const lastReadSeqAtom=atomWithStorage('readNotificationSeq',-1, undefined, {getOnInit:true})
const unreadNotificationsAtom=atom(async get=>{
  return await (await fetch(`/api/notification?from=${encodeURIComponent(get(lastReadSeqAtom)+1)}`)).json() as Notification[]
})
const maxUnreadSeqAtom=atom(async get=>{
  return (await get(unreadNotificationsAtom)).map(item=>item.seq).reduce((prev,cur)=>cur>prev ? cur : prev, 0)
})
const unreadNotificationContentsAtom=atom(async get=>{
  return await Promise.all((await get(unreadNotificationsAtom)).map(async notif=><BlogViewer mdHtml={(await MarkdownToHtml(notif.content)).result} theme={GitHubLightTheme} disableAuthorCard disableComments disableShareButtons></BlogViewer>))
})

export interface Notification {
  seq: number
  type: 'notification'
  title: string
  content: string
  createdAt: string
  expiresAt: string
}

export const NotificationModal =()=>{
  const [notificationContents, setNotificationContents]=useState([] as React.JSX.Element[])
  const [lastReadSeq, setLastReadSeq]=useAtom(lastReadSeqAtom)
  const store=useStore()

  useEffect(()=>{
    void (async ()=>{
      setNotificationContents(await store.get(unreadNotificationContentsAtom))
    })()
  },[store, lastReadSeq]) // refetch when lastReadSeq changes

  const onCloseModalMain=useCallback(()=>{
    void (async ()=>{
      setLastReadSeq(await store.get(maxUnreadSeqAtom))
    })()
  },[setLastReadSeq, store])

  return notificationContents.length>0 ? <NotificationModalMain contents={notificationContents} onClose={onCloseModalMain}/> : <></>
}

interface NotificationModalProps {
  contents: React.JSX.Element[]
  onClose: ()=>void
}

const NotificationModalMain=({contents, onClose}:NotificationModalProps)=>{
  const [show, setShow]=useState(true)
  const [currentPage, setCurrentPage]=useState(1)

  const handleClose=useCallback(()=>{
    setShow(false) // guarantee the modal is closed immediately
    onClose()
  },[onClose])

  return (
    <Modal show={show && contents.length>0} size='lg' popup theme={{ header: { title: 'text-xl font-semibold text-gray-700 bg-gray-100', close: {base: 'hidden'} } }}>
      <Modal.Header className='bg-gray-100 p-4'>Notification ({currentPage} / {contents.length})</Modal.Header>
      <div className='bg-gray-100 rounded'>
        <Modal.Body className='flex flex-col gap-4 items-center'>
          <div className='max-h-96 min-h-96 w-full overflow-auto'>
            {contents[currentPage-1]}
          </div>
          {contents.length>1 && <Pagination layout='navigation' currentPage={currentPage} totalPages={contents.length} onPageChange={setCurrentPage} showIcons/>}
          <button
            className='rounded-lg bg-sky-400 text-white px-4 py-2 transition duration-200 hover:bg-sky-500 focus:ring-4 focus:ring-cyan-200'
            onClick={handleClose}
          >
            Confirm all
          </button>
        </Modal.Body>
      </div>
    </Modal>
  )
}