import { FC } from 'react'
import 'github-markdown-css/github-markdown-light.css'
import { ThemeProps } from '@/components/themes/types'

export const GitHubLightTheme: FC<ThemeProps> = ({ mdHtml }) => {
  return <div className='markdown-body'>{mdHtml}</div>
}
