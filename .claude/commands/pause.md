# Pause Work and Save State

You are pausing work on the current project to allow the user to shutdown or take a break.

## Your Task

### Step 1: Save Current State

Update `.morpheus/state.json` with pause information:

```bash
cat .morpheus/state.json
```

Note the current state and phase for the summary.

### Step 2: Commit All Work to Git

```bash
# Stage everything
git add -A

# Show what will be committed
git status

# Commit with WIP message
git commit -m "WIP: Paused at $(date '+%Y-%m-%d %H:%M') - State: [CURRENT_STATE], Phase: [N]"
```

### Step 3: Push to Remote

```bash
git push
```

If push fails due to HTTPS auth, inform the user they need to push manually or use the export command.

### Step 4: Generate Resume Summary

Create/update `.morpheus/RESUME.md`:

```markdown
# Resume Point

**Paused At:** [timestamp]
**State:** [current workflow state]
**Current Phase:** [N] of [total]

## What Was In Progress

[Description of current task/phase]

## Files Modified Since Last Commit

[List from git status before commit]

## To Resume

1. Start the container: `./bourne.sh start [repo-url]`
2. Run: `/continue`

## Notes

[Any context that would help when resuming]
```

### Step 5: Output Summary

```
WORK PAUSED

State saved: [state]
Phase: [N] of [total]
Commit: [short hash]
Pushed: [Yes/No]

TO RESUME:
  ./bourne.sh start [repo-url]
  /continue

You can now safely:
  - Detach: Ctrl+B, D
  - Exit container: exit
  - Stop container: ./bourne.sh stop
  - Shutdown system
```

### Step 6: Final Instructions

Tell the user:
1. Press `Ctrl+B, D` to detach from tmux
2. Type `exit` to leave the container
3. Run `./bourne.sh stop` from host to stop container
4. Safe to shutdown

---

**Note:** If git push fails, remind user to either:
- Export files: `./bourne.sh export /workspace ~/backup`
- Or set up git credentials for HTTPS push
