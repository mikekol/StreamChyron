import type { ChyronConfig } from './types'

export async function loadConfig(): Promise<ChyronConfig> {
  const res = await fetch('/config.json')
  return res.json()
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
