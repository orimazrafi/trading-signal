import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/useAuth'

type AuthContextValue = ReturnType<typeof useAuth>

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

/** Provides session state and auth actions to the route tree. */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/** Reads auth state from the nearest AuthProvider. */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }

  return context
}
