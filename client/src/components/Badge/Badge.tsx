import { badgeClassName } from '@/lib/badgeVariants'
import type { BadgeProps } from './types'

/** Renders a small status or label pill with shared color variants. */
function Badge({ children, variant = 'neutral', size = 'md', className = '' }: BadgeProps) {
  return (
    <span className={`shrink-0 ${badgeClassName(variant, size)} ${className}`.trim()}>
      {children}
    </span>
  )
}

export default Badge
