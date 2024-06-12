import flowbite from 'flowbite-react/tailwind'
/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line
module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', flowbite.content()],
  theme: {
    extend: {
      colors: {
        brand: 'rgb(10,122,255)',
        textLight: 'rgb(66,87,108)'
      },
      keyframes: {
        typing: {
          '0%': {
            width: '0%',
            visibility: 'hidden'
          },
          '100%': {
            width: '100%'
          }
        },
        blink: {
          '50%': {
            borderColor: 'transparent'
          },
          '100%': {
            borderColor: 'white'
          }
        },
        fadein: {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        }
      },
      animation: {
        typing: 'typing 1.5s steps(13), blink 1.0s infinite',
        fadein: 'fadein .2s ease-in-out'
      }
    }
  },
  plugins: [flowbite.plugin()]
}
