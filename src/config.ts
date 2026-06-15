import type { AppState, ChyronConfig } from './types'

export async function loadConfig(): Promise<ChyronConfig> {
  const res = await fetch('/config.json')
  return res.json()
}

export async function loadState(): Promise<AppState> {
  const res = await fetch('/state')
  return res.json()
}

export function watchState(
  initialState: AppState,
  cb: (state: AppState) => void,
  interval = 500
): () => void {
  let lastJson = JSON.stringify(initialState)

  const poll = async () => {
    try {
      const state = await loadState()
      const json = JSON.stringify(state)
      if (json !== lastJson) {
        lastJson = json
        cb(state)
      }
    } catch {
      // ignore transient fetch errors
    }
  }

  const id = setInterval(poll, interval)
  return () => clearInterval(id)
}

export function watchConfig(
  initialConfig: ChyronConfig,
  cb: (config: ChyronConfig) => void,
  interval = 2000
): () => void {
  let lastJson = JSON.stringify(initialConfig)

  const poll = async () => {
    try {
      const config = await loadConfig()
      const json = JSON.stringify(config)
      if (json !== lastJson) {
        lastJson = json
        cb(config)
      }
    } catch {
      // ignore transient fetch errors
    }
  }

  const id = setInterval(poll, interval)
  return () => clearInterval(id)
}
