import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/Button'
import { useTheme } from '@/features/theme/ThemeProvider'
import type { ThemeMode } from '@/features/theme/types'

const MODE_CYCLE: ThemeMode[] = ['light', 'dark', 'system']

/** Returns the next theme mode in the light → dark → system cycle. */
function nextThemeMode(current: ThemeMode): ThemeMode {
  const index = MODE_CYCLE.indexOf(current)
  const nextIndex = index === -1 ? 0 : (index + 1) % MODE_CYCLE.length
  return MODE_CYCLE[nextIndex] ?? 'system'
}

/** Returns an accessible label for the theme toggle button. */
function themeToggleLabel(mode: ThemeMode): string {
  if (mode === 'light') {
    return 'Switch to dark mode'
  }

  if (mode === 'dark') {
    return 'Use system theme'
  }

  return 'Switch to light mode'
}

/** Cycles light, dark, and system theme preferences. */
function ThemeToggle() {
  const { mode, setMode, resolvedDark } = useTheme()

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => setMode(nextThemeMode(mode))}
      aria-label={themeToggleLabel(mode)}
      title={themeToggleLabel(mode)}
      className="px-3"
    >
      {resolvedDark ? (
        <Moon className="size-4" aria-hidden="true" />
      ) : (
        <Sun className="size-4" aria-hidden="true" />
      )}
    </Button>
  )
}

export default ThemeToggle
