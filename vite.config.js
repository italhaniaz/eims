import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const resolvedRoot = typeof process !== 'undefined' && fs.existsSync(process.cwd()) 
  ? fs.realpathSync(process.cwd()) 
  : undefined

// https://vite.dev/config/
export default defineConfig({
  root: resolvedRoot,
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    open: false
  },
  preview: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
})
