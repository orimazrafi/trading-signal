import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ROUTES } from '@/routes/paths'

/** Fallback page for unknown routes. */
function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 py-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you requested does not exist or may have moved.
      </p>
      <Button variant="primary" onClick={() => navigate(ROUTES.home)}>
        Go home
      </Button>
    </main>
  )
}

export default NotFoundPage
