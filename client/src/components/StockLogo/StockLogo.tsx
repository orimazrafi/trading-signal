import { useState } from 'react'
import { buildStockLogoUrl, stockLogoInitials } from '@/lib/stockLogoUrl'
import { cn } from '@/lib/utils'
import type { StockLogoProps } from './types'

const SIZE_CLASSES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
} as const

/** Renders a company logo for a ticker with initials fallback. */
function StockLogo({ symbol, size = 'md', className = '' }: StockLogoProps) {
  const [failed, setFailed] = useState(false)
  const normalized = symbol.trim().toUpperCase()

  if (!normalized) {
    return null
  }

  if (failed) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground',
          SIZE_CLASSES[size],
          className,
        )}
        aria-hidden="true"
      >
        {stockLogoInitials(normalized)}
      </span>
    )
  }

  return (
    <img
      src={buildStockLogoUrl(normalized)}
      alt=""
      className={cn(
        'inline-block shrink-0 rounded-lg border border-border bg-card object-contain p-1',
        SIZE_CLASSES[size],
        className,
      )}
      onError={() => setFailed(true)}
    />
  )
}

export default StockLogo
