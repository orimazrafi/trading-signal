/** True when client-side micro price ticks should run between API syncs. */
export function isSimulatedLiveEnabled(): boolean {
  return import.meta.env.VITE_SIMULATED_LIVE !== 'false'
}
