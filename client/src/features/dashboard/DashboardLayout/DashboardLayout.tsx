import { Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AppHeader } from '@/components/AppHeader'
import AlertStreamListener from '@/features/alerts/components/AlertStreamListener'
import { DashboardNav } from '@/features/dashboard/components/DashboardNav'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { TAB_ERROR_TITLE, TAB_LOADING_LABEL } from './types'
import { resolveDashboardTab } from '@/routes/resolveDashboardTab'
import { ROUTES } from '@/routes/paths'

/** Signed-in dashboard shell with primary section tabs and nested route outlet. */
function DashboardLayout() {
  const { user, logout } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = resolveDashboardTab(location.pathname)

  if (!user) {
    return null
  }

  /** Signs out and returns the visitor to the login page. */
  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
      <AlertStreamListener />
      <AppHeader email={user.email} onLogout={() => void handleLogout()} />
      <DashboardNav activeTab={activeTab} />

      <ErrorBoundary key={location.pathname} title={TAB_ERROR_TITLE[activeTab]}>
        <Suspense fallback={<LoadingSpinner label={TAB_LOADING_LABEL[activeTab]} />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

export default DashboardLayout
