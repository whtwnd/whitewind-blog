import { useState, useLayoutEffect, useRef, Dispatch, SetStateAction } from 'react'

interface IUseTruncatedElement {
  isTruncated: boolean
  isReadingMore: boolean
  setIsReadingMore: Dispatch<SetStateAction<boolean>>
}

export const useTruncatedElement = ({ ref, initial }: { ref: ReturnType<typeof useRef<HTMLParagraphElement | null>>, initial?: boolean }): IUseTruncatedElement => {
  const [isTruncated, setIsTruncated] = useState(initial === true)
  const [isReadingMore, setIsReadingMore] = useState(false)

  useLayoutEffect(() => {
    const { offsetHeight, scrollHeight } = ref.current !== null && ref.current !== undefined ? ref.current : { offsetHeight: undefined, scrollHeight: undefined }

    if (offsetHeight !== undefined && scrollHeight !== undefined && offsetHeight < scrollHeight) {
      setIsTruncated(true)
    } else {
      setIsTruncated(false)
    }
  }, [ref])

  return {
    isTruncated,
    isReadingMore,
    setIsReadingMore
  }
}

export default useTruncatedElement
