# Start New Project from PRD

You are initiating the **Bourne Agentic Development Harness** for a new project.

## Your Task

The user has provided a PRD or feature description. Execute the full autonomous workflow:

### Step 1: PRD Enhancement (Parallel Subagents)

Launch **5 parallel subagents** using the Task tool to analyze the PRD from different perspectives:

1. **User Advocate Agent**
   - Prompt: "Analyze this PRD from an end-user perspective. What would frustrate users? What's missing from their journey? What would delight them? Output as bullet points under 'User Experience Enhancements'."

2. **Developer Advocate Agent**
   - Prompt: "Analyze this PRD from a developer experience perspective. Is the API intuitive? Are edge cases handled? What would make this easier to maintain? Output as bullet points under 'Developer Experience Notes'."

3. **Edge Case Hunter Agent**
   - Prompt: "Analyze this PRD for failure modes and edge cases. What happens when X fails? Network down? Invalid input? Concurrent access? Output as bullet points under 'Edge Cases & Error Handling'."

4. **Security Auditor Agent**
   - Prompt: "Analyze this PRD for security and privacy concerns. What data is sensitive? What attack vectors exist? Authentication/authorization gaps? Output as bullet points under 'Security Considerations'."

5. **Accessibility Champion Agent**
   - Prompt: "Analyze this PRD for accessibility and inclusivity. Screen reader compatibility? Color blindness? Keyboard navigation? Internationalization? Output as bullet points under 'Accessibility Requirements'."

### Step 2: Tech Stack Research (Parallel via Context7)

Based on the enhanced PRD, identify the required domains and research current best practices using Context7 MCP:

- For each technology domain (frontend framework, backend, database, auth, etc.)
- First resolve library ID, then fetch docs
- Compare options and recommend with rationale

### Step 3: Phase Planning

Break the project into phases:
- 5-10 tasks per phase
- Identify dependencies between phases
- Mark which phases can run in parallel
- Define quality gates per phase

### Step 4: Generate Clarification Questions

Compile ALL strategic questions that require human input into a single questionnaire. Categories:
- Authentication choices
- Data storage preferences
- Design system preferences
- Scope decisions
- External service choices

### Step 5: Output

Create these files:
1. `.coordination/ENHANCED-PRD.md` - The enhanced PRD with all perspectives
2. `.coordination/TECH-STACK.md` - Tech recommendations with rationale
3. `.coordination/PHASE-PLAN.md` - The phase breakdown
4. `.coordination/CLARIFICATION-QUEUE.md` - Questions for human (if any)
5. `docs/PROGRESS.md` - Initial project dashboard

Present a summary to the user and ask for approval to proceed.

---

**PRD/Feature Description:**
$ARGUMENTS