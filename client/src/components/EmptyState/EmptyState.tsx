import { cn } from '@/lib/utils'
import type { EmptyStateProps } from './types'

const VARIANT_CLASSES = {
  dashed:
    'rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground',
  plain: 'text-center text-sm text-muted-foreground',
} as const

/** Renders a consistent empty-data placeholder. */
function EmptyState({ message, className = '', variant = 'dashed' }: EmptyStateProps) {
  return <p className={cn(VARIANT_CLASSES[variant], className)}>{message}</p>
}

export default EmptyState
