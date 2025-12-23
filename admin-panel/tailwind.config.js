/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E73D9',
          50: '#E8F1FB',
          100: '#C9DFF7',
          200: '#1E73D9',
          300: '#0F2C4C',
        },
        secondary: {
          DEFAULT: '#0F2C4C',
        },
        accent: {
          DEFAULT: '#C9DFF7',
        },
        sky: {
          DEFAULT: '#E8F1FB',
        },
        neutral: {
          light: '#F5F7FA',
          medium: '#6F7680',
          dark: '#2E2E2E',
          DEFAULT: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}

