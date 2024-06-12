import { ChangeEventHandler, FC, MutableRefObject, useEffect, useRef, useState } from 'react'
import { IoCloudUploadOutline } from 'react-icons/io5'

export interface IDragDropUploadProps {
  onUpload: (f: File) => void
  backdropZoneRef: MutableRefObject<HTMLDivElement | null>
}

// Drag and drop image upload with image preview - Tailwind CSS Example
// author: Santos78 (https://tailwindflex.com/@santos78)
// https://tailwindflex.com/@santos78/drag-and-drop-image-upload-with-image-preview
export const DragDropUpload: FC<IDragDropUploadProps> = ({ onUpload, backdropZoneRef }) => {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const [showBackdrop, setShowBackdrop] = useState(false)
  const innerFlag = useRef(false)

  const HOVERCOLOR = 'border-sky-400'

  useEffect(() => {
    const dropzone = dropzoneRef.current
    const input = inputRef.current
    if (dropzone === null || input === null) {
      return
    }
    const onDragOver = (e: DragEvent): void => {
      e.preventDefault()
      setIsDragging(true)
    }
    const onDragLeave = (e: DragEvent): void => {
      e.preventDefault()
      setIsDragging(false)
    }
    const onDrop = (e: DragEvent): void => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer?.files?.[0] === undefined) {
        return
      }
      onUpload(e.dataTransfer.files[0])
    }

    dropzone.addEventListener('dragover', onDragOver)
    dropzone.addEventListener('dragleave', onDragLeave)
    dropzone.addEventListener('drop', onDrop)

    return () => {
      dropzone.removeEventListener('drop', onDrop)
      dropzone.removeEventListener('dragleave', onDragLeave)
      dropzone.removeEventListener('dragover', onDragOver)
    }
  }, [onUpload])

  useEffect(() => {
    const backdropZone = backdropZoneRef.current
    if (backdropZone === null) {
      return
    }
    const onDragEnter = (): void => {
      innerFlag.current = true
    }
    const onDragOver = (e: DragEvent): void => {
      e.preventDefault()
      setShowBackdrop(true)
      innerFlag.current = false
    }
    const onDragLeave = (e: DragEvent): void => {
      e.preventDefault()
      if (innerFlag.current) {
        innerFlag.current = false
      } else {
        setShowBackdrop(false)
      }
    }
    const onDrop = (e: DragEvent): void => {
      e.preventDefault()
      setShowBackdrop(false)
    }

    backdropZone.addEventListener('dragenter', onDragEnter)
    backdropZone.addEventListener('dragover', onDragOver)
    backdropZone.addEventListener('dragleave', onDragLeave)
    backdropZone.addEventListener('drop', onDrop)

    return () => {
      backdropZone.removeEventListener('drop', onDrop)
      backdropZone.removeEventListener('dragleave', onDragLeave)
      backdropZone.removeEventListener('dragover', onDragOver)
      backdropZone.removeEventListener('dragenter', onDragEnter)
    }
  }, [backdropZoneRef])

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()
    if (e.target?.files?.[0] === undefined) {
      return
    }
    onUpload(e.target.files[0])
    e.target.value = '' // reset
  }

  return (
    <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center backdrop-brightness-[0.2] transition ${!showBackdrop ? 'hidden' : 'animate-fadein'}`}>
      <div className={`w-[800px] relative border-2 ${!isDragging ? 'border-gray-300' : HOVERCOLOR} hover:${HOVERCOLOR} transition duration-200 border-dashed rounded-lg p-6`} ref={dropzoneRef}>
        <input type='file' className='absolute inset-0 w-full h-full opacity-0 z-50' onChange={onInputChange} />
        <div className='text-center flex flex-col justify-center'>
          <IoCloudUploadOutline size={60} className={`w-full transition duration-200 ${!isDragging ? 'stroke-gray-200' : 'stroke-sky-400'} hover:stroke-sky-400`} />
          <h3 className='mt-2 text-lg font-medium text-gray-900'>
            <label htmlFor='file-upload' className='relative cursor-pointer'>
              <p className='text-gray-300'>
                Drag and drop to upload
              </p>
              <input name='file-upload' type='file' className='sr-only' ref={inputRef} />
            </label>
          </h3>
          <p className='mt-1 text-sm text-gray-400'>
            Image file up to 1 MB
          </p>
        </div>
      </div>
    </div>
  )
}
