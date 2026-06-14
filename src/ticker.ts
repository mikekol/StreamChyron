import type { ChyronItem, LaneConfig } from './types'
import { renderItem } from './items'

export function calculateDuration(contentWidth: number, speed: number): number {
  if (speed <= 0) return 0
  return contentWidth / speed
}

export class Ticker {
  readonly trackEl: HTMLElement

  constructor(container: HTMLElement) {
    this.trackEl = document.createElement('div')
    this.trackEl.className = 'ticker-track'
    container.appendChild(this.trackEl)
  }

  render(items: ChyronItem[], config: LaneConfig): void {
    this.trackEl.innerHTML = ''
    this.trackEl.appendChild(this.buildItemSet(items, config))
    this.trackEl.appendChild(this.buildItemSet(items, config))
    requestAnimationFrame(() => this.applyDuration(config.speed))
  }

  private buildItemSet(items: ChyronItem[], config: LaneConfig): DocumentFragment {
    const frag = document.createDocumentFragment()
    items.forEach(item => {
      frag.appendChild(renderItem(item))
      const sep = document.createElement('span')
      sep.className = 'item-separator'
      sep.textContent = config.separator
      sep.style.margin = `0 ${config.itemPadding}px`
      frag.appendChild(sep)
    })
    return frag
  }

  applyDuration(speed: number): void {
    const halfWidth = this.trackEl.scrollWidth / 2
    const duration = calculateDuration(halfWidth, speed)
    this.trackEl.style.animationDuration = `${Math.max(duration, 1)}s`
  }

  update(items: ChyronItem[], config: LaneConfig): void {
    this.render(items, config)
  }

  destroy(): void {
    this.trackEl.remove()
  }
}
