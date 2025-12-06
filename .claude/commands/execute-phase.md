# Execute Phase

You are executing **Phase $ARGUMENTS** of the implementation.

## Context

The orchestrator daemon has triggered this command. Your job is to implement this phase completely, following the plan and quality gates.

## Instructions

### 1. Read Phase Plan

Read `.coordination/PHASE-PLAN.md` and find Phase $ARGUMENTS.

Note:
- The specific tasks for this phase
- The dependencies (verify they're complete)
- The quality gate requirements

### 2. Check Dependencies

Verify that prerequisite phases are complete:
- Check `.coordination/phases/phase-N/status.json` for each dependency
- If a dependency is not complete, report a blocker

### 3. Create Phase Directory

Create the phase tracking directory:
```
.coordination/phases/phase-$ARGUMENTS/
├── status.json      # Structured status for daemon
├── PROGRESS.md      # Human-readable progress
└── output/          # Phase deliverables
```

Initialize `status.json`:
```json
{
  "phase": $ARGUMENTS,
  "status": "in_progress",
  "started_at": "[timestamp]",
  "tasks": [
    {"id": 1, "name": "Task 1", "status": "pending"},
    {"id": 2, "name": "Task 2", "status": "pending"}
  ],
  "progress": 0,
  "blockers": [],
  "questions": []
}
```

### 4. Execute Tasks

For each task in the phase:

1. **Update status.json** - Mark task as "in_progress"
2. **Implement the task** - Write the code, create files
3. **Test the task** - Verify it works
4. **Update status.json** - Mark task as "complete", update progress %
5. **Update PROGRESS.md** - Document what was done

If you encounter a blocker:
- Add to `status.json` blockers array
- Create `.coordination/phases/phase-$ARGUMENTS/BLOCKERS.md`
- The daemon will notify the user

If you have questions:
- Add to `status.json` questions array
- Create `.coordination/phases/phase-$ARGUMENTS/QUESTIONS.md`
- The daemon will route to the user

### 5. Run Quality Gate

When all tasks are complete:

1. **Verify deliverables** - Check that outputs exist and are correct
2. **Run tests** - Execute relevant tests
3. **Self-review** - Check code quality

### 6. Signal Completion

When the phase is complete and quality gate passes:

1. Update `status.json`:
```json
{
  "phase": $ARGUMENTS,
  "status": "complete",
  "started_at": "[timestamp]",
  "completed_at": "[timestamp]",
  "tasks": [...all complete...],
  "progress": 100,
  "deliverables": ["list of files/features created"],
  "quality_gate": {
    "tests_passed": true,
    "review_notes": "Self-review notes"
  }
}
```

2. Create `.coordination/phases/phase-$ARGUMENTS/COMPLETED.md`:
```markdown
# Phase $ARGUMENTS Complete

## Summary
[What was accomplished]

## Deliverables
- File 1: [description]
- File 2: [description]

## Tests
- [x] Test 1 passed
- [x] Test 2 passed

## Notes for Reviewer
[Any important context]
```

The daemon will detect COMPLETED.md and trigger the review phase.

## Important

- Update PROGRESS.md frequently (daemon and UI watch this)
- Don't skip quality gates
- Report blockers immediately (don't get stuck silently)
- Keep tasks focused and testable
- Commit your work as you go
