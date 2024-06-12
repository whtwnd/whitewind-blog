import type { FC } from 'react'
import { GitHubLightTheme } from '@/components/themes/GitHubLightTheme'
import { NoTheme } from '@/components/themes/NoTheme'
import type { ThemeProps } from '@/components/themes/types'

export const NO_THEME = '(no theme)'

export const ThemeMapping = new Map<string, FC<ThemeProps>>([
  ['github-light', GitHubLightTheme],
  [NO_THEME, NoTheme]
])

export { GitHubLightTheme, NoTheme }
