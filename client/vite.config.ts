import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true'
const pollingInterval = Number(process.env.CHOKIDAR_INTERVAL ?? '300')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling,
      interval: pollingInterval,
    },
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})