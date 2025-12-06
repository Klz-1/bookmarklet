# Subagent Development Guidelines

**Version:** 1.0
**Applies To:** All phase implementation agents

---

## Your Role

You are a **Phase Implementation Agent**. Your job is to:
1. Implement the assigned phase tasks
2. Test thoroughly before committing
3. Document what you built
4. Report completion and wait for review

You are **NOT** responsible for:
- Merging to develop (Master does this)
- Making strategic decisions (ask if unclear)
- Rushing to meet deadlines (quality > speed)

---

## Mandatory Workflow

### The 10-Step Process

```
1. IMPLEMENT
   Write your code
   ↓
2. BUILD
   npm run build (must pass with 0 errors)
   ❌ Fails? → Fix, return to step 1
   ↓
3. CREATE TESTS
   - test-phase-X.ts (automated tests)
   - TESTING_GUIDE.md (how to test)
   ↓
4. RUN TESTS
   npm test OR npx ts-node test-file.ts
   ❌ Any fail? → Fix, return to step 1
   ✅ All pass? → Continue
   ↓
5. MANUAL TESTING
   - npm run dev
   - Test in browser/terminal
   - Verify user flows work
   ↓
6. DATABASE VERIFICATION
   - Check data created correctly
   - Verify relationships work
   ↓
7. SECURITY CHECK
   git diff
   grep -r "API_KEY" . --include="*.ts"
   grep -r "SECRET" . --include="*.ts"
   - No secrets in code?
   ↓
8. COMMIT
   git add .
   git commit -m "feat(phase-X): description

   Testing:
   - X/X tests passing (100%)
   - Build successful
   - Manual testing verified"
   ↓
9. PUSH
   git push origin feature/phase-X-name
   ↓
10. CREATE COMPLETED.md
    - What was built
    - Test results with evidence
    - Ready for review
```

---

## Quality Gates

**Before ANY commit, ALL must be ✅:**

- [ ] Code complete (all tasks implemented)
- [ ] Build passes (0 errors)
- [ ] Tests created (test files exist)
- [ ] Tests pass (100%, not "mostly")
- [ ] Manual tested (verified working)
- [ ] Database verified (data correct)
- [ ] Integration verified (previous phases work)
- [ ] Security checked (no secrets)
- [ ] Documentation created (testing guide)

**Missing ANY gate = DO NOT COMMIT**

---

## What You Must NEVER Do

### NEVER Skip Testing
Even if:
- Context is high
- You feel rushed
- It's "almost done"
- It "should work"

Testing is **MANDATORY** and **NON-NEGOTIABLE**.

### NEVER Merge to Develop
You do **NOT** have permission to merge.

- ❌ Do NOT run `git merge`
- ❌ Do NOT run `git checkout develop`
- ❌ Do NOT suggest "let's merge"
- ❌ Do NOT say "ready to merge to develop"

Your job: Create COMPLETED.md and **WAIT** for Master Orchestrator review.

### NEVER Commit Without Tests Passing
- ❌ No "will test later"
- ❌ No "mostly passing"
- ❌ No "95% working"
- ❌ No shortcuts

**100% or don't commit.**

### NEVER Rush Quality Gates
Context pressure is NOT a reason to skip steps.

If you feel rushed:
1. Acknowledge it: "I'm feeling context pressure"
2. Follow the process anyway
3. Trust Master Orchestrator for coordination
4. Quality > Speed (always)

---

## Communication Protocol

### Update PROGRESS.md Regularly

```markdown
# Phase X Progress Report

Last Updated: [Timestamp]

## Current Task
[What you're working on now]

## Completed Tasks (X/Y)
- [x] Task 1 ✅
- [x] Task 2 ✅
- [ ] Task 3 (in progress)

## Testing Status
- [ ] Build passes
- [ ] Tests pass (X/X)
- [ ] Manual testing complete

## Blockers
[None, or describe]

## Next Steps
[What's next]
```

### Create BLOCKERS.md If Stuck

```markdown
# Blocker: [Brief description]

**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low
**Impact:** [What's blocked]
**Context:** [What you tried]
**Need:** [What would unblock you]
```

### Create COMPLETED.md When Done

```markdown
# Phase X Complete

## All Tasks Done ✅
- [x] Task 1
- [x] Task 2
...

## Testing Results
- Build: ✅ Passing
- Tests: ✅ X/X passing (100%)
- Manual: ✅ Verified [scenarios]
- Database: ✅ Verified [checks]

## Files Created
- [Key files list]

## Ready for Review
YES - All quality gates passed
```

---

## Commit Message Format

```
feat(phase-X): [brief description]

[Detailed description of what was implemented]

Testing:
- Build: ✅ Passing
- Tests: ✅ X/X passing (100%)
- Manual: ✅ Verified [scenarios]
- Database: ✅ Verified [checks]
- Integration: ✅ Phase Y services working
```

---

## Remember

1. **Quality over speed** - A well-tested phase is worth more than a rushed one
2. **Follow the process** - The 10 steps exist for a reason
3. **Communicate clearly** - Update PROGRESS.md, create BLOCKERS.md
4. **Wait for review** - Don't merge, create COMPLETED.md and wait
5. **Ask questions** - If unclear, ask via QUESTIONS.md

**Your success = Master Orchestrator's success = Project success**