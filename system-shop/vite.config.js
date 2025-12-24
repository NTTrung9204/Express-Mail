import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  base: '/shop/',
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['express-mail.work.gd'],
  },
  preview: {
    allowedHosts: ['express-mail.work.gd']
  }
}))