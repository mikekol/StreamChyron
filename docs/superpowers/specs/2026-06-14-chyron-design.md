# Chyron News Scroller — Design Spec

**Date:** 2026-06-14
**Stack:** TypeScript, Vite
**Target:** OBS Browser Source

---

## Overview

A highly customizable HTML5/CSS chyron news scroller for use as an OBS browser source. Supports a mix of freeform text and structured "breaking news" items. Configured via `config.json`. Designed so a web-based admin panel can be added later without rearchitecting the core.

---

## Architecture

```
chyron/
├── index.html
├── config.json              ← primary config (user edits this)
├── src/
│   ├── main.ts              ← entry point, mounts ChyronApp
│   ├── types.ts             ← all TypeScript interfaces
│   ├── app.ts               ← ChyronApp: orchestrates lanes, polls config
│   ├── lane.ts              ← Lane: one horizontal strip
│   ├── ticker.ts            ← Ticker: CSS scroll engine
│   ├── items.ts             ← ItemRenderer: text vs. breaking items
│   ├── themes.ts            ← built-in theme definitions
│   └── config.ts            ← config loader + polling
├── vite.config.ts
└── package.json
```

---

## Data Model

### `config.json`

```json
{
  "theme": "dark-news",
  "themes": {},
  "lanes": [
    {
      "id": "main",
      "position": "bottom",
      "height": 48,
      "speed": 80,
      "font": "Inter",
      "fontSize": 18,
      "separator": "◆",
      "itemPadding": 40,
      "overrides": {},
      "items": [
        { "type": "text", "content": "Welcome to the stream" },
        { "type": "breaking", "label": "BREAKING", "content": "Something just happened" }
      ]
    }
  ]
}
```

### TypeScript Interfaces (`types.ts`)

```ts
type ItemType = "text" | "breaking";

interface TextItem {
  type: "text";
  content: string;
}

interface BreakingItem {
  type: "breaking";
  label: string;
  content: string;
}

type ChyronItem = TextItem | BreakingItem;

interface LaneConfig {
  id: string;
  position: "top" | "bottom";
  height: number;         // px
  speed: number;          // px/s
  font: string;
  fontSize: number;       // px
  separator: string;      // character between items
  itemPadding: number;    // px between items
  overrides: Record<string, string>; // CSS variable overrides
  items: ChyronItem[];
}

interface ThemeVars {
  "--chyron-bg": string;
  "--chyron-text": string;
  "--chyron-label-bg": string;
  "--chyron-label-text": string;
  "--chyron-separator-color": string;
  "--chyron-border": string;
  [key: string]: string;
}

interface ChyronConfig {
  theme: string;
  themes?: Record<string, Partial<ThemeVars>>; // custom theme overrides
  lanes: LaneConfig[];
}
```

---

## Components

### `ChyronApp` (`app.ts`)

- Boots from `config.json` via `loadConfig()`
- Creates a `Lane` instance per entry in `config.lanes`
- Mounts all lanes to `document.body`
- Polls `config.json` every 2 seconds
- On config change: diffs lanes by `id`, hot-swaps content without full reload (no OBS flash)
- Applies the active theme's CSS variables to `:root`
- Per-lane `overrides` shadow the global theme variables on the lane's root element

### `Lane` (`lane.ts`)

- Owns one `<div>` positioned absolutely (`top: 0` or `bottom: 0`, full width)
- Height, font, fontSize set as inline styles
- Delegates all scroll logic to `Ticker`
- Exposes `update(config: LaneConfig)` for hot-swap

### `Ticker` (`ticker.ts`)

- Builds a single long DOM row of rendered items, separated by the configured separator character
- Duplicates the row end-to-end for a seamless infinite loop
- Drives scroll with a CSS `animation: translate` at `speed` px/s
- Calculates animation duration from measured content width: `duration = width / speed`
- On `update()`: rebuilds content and recalculates duration

### `ItemRenderer` (`items.ts`)

- `renderItem(item: ChyronItem): HTMLElement`
- `text` → `<span class="item-text">content</span>`
- `breaking` → `<span class="item-breaking"><span class="label">BREAKING</span><span class="content">…</span></span>`
- All styling via CSS custom properties, so themes control appearance

---

## Theming

Three built-in presets in `themes.ts`:

| Name | Background | Text | Label |
|------|-----------|------|-------|
| `dark-news` | `#000` | `#fff` | Red (`#cc0000`) |
| `light-news` | `#fff` | `#111` | Navy (`#003399`) |
| `broadcast` | `#002b6b` | `#ffd700` | Bold gold |

Theme variables applied to `:root`. Per-lane `overrides` applied to the lane element, shadowing globals.

Custom themes defined in `config.json` under `"themes"` key using the same variable map.

First-class config fields (not in theme variables): `font`, `fontSize`, `height`, `speed`, `separator`, `itemPadding`.

---

## Config Polling & Hot-Swap

- `config.ts` exposes `loadConfig(): Promise<ChyronConfig>` and `watchConfig(cb, interval)`
- `watchConfig` fetches `/config.json` on `interval` (default 2000ms), compares to last known state, calls `cb` only on change
- `ChyronApp` uses `watchConfig` to trigger lane diffs
- Lane diff: match by `id` — add new lanes, remove dropped lanes, call `lane.update()` for changed lanes
- When admin panel ships: `watchConfig` gets replaced by a WebSocket subscription; no other changes needed

---

## OBS Integration

### Dev mode
```bash
npm run dev       # Vite at localhost:5173
```
OBS Browser Source → `http://localhost:5173`
Width: match canvas (e.g. 1920). Height: match lane height (e.g. 80px for single lane).

### Production mode
```bash
npm run build        # outputs dist/
npm run build:watch  # rebuilds on file change (for config edits without dev server)
```
OBS Browser Source → local file `dist/index.html`

> **Note:** In production (file:// protocol), config is bundled at build time. Changes to `config.json` require a rebuild. Use dev mode for live config editing during stream.

### Recommended OBS settings
- "Shutdown source when not visible" → **unchecked**
- "Refresh browser when scene becomes active" → **checked**

---

## Multi-Lane Support

Default: one lane. Multi-lane: add entries to the `lanes` array. Each lane is independent — different speed, items, position, height, and theme overrides. A second lane can be positioned `"top"` to act as a static alert bar (set a very slow speed or a single item).

---

## Out of Scope (for now)

- Admin panel UI (future: separate Vite route on same dev server)
- WebSocket live updates (future: replaces polling in `config.ts`)
- Per-item display duration / timed rotation
- Video/image items
