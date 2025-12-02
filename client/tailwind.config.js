/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo-600
        secondary: '#6366F1', // Indigo-500
        dark: '#111827', // Gray-900
        light: '#F3F4F6', // Gray-100
        sidebar: '#1F2937', // Gray-800
        'msg-me': '#4F46E5',
        'msg-other': '#374151'
      }
    },
  },
  plugins: [],
}
