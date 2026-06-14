import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import type { ChyronConfig } from './src/types'

const app = express()
const PORT = Number(process.env.PORT ?? 3000)
const CONFIG_PATH = resolve(process.cwd(), 'config.json')
const DIST_PATH = resolve(process.cwd(), 'dist')

app.use(cors())
app.use(express.json())
app.use(express.static(DIST_PATH))

app.get('/config.json', (_req, res) => {
  try {
    res.json(JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')))
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chyron server → http://0.0.0.0:${PORT}`)
})
