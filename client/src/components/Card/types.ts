import type { KeyboardEvent, ReactNode } from 'react'

export type CardVariant = 'default' | 'muted' | 'interactive' | 'selected' | 'highlight' | 'unread'

export type CardProps = {
  children: ReactNode
  className?: string
  variant?: CardVariant
  onClick?: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void
  role?: string
  tabIndex?: number
}
