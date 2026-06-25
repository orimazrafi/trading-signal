import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/Button'
import { useTheme } from '@/features/theme/ThemeProvider'

/** Returns an accessible label for the theme toggle button. */
function themeToggleLabel(resolvedDark: boolean): string {
  return resolvedDark ? 'Switch to light mode' : 'Switch to dark mode'
}

/** Toggles between light and dark based on the current resolved appearance. */
function ThemeToggle() {
  const { setMode, resolvedDark } = useTheme()
  const label = themeToggleLabel(resolvedDark)

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => setMode(resolvedDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
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
