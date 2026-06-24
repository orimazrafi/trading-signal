import type { ReactNode } from 'react'

export type ErrorBoundaryProps = {
  children: ReactNode
  title?: string
  onReset?: () => void
}

export type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}
