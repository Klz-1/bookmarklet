# Generate Project Status Report

You are generating a comprehensive **Status Report** for the Bourne harness.

## Your Task

### Step 1: Gather Information

Read all relevant files:

1. **Master Dashboard:** `docs/PROGRESS.md`
2. **Phase Plan:** `.coordination/PHASE-PLAN.md`
3. **All Phase Status Files:**
   - For each phase worktree, read `.phase-status/PROGRESS.md`
   - Check for `BLOCKERS.md` files
   - Check for `COMPLETED.md` files

4. **Recent Git Activity:**
   ```bash
   git log --all --oneline -20
   git branch -a
   git worktree list
   ```

### Step 2: Calculate Metrics

**Progress Metrics:**
- Total phases: [N]
- Completed phases: [X]
- In progress: [Y]
- Not started: [Z]
- Overall progress: [X/N] = [%]

**Quality Metrics:**
- Average review score: [X.X/10]
- Test pass rate: [%]
- Phases with blockers: [N]

**Velocity (if applicable):**
- Tasks completed today: [N]
- Phases completed this session: [N]

### Step 3: Identify Issues

**Blockers:**
- Read all BLOCKERS.md files
- Categorize by severity

**Stale Phases:**
- Check last update timestamps
- Flag phases with no recent activity

**Integration Risks:**
- Check for merge conflicts
- Identify phases that need coordination

### Step 4: Generate Report

Update `docs/PROGRESS.md`:

```markdown
# [Project Name] - Master Progress Dashboard

**Last Updated:** [Date Time]
**Project Status:** [Summary - On Track / At Risk / Blocked]

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Phases | [N] |
| Completed | [X] |
| In Progress | [Y] |
| Not Started | [Z] |
| Overall Progress | [%] |
| Avg Quality Score | [X.X/10] |

---

## Phase Overview

| Phase | Name | Status | Progress | Score | Notes |
|-------|------|--------|----------|-------|-------|
| 1 | [Name] | [Status] | [X/Y] | [X/10] | [Note] |
| 2 | [Name] | [Status] | [X/Y] | - | [Note] |
...

**Legend:**
- Complete: Phase merged to develop
- Active: Currently being implemented
- Blocked: Has unresolved blockers
- Pending: Not yet started
- Review: Awaiting code review

---

## Currently Active

### Phase [N]: [Name]
**Progress:** [X/Y] tasks
**Last Update:** [Time]
**Current Task:** [Description]
**Blockers:** [None / Description]

[Repeat for each active phase]

---

## Blockers

### Critical
[List or "None"]

### Medium
[List or "None"]

### Low
[List or "None"]

---

## Recent Activity

**Last 24 Hours:**
- [Event 1]
- [Event 2]

**Recent Commits:**
```
[git log output]
```

---

## Next Steps

1. [Immediate action needed]
2. [Next phase to start]
3. [Review needed]

---

## Decisions Pending

[List any questions awaiting human input, or "None"]

---

## Session Notes

**Current Session Started:** [Time]
**Focus This Session:** [What's being worked on]

---

**To Resume Later:**
1. Read this file
2. Check active phase status files
3. Continue from [specific point]
```

### Step 5: Present Summary

Output a concise summary to the user:

```
PROJECT STATUS: [Project Name]

Progress: [X/N] phases complete ([%])
Quality: [X.X/10] average score

ACTIVE:
- Phase [N]: [X/Y] tasks, [status note]

BLOCKERS:
- [List or "None"]

NEXT:
- [What needs to happen next]
```