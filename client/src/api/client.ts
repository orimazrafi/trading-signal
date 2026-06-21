import axios, { isAxiosError } from 'axios'

type ApiErrorBody = {
  error?: string
}

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
  baseURL: '/api',
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Maps axios failures to readable Error messages for UI and hooks. */
export function getApiErrorMessage(error: unknown): string {
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
    const status = isAxiosError(error) ? error.response?.status : undefined
    return Promise.reject(new ApiError(getApiErrorMessage(error), status))
  },
)
