# Tech Stack Recommendations

**Project:** Browsing History Tracker Chrome Extension
**Generated:** 2025-12-06
**Based on:** `.coordination/ENHANCED-PRD.md`

---

## Recommended Stack Summary

| Domain | Choice | Version | Confidence |
|--------|--------|---------|------------|
| Extension Framework | Chrome Manifest V3 | MV3 | **Required** |
| Language | TypeScript | 5.3+ | High |
| Build Tool | Vite | 5.x | High |
| UI Framework | Preact | 10.x | High |
| Styling | Tailwind CSS | 3.x | High |
| Storage | IndexedDB (via Dexie.js) | 4.x | High |
| Charting | Chart.js | 4.x | High |
| Testing | Vitest + Playwright | Latest | High |
| Linting | ESLint + Prettier | Latest | High |

---

## Domain Analysis

### Extension Framework

**Recommendation:** Chrome Extension Manifest V3
**Version:** Manifest V3 (required for Chrome Web Store)

**Why This Choice:**
Manifest V3 is mandatory for new Chrome extensions as of 2024. It provides better security through service workers instead of background pages, declarative APIs, and restricted host permissions.

**Key Constraints:**
- Service workers terminate after 30 seconds of inactivity
- No persistent background scripts
- Must use `chrome.alarms` for periodic operations
- Stricter Content Security Policy

**Required Permissions (Minimal Set):**
```json
{
  "permissions": [
    "storage",
    "alarms",
    "tabs",
    "history",
    "bookmarks",
    "idle"
  ],
  "optional_permissions": [
    "webNavigation"
  ],
  "host_permissions": []
}
```

---

### Language

**Recommendation:** TypeScript
**Version:** 5.3+

**Why This Choice:**
Chrome extension APIs are complex with many overlapping methods. TypeScript provides type safety, better IDE autocomplete, and catches permission/API mismatches at compile time. The `@types/chrome` package provides complete type definitions.

**Alternatives Considered:**

| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| JavaScript | No build step, simpler | No type safety, harder refactoring | Risk of runtime errors in complex message passing |
| ReScript | Excellent type safety | Smaller ecosystem, learning curve | Team familiarity likely lower |

**Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "lib": ["ES2022", "DOM"],
    "types": ["chrome"]
  }
}
```

---

### Build Tool

**Recommendation:** Vite
**Version:** 5.x

**Why This Choice:**
Vite offers fast HMR during development, excellent TypeScript support, and efficient production bundling. The `@crxjs/vite-plugin` provides first-class Chrome extension support with automatic manifest handling.

**Alternatives Considered:**

| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| Webpack | Mature, flexible | Complex config, slower builds | More setup overhead |
| Rollup | Clean output | Less dev tooling | Vite uses Rollup under the hood anyway |
| esbuild | Fastest | Less plugin ecosystem | Vite uses esbuild for dev already |

**Key Dependencies:**
```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "@crxjs/vite-plugin": "^2.0.0-beta.23",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

---

### UI Framework

**Recommendation:** Preact
**Version:** 10.x

**Why This Choice:**
Preact is a 3KB alternative to React with the same API. For a Chrome extension where bundle size matters, Preact provides excellent DX with minimal footprint. Compatible with React ecosystem tools.

**Alternatives Considered:**

| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| React | Largest ecosystem | 40KB+ bundle size | Too heavy for extension popup |
| Vue | Good DX, smaller than React | Different paradigm | React/Preact ecosystem larger |
| Svelte | Smallest runtime | Smaller ecosystem | Less hiring/knowledge pool |
| Vanilla JS | No framework overhead | More code, less maintainable | Complex UI needs component model |

**Usage Pattern:**
```typescript
// Popup component
import { render } from 'preact';
import { App } from './App';

render(<App />, document.getElementById('app')!);
```

---

### Styling

**Recommendation:** Tailwind CSS
**Version:** 3.x

**Why This Choice:**
Tailwind provides utility-first CSS that compiles to minimal output. With PurgeCSS, only used styles are included. Great for consistent design system and responsive layouts.

**Alternatives Considered:**

| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| CSS Modules | Scoped styles | More verbose | More files to manage |
| Styled Components | CSS-in-JS | Runtime overhead | Bundle size concern |
| Plain CSS | No dependencies | Hard to maintain consistency | Larger projects need system |

**Configuration Notes:**
- Use `@tailwindcss/forms` for accessible form styling
- Configure dark mode with `class` strategy
- Set up content paths for extension structure

---

### Storage

**Recommendation:** IndexedDB via Dexie.js
**Version:** Dexie 4.x

**Why This Choice:**
IndexedDB provides virtually unlimited storage (based on disk space) compared to `chrome.storage.local` (10MB). Dexie.js wraps IndexedDB with a clean Promise-based API and supports schema versioning for migrations.

**Alternatives Considered:**

| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| chrome.storage.local | Simple API | 10MB limit | Will fill quickly with history |
| Raw IndexedDB | No dependencies | Complex callback API | DX nightmare |
| sql.js (SQLite) | SQL queries | Large WASM bundle (~1MB) | Overkill for this use case |

