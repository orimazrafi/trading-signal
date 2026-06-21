import { ApiError, api } from '../../api/client'
import type { AuthUser } from '../../types/auth'

type AuthResponse = {
  user: AuthUser
}

/** Returns the current session user, or null when unauthenticated. */
export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me')
    return data.user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }

    throw error
  }
}

/** Logs in with email and password. */
export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data.user
}

/** Registers a new email/password account. */
export async function signup(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>('/auth/signup', { email, password })
  return data.user
}

/** Clears the server session cookie. */
export async function logout(): Promise<void> {
  await api.post<{ ok: boolean }>('/auth/logout')
}
