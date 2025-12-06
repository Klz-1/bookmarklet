# Clarification Queue: Browsing History Tracker

**Project:** Browsing History Tracker Chrome Extension
**Generated:** 2025-12-06
**Status:** Awaiting Responses

---

## Critical Decisions (Blocking)

These decisions affect core architecture and must be resolved before Phase 1 begins.

### 1. Data Storage Strategy

**Question:** Should the extension support cloud sync, or be strictly local-only?

| Option | Pros | Cons |
|--------|------|------|
| **Local-only** | Maximum privacy, simpler architecture, no server costs | No cross-device sync, data loss if browser/device fails |
| **Optional cloud sync** | Cross-device access, backup | Requires backend infrastructure, encryption complexity, privacy concerns |

**Recommendation:** Start local-only for MVP, add encrypted sync as v2 feature.

**Impact:** Determines need for backend infrastructure, encryption library selection, and compliance scope.

---

### 2. Time Tracking Granularity

**Question:** What level of time tracking accuracy is acceptable?

| Option | Implementation | Trade-offs |
|--------|----------------|------------|
| **1-minute intervals** | Use `chrome.alarms` (minimum 1 min) | Simple, battery-friendly, less precise |
| **30-second intervals** | Workaround with multiple alarms | More complex, slightly higher resource use |
| **Real-time** | Content script with visibility API | Most accurate, highest resource use, requires `<all_urls>` permission |

**Recommendation:** 1-minute intervals for MVP, with visibility-based active detection.

**Impact:** Affects permission scope, battery impact, and code complexity.

---

### 3. Incognito Mode Handling

**Question:** Should incognito browsing be trackable (with user permission)?

| Option | Behavior |
|--------|----------|
| **Always excluded** | Never track incognito, simplest for privacy |
| **User choice** | Checkbox in settings to enable incognito tracking |

**Recommendation:** Always excluded in MVP. Many users expect incognito to be private.

**Impact:** Affects permission declarations and privacy policy wording.

---

### 4. Target Browser(s)

**Question:** Should the MVP support only Chrome, or multiple browsers?

| Option | Development Effort | Considerations |
|--------|-------------------|----------------|
| **Chrome-only** | Lower | Fastest to market, single manifest format |
| **Chrome + Firefox** | Medium | Firefox uses different manifest format, WebExtension API |
| **Chrome + Firefox + Edge** | Higher | Edge uses Chromium, minimal extra work after Firefox |

**Recommendation:** Chrome-only MVP, with architecture that allows Firefox port later.

**Impact:** Affects project structure, testing matrix, and store submission process.

---

## Important Decisions (Phase 1-2)

These can be decided during early development but should be resolved soon.

### 5. Engagement Tracking Scope

**Question:** What engagement metrics should be tracked in MVP?

| Metric | Implementation | Privacy Impact |
|--------|----------------|----------------|
| **Page visits & time** | Background script only | Low - no content scripts needed |
| **+ Bookmark events** | Background script | Low |
| **+ Scroll depth** | Content script required | Medium - needs `<all_urls>` |
| **+ Click tracking** | Content script required | Higher |
| **+ Share detection** | Complex, often impossible | Highest - may not be feasible |

**Recommendation:** Page visits, time, and bookmarks for MVP. Scroll depth as optional v1.1 feature.

**Impact:** Determines need for content scripts and permission scope.

---

### 6. Data Retention Policy

**Question:** What should the default data retention period be?

| Option | Storage Impact | User Expectation |
|--------|---------------|------------------|
| **30 days** | Minimal storage use | May feel too short for reflection |
| **90 days** | Moderate | Good balance |
| **1 year** | Larger storage | Common for analytics |
| **Forever** | Unbounded growth | Requires manual cleanup |
| **User-configurable** | Flexible | More complex UI |

**Recommendation:** User-configurable with 90-day default and auto-cleanup option.

**Impact:** Affects storage design, cleanup logic, and user settings UI.

---

### 7. UI Framework Confirmation

**Question:** Confirm UI framework choice - Preact or React?

| Option | Bundle Size | Ecosystem | Learning Curve |
|--------|-------------|-----------|----------------|
| **Preact** | ~3KB | Smaller, but React-compatible | Minimal if know React |
| **React** | ~40KB | Largest | Standard |

**Recommendation:** Preact (already proposed in tech stack).

**Impact:** Affects bundle size and component library choices.

---

## Nice-to-Know (Can Defer)

These decisions can be made during later phases.

### 8. Monetization Strategy

**Question:** Is monetization planned? This affects analytics and telemetry decisions.

| Option | Implications |
|--------|-------------|
| **Free forever** | No analytics needed, maximum privacy |
| **Freemium** | Need usage analytics for conversion optimization |
| **One-time purchase** | Payment integration needed |
| **Subscription** | Requires account system, backend |

**Default assumption:** Free with no analytics unless specified otherwise.

---

### 9. Error Reporting Service

**Question:** Should we integrate error reporting (Sentry, etc.)?

| Option | Pros | Cons |
|--------|------|------|
| **None** | Maximum privacy | Harder to debug production issues |
| **Opt-in Sentry** | User chooses to share crash reports | Additional dependency, privacy disclosure |
| **Local-only logging** | Export debug logs on request | Manual user involvement |

**Recommendation:** Local logging with export capability; no external service.

---

### 10. Internationalization Scope

**Question:** Which languages should be supported?

| Option | Effort |
|--------|--------|
| **English only** | Baseline |
| **+ Major European** | Medium (DE, FR, ES) |
| **+ Asian languages** | Higher (ZH, JA, KO) |
| **+ RTL languages** | Highest (AR, HE) - requires layout changes |

**Recommendation:** English MVP, architecture that supports i18n for future.

---

## Responses Received

**Date:** 2025-12-06

### Critical Decisions (Resolved)

| # | Decision | Response | Notes |
|---|----------|----------|-------|
| 1 | Data Storage | **Local-only** | Cloud sync deferred to post-MVP |
| 2 | Time Granularity | **1-minute** | Using chrome.alarms API |
| 3 | Incognito Mode | **Always excluded** | Maximum privacy |
| 4 | Target Browser | **Chrome-only** | Firefox/Edge deferred to post-MVP |

### Deferred Decisions (Using Defaults)

| # | Decision | Default |
|---|----------|---------|
| 5 | Engagement Scope | Basic (visits, time, bookmarks) |
| 6 | Data Retention | User-configurable, 90-day default |
| 7 | UI Framework | Preact |

---

**Questions Generated:** 2025-12-06
**Responses Received:** 2025-12-06
**Status:** All critical decisions resolved
**Blocks:** None - Ready for Phase 1
