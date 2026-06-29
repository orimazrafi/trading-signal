/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_ALERT_RUN_CHECK_ENABLED?: string
  /** Set to "false" in E2E to disable client-side simulated price ticks. */
  readonly VITE_SIMULATED_LIVE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
