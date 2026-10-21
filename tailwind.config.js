/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#161e31',
          sidebar: '#1a233a',
          sidebarHover: '#232e4a',
          sidebarActive: '#2d3b5e',
          primary: '#2563eb',
          secondary: '#3b82f6',
          accent: '#60a5fa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
