import { Navigate, useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { NewsFeed } from '@/features/dashboard/components/NewsFeed'
import { useNewsFeed } from '@/features/dashboard/hooks/useNewsFeed'
import { LandingHeader } from '@/features/landing/components/LandingHeader'
import { ROUTES } from '@/routes/paths'

/** Public landing page with live market headlines. */
function LandingPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuthContext()
  const { news, isLoading, isRefreshing, isLoadingMore, hasMore, error, reload, loadMore } = useNewsFeed()

  if (loading) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-3xl items-center justify-center px-4 py-6">
        <LoadingSpinner label="Loading headlines..." />
      </main>
    )
  }

  if (user) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 px-4 py-6 text-left">
      <LandingHeader onSignIn={() => navigate(ROUTES.login)} />
      <NewsFeed
        news={news}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        error={error}
        variant="landing"
        onRefresh={() => void reload()}
        onLoadMore={loadMore}
      />
    </main>
  )
}

export default LandingPage
