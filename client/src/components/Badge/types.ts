import type { ReactNode } from 'react'
import type { BadgeSize, BadgeVariant } from '@/lib/badgeVariants'

export type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}
