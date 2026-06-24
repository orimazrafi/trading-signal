import { cn } from '@/lib/utils'
import type { LoadingSpinnerProps } from './types'

/** Inline loading spinner for async actions and feed panels. */
function LoadingSpinner({ label, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
