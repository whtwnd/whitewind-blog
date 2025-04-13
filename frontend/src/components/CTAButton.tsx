import { FC, type JSX } from 'react'

export interface ICTAButtonProps {
  text?: string
}

export const CTAButton: FC<ICTAButtonProps & JSX.IntrinsicElements['button']> = ({ text, ...props }) => {
  return (
    <button {...props} className='w-full flex py-2 pl-4 pr-4 flex flex-row items-center content-center gap-1 rounded-lg bg-sky-400 text-gray-100 stroke-gray-100 transition duration-200 hover:bg-sky-500 focus:ring-4 focus:ring-cyan-200'>
      {text !== undefined && <p className='block font-semibold text-sm w-full'>{text}</p>}
    </button>
  )
}
