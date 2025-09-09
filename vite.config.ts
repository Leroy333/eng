import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'engcard-bot.loca.lt',
      '.loca.lt',
      '.ngrok.io',
      '.trycloudflare.com'
    ]
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'effector', 'effector-react']
  }
})