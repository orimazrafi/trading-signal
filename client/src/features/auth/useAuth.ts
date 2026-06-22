import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from '../../api/queryKeys'
import type { AuthUser } from '../../types/auth'
import { fetchMe, login, logout, signup } from '../../api/auth'

/** Manages login, signup, logout, and session state via React Query. */
export function useAuth() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
  })

  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signup(email, password),
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
  })

  const user = meQuery.data ?? null
  const sessionError = meQuery.error instanceof Error ? meQuery.error.message : null

  return {
    user,
    loading: meQuery.isLoading,
    error: error ?? sessionError,
    setError,
    login: async (email: string, password: string) => {
      setError(null)
      const nextUser = await loginMutation.mutateAsync({ email, password })
      queryClient.setQueryData<AuthUser | null>(queryKeys.auth.me, nextUser)
    },
    signup: async (email: string, password: string) => {
      setError(null)
      const nextUser = await signupMutation.mutateAsync({ email, password })
      queryClient.setQueryData<AuthUser | null>(queryKeys.auth.me, nextUser)
    },
    logout: async () => {
      setError(null)
      await logoutMutation.mutateAsync()
      queryClient.setQueryData<AuthUser | null>(queryKeys.auth.me, null)
      queryClient.removeQueries({ queryKey: queryKeys.health })
    },
    startGoogleSignIn: () => {
      window.location.href = '/api/auth/google'
    },
    reload: () => meQuery.refetch(),
  }
}
