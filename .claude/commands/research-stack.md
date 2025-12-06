# Research Tech Stack with Context7

You are running the **Tech Stack Research** phase of the Bourne harness.

## Your Task

Research current best practices and latest documentation for the technology domains required by this project.

### Step 1: Identify Domains

Based on the enhanced PRD at `.coordination/ENHANCED-PRD.md`, identify which technology domains are needed:

- [ ] Frontend Framework (React, Vue, Svelte, etc.)
- [ ] Backend Framework (Node/Express, Python/FastAPI, Go, etc.)
- [ ] Database (PostgreSQL, SQLite, MongoDB, etc.)
- [ ] Authentication (Auth0, Clerk, NextAuth, custom)
- [ ] Real-time (WebSockets, SSE, Polling)
- [ ] File Storage (S3, Cloudflare R2, local)
- [ ] Deployment (Vercel, Railway, AWS, etc.)
- [ ] Styling (Tailwind, CSS Modules, styled-components)
- [ ] State Management (Zustand, Redux, Jotai)
- [ ] Testing (Jest, Vitest, Playwright)
- [ ] API Layer (REST, GraphQL, tRPC)
- [ ] Other: [domain-specific needs]

### Step 2: Research Each Domain (Parallel)

For each identified domain, use Context7 MCP:

1. **Resolve library ID:**
   ```
   mcp__context7__resolve-library-id
   libraryName: "[library name]"
   ```

2. **Fetch current docs:**
   ```
   mcp__context7__get-library-docs
   context7CompatibleLibraryID: "[resolved ID]"
   mode: "code" or "info"
   topic: "[specific feature if applicable]"
   ```

3. **Compare alternatives** for each domain
4. **Note latest versions** and any breaking changes

### Step 3: Evaluation Criteria

For each domain, evaluate options on:

| Criteria | Weight | Notes |
|----------|--------|-------|
| Active maintenance | High | Recent commits, responsive maintainers |
| Documentation quality | High | Complete, current, with examples |
| Community size | Medium | Stack Overflow answers, GitHub stars |
| Performance | Medium | Benchmarks if available |
| Bundle size | Medium | For frontend libs especially |
| Type safety | Medium | TypeScript support quality |
| Learning curve | Low | Team familiarity more important |

### Step 4: Output Format

Create `.coordination/TECH-STACK.md`:

```markdown
# Tech Stack Recommendations

**Generated:** [Date]
**Based on:** .coordination/ENHANCED-PRD.md

---

## Recommended Stack

| Domain | Choice | Version | Rationale |
|--------|--------|---------|-----------|
| Frontend | [lib] | [ver] | [why] |
| Backend | [lib] | [ver] | [why] |
| ... | ... | ... | ... |

---

## Domain Analysis

### Frontend Framework

**Recommendation:** [Choice]

**Alternatives Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |

**Why This Choice:**
[Detailed rationale]

**Code Example (from Context7):**
```[language]
[example code]
```

**Official Docs Reference:**
[Link or Context7 source]

---

[Repeat for each domain]

---

## Integration Notes

- [How these choices work together]
- [Any known compatibility issues]
- [Recommended project structure]

---

## Dependencies to Research Further

- [Any areas needing more investigation]
- [Questions for human clarification]
```

### Step 5: Present to User

After generating the tech stack document, present a summary and ask if any domains need different choices or further research.