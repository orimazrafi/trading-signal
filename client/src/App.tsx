import { useEffect, useState } from 'react'
import './App.css'

type HealthResponse = {
  status: string
  service: string
}

/** Root app shell; verifies connectivity to the Express API. */
function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API responded with ${res.status}`)
        }
        return res.json() as Promise<HealthResponse>
      })
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <main className="app">
      <h1>Trading Signal</h1>
      <p>React + Vite client with Express API backend</p>

      <section className="status-card">
        <h2>API status</h2>
        {health && (
          <p className="status-ok">
            {health.service}: {health.status}
          </p>
        )}
        {error && <p className="status-error">Error: {error}</p>}
        {!health && !error && <p>Checking backend...</p>}
      </section>
    </main>
  )
}

export default App
