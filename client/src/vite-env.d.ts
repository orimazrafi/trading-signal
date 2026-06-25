/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_ALERT_RUN_CHECK_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
