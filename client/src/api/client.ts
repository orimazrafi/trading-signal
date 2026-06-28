import { API_BASE_PATH } from '@trading-signal/contracts/apiPath'
import axios, { CanceledError, isAxiosError } from 'axios'
import type { ApiErrorBody } from '@/types/api'

/** API error with optional HTTP status for query and mutation handling. */
export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const API_TIMEOUT_MS = 8000

/** Shared axios client for API requests with httpOnly auth cookies. */
export const api = axios.create({
  baseURL: API_BASE_PATH,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Returns true when a request was aborted or superseded by a newer call. */
export function isRequestCancelled(error: unknown): boolean {
  if (error instanceof CanceledError) {
    return true
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return true
  }

  if (isAxiosError(error) && error.code === 'ERR_CANCELED') {
    return true
  }

  return false
}

/** Maps axios failures to readable Error messages for UI and hooks. */
export function getApiErrorMessage(error: unknown): string {
  if (isRequestCancelled(error)) {
    return ''
  }

  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'API request timed out. Check that the backend is running.'
    }

    return error.response?.data?.error ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Request failed'
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isRequestCancelled(error)) {
      return Promise.reject(error)
    }

    const status = isAxiosError(error) ? error.response?.status : undefined
    return Promise.reject(new ApiError(getApiErrorMessage(error), status))
  },
)
