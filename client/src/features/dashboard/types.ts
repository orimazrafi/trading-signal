import type { AuthUser } from '../../types/auth'

export type DashboardProps = {
  user: AuthUser
  onLogout: () => void
}
