import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Remove outDir to use Vite's default 'dist' directory
    sourcemap: true,
  },
  define: {
    global: 'globalThis',
  },
})