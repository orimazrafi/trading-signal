import { Component, type ErrorInfo } from 'react'
import { Button } from '@/components/Button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { reportClientError } from '@/lib/reportClientError'
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types'

/** Catches render errors in children and shows a recoverable fallback. */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportClientError(error, errorInfo)
  }

  /** Clears the error state so children can render again. */
  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      const title = this.props.title ?? 'Something went wrong'
      const message = this.state.error?.message ?? 'An unexpected error occurred.'

      return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <ErrorMessage message={message} />
          <Button type="button" variant="secondary" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
