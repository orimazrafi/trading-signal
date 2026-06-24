/** Logs a client-side render error for debugging. */
export function reportClientError(error: Error, errorInfo: { componentStack?: string | null }): void {
  console.error('UI render error', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  })
}
