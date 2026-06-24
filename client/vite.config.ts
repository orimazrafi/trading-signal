import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true'
const pollingInterval = Number(process.env.CHOKIDAR_INTERVAL ?? '300')

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
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
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req) => {
            if (req.url?.includes('/stream')) {
              proxyRes.headers['cache-control'] = 'no-cache'
            }
          })
        },
      },
    },
  },
})