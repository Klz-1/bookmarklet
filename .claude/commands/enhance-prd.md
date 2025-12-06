# Enhance PRD with Multi-Perspective Analysis

You are running the **PRD Enhancement** phase of the Bourne harness.

## Input

Read the PRD from: `$ARGUMENTS` (or from the user's message if provided inline)

## Your Task

Launch **5 parallel subagents** using the Task tool. Each agent analyzes the PRD from a different perspective.

### Agent 1: User Advocate
```
Analyze this PRD from an end-user perspective:

1. User Journey Gaps
   - What steps are unclear or frustrating?
   - Where might users get confused?
   - What's missing from onboarding to daily use?

2. Delight Opportunities
   - What would make users love this?
   - Quick wins that feel premium
   - Moments of surprise/delight

3. Pain Point Predictions
   - What will users complain about?
   - Common support requests to anticipate
   - Friction points in the flow

Output format: Bullet points under "## User Experience Enhancements"
```

### Agent 2: Developer Advocate
```
Analyze this PRD from a developer/maintainer perspective:

1. API Design
   - Are interfaces intuitive?
   - Naming conventions clear?
   - Error messages helpful?

2. Maintainability
   - What will be hard to change later?
   - Technical debt risks
   - Testing complexity

3. Documentation Needs
   - What needs documenting?
   - Code examples needed
   - Integration guides required

Output format: Bullet points under "## Developer Experience Notes"
```

### Agent 3: Edge Case Hunter
```
Analyze this PRD for failure modes and edge cases:

1. Infrastructure Failures
   - Network down scenarios
   - Database unavailable
   - Third-party API failures

2. User Input Edge Cases
   - Empty/null inputs
   - Extremely long inputs
   - Special characters/unicode
   - Concurrent access

3. State Management
   - Race conditions
   - Partial failures
   - Recovery scenarios

Output format: Bullet points under "## Edge Cases & Error Handling"
```

### Agent 4: Security Auditor
```
Analyze this PRD for security and privacy:

1. Data Sensitivity
   - What data is PII?
   - What needs encryption?
   - Data retention policies needed

2. Attack Vectors
   - Authentication bypasses
   - Injection risks (SQL, XSS, etc.)
   - Authorization gaps

3. Compliance
   - GDPR considerations
   - Data export requirements
   - Audit trail needs

Output format: Bullet points under "## Security Considerations"
```

### Agent 5: Accessibility Champion
```
Analyze this PRD for accessibility and inclusivity:

1. Screen Reader Compatibility
   - ARIA labels needed
   - Focus management
   - Semantic HTML requirements

2. Visual Accessibility
   - Color contrast
   - Color blindness considerations
   - Text sizing/scaling

3. Motor Accessibility
   - Keyboard navigation
   - Touch target sizes
   - Reduced motion support

4. Internationalization
   - RTL language support
   - Date/number formatting
   - Translation considerations

Output format: Bullet points under "## Accessibility Requirements"
```

## Output

After all agents complete, synthesize their outputs into `.coordination/ENHANCED-PRD.md`:

```markdown
# Enhanced PRD: [Project Name]

## Original Requirements
[Paste original PRD]

---

## Multi-Perspective Analysis

### User Experience Enhancements
[Agent 1 output]

### Developer Experience Notes
[Agent 2 output]

### Edge Cases & Error Handling
[Agent 3 output]

### Security Considerations
[Agent 4 output]

### Accessibility Requirements
[Agent 5 output]

---

## Summary of Additions
- X user experience items
- Y developer experience items
- Z edge cases identified
- N security considerations
- M accessibility requirements

## Recommended Priority
1. [Must-have items for MVP]
2. [Should-have for quality]
3. [Nice-to-have for polish]
```

Present the enhanced PRD to the user for approval before proceeding to tech stack research.