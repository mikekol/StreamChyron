# StreamChyron

A customizable HTML5 news ticker for live streams, designed to run as an OBS browser source. Supports freeform text and breaking news items, multiple scroll lanes, swappable themes, and live config updates via a REST API.

Built to run on a Raspberry Pi on your local network — the Pi serves the chyron and accepts config updates, your streaming PC points OBS at the Pi's IP.

![dark-news theme](docs/themes/dark-news.png)

---

## Features

- **Scrolling ticker lanes** — smooth CSS animation, configurable speed
- **Two item types** — freeform text and labeled breaking news items
- **Multi-lane support** — independent lanes at top and/or bottom of frame
- **Theme presets** — `dark-news`, `light-news`, `broadcast` (plus custom themes in config)
- **Live updates** — edit `config.json` and the chyron updates within 2 seconds, no reload
- **REST API** — push content changes from any machine on your network
- **Pi-ready** — Express server binds to `0.0.0.0`, serves the frontend and API on one port

---

## Quick Start

### Requirements

- Node.js 20+
- npm 9+

### Install

```bash
git clone git@github.com:mikekol/StreamChyron.git
cd StreamChyron
npm install
```

### Development (local machine)

Two terminals:

```bash
# Terminal 1 — API server on :3000
npm run server:dev

# Terminal 2 — Vite dev server on :5173 (proxies API to :3000)
npm run dev
```

Open `http://localhost:5173` to preview. Edit `config.json` to see live updates.

### Production (Raspberry Pi)

```bash
npm run build       # compile frontend to dist/
npm run serve       # Express on :3000 serves dist/ + API
```

On your streaming PC, add a Browser Source in OBS pointing to `http://<pi-ip>:3000`.

**Recommended OBS Browser Source settings:**
- Width: `1920` (or match your canvas)
- Height: match the `height` value in your lane config (e.g. `80`)
- Shutdown source when not visible: **off**
- Refresh browser when scene becomes active: **on**

---

## Configuration

Edit `config.json` in the project root. Changes are picked up automatically within 2 seconds.

```json
{
  "theme": "dark-news",
  "lanes": [
    {
      "id": "main",
      "position": "bottom",
      "height": 52,
      "speed": 80,
      "font": "Inter, Arial, sans-serif",
      "fontSize": 18,
      "separator": "◆",
      "itemPadding": 48,
      "overrides": {},
      "items": [
        { "type": "text", "content": "Welcome to the stream!" },
        { "type": "breaking", "label": "BREAKING", "content": "Something just happened" }
      ]
    }
  ]
}
```

### Lane options

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier, used for hot-swap diffing |
| `position` | `"top"` \| `"bottom"` | Where the lane is pinned |
| `height` | number | Lane height in px |
| `speed` | number | Scroll speed in px/s |
| `font` | string | CSS font-family string |
| `fontSize` | number | Font size in px |
| `separator` | string | Character shown between items (e.g. `◆`, `•`, `\|`) |
| `itemPadding` | number | Padding in px on each side of a separator |
| `overrides` | object | CSS custom property overrides (see Theming) |
| `items` | array | List of items to scroll |

### Item types

```json
{ "type": "text", "content": "Any freeform message" }

{ "type": "breaking", "label": "BREAKING", "content": "The news headline" }
```

### Multi-lane

Add more entries to `lanes`. Each lane is fully independent:

```json
"lanes": [
  { "id": "main",      "position": "bottom", "speed": 80,  ... },
  { "id": "alert-bar", "position": "top",    "speed": 20,  ... }
]
```

---

## Themes

Three built-in presets:

| Name | Background | Text | Label |
|---|---|---|---|
| `dark-news` | Black | White | Red |
| `light-news` | White | Dark | Navy |
| `broadcast` | Deep blue | Gold | Gold |

Set `"theme"` in `config.json` to switch. Define custom themes under a `"themes"` key:

```json
{
  "theme": "my-theme",
  "themes": {
    "my-theme": {
      "--chyron-bg": "#1a1a2e",
      "--chyron-text": "#e0e0e0",
      "--chyron-label-bg": "#e94560",
      "--chyron-label-text": "#ffffff",
      "--chyron-separator-color": "#555",
      "--chyron-border": "2px solid #e94560"
    }
  },
  "lanes": [ ... ]
}
```

Per-lane overrides let you diverge from the global theme for a single lane:

```json
{ "id": "alert-bar", "overrides": { "--chyron-bg": "#cc0000" }, ... }
```

---

## API

The Express server exposes two endpoints:

### `GET /config.json`

Returns the current configuration.

```bash
curl http://<pi-ip>:3000/config.json
```

### `PUT /config`

Replaces the full configuration. The chyron picks up the change within 2 seconds.

```bash
curl -X PUT http://<pi-ip>:3000/config \
  -H "Content-Type: application/json" \
  -d @config.json
```

---

## PowerShell Helper

`scripts/add-content.ps1` provides convenience functions for pushing updates from Windows:

```powershell
# Dot-source to use functions directly
. .\scripts\add-content.ps1 -Server http://<pi-ip>:3000

# Add items
Add-TextItem    -laneId "main" -content "Raid incoming from @streamer!"
Add-BreakingItem -laneId "main" -label "HYPE" -content "We just hit 500 viewers"

# Manage
Set-Theme  -theme "broadcast"
Clear-Lane -laneId "main"
Show-Config
```

Run without arguments to execute a self-contained demo against `localhost:3000`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server on `:5173` (proxies API to `:3000`) |
| `npm run server:dev` | Express API server with auto-restart on `:3000` |
| `npm run build` | Compile TypeScript + build frontend to `dist/` |
| `npm run serve` | Production server — serves `dist/` + API on `:3000` |
| `npm run build:watch` | Rebuild frontend on file change |
| `npm test` | Run unit tests with Vitest |

---

## Project Structure

```
StreamChyron/
├── config.json          ← edit this to change content and appearance
├── server.ts            ← Express API server
├── index.html
├── src/
│   ├── main.ts          ← entry point
│   ├── types.ts         ← TypeScript interfaces
│   ├── app.ts           ← ChyronApp orchestrator
│   ├── lane.ts          ← individual scroll lane
│   ├── ticker.ts        ← CSS scroll engine
│   ├── items.ts         ← item renderers (text, breaking)
│   ├── themes.ts        ← built-in theme definitions
│   ├── config.ts        ← config loader + live polling
│   └── styles/
│       └── chyron.css
└── scripts/
    └── add-content.ps1  ← PowerShell API helper
```
