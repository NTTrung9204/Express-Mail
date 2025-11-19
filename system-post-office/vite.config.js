import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/post-office/',
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