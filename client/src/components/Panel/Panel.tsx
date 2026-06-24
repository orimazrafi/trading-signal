import { PANEL_SHELL_CLASS } from '@/lib/surfaceClasses'
import { cn } from '@/lib/utils'
import type { PanelProps, PanelVariant } from './types'

/** Returns layout classes for a panel variant. */
function panelLayoutClass(variant: PanelVariant): string {
  if (variant === 'page') {
    return 'min-h-[calc(100vh-14rem)] flex-1'
  }

  if (variant === 'feed') {
    return 'max-h-[32rem]'
  }

  return 'p-5'
}

/** Returns body wrapper classes for a panel variant. */
function panelBodyClass(variant: PanelVariant, bodyClassName: string): string {
  if (variant === 'section') {
    return bodyClassName
  }

  return cn('min-h-0 flex-1 overflow-y-auto px-5 py-4', bodyClassName)
}

/** Returns header classes for a panel variant. */
function panelHeaderClass(variant: PanelVariant): string {
  if (variant === 'section') {
    return 'mb-4'
  }

  return 'border-b border-border px-5 py-4'
}

/** Renders a titled dashboard section shell with shared layout styles. */
function Panel({
  title,
  description,
  children,
  className = '',
  bodyClassName = '',
  variant = 'section',
}: PanelProps) {
  return (
    <section className={cn(PANEL_SHELL_CLASS, panelLayoutClass(variant), className)}>
      <header className={panelHeaderClass(variant)}>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </header>

      <div className={panelBodyClass(variant, bodyClassName)}>{children}</div>
    </section>
  )
}

export default Panel
