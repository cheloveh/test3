import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Для GitHub Pages используйте './' для относительных путей
  // Если репозиторий называется username.github.io, оставьте './'
  // Если репозиторий называется по-другому, укажите '/название-репозитория/'
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
