export type Theme = 'lilac' | 'light' | 'dark'

export const THEMES: { value: Theme; label: string }[] = [
  { value: 'lilac', label: 'Lilac' },
  { value: 'light', label: 'Paper' },
  { value: 'dark', label: 'Dark' },
]

export const THEME_LABEL: Record<Theme, string> = {
  lilac: 'Lilac',
  light: 'Paper',
  dark: 'Dark',
}

/** The order the rail button and the `t` key step through. */
export const nextTheme = (current: Theme): Theme => {
  const order = THEMES.map((entry) => entry.value)
  return order[(order.indexOf(current) + 1) % order.length]
}

const STORAGE_KEY = 'mercury.theme'

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' || value === 'lilac' ? value : null
  } catch {
    return null
  }
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* private browsing - the choice just does not persist */
  }
}
