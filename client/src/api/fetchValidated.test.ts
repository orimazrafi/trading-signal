import { API_BASE_PATH } from '@trading-signal/contracts/apiPath'
import { authResponseSchema, logoutResponseSchema } from '@trading-signal/contracts/auth'
import { ApiValidationError } from '@trading-signal/contracts/zodApi'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { mswServer } from '@/test/msw/server'
import { fetchValidated, patchValidated, postValidated } from './fetchValidated'

describe('fetchValidated', () => {
  it('returns parsed data when the API response matches the schema', async () => {
    mswServer.use(
      http.get(`${API_BASE_PATH}/auth/me`, () =>
        HttpResponse.json({
          user: { userId: 'user-1', email: 'user@example.com' },
        }),
      ),
    )

    const result = await fetchValidated('/auth/me', authResponseSchema, 'auth me')

    expect(result.user.email).toBe('user@example.com')
  })

  it('throws ApiValidationError when the payload is invalid', async () => {
    mswServer.use(
      http.get(`${API_BASE_PATH}/auth/me`, () =>
        HttpResponse.json({ user: { userId: 42 } }),
      ),
    )

    await expect(fetchValidated('/auth/me', authResponseSchema, 'auth me')).rejects.toBeInstanceOf(
      ApiValidationError,
    )
  })
})

describe('postValidated', () => {
  it('posts JSON and validates the response body', async () => {
    mswServer.use(
      http.post(`${API_BASE_PATH}/auth/signup`, () =>
        HttpResponse.json({
          user: { userId: 'user-2', email: 'new@example.com' },
        }),
      ),
    )

    const result = await postValidated('/auth/signup', authResponseSchema, 'auth signup', {
      email: 'new@example.com',
      password: 'password123',
    })

    expect(result.user.userId).toBe('user-2')
  })
})

describe('patchValidated', () => {
  it('patches JSON and validates the response body', async () => {
    mswServer.use(
      http.patch(`${API_BASE_PATH}/auth/logout`, () => HttpResponse.json({ ok: true })),
    )

    const result = await patchValidated('/auth/logout', logoutResponseSchema, 'auth logout')

    expect(result.ok).toBe(true)
  })
})
