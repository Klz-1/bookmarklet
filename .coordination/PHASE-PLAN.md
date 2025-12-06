# Phase Plan: Browsing History Tracker Chrome Extension

**Project:** Browsing History Tracker
**Generated:** 2025-12-06
**Based on:** `.coordination/ENHANCED-PRD.md` and `.coordination/TECH-STACK.md`

---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation          │ Phase 2: Core Features                  │
│ (Project Setup & Storage)    │ (Tracking & Basic UI)                   │
│ [5 tasks]                    │ [7 tasks]                               │
│ ────────────────────────────►│ ──────────────────────────────────────► │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Visualization       │ Phase 4: Polish & Compliance            │
│ (Dashboard & Charts)         │ (A11y, Privacy, Testing)                │
│ [6 tasks]                    │ [8 tasks]                               │
│ ────────────────────────────►│ ──────────────────────────────────────► │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Launch Prep                                                    │
│ (Store Submission & Documentation)                                      │
│ [6 tasks]                                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (Project Setup & Storage)

**Goal:** Establish project structure, build pipeline, and storage layer

**Dependencies:** None (starting phase)

**Quality Gate:**
- [ ] Project builds successfully
- [ ] Storage layer tested with sample data
- [ ] Extension loads in Chrome without errors

### Tasks

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 1.1 | Initialize Vite project | Create project with TypeScript, Preact, Tailwind | None |
| 1.2 | Configure Chrome extension build | Set up @crxjs/vite-plugin, manifest.json | 1.1 |
| 1.3 | Implement IndexedDB schema | Create Dexie database with PageVisit model | 1.1 |
| 1.4 | Create storage service layer | CRUD operations, queries, data access | 1.3 |
| 1.5 | Set up testing infrastructure | Vitest config, Chrome API mocks, first tests | 1.1 |

**Deliverables:**
- Working build pipeline with HMR
- Extension loads in Chrome (empty popup)
- Storage layer with unit tests
- CI-ready test configuration

---

## Phase 2: Core Features (Tracking & Basic UI)

**Goal:** Implement history capture, time tracking, and basic popup UI

**Dependencies:** Phase 1 complete

**Quality Gate:**
- [ ] History capture working for all tabs
- [ ] Time tracking accurate within 1-minute granularity
- [ ] Popup displays current session data
- [ ] Pause/resume functionality working

### Tasks

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 2.1 | Implement service worker lifecycle | Handle activation, termination, alarms | 1.2 |
| 2.2 | Create history tracking module | Capture URL, title, favicon on navigation | 2.1, 1.4 |
| 2.3 | Implement time tracking | Use alarms API, idle detection, visibility API | 2.1 |
| 2.4 | Detect bookmark events | Listen to chrome.bookmarks API | 2.1 |
| 2.5 | Build popup skeleton | Basic Preact popup with today's summary | 1.2 |
| 2.6 | Add pause/resume toggle | Global tracking on/off state | 2.2, 2.5 |
| 2.7 | Implement sensitive site filtering | Configurable domain exclusion list | 2.2 |

**Deliverables:**
- Background tracking fully functional
- Popup shows today's stats (pages visited, time spent)
- User can pause/resume tracking
- Sensitive sites excluded from tracking

---

## Phase 3: Visualization (Dashboard & Charts)

**Goal:** Build full-page dashboard with statistics and visualizations

**Dependencies:** Phase 2 complete

**Quality Gate:**
- [ ] Dashboard loads within 2 seconds
- [ ] Charts render correctly with real data
- [ ] Data filtering works (date range, domain)
- [ ] Export functionality tested

### Tasks

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 3.1 | Create dashboard page structure | HTML entry point, routing, layout | 1.2 |
| 3.2 | Build statistics summary cards | Total time, pages, top domains | 3.1, 1.4 |
| 3.3 | Implement time-by-domain chart | Bar/pie chart with Chart.js | 3.1 |
| 3.4 | Create browsing timeline | Daily/hourly activity heatmap | 3.1 |
| 3.5 | Add date range filtering | Filter data by custom date ranges | 3.2, 3.3, 3.4 |
| 3.6 | Implement data export | Export to JSON/CSV formats | 1.4 |

**Deliverables:**
- Full-page dashboard accessible from popup
- 4+ visualization types
- Date range filtering
- JSON/CSV export functionality

---

## Phase 4: Polish & Compliance (A11y, Privacy, Testing)

**Goal:** Ensure accessibility, privacy compliance, and comprehensive testing

**Dependencies:** Phase 3 complete
**Can run partially in parallel with Phase 3 (tasks 4.1-4.3)**

