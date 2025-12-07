# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A privacy-first Chrome extension (Manifest V3) that tracks browsing history with time spent, engagement metrics, and visualizations. All data stays local using IndexedDB.

## Commands

All commands run from the `browsing-tracker/` directory:

```bash
# Development (hot reload for popup/dashboard, load dist/ as unpacked extension)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Create .zip for Chrome Web Store submission
npm run zip
```

## Architecture

### Extension Components

- **Service Worker** (`src/background/service-worker.ts`): Core tracking logic, handles Chrome events (tabs, bookmarks, idle state), manages alarms for periodic time updates and sync
- **Popup** (`src/popup/`): Quick stats view, tracking toggle, settings access
- **Dashboard** (`src/dashboard/`): Full analytics page with charts and data export
- **New Tab** (`src/newtab/`): Personal dashboard with clock, search, quick links, stats, and bookmarks
- **Storage** (`src/storage/db.ts`): Dexie.js wrapper for IndexedDB, singleton `db` instance
- **Auth** (`src/auth/`): Google OAuth via chrome.identity API
- **Search** (`src/search/`): Fuse.js fuzzy search across visits and bookmarks
- **Sync** (`src/sync/`): Optional sync to Onebox cloud service

### Key Patterns

- Service worker terminates after 30s inactivity (MV3 constraint) - uses `chrome.alarms` for periodic operations
- Communication between components via `chrome.runtime.sendMessage` with typed messages (`ExtensionMessage` in `src/shared/types.ts`)
- URL normalization removes query params/fragments for grouping visits
- Sessions tracked via generated `sessionId` per browser startup

### Testing

Tests use `fake-indexeddb` for IndexedDB mocking and a comprehensive Chrome API mock in `tests/setup.ts`. Test files in `tests/unit/`.

## Tech Stack

- TypeScript, Preact, Tailwind CSS v4, Chart.js
- Dexie.js for IndexedDB
- Fuse.js for fuzzy search
- Vite + @crxjs/vite-plugin for building
- Vitest for testing
