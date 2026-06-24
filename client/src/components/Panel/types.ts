import type { ReactNode } from 'react'

export type PanelVariant = 'section' | 'feed' | 'page'

export type PanelProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
  bodyClassName?: string
  variant?: PanelVariant
}
