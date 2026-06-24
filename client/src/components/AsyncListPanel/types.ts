import type { ReactNode } from 'react'
import type { PanelVariant } from '@/components/Panel/types'

export type AsyncListPanelProps<TItem> = {
  title: string
  description?: string
  items: TItem[]
  isLoading: boolean
  error: string | null
  emptyMessage: string
  loadingLabel: string
  variant?: PanelVariant
  className?: string
  getItemKey: (item: TItem) => string
  renderItem: (item: TItem) => ReactNode
}
