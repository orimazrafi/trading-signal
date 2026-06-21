import styles from './Button.module.css'
import type { ButtonProps, ButtonVariant } from './types'

/** Returns the CSS module class for a button variant. */
function getVariantClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'secondary':
      return styles.secondary
    case 'tab':
      return styles.tab
    case 'tabActive':
      return styles.tabActive
    default:
      return styles.primary
  }
}

/** Builds the final class list for a button element. */
function getButtonClassName(variant: ButtonVariant, fullWidth: boolean): string {
  return [getVariantClass(variant), fullWidth ? styles.fullWidth : ''].filter(Boolean).join(' ')
}

/** Resolves button label when a loading state is active. */
function getButtonLabel(loading: boolean, loadingLabel: string | undefined, children: ButtonProps['children']) {
  return loading && loadingLabel ? loadingLabel : children
}

/** Shared button with primary, secondary, and tab variants. */
export function Button({
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingLabel,
  onClick,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      className={getButtonClassName(variant, fullWidth)}
      disabled={isDisabled}
      onClick={onClick}
    >
      {getButtonLabel(loading, loadingLabel, children)}
    </button>
  )
}

