import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonProps } from './types'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70',
  {
    variants: {
      variant: {
        primary: 'border-0 bg-primary px-[0.85rem] py-[0.65rem] text-primary-foreground hover:bg-primary/90',
        secondary:
          'border-0 bg-secondary px-[0.85rem] py-[0.65rem] text-secondary-foreground hover:bg-secondary/90',
        danger:
          'border border-destructive/30 bg-transparent px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10',
        tab: 'flex-1 border border-border bg-transparent px-3 py-2',
        tabActive: 'flex-1 border border-border bg-secondary px-3 py-2 text-secondary-foreground',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      fullWidth: false,
    },
  },
)

/** Resolves button label when a loading state is active. */
function getButtonLabel(loading: boolean, loadingLabel: string | undefined, children: ButtonProps['children']) {
  return loading && loadingLabel ? loadingLabel : children
}

/** Shared button with primary, secondary, and tab variants. */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    type = 'button',
    fullWidth = false,
    disabled = false,
    loading = false,
    loadingLabel,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, fullWidth }), className)}
      disabled={isDisabled}
      {...rest}
    >
      {getButtonLabel(loading, loadingLabel, children)}
    </button>
  )
})

export default Button
