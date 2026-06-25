import { THEME_STORAGE_KEY, type ThemeMode } from './types'

const themeModes: ThemeMode[] = ['light', 'dark', 'system']

/** Returns true when value is a supported theme mode. */
function isThemeMode(value: string): value is ThemeMode {
  return themeModes.includes(value as ThemeMode)
}

/** Reads the persisted theme preference from local storage. */
export function readStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)

  if (stored && isThemeMode(stored)) {
    return stored
  }

  return 'system'
}

/** Persists the theme preference to local storage. */
export function writeStoredThemeMode(mode: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, mode)
}

/** Applies the theme class on the document root element. */
export function applyThemeMode(mode: ThemeMode): void {
  const root = document.documentElement
  root.classList.remove('light', 'dark')

  if (mode === 'light') {
    root.classList.add('light')
    return
  }

  if (mode === 'dark') {
    root.classList.add('dark')
    return
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  root.classList.toggle('dark', prefersDark)
}
