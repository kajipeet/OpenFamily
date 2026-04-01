/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          blue:    '#2AABEE',
          'blue-dark': '#1b8fd0',
          green:   '#31a24c',
          bg:      '#eef2f5',
          sidebar: '#2c3e4e',
          'sidebar-darker': '#243341',
          bubble:  '#effdde',
          'bubble-in': '#ffffff',
          gray:    '#708499',
          header:  '#517da2',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
          'emoji',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
