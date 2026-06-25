/** True when the dev-only "Run check now" alerts toolbar should render. */
export function isAlertRunCheckEnabled(): boolean {
  return import.meta.env.VITE_ALERT_RUN_CHECK_ENABLED === 'true'
}
