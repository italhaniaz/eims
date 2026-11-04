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
          purple: '#059669',
          purpleDark: '#047857',
          lilac: '#ecfdf5',
          lilacLight: '#f4fbf7',
          canvas: '#f4fbf7',
          dark: '#064e3b',
          sidebar: '#0f172a',
          sidebarHover: '#1e293b',
          sidebarActive: '#059669',
          primary: '#059669',
          secondary: '#10b981',
          accent: '#34d399',
          emerald: '#059669',
          emeraldDark: '#047857',
          emeraldLight: '#ecfdf5',
        }
      },
      spacing: {
        '0.2': '0.05rem',
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
        18: '4.5rem',
      },
      fontFamily: {
        sans: ['Geist', 'Outfit', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Outfit', 'Geist', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
