import type { ReactNode, Ref } from 'react'

export type PanelVariant = 'section' | 'feed' | 'page'

export type PanelProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
  bodyClassName?: string
  bodyRef?: Ref<HTMLDivElement>
  variant?: PanelVariant
}
