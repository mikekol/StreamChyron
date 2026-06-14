import type { LaneConfig, LogoConfig } from './types'
import { Ticker } from './ticker'

export class Lane {
  private el: HTMLElement
  private tickerWrapper: HTMLElement
  private logoEl: HTMLElement
  private ticker: Ticker
  private config: LaneConfig

  constructor(config: LaneConfig) {
    this.config = config

    this.el = document.createElement('div')
    this.el.className = 'lane'
    this.el.dataset.id = config.id
    this.el.dataset.position = config.position
    this.applyStyles(config)

    this.tickerWrapper = document.createElement('div')
    this.tickerWrapper.className = 'ticker-wrapper'
    this.el.appendChild(this.tickerWrapper)

    this.ticker = new Ticker(this.tickerWrapper)
    this.ticker.render(config.items, config)

    this.logoEl = document.createElement('div')
    this.logoEl.className = 'lane-logo'
    this.el.appendChild(this.logoEl)
    this.updateLogo(config.logo)
  }

  private applyStyles(config: LaneConfig): void {
    this.el.style.height = `${config.height}px`
    this.el.style.fontSize = `${config.fontSize}px`
    this.el.style.fontFamily = config.font
    Object.entries(config.overrides).forEach(([k, v]) => {
      this.el.style.setProperty(k, v)
    })
  }

  private updateLogo(logo: LogoConfig | undefined): void {
    this.logoEl.innerHTML = ''
    if (!logo) {
      this.logoEl.style.display = 'none'
      return
    }
    const width = logo.width ?? 120
    this.logoEl.style.display = 'flex'
    this.logoEl.style.width = `${width}px`

    const img = document.createElement('img')
    img.src = logo.src
    img.alt = 'Network logo'
    img.className = 'lane-logo-img'
    this.logoEl.appendChild(img)
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.el)
  }

  update(config: LaneConfig): void {
    this.config = config
    this.el.dataset.position = config.position
    this.applyStyles(config)
    this.ticker.update(config.items, config)
    this.updateLogo(config.logo)
  }

  destroy(): void {
    this.ticker.destroy()
    this.el.remove()
  }

  get id(): string {
    return this.config.id
  }
}
