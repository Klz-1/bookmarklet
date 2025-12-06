# Review Completed Phase

You are conducting a **Senior Engineer Code Review** in the Bourne harness.

## Arguments

`$ARGUMENTS` should be the phase number to review (e.g., "1", "2", etc.)

## Your Task

### Step 1: Verify Completion

Read from the phase worktree:
- `.phase-status/COMPLETED.md` - Must exist
- `.phase-status/PROGRESS.md` - All tasks checked

If COMPLETED.md doesn't exist, the phase isn't ready for review.

### Step 2: Review Checklist

Conduct review from these perspectives:

#### Code Quality (25%)
- [ ] Architecture follows established patterns
- [ ] TypeScript usage is correct and strict
- [ ] Error handling is comprehensive
- [ ] Code is readable and maintainable
- [ ] No code duplication with other phases
- [ ] Functions are appropriately sized

#### Security (25%)
- [ ] No secrets in code (grep -r "API_KEY" etc.)
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] No injection vulnerabilities
- [ ] Sensitive data handled properly

#### Testing (20%)
- [ ] Test files exist
- [ ] Tests actually pass (verify, don't trust)
- [ ] Test coverage is adequate
- [ ] Edge cases covered
- [ ] Integration tests present

#### Integration (15%)
- [ ] Uses previous phases correctly
- [ ] Doesn't duplicate existing code
- [ ] No breaking changes to shared interfaces
- [ ] Future phases can build on this

#### Documentation (10%)
- [ ] Testing guide exists
- [ ] Key decisions documented
- [ ] API/interface documented if public

#### Performance (5%)
- [ ] No obvious performance issues
- [ ] Database queries efficient
- [ ] No memory leaks apparent

### Step 3: Calculate Score

| Category | Weight | Score (0-10) | Weighted |
|----------|--------|--------------|----------|
| Code Quality | 25% | ? | ? |
| Security | 25% | ? | ? |
| Testing | 20% | ? | ? |
| Integration | 15% | ? | ? |
| Documentation | 10% | ? | ? |
| Performance | 5% | ? | ? |
| **TOTAL** | 100% | - | **?/10** |

### Step 4: Generate Review Document

Create `.coordination/PHASE-[N]-REVIEW.md`:

```markdown
# Phase [N]: Senior Engineer Code Review

**Phase:** [N] - [Name]
**Reviewed:** [Date]
**Reviewer:** Master Orchestrator (Bourne Harness)

---

## Overall Assessment

**Verdict:** [APPROVE / CONDITIONAL APPROVE / NEEDS WORK / REJECT]
**Quality Score:** [X.X/10]

---

## Executive Summary

[2-3 paragraph summary of the phase, what it does well, and concerns]

---

## Detailed Analysis

### Code Quality ([X]/10)

**Strengths:**
- [Strength 1]
- [Strength 2]

**Issues:**
- [Issue with severity and location]

### Security ([X]/10)

**Strengths:**
- [What's done well]

**Issues:**
- [Concern with severity]

### Testing ([X]/10)

**Test Evidence:**
```
[Paste test output or summary]
```

**Coverage Assessment:**
- [What's covered]
- [What's missing]

### Integration ([X]/10)

**Uses From Previous Phases:**
- [Service/component]: [How used]

**Exposes For Future Phases:**
- [Service/component]: [What's available]

### Documentation ([X]/10)

**Available:**
- [Doc 1]

**Missing:**
- [Doc 1]

### Performance ([X]/10)

**Notes:**
- [Observations]

---

## Issues Summary

### Critical (Must Fix Before Merge)
1. [Issue]

### Medium (Should Fix)
1. [Issue]

### Low (Track for Later)
1. [Issue]

---

## Merge Recommendation

**Recommendation:** [APPROVE / CONDITIONAL / REJECT]

**Conditions (if conditional):**
1. [Required fix 1]
2. [Required fix 2]

**Post-Merge Improvements:**
1. [Improvement to track]

---

## Integration Verification

- [ ] Build passes after merge to develop
- [ ] All previous phase tests still pass
- [ ] No conflicts with other active phases

---

**Review Complete:** [Date Time]
```

### Step 5: Make Merge Decision

Based on score:
- **9.0-10.0:** Approve immediately
- **8.0-8.9:** Approve with minor notes
- **7.0-7.9:** Approve with tracked improvements
- **6.0-6.9:** Conditional - request fixes first
- **<6.0:** Reject - request refactor

### Step 6: If Approved - Merge

```bash
# From main repo
git checkout develop
git pull origin develop
git merge feature/phase-[N]-[name] --no-ff -m "feat: merge Phase [N] - [Name]

Review Score: [X.X]/10
See .coordination/PHASE-[N]-REVIEW.md for details

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin develop
git tag -a phase-[N]-complete -m "Phase [N]: [Name] - Complete"
git push origin --tags
```

### Step 7: Update Dashboard

Update `docs/PROGRESS.md` with:
- Phase marked complete
- Score recorded
- Next steps updated