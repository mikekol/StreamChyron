import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import type { ChyronConfig, ChyronItem, StopAlert } from './src/types'

const app = express()
const PORT = Number(process.env.PORT ?? 3000)
const CONFIG_PATH = resolve(process.cwd(), 'config.json')
const DIST_PATH = resolve(process.cwd(), 'dist')

// In-memory transient state — lost on restart by design
let transientItems: Record<string, ChyronItem[]> = {}
let currentStop: StopAlert | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null

function readConfig(): ChyronConfig {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
}

app.use(cors())
app.use(express.json())
app.use(express.static(DIST_PATH))

// Unified state endpoint — polled by the frontend at 500ms
app.get('/state', (_req, res) => {
  try {
    res.json({ config: readConfig(), transientItems, stop: currentStop })
  } catch {
    res.status(500).json({ error: 'Failed to read config' })
  }
})

// Kept for backward compatibility and direct config editing
app.get('/config.json', (_req, res) => {
  try {
    res.json(readConfig())
  } catch {
    res.status(500).json({ error: 'Failed to read config' })
  }
})

app.put('/config', (req, res) => {
  const config = req.body as ChyronConfig
  if (!config?.lanes || !Array.isArray(config.lanes)) {
    res.status(400).json({ error: 'Invalid config: missing lanes array' })
    return
  }
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to write config' })
  }
})

// Trigger a STOP alert
app.post('/stop', (req, res) => {
  const { laneId, content, label = 'STOP', duration = 7 } = req.body ?? {}

  if (!laneId || typeof laneId !== 'string') {
    res.status(400).json({ error: 'laneId is required' })
    return
  }
  if (!content || typeof content !== 'string') {
    res.status(400).json({ error: 'content is required' })
    return
  }

  // Cancel any in-flight STOP
  if (stopTimer) clearTimeout(stopTimer)

  currentStop = { laneId, label, content, endsAt: Date.now() + duration * 1000 }

  stopTimer = setTimeout(() => {
    // Add STOP message as transient breaking item on the target lane
    transientItems[laneId] = [
      ...(transientItems[laneId] ?? []),
      { type: 'breaking', label, content } satisfies ChyronItem,
    ]
    currentStop = null
    stopTimer = null
  }, duration * 1000)

  console.log(`STOP alert: [${label}] ${content} (${duration}s)`)
  res.json({ ok: true, endsAt: currentStop.endsAt })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chyron server → http://0.0.0.0:${PORT}`)
})
