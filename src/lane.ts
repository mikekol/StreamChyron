import type { LaneConfig } from './types'
import { Ticker } from './ticker'

export class Lane {
  private el: HTMLElement
  private ticker: Ticker
  private config: LaneConfig

  constructor(config: LaneConfig) {
    this.config = config
    this.el = document.createElement('div')
    this.el.className = 'lane'
    this.el.dataset.id = config.id
    this.el.dataset.position = config.position
    this.applyStyles(config)
    this.ticker = new Ticker(this.el)
    this.ticker.render(config.items, config)
  }

  private applyStyles(config: LaneConfig): void {
    this.el.style.height = `${config.height}px`
    this.el.style.fontSize = `${config.fontSize}px`
    this.el.style.fontFamily = config.font
    Object.entries(config.overrides).forEach(([k, v]) => {
      this.el.style.setProperty(k, v)
    })
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.el)
  }

  update(config: LaneConfig): void {
    this.config = config
    this.el.dataset.position = config.position
    this.applyStyles(config)
    this.ticker.update(config.items, config)
  }

  destroy(): void {
    this.ticker.destroy()
    this.el.remove()
  }

  get id(): string {
    return this.config.id
  }
}
