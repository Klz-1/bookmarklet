# Continue From Where You Left Off

You are resuming work on a project that was previously started with the Bourne harness.

## Your Task

### Step 1: Read Current State

Check the workflow state:

```bash
cat .morpheus/state.json
```

Also read:
1. `.coordination/ENHANCED-PRD.md` (if exists)
2. `.coordination/TECH-STACK.md` (if exists)
3. `.coordination/PHASE-PLAN.md` (if exists)
4. `.coordination/DECISIONS.md` (if exists)
5. `docs/PROGRESS.md` (if exists)

### Step 2: Determine Resume Point

Based on the state, determine where to continue:

| State | Action |
|-------|--------|
| `UNINITIALIZED` | Run `/start` - begin from scratch |
| `INITIALIZED` | PRD exists, run `/enhance-prd` |
| `ENHANCING_PRD` | Check if ENHANCED-PRD.md exists, if not complete it |
| `RESEARCHING_TECH_STACK` | Check if TECH-STACK.md exists, if not complete it |
| `PLANNING_PHASES` | Check if PHASE-PLAN.md exists, if not complete it |
| `AWAITING_DECISIONS` | Present questions from CLARIFICATION-QUEUE.md to user |
| `EXECUTING` | Continue with current phase from PHASE-PLAN.md |
| `REVIEWING_PHASE` | Complete the review for current phase |
| `FIXING_PHASE` | Address review feedback |
| `BLOCKED` | Read BLOCKERS.md and resolve |
| `COMPLETED` | Project is done! Generate final report |

### Step 3: Show Summary

Output a brief summary:

```
RESUMING PROJECT: [name from state.json]

Last State: [current_state]
Current Phase: [N] of [total]
Last Activity: [timestamp]

RESUMING FROM:
[Description of what will happen next]

Press Enter to continue or type 'status' for full report...
```

### Step 4: Execute Resume Action

Based on the state determined in Step 2, automatically execute the appropriate action:

- If `EXECUTING` state with a current phase, run: `/execute-phase [N]`
- If `REVIEWING_PHASE`, run: `/review-phase [N]`
- If mid-workflow, complete the current step

### Step 5: Continue Autonomously

Once resumed, continue the workflow autonomously:
- Complete current phase
- Run quality gates
- Progress to next phase
- Only stop for blockers or human decisions

---

**Note:** If state.json is missing or corrupted, fall back to reading coordination files directly and inferring the current state from what exists.
