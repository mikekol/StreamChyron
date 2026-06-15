import type { AppState, ChyronConfig, ChyronItem, StopAlert } from './types'
import { Lane } from './lane'
import { THEMES } from './themes'
import { loadState, watchState } from './config'

export class ChyronApp {
  private lanes = new Map<string, Lane>()
  private stopWatcher: (() => void) | null = null
  private activeStop: StopAlert | null = null

  constructor(private root: HTMLElement) {}

  async start(): Promise<void> {
    const state = await loadState()
    this.init(state)
    this.stopWatcher = watchState(state, s => this.onStateChange(s))
  }

  init(state: AppState): void {
    this.applyTheme(state.config)
    state.config.lanes.forEach(laneConfig => {
      const merged = this.mergeTransient(laneConfig, state.transientItems)
      const lane = new Lane(merged)
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

  onStateChange(state: AppState): void {
    this.applyTheme(state.config)
    this.updateLanes(state)
    this.updateStop(state.stop)
  }

  private updateLanes(state: AppState): void {
    const newIds = new Set(state.config.lanes.map(l => l.id))

    this.lanes.forEach((lane, id) => {
      if (!newIds.has(id)) {
        lane.destroy()
        this.lanes.delete(id)
      }
    })

    state.config.lanes.forEach(laneConfig => {
      const merged = this.mergeTransient(laneConfig, state.transientItems)
      if (this.lanes.has(laneConfig.id)) {
        this.lanes.get(laneConfig.id)!.update(merged)
      } else {
        const lane = new Lane(merged)
        lane.mount(this.root)
        this.lanes.set(laneConfig.id, lane)
      }
    })
  }

  private updateStop(stop: StopAlert | null): void {
    const wasActive = this.activeStop !== null
    const isActive = stop !== null

    if (isActive && !wasActive) {
      this.lanes.forEach(lane => lane.showStop(stop))
    } else if (!isActive && wasActive) {
      this.lanes.forEach(lane => lane.clearStop())
    }

    this.activeStop = stop
  }

  private mergeTransient(
    laneConfig: AppState['config']['lanes'][number],
    transientItems: Record<string, ChyronItem[]>
  ): typeof laneConfig {
    const extra = transientItems[laneConfig.id] ?? []
    if (extra.length === 0) return laneConfig
    return { ...laneConfig, items: [...laneConfig.items, ...extra] }
  }

  stop(): void {
    this.stopWatcher?.()
    this.lanes.forEach(lane => lane.destroy())
    this.lanes.clear()
  }
}
