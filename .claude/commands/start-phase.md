# Start Phase Implementation

You are initiating a **Phase Implementation** in the Bourne harness.

## Arguments

`$ARGUMENTS` should be the phase number (e.g., "1", "2", etc.)

## Your Task

### Step 1: Read Phase Plan

Read `.coordination/PHASE-PLAN.md` to understand:
- This phase's tasks
- Dependencies (what must be ready)
- Quality gates required
- What this phase enables

### Step 2: Verify Prerequisites

Check that prerequisite phases are complete:
- Read their `.phase-status/COMPLETED.md` files
- Verify merges to develop completed
- Confirm integration points are working

### Step 3: Set Up Worktree

If not already created:

```bash
# From main repo
git worktree add ../[project]-phase-[N] -b feature/phase-[N]-[name]

# Create communication directory
mkdir -p ../[project]-phase-[N]/.phase-status
```

### Step 4: Create MASTER-NOTES.md

Create `.phase-status/MASTER-NOTES.md` in the worktree:

```markdown
# Notes from Master Coordinator - Phase [N]

**Last Updated:** [Date]

## Welcome to Phase [N]: [Name]

[Overview of what this phase builds]

---

## What You're Inheriting

**From Previous Phases:**
- Phase 1: [What's available - auth, database, etc.]
- Phase N-1: [What was just completed]

**Key Integration Points:**
```[language]
// Example code showing how to use inherited services
```

---

## MANDATORY: Test Before Commit

**READ:** .coordination/COMMIT-WORKFLOW.md

**10-Step Process - NO EXCEPTIONS:**
1. Implement
2. Build (0 errors)
3. Create tests
4. Run tests (100% pass)
5. Manual test
6. Verify database
7. Security check (no secrets)
8. Commit with test evidence
9. Push
10. Create COMPLETED.md

---

## Your Tasks ([X] Total)

1. [ ] [Task 1 description]
2. [ ] [Task 2 description]
3. [ ] [Task 3 description]
...

---

## Quality Gates for This Phase

Before marking complete, verify:
- [ ] [Specific gate 1]
- [ ] [Specific gate 2]
- [ ] [Specific gate 3]

---

## CRITICAL: What You Must NEVER Do

### NEVER SKIP TESTING
Even if context is high or feeling rushed - testing is MANDATORY.

### NEVER MERGE TO DEVELOP
You do NOT have permission to merge. Create COMPLETED.md and WAIT for Master review.

### NEVER COMMIT WITHOUT 100% TESTS PASSING
No "will test later". No "mostly passing". No shortcuts.

---

## Communication

- Update `.phase-status/PROGRESS.md` as you work
- Create `.phase-status/BLOCKERS.md` if stuck
- Create `.phase-status/QUESTIONS.md` for clarifications
- Create `.phase-status/COMPLETED.md` when all tests pass

I'll check every 10-30 minutes.

---

## References

- Enhanced PRD: `.coordination/ENHANCED-PRD.md`
- Tech Stack: `.coordination/TECH-STACK.md`
- Phase Plan: `.coordination/PHASE-PLAN.md`
- Decisions: `.coordination/DECISIONS.md`
```

### Step 5: Spawn Phase Subagent

Use the Task tool to spawn a subagent for this phase:

```
Launch a general-purpose agent with this prompt:

"You are a Phase [N] implementation agent for [Project Name].

Your worktree: ../[project]-phase-[N]
Your branch: feature/phase-[N]-[name]

FIRST: Read .phase-status/MASTER-NOTES.md for your complete instructions.

Your tasks are:
1. [Task 1]
2. [Task 2]
...

CRITICAL RULES:
- Test EVERYTHING before committing
- NEVER merge to develop
- Update PROGRESS.md as you work
- Create COMPLETED.md when done with test evidence

Begin implementation now. Start with Task 1."
```

### Step 6: Update Dashboard

Update `docs/PROGRESS.md` to reflect the new active phase.

### Step 7: Check for Parallel Opportunities

If other phases can run in parallel, spawn additional phase agents simultaneously.