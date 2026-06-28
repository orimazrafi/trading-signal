const DEFAULT_BASE_URL = 'http://localhost:5173'
const HEALTH_PATH = '/health'
const MAX_ATTEMPTS = 60
const RETRY_DELAY_MS = 2_000

/** Waits until an HTTP endpoint returns a successful response. */
async function waitForOk(url: string): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(4_000) })

      if (response.ok) {
        return
      }
    } catch {
      // Retry until the dev stack finishes booting.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, RETRY_DELAY_MS)
    })
  }

  throw new Error(`Timed out waiting for ${url}`)
}

/** Ensures the client proxy and API are reachable before E2E tests run. */
export default async function globalSetup(): Promise<void> {
  const baseURL = process.env.E2E_BASE_URL ?? DEFAULT_BASE_URL

  await waitForOk(`${baseURL}${HEALTH_PATH}`)
}
