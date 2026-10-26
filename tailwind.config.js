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
          purple: '#8b5cf6',
          purpleDark: '#7c3aed',
          lilac: '#ede9fe',
          lilacLight: '#f5f3ff',
          canvas: '#f8fafc',
          dark: '#161e31',
          sidebar: '#1a233a',
          sidebarHover: '#232e4a',
          sidebarActive: '#2d3b5e',
          primary: '#7c3aed',
          secondary: '#8b5cf6',
          accent: '#a78bfa',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
