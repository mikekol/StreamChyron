export interface TextItem {
  type: 'text'
  content: string
}

export interface BreakingItem {
  type: 'breaking'
  label: string
  content: string
}

export type ChyronItem = TextItem | BreakingItem

export interface LogoConfig {
  src: string
  width?: number
}

export interface LaneConfig {
  id: string
  position: 'top' | 'bottom'
  height: number
  speed: number
  font: string
  fontSize: number
  separator: string
  itemPadding: number
  overrides: Record<string, string>
  logo?: LogoConfig
  items: ChyronItem[]
}

export interface ThemeVars {
  '--chyron-bg': string
  '--chyron-text': string
  '--chyron-label-bg': string
  '--chyron-label-text': string
  '--chyron-separator-color': string
  '--chyron-border': string
  [key: string]: string
}

export interface ChyronConfig {
  theme: string
  themes?: Record<string, Partial<ThemeVars>>
  lanes: LaneConfig[]
}
