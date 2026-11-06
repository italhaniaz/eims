/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Design token CSS variables mapping
        theme: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          border: 'var(--border)',
          'border-subtle': 'var(--border-subtle)',
          text: 'var(--text)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
          primary: {
            DEFAULT: 'var(--primary)',
            hover: 'var(--primary-hover)',
            soft: 'var(--primary-soft)',
            border: 'var(--primary-border)',
          },
          secondary: {
            DEFAULT: 'var(--secondary)',
            hover: 'var(--secondary-hover)',
            soft: 'var(--secondary-soft)',
          },
          accent: {
            DEFAULT: 'var(--accent)',
            hover: 'var(--accent-hover)',
            soft: 'var(--accent-soft)',
          },
        },
        sidebar: {
          bg: 'var(--sidebar-bg)',
          surface: 'var(--sidebar-surface)',
          border: 'var(--sidebar-border)',
          text: 'var(--sidebar-text)',
          'text-muted': 'var(--sidebar-text-muted)',
          'text-active': 'var(--sidebar-text-active)',
          hover: 'var(--sidebar-hover)',
          active: 'var(--sidebar-active)',
        },
        status: {
          success: 'var(--success)',
          'success-soft': 'var(--success-soft)',
          warning: 'var(--warning)',
          'warning-soft': 'var(--warning-soft)',
          error: 'var(--error)',
          'error-soft': 'var(--error-soft)',
          info: 'var(--info)',
          'info-soft': 'var(--info-soft)',
        },
        // Chart color tokens
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
          6: 'var(--chart-6)',
        },
        brand: {
          purple: 'var(--primary)',
          purpleDark: 'var(--primary-hover)',
          lilac: 'var(--primary-soft)',
          lilacLight: 'var(--primary-soft)',
          canvas: 'var(--bg)',
          dark: '#0B1020',
          sidebar: 'var(--sidebar-bg)',
          sidebarHover: 'var(--sidebar-hover)',
          sidebarActive: 'var(--primary)',
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
          emerald: 'var(--primary)',
          emeraldDark: 'var(--primary-hover)',
          emeraldLight: 'var(--primary-soft)',
        }
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        'soft-hover': 'var(--shadow-hover)',
        card: 'var(--shadow-card)',
      },
      spacing: {
        '0.2': '0.05rem',
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
        18: '4.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Outfit', 'Geist', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Poppins', 'Outfit', 'Inter', 'Geist', 'system-ui', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', 'Amiri', 'serif'],
      }
    },
  },
  plugins: [],
}
