import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          react_vendor: ['react', 'react-dom', 'react-router-dom'],
          ui_vendor: ['framer-motion', 'lucide-react', 'styled-components'],
          auth_vendor: ['@clerk/clerk-react', '@clerk/react'],
          charts_vendor: ['recharts'],
          crypto: ['crypto-js']
        }
      }
    }
  }
})
