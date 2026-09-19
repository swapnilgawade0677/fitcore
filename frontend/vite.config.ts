import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    allowedHosts: [
      'fitcore-q17x.onrender.com',
    ],
    proxy: {
      '/api': {
        target: 'https://fitcore-backend-4746.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
