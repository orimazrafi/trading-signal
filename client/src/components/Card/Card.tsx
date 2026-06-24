import { CARD_BASE_CLASS } from '@/lib/surfaceClasses'
import { cn } from '@/lib/utils'
import type { CardProps, CardVariant } from './types'

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'border-border bg-card',
  muted: 'border-border bg-muted/50',
  interactive: 'border-border bg-card transition hover:border-primary/40',
  selected: 'border-primary bg-accent ring-2 ring-primary/30',
  highlight: 'border-border bg-muted/40 transition hover:border-primary/40 hover:bg-accent/60',
  unread: 'border-warning/50 bg-warning-muted',
}

/** Returns true when the card should use pointer cursor styling. */
function isInteractiveCard(variant: CardVariant, onClick?: () => void): boolean {
  return Boolean(onClick) || variant === 'interactive' || variant === 'selected'
}

/** Renders a bordered content card with shared surface variants. */
function Card({
  children,
  className = '',
  variant = 'default',
  onClick,
  onKeyDown,
  role,
  tabIndex,
}: CardProps) {
  const interactive = isInteractiveCard(variant, onClick)

  return (
    <article
      className={cn(
        CARD_BASE_CLASS,
        VARIANT_CLASSES[variant],
        interactive && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </article>
  )
}

export default Card
