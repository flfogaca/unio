/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primaryDark: '#233D77',
        primary: '#003F72',
        accent: '#5FE2B6',
        accentLight: '#8DEAD0',
        actionBlue: '#1A8FFB',
        grayBg: '#F2F6FA',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
