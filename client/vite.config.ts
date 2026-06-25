import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contractsSrc = path.resolve(__dirname, '../packages/contracts/src')

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true'
const pollingInterval = Number(process.env.CHOKIDAR_INTERVAL ?? '300')

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@trading-signal/contracts/recommendation': path.join(contractsSrc, 'recommendation.ts'),
      '@trading-signal/contracts/alert': path.join(contractsSrc, 'alert.ts'),
      '@trading-signal/contracts/auth': path.join(contractsSrc, 'auth.ts'),
      '@trading-signal/contracts/parseAlertNotification': path.join(contractsSrc, 'alert.ts'),
      '@trading-signal/contracts/stock': path.join(contractsSrc, 'stock.ts'),
      '@trading-signal/contracts/signal': path.join(contractsSrc, 'signal.ts'),
      '@trading-signal/contracts/news': path.join(contractsSrc, 'news.ts'),
      '@trading-signal/contracts/watchlist': path.join(contractsSrc, 'watchlist.ts'),
      '@trading-signal/contracts/zodApi': path.join(contractsSrc, 'lib/zodApi.ts'),
      '@trading-signal/contracts/httpStatus': path.join(contractsSrc, 'httpStatus.ts'),
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