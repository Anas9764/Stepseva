/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E73D9',        // StepSeva Blue
        secondary: '#0F2C4C',      // Dark Navy
        accent: '#C9DFF7',         // Light Blue Tint
        sky: '#E8F1FB',            // Soft Sky Blue
        background: '#FFFFFF',      // White
        lightGray: '#F5F7FA',      // Light Gray
        mediumGray: '#6F7680',     // Medium Gray
        text: '#2E2E2E',           // Dark Gray
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

