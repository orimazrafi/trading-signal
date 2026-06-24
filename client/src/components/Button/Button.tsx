import styles from './Button.module.css'
import type { ButtonProps, ButtonVariant } from './types'

/** Returns CSS module classes for a button variant (base + variant; tabActive layers on tab). */
function getVariantClasses(variant: ButtonVariant): string[] {
  switch (variant) {
    case 'secondary':
      return [styles.base, styles.secondary]
    case 'danger':
      return [styles.base, styles.danger]
    case 'tab':
      return [styles.base, styles.tab]
    case 'tabActive':
      return [styles.base, styles.tab, styles.tabActive]
    default:
      return [styles.base, styles.primary]
  }
}

/** Builds the final class list for a button element. */
function getButtonClassName(variant: ButtonVariant, fullWidth: boolean): string {
  return [...getVariantClasses(variant), fullWidth ? styles.fullWidth : ''].filter(Boolean).join(' ')
}

/** Resolves button label when a loading state is active. */
function getButtonLabel(loading: boolean, loadingLabel: string | undefined, children: ButtonProps['children']) {
  return loading && loadingLabel ? loadingLabel : children
}

/** Shared button with primary, secondary, and tab variants. */
function Button({
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingLabel,
  onClick,
  'aria-current': ariaCurrent,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      className={getButtonClassName(variant, fullWidth)}
      disabled={isDisabled}
      onClick={onClick}
      aria-current={ariaCurrent}
    >
      {getButtonLabel(loading, loadingLabel, children)}
    </button>
  )
}

export default Button
