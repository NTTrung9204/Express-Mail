import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['express-mail.work.gd'],
    proxy: {
      '/api': {
        target: mode === 'development' ? 'http://localhost:3000' : 'https://express-mail.work.gd',
        changeOrigin: true,
      }
    }
  },
  preview: {
    allowedHosts: ['express-mail.work.gd']
  }
}))