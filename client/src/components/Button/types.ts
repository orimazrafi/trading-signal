import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'tab' | 'tabActive'

export type ButtonProps = {
  variant?: ButtonVariant
  fullWidth?: boolean
  loading?: boolean
  loadingLabel?: string
  children: ReactNode
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled' | 'onClick'>
