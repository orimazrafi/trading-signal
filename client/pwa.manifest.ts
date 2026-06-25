import type { ManifestOptions } from 'vite-plugin-pwa'
import {
  PWA_APP_DESCRIPTION,
  PWA_APP_NAME,
  PWA_APP_SHORT_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_THEME_COLOR,
} from './src/lib/pwa/constants'

/** Shared web app manifest aligned with Trading Signal design tokens. */
export const PWA_MANIFEST: Partial<ManifestOptions> = {
  name: PWA_APP_NAME,
  short_name: PWA_APP_SHORT_NAME,
  description: PWA_APP_DESCRIPTION,
  theme_color: PWA_THEME_COLOR,
  background_color: PWA_BACKGROUND_COLOR,
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  start_url: '/',
  categories: ['finance', 'business'],
  icons: [
    {
      src: 'pwa/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'pwa/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'pwa/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}
