'use client'
import { FC, ReactNode, useState } from 'react'
import { AppBskyFeedDefs } from '@atproto/api'
import { isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { Post } from '@/components/bskyembed/src/components/post'

interface IBskyCommentTreeProps {
  thread: AppBskyFeedDefs.ThreadViewPost
}

export const BskyCommentTree: FC<IBskyCommentTreeProps> = ({ thread }) => {
  const threads: ReactNode[] = []
  interface Remain { thread: AppBskyFeedDefs.ThreadViewPost, level: number, foldStack: boolean[] }
  const remain: Remain[] = [{ thread, level: 0, foldStack: [false] }]

  const [foldStates, setFoldStates] = useState({ states: new Map<string, boolean>() })
  while (remain.length > 0) {
    const cur = remain.pop()
    if (cur === undefined) {
      continue
    }
    const { thread: curThread, level, foldStack } = cur
    const { states } = foldStates
    if (!states.has(curThread.post.cid)) {
      states.set(curThread.post.cid, true)
    }

    const onExpandClick = (): void => {
      const { states } = foldStates
      const curState = states.get(curThread.post.cid)
      states.set(curThread.post.cid, curState === false)
      setFoldStates({ states })
    }
    const curHidden = foldStack[foldStack.length - 1]
    const elem = (
      <div className={`pl-[${level * 40}px]`} key={curThread.post.cid} hidden={curHidden}>
        <Post thread={curThread} onExpandClick={onExpandClick} />
      </div>
    )
    const newHiddenStack = [...foldStack, curHidden || (states.get(cur.thread.post.cid) === true)]

    threads.push(elem)
    if (cur.thread.replies === undefined) {
      continue
    }
    for (const reply of cur.thread.replies.reverse()) {
      if (isThreadViewPost(reply)) {
        remain.push({ thread: reply, level: cur.level + 1, foldStack: newHiddenStack })
      }
    }
  }
  return <>{threads}</>
}
