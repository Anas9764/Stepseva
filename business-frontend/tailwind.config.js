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
        // Premium additions
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F4E4BC',
          dark: '#B8942D',
        },
        navy: {
          50: '#E8F1FB',
          100: '#C9DFF7',
          200: '#93BFE9',
          300: '#5D9FDB',
          400: '#1E73D9',
          500: '#0F2C4C',
          600: '#0B2139',
          700: '#081826',
          800: '#050F19',
          900: '#02080D',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(15, 44, 76, 0.07), 0 10px 20px -2px rgba(15, 44, 76, 0.04)',
        'medium': '0 4px 20px -2px rgba(15, 44, 76, 0.1), 0 12px 25px -3px rgba(15, 44, 76, 0.06)',
        'strong': '0 10px 40px -5px rgba(15, 44, 76, 0.15), 0 20px 50px -5px rgba(15, 44, 76, 0.1)',
        'glow-primary': '0 0 30px rgba(30, 115, 217, 0.35)',
        'glow-gold': '0 0 30px rgba(212, 175, 55, 0.35)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #1E73D9 0%, #0F2C4C 100%)',
        'gradient-primary-reverse': 'linear-gradient(135deg, #0F2C4C 0%, #1E73D9 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F4E4BC 50%, #D4AF37 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(15, 44, 76, 0.95) 0%, rgba(30, 115, 217, 0.85) 50%, rgba(15, 44, 76, 0.95) 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(30, 115, 217, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(15, 44, 76, 0.1) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'floatSlow 5s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'gradient': 'gradientMove 8s ease infinite',
        'shine': 'shine 2s linear infinite',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
