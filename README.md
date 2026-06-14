# Tile Map Editor

A local web-based tile map editor for designing board game maps. Paint PNG tiles onto a grid, save/load maps as JSON, and undo/redo your work.

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Adding Tiles

Drop PNG files into `public/tiles/`. The editor automatically discovers them on startup and reloads when files change during development.

Sample tiles (`grass`, `water`, `stone`, `sand`, `forest`, `lava`) are generated automatically when you run `npm run dev` or `npm run build`.

## Usage

1. **New Map** — Choose dimensions (presets: 15×15, 20×20, 30×30, or custom up to 200×200).
2. **Select a tile** from the left sidebar palette.
3. **Paint** — Left-click a cell, or click and drag across cells.
4. **Eraser** — Clear individual cells.
5. **Clear Map** — Remove all tiles at once.
6. **Save / Load** — Export or import maps as JSON.
7. **Undo / Redo** — Up to 50 actions.
8. **Zoom** — Use +/- controls in the toolbar.

## Map JSON Format

```json
{
  "width": 15,
  "height": 15,
  "cells": [
    ["grass.png", null, "water.png"],
    ["grass.png", "stone.png", null]
  ]
}
```

Each cell holds a tile filename (matching files in `public/tiles/`) or `null` for empty.

## Project Structure

```
src/
  components/     Toolbar, TilePalette, MapGrid, MapCell
  types/          MapData, TileData
  services/       SaveLoadService, TileService
  hooks/          useMapEditor (state, undo/redo, painting)
public/
  tiles/          PNG tile library
```

The architecture is designed for future extensions: layers, terrain metadata, spawn points, movement costs, fog of war, and more.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
