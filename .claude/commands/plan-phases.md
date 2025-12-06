# Generate Phase Plan

You are running the **Phase Planning** phase of the Bourne harness.

## Input

Read:
- `.coordination/ENHANCED-PRD.md` - The enhanced requirements
- `.coordination/TECH-STACK.md` - The chosen technologies

## Your Task

### Step 1: Feature Extraction

Extract all features/requirements from the enhanced PRD and categorize:

1. **Core Features** (MVP must-haves)
2. **Enhanced Features** (quality improvements)
3. **Polish Features** (nice-to-haves)

### Step 2: Dependency Analysis

For each feature, identify:
- What it depends on (must be built first)
- What depends on it (blocks other features)
- External dependencies (APIs, services)

Create a dependency graph mentally or document it.

### Step 3: Phase Clustering

Group features into phases following these rules:

1. **5-10 tasks per phase** (optimal for subagent context)
2. **Phase 1 is always Foundation** (infrastructure, auth, database schema)
3. **Group by domain/feature area** when possible
4. **Minimize cross-phase dependencies**
5. **Put risky/uncertain items early** (fail fast)

### Step 4: Parallel Identification

Identify which phases can run in parallel:
- No shared dependencies
- Different domain areas
- No integration conflicts

### Step 5: Quality Gates Per Phase

For each phase, define specific quality gates:
- Required tests
- Integration verification
- Security checks
- Performance benchmarks (if applicable)

## Output Format

Create `.coordination/PHASE-PLAN.md`:

```markdown
# Phase Plan

**Project:** [Name]
**Generated:** [Date]
**Total Phases:** [N]
**Estimated Parallel Groups:** [M]

---

## Dependency Overview

```
Phase 1 (Foundation)
    ├── Phase 2 (Core Feature A)
    ├── Phase 3 (Core Feature B) ← Can parallel with Phase 2
    └── Phase 4 (Integration A+B)
            ├── Phase 5 (Enhanced Feature)
            └── Phase 6 (Polish)
```

---

## Phase Details

### Phase 1: Foundation

**Worktree:** `../[project]-phase-1`
**Branch:** `feature/phase-1-foundation`
**Can Parallel With:** None (must complete first)

**Tasks:**
1. [ ] Initialize project with chosen stack
2. [ ] Set up database schema
3. [ ] Implement authentication
4. [ ] Create base API structure
5. [ ] Set up testing infrastructure
6. [ ] Configure CI/CD basics

**Quality Gates:**
- [ ] `npm run build` passes
- [ ] Database migrations run
- [ ] Auth flow works end-to-end
- [ ] 100% test pass rate

**Dependencies:**
- Inputs: Tech stack choices
- Outputs: Auth service, DB connection, base API

---

### Phase 2: [Feature Name]

**Worktree:** `../[project]-phase-2`
**Branch:** `feature/phase-2-[name]`
**Can Parallel With:** Phase 3

**Tasks:**
1. [ ] Task description
2. [ ] Task description
...

**Quality Gates:**
- [ ] Specific gate 1
- [ ] Specific gate 2
...

**Dependencies:**
- Requires: Phase 1 (auth, database)
- Enables: Phase 4

---

[Repeat for each phase]

---

## Parallel Execution Strategy

**Group A (Sequential):**
- Phase 1 (Foundation) - MUST complete first

**Group B (Parallel):**
- Phase 2 + Phase 3 can run simultaneously
- Combined estimate: [complexity note]

**Group C (Sequential after B):**
- Phase 4 (Integration) - needs 2 + 3

**Group D (Parallel):**
- Phase 5 + Phase 6 can run simultaneously

---

## Timeline Overview

| Phase | Depends On | Can Parallel | Complexity |
|-------|------------|--------------|------------|
| 1 | - | No | Medium |
| 2 | 1 | Yes (with 3) | High |
| 3 | 1 | Yes (with 2) | Medium |
| 4 | 2, 3 | No | Medium |
| 5 | 4 | Yes (with 6) | Low |
| 6 | 4 | Yes (with 5) | Low |

---

## Risk Assessment

**High Risk Phases:**
- [Phase X]: [Why risky, mitigation]

**Integration Risk Points:**
- Between Phase X and Y: [Concern]

---

## Next Steps

1. Set up git worktrees for all phases
2. Create MASTER-NOTES.md for Phase 1
3. Begin Phase 1 implementation
4. Prepare Phase 2 & 3 for parallel start after Phase 1
```

### Step 6: Present Plan

Present the phase plan to the user for approval. Highlight:
- Total phases
- Parallel opportunities
- Risk areas
- Any questions about scope/priority