**Schema Design:**
```typescript
import Dexie, { Table } from 'dexie';

interface PageVisit {
  id?: number;
  url: string;
  normalizedUrl: string;
  title: string;
  favicon?: string;
  visitedAt: Date;
  duration: number;  // seconds
  isActive: boolean;
  sessionId: string;
  engagement: {
    scrollDepth: number;
    clicks: number;
    bookmarked: boolean;
  };
}

class BrowsingDB extends Dexie {
  visits!: Table<PageVisit>;

  constructor() {
    super('BrowsingHistoryDB');
    this.version(1).stores({
      visits: '++id, url, normalizedUrl, visitedAt, sessionId'
    });
  }
}
```

---

### Charting Library

**Recommendation:** Chart.js
**Version:** 4.x

**Why This Choice:**
Chart.js is lightweight (~60KB gzipped), has built-in accessibility features, supports responsive design, and has a large ecosystem. Version 4 includes tree-shaking for smaller bundles.

**Alternatives Considered:**

| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| D3.js | Most flexible | Steep learning curve, larger | Overkill for standard charts |
| Recharts | React-native | Larger bundle | Preact compatibility issues |
| Apache ECharts | Feature-rich | 400KB+ bundle | Too heavy |
| uPlot | Fastest, smallest | Less chart types | Limited for statistics viz |

**Accessibility Integration:**
```typescript
// Chart.js with accessibility plugin
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Enable accessibility
Chart.defaults.plugins.legend.labels.generateLabels = (chart) => {
  // Custom label generation with ARIA support
};
```

---

### Testing Framework

**Recommendation:** Vitest + Playwright
**Version:** Latest

**Why This Choice:**
Vitest integrates seamlessly with Vite for unit/integration tests. Playwright handles E2E testing with Chrome extension support. Both have excellent TypeScript support.

**Testing Strategy:**
```
tests/
├── unit/           # Vitest - Pure functions, utilities
├── integration/    # Vitest - Component tests with mocked Chrome APIs
└── e2e/            # Playwright - Full extension testing in real Chrome
```

**Chrome API Mocking:**
```typescript
// vitest.setup.ts
import { vi } from 'vitest';

global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    onActivated: { addListener: vi.fn() },
  },
  // ... more mocks
} as unknown as typeof chrome;
```

---

## Integration Notes

### How These Choices Work Together

1. **Vite** builds TypeScript/Preact into optimized bundles
2. **@crxjs/vite-plugin** handles manifest.json generation and HMR for extension development
3. **Preact** renders popup UI and full-page dashboard
4. **Tailwind** provides styling with dark mode support
5. **Dexie.js** abstracts IndexedDB for clean async storage operations
6. **Chart.js** renders visualizations in the dashboard
7. **Vitest** runs unit tests with Chrome API mocks
8. **Playwright** tests the complete extension in real Chrome

### Project Structure Recommendation

```
browsing-tracker/
├── src/
│   ├── background/
│   │   ├── service-worker.ts    # Main background script
│   │   ├── tracker.ts           # History/tab tracking logic
│   │   └── alarms.ts            # Periodic time tracking
│   ├── content/
│   │   └── engagement.ts        # Scroll/click tracking (optional)
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── components/
│   ├── dashboard/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── components/
│   │   └── charts/
│   ├── storage/
│   │   ├── db.ts                # Dexie database definition
│   │   ├── queries.ts           # Data access layer
│   │   └── migrations.ts        # Schema migrations
│   ├── shared/
│   │   ├── types.ts             # Shared TypeScript types
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── manifest.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   └── icons/
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Known Compatibility Notes

- **Preact**: Use `preact/compat` for React library compatibility
- **Chart.js**: Tree-shake unused chart types for smaller bundle
- **Dexie.js**: Works in service workers, but be aware of IndexedDB async nature
- **Tailwind**: Configure content paths to include all TSX files

---

## Development Workflow

### Local Development
```bash
npm run dev        # Start Vite dev server with HMR
# Load unpacked extension from dist/ folder
```

### Testing
```bash
npm run test       # Vitest unit/integration tests
npm run test:e2e   # Playwright E2E tests
```

### Production Build
```bash
npm run build      # Optimized production build
npm run zip        # Create .zip for Chrome Web Store
```

---

## Further Research Needed

| Topic | Why | Priority |
|-------|-----|----------|
| Encryption library | For local data encryption | High |
| i18n approach | Chrome's i18n vs. library | Medium |
| Error reporting | Sentry vs alternatives for extensions | Medium |
| CI/CD pipeline | GitHub Actions for automated builds | Medium |

---

## Human Decisions Required

1. Should we use Preact or full React? (Preact recommended for size)
2. Do we need content script engagement tracking in MVP?
3. Preferred CI/CD platform (GitHub Actions, CircleCI, etc.)?
4. Error reporting service preference (Sentry, Bugsnag, none)?

---

**Research Complete:** 2025-12-06
**Ready for Phase Planning:** Yes
