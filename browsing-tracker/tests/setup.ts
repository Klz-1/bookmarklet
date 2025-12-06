import { vi } from 'vitest'
import 'fake-indexeddb/auto'

// Mock Chrome Extension APIs
const mockStorage: Record<string, unknown> = {}

const mockChrome = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: mockStorage[keys] })
        }
        const result: Record<string, unknown> = {}
        for (const key of keys) {
          result[key] = mockStorage[key]
        }
        return Promise.resolve(result)
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(mockStorage, items)
        return Promise.resolve()
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keysArray = typeof keys === 'string' ? [keys] : keys
        for (const key of keysArray) {
          delete mockStorage[key]
        }
        return Promise.resolve()
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
        return Promise.resolve()
      }),
    },
    sync: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
    },
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([])),
    get: vi.fn((tabId: number) =>
      Promise.resolve({
        id: tabId,
        url: 'https://example.com',
        title: 'Example',
        active: true,
      })
    ),
    create: vi.fn(() => Promise.resolve({ id: 1 })),
    onActivated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  windows: {
    WINDOW_ID_NONE: -1,
    onFocusChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(() => Promise.resolve()),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onStartup: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  },
  alarms: {
    create: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
    get: vi.fn(() => Promise.resolve(null)),
    getAll: vi.fn(() => Promise.resolve([])),
    onAlarm: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  bookmarks: {
    onCreated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  idle: {
    onStateChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    queryState: vi.fn(() => Promise.resolve('active')),
  },
  history: {
    search: vi.fn(() => Promise.resolve([])),
    getVisits: vi.fn(() => Promise.resolve([])),
  },
}

// @ts-expect-error - Mocking chrome global
globalThis.chrome = mockChrome

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
})

// Export for use in tests
export { mockChrome, mockStorage }
