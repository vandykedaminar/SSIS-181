/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-900': '#071018',
        'bg-800': '#0b1a23',
        'surface-700': '#0f2a2f',
        'muted-600': '#2b3940',
        'accent-500': '#0b5560',
        'accent-400': '#0f6b72',
      },
      borderRadius: {
        lg: '12px',
      }
    },
  },
  plugins: [],
}
