import type { ThemeVars } from './types'

export const THEMES: Record<string, ThemeVars> = {
  'dark-news': {
    '--chyron-bg': '#000000',
    '--chyron-text': '#ffffff',
    '--chyron-label-bg': '#cc0000',
    '--chyron-label-text': '#ffffff',
    '--chyron-separator-color': '#666666',
    '--chyron-border': '2px solid #333333',
  },
  'light-news': {
    '--chyron-bg': '#ffffff',
    '--chyron-text': '#111111',
    '--chyron-label-bg': '#003399',
    '--chyron-label-text': '#ffffff',
    '--chyron-separator-color': '#aaaaaa',
    '--chyron-border': '2px solid #cccccc',
  },
  'broadcast': {
    '--chyron-bg': '#002b6b',
    '--chyron-text': '#ffd700',
    '--chyron-label-bg': '#ffd700',
    '--chyron-label-text': '#002b6b',
    '--chyron-separator-color': '#5588cc',
    '--chyron-border': '2px solid #ffd700',
  },
}
