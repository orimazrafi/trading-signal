import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/features/dashboard/DashboardLayout'
import {
  AlertsTabRoute,
  NewsTabRoute,
  RecommendationsTabRoute,
  WatchlistTabRoute,
} from '@/routes/DashboardTabRoutes'
import LoginPage from '@/routes/LoginPage'
import NotFoundPage from '@/routes/NotFoundPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { ROUTES } from '@/routes/paths'

/** Application route tree with protected dashboard layout and nested tabs. */
function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<NewsTabRoute />} />
          <Route path={ROUTES.recommendations} element={<RecommendationsTabRoute />} />
          <Route path={ROUTES.alerts} element={<AlertsTabRoute />} />
          <Route path={ROUTES.watchlist} element={<WatchlistTabRoute />} />
          <Route path={`${ROUTES.watchlist}/:symbol`} element={<WatchlistTabRoute />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
