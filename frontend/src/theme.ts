// src/theme.ts
'use client'
import { createTheme } from '@mui/material/styles'
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f0f0f0', // gray-100 Light gray for the general background
      paper: '#ffffff' // Pure white for elements considered "paper"
    },
    primary: {
      main: '#5bc4f5' // sky-400 Light sky blue for primary actions and elements
    },
    secondary: {
      main: '#16aef5' // blue-400 Slightly deeper blue for secondary accents
    },
    text: {
      primary: '#212121', // gray-900 Dark gray for text to ensure readability
      secondary: '#757575' // gray-500 Medium gray for less important text
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1000,
      lg: 1400,
      xl: 1536
    }
  }
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#303030', // Dark gray for the general background
      paper: '#424242' // Slightly lighter gray for elements considered "paper"
    },
    primary: {
      main: '#5c6bc0' // Muted blue for primary actions and elements, like a night sky
    },
    secondary: {
      main: '#7986cb' // A lighter shade of blue for secondary accents
    },
    text: {
      primary: '#ffffff', // White for text to ensure readability
      secondary: '#eeeeee' // Light gray for less important text, ensuring it stands out
    }
  }
})

export default lightTheme
