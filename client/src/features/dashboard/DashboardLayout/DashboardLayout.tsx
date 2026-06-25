import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AppHeader } from '@/components/AppHeader'
import { AlertNotificationCenterProvider } from '@/features/alerts/context'
import { DashboardNav } from '@/features/dashboard/components/DashboardNav'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { consumeStoredAuthReturnTo } from '@/lib/authRedirect'
import { TAB_ERROR_TITLE, TAB_LOADING_LABEL } from './types'
import { resolveDashboardTab } from '@/routes/resolveDashboardTab'
import { ROUTES } from '@/routes/paths'

/** Signed-in dashboard shell with primary section tabs and nested route outlet. */
function DashboardLayout() {
  const { user, logout } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = resolveDashboardTab(location.pathname)

  /** Sends OAuth sign-ins to their saved destination when Google returns to /dashboard. */
  useEffect(() => {
    if (!user) {
      return
    }

    const storedReturnTo = consumeStoredAuthReturnTo()

    if (!storedReturnTo) {
      return
    }

    const currentPath = `${location.pathname}${location.search}${location.hash}`

    if (storedReturnTo !== currentPath) {
      navigate(storedReturnTo, { replace: true })
    }
  }, [user, location.pathname, location.search, location.hash, navigate])

  if (!user) {
    return null
  }

  /** Signs out and returns the visitor to the login page. */
  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <AlertNotificationCenterProvider>
      <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
        <AppHeader email={user.email} onLogout={() => void handleLogout()} />
        <DashboardNav activeTab={activeTab} />

        <ErrorBoundary key={location.pathname} title={TAB_ERROR_TITLE[activeTab]}>
          <Suspense fallback={<LoadingSpinner label={TAB_LOADING_LABEL[activeTab]} />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </AlertNotificationCenterProvider>
  )
}

export default DashboardLayout
