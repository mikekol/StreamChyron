export class StopOverlay {
  readonly el: HTMLElement
  private labelEl: HTMLElement
  private contentEl: HTMLElement

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.className = 'stop-overlay'

    this.labelEl = document.createElement('span')
    this.labelEl.className = 'stop-label'

    this.contentEl = document.createElement('span')
    this.contentEl.className = 'stop-content'

    this.el.appendChild(this.labelEl)
    this.el.appendChild(this.contentEl)
    container.appendChild(this.el)
  }

  show(label: string, content: string): void {
    this.labelEl.textContent = label
    this.contentEl.textContent = content
    this.el.classList.remove('stop-overlay--exiting')
    this.el.classList.add('stop-overlay--active')
  }

  hide(): void {
    this.el.classList.remove('stop-overlay--active')
    this.el.classList.add('stop-overlay--exiting')
    this.el.addEventListener(
      'animationend',
      () => this.el.classList.remove('stop-overlay--exiting'),
      { once: true }
    )
  }

  destroy(): void {
    this.el.remove()
  }
}
