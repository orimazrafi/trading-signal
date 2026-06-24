import { cn } from '@/lib/utils'
import type { ErrorMessageProps } from './types'

/** Renders a consistent inline error banner. */
function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <p
      className={cn(
        'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
        className,
      )}
      role="alert"
    >
      {message}
    </p>
  )
}

export default ErrorMessage
