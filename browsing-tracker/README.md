# Browsing History Tracker

A privacy-first Chrome extension that tracks your browsing habits and provides meaningful insights into how you spend your time online.

## Features

- **Time Tracking** - See how much time you spend on each website
- **Activity Heatmap** - Visualize your browsing patterns by day and hour
- **Top Sites** - Track your most visited domains
- **Bookmark Detection** - Know when you bookmark pages
- **Data Export** - Export your data in JSON or CSV format
- **Privacy First** - All data stays on your device

## Privacy

Your data never leaves your device. The extension:
- Stores all data locally using IndexedDB
- Does not transmit any data to external servers
- Does not track incognito browsing
- Allows you to exclude sensitive domains
- Lets you delete all data at any time

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Development)

1. Clone the repository
2. Install dependencies:
   ```bash
   cd browsing-tracker
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Preact** - Lightweight React alternative (3KB)
- **Tailwind CSS** - Utility-first styling
- **Dexie.js** - IndexedDB wrapper
- **Chart.js** - Data visualization
- **Vite** - Fast build tool
- **Vitest** - Unit testing

## Permissions

The extension requires these permissions:
- `tabs` - To track which pages you visit
- `history` - To access page metadata
- `bookmarks` - To detect bookmark events
- `storage` - To save data locally
- `alarms` - For time tracking (runs every minute)
- `idle` - To detect inactive browsing

## License

MIT
