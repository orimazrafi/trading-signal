import { ApiError, api } from './client'
import { HTTP_STATUS } from '@trading-signal/contracts/httpStatus'
import type { ApiRequestOptions } from './types'
import type { AuthResponse, AuthUser, LogoutResponse } from '@/types/auth'

/** Returns the current session user, or null when unauthenticated. */
export async function fetchMe(options: ApiRequestOptions = {}): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me', { signal: options.signal })
    return data.user
  } catch (error) {
    if (error instanceof ApiError && error.status === HTTP_STATUS.UNAUTHORIZED) {
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
  await api.post<LogoutResponse>('/auth/logout')
}
