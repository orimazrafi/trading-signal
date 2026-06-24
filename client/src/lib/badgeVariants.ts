/** Shared Tailwind class maps for status and label badges. */
export const BADGE_VARIANTS = {
  positive: 'bg-positive-muted text-positive',
  negative: 'bg-negative-muted text-negative',
  warning: 'bg-warning-muted text-warning',
  neutral: 'bg-muted text-muted-foreground',
  accent: 'bg-accent text-accent-foreground',
  muted: 'bg-muted text-muted-foreground',
} as const

export type BadgeVariant = keyof typeof BADGE_VARIANTS

export type BadgeSize = 'sm' | 'md'

/** Returns Tailwind classes for a badge variant and size. */
export function badgeClassName(variant: BadgeVariant, size: BadgeSize = 'md'): string {
  const sizeClass =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[10px] uppercase tracking-wide'
      : 'px-3 py-1 text-xs'

  return `rounded-full font-semibold ${sizeClass} ${BADGE_VARIANTS[variant]}`
}
