import { ThemeProps } from '@/components/themes/types'
import { FC } from 'react'

export const NoTheme: FC<ThemeProps> = ({ mdHtml }) => {
  return <div>{mdHtml}</div>
}
