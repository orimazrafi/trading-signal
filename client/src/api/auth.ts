import { authResponseSchema, logoutResponseSchema } from '@trading-signal/contracts/auth'
import { HTTP_STATUS } from '@trading-signal/contracts/httpStatus'
import type { AuthUser } from '@/types/auth'
import { ApiError } from './client'
import type { ApiRequestOptions } from './types'
import { fetchValidated, postValidated } from './fetchValidated'

/** Returns the current session user, or null when unauthenticated. */
export async function fetchMe(options: ApiRequestOptions = {}): Promise<AuthUser | null> {
  try {
    const data = await fetchValidated('/auth/me', authResponseSchema, 'auth session', {
      signal: options.signal,
    })

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
  const data = await postValidated('/auth/login', authResponseSchema, 'auth login', {
    email,
    password,
  })

  return data.user
}

/** Registers a new email/password account. */
export async function signup(email: string, password: string): Promise<AuthUser> {
  const data = await postValidated('/auth/signup', authResponseSchema, 'auth signup', {
    email,
    password,
  })

  return data.user
}

/** Clears the server session cookie. */
export async function logout(): Promise<void> {
  await postValidated('/auth/logout', logoutResponseSchema, 'auth logout')
}