**Quality Gate:**
- [ ] WCAG AA compliance validated
- [ ] Privacy policy approved
- [ ] Keyboard navigation complete
- [ ] 80%+ test coverage on core modules

### Tasks

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 4.1 | Implement keyboard navigation | Full keyboard accessibility for all UI | 2.5, 3.1 |
| 4.2 | Add ARIA labels and roles | Screen reader support | 2.5, 3.1 |
| 4.3 | Create accessible chart alternatives | Data tables, text summaries | 3.3, 3.4 |
| 4.4 | Implement dark mode | System preference detection, toggle | 2.5, 3.1 |
| 4.5 | Add data deletion functionality | Delete by date range, domain, or all | 1.4 |
| 4.6 | Create consent/onboarding flow | First-run experience with privacy info | 2.5 |
| 4.7 | Write comprehensive tests | Unit, integration, E2E coverage | All prior |
| 4.8 | Privacy policy and compliance docs | GDPR/CCPA compliant documentation | None |

**Deliverables:**
- WCAG AA accessible interface
- Complete keyboard navigation
- Dark mode support
- User consent flow
- Data deletion capability
- Test coverage report
- Privacy policy document

---

## Phase 5: Launch Prep (Store Submission & Documentation)

**Goal:** Prepare for Chrome Web Store submission

**Dependencies:** Phase 4 complete

**Quality Gate:**
- [ ] All store assets created
- [ ] Extension passes Chrome Web Store review
- [ ] Documentation complete
- [ ] Production build optimized

### Tasks

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 5.1 | Create store assets | Icons (128x128), screenshots, promo tiles | 3.1 |
| 5.2 | Write store listing | Description, feature list, privacy justification | 4.8 |
| 5.3 | Production build optimization | Bundle analysis, tree-shaking, minification | All prior |
| 5.4 | Security review | Permission audit, code review, vulnerability scan | All prior |
| 5.5 | Create user documentation | README, FAQ, troubleshooting guide | All prior |
| 5.6 | Submit to Chrome Web Store | Complete submission process | 5.1-5.5 |

**Deliverables:**
- Store-ready extension package
- Promotional assets
- User documentation
- Submitted to Chrome Web Store

---

## Parallel Execution Opportunities

```
Phase 1 ─────────────────────►
                              │
                              ▼
Phase 2 ─────────────────────────────────────────►
                              │                   │
                    ┌─────────┴───────┐           │
                    ▼                 ▼           ▼
              Phase 4.1-4.3     Phase 3 ─────────►
              (A11y prep)             │           │
                    │                 │           │
                    └────────┬────────┘           │
                             ▼                    │
                       Phase 4.4-4.8 ─────────────►
                                                  │
                                                  ▼
                                            Phase 5 ───►
```

**Maximum Parallelism:**
- Tasks 4.1-4.3 (accessibility) can start during Phase 3
- Task 4.8 (privacy docs) can start anytime
- Multiple developers can work on different phases simultaneously

---

## Risk Mitigation

| Risk | Mitigation | Contingency |
|------|------------|-------------|
| MV3 service worker limitations | Early spike on alarm-based tracking | Implement simpler polling approach |
| IndexedDB performance with large datasets | Implement pagination early | Add data archival feature |
| Chrome Web Store rejection | Follow all guidelines strictly | Have revision plan ready |
| Time tracking accuracy | Define clear "active time" rules | Document limitations to users |
| Accessibility complexity | Start a11y work early in Phase 4 | Phased accessibility release |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Extension load time | < 100ms | Chrome DevTools |
| Dashboard render time | < 2s | Performance API |
| Bundle size | < 500KB total | Build output |
| Test coverage | > 80% core modules | Coverage report |
| Accessibility | WCAG AA pass | axe-core audit |
| Store rating | > 4.0 stars | Chrome Web Store |

---

## Phase Dependencies Diagram

```
[1.1] ──┬──► [1.2] ──┬──► [2.1] ──┬──► [2.2] ──► [2.7]
        │            │            │
        ├──► [1.3] ──┤            ├──► [2.3]
        │            │            │
        └──► [1.5]   └──► [1.4] ──┼──► [2.4]
                                  │
                                  └──► [2.5] ──► [2.6]
                                         │
                                         ▼
                              [3.1] ──┬──► [3.2] ──┐
                                      ├──► [3.3] ──┼──► [3.5]
                                      ├──► [3.4] ──┘
                                      └──► [3.6]
                                         │
                                         ▼
                              [4.1-4.8] ──► [5.1-5.6]
```

---

**Plan Complete:** 2025-12-06
**Total Tasks:** 32
**Estimated Phases:** 5
**Ready for Implementation:** Pending clarification responses
