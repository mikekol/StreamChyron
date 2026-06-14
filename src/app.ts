import type { ChyronConfig } from './types'
import { Lane } from './lane'
import { THEMES } from './themes'
import { loadConfig, watchConfig } from './config'

export class ChyronApp {
  private lanes = new Map<string, Lane>()
  private stopWatcher: (() => void) | null = null

  constructor(private root: HTMLElement) {}

  async start(): Promise<void> {
    const config = await loadConfig()
    this.init(config)
    this.stopWatcher = watchConfig(config, newConfig => this.onConfigChange(newConfig))
  }

  init(config: ChyronConfig): void {
    this.applyTheme(config)
    config.lanes.forEach(laneConfig => {
      const lane = new Lane(laneConfig)
      lane.mount(this.root)
      this.lanes.set(laneConfig.id, lane)
    })
  }

  applyTheme(config: ChyronConfig): void {
    const base = THEMES[config.theme] ?? THEMES['dark-news']
    const custom = config.themes?.[config.theme] ?? {}
    const merged = { ...base, ...custom }
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined) this.root.style.setProperty(k, v)
    })
  }

  onConfigChange(newConfig: ChyronConfig): void {
    this.applyTheme(newConfig)

    const newIds = new Set(newConfig.lanes.map(l => l.id))

    this.lanes.forEach((lane, id) => {
      if (!newIds.has(id)) {
        lane.destroy()
        this.lanes.delete(id)
      }
    })

    newConfig.lanes.forEach(laneConfig => {
      if (this.lanes.has(laneConfig.id)) {
        this.lanes.get(laneConfig.id)!.update(laneConfig)
      } else {
        const lane = new Lane(laneConfig)
        lane.mount(this.root)
        this.lanes.set(laneConfig.id, lane)
      }
    })
  }

  stop(): void {
    this.stopWatcher?.()
    this.lanes.forEach(lane => lane.destroy())
    this.lanes.clear()
  }
}
