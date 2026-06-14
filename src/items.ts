import type { ChyronItem } from './types'

export function renderItem(item: ChyronItem): HTMLElement {
  if (item.type === 'breaking') {
    const el = document.createElement('span')
    el.className = 'item-breaking'

    const label = document.createElement('span')
    label.className = 'label'
    label.textContent = item.label

    const content = document.createElement('span')
    content.className = 'content'
    content.textContent = item.content

    el.appendChild(label)
    el.appendChild(content)
    return el
  }

  const el = document.createElement('span')
  el.className = 'item-text'
  el.textContent = item.content
  return el
}
