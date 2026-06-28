import { Navigate, Outlet, useLocation } from 'react-router-dom'
import styles from '@/App.module.css'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { ROUTES } from '@/routes/paths'

/** Redirects unauthenticated visitors to login; renders child routes when signed in. */
function ProtectedRoute() {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <main className={styles.app}>
        <LoadingSpinner label="Checking session..." />
      </main>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
