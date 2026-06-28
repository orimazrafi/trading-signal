import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contractsSrc = path.resolve(__dirname, '../packages/contracts/src')

const contractAliases = {
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
  '@trading-signal/contracts/apiPath': path.join(contractsSrc, 'apiPath.ts'),
  '@trading-signal/contracts/pagination': path.join(contractsSrc, 'pagination.ts'),
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      ...contractAliases,
    },
  },
  test: {
    environment: 'jsdom',
    environmentMatchGlobs: [['src/**/*.test.ts', 'node']],
    setupFiles: ['src/test/setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
