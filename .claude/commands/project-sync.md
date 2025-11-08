# Project Sync

**Purpose:** Push commits and update context file in one command

**Usage:**
- `/project-sync` - Show git status and uncommitted changes
- `/project-sync commit "message"` - Commit and push all changes
- `/project-sync context "what changed" "next steps"` - Update context file and push
- `/project-sync all "commit msg" "what changed" "next steps"` - Full sync (commit + context update)

---

## EXAMPLES

### Quick commit and push
```bash
/project-sync commit "Complete Week 1 business setup tasks"
```

### Update context file and push
```bash
/project-sync context "Completed business setup phase" "Starting design specification phase"
```

### Full sync (everything at once)
```bash
/project-sync all "Write dropshipping chapters 1-4" "Dropshipping content 45% complete" "Moving to design specification"
```

This does:
1. Commits all working changes
2. Updates context file with what changed
3. Pushes both commits to remote
4. All in one command

---

## WHAT IT DOES

### Commit Mode
1. Stages all current changes (`git add -A`)
2. Creates commit with your message
3. Pushes to current branch
4. Shows git log of recent commits

### Context Mode
1. Updates main context file (Claude.md)
2. Adds timestamp and change summary
3. Commits update automatically
4. Pushes to remote

### All Mode (Full Sync)
1. Commits all working changes with your message
2. Pushes working changes to remote
3. Updates context file with changes summary
4. Commits context file update
5. Pushes context update to remote
6. Shows completion summary

---

## AUTOMATIC FEATURES

✅ **Branch Detection** - Works with any branch
✅ **Auto-Push** - Pushes immediately after commit
✅ **Timestamp** - All updates timestamped
✅ **Current Session** - Works in any project/session
✅ **Safe Commits** - Won't commit empty changes

---

## COMMAND SYNTAX

```
/project-sync commit "[COMMIT MESSAGE]"
/project-sync context "[WHAT CHANGED]" "[NEXT STEPS]"
/project-sync all "[COMMIT MESSAGE]" "[WHAT CHANGED]" "[NEXT STEPS]"
```

Parameters:
- `[COMMIT MESSAGE]` - What was done (required)
- `[WHAT CHANGED]` - Summary of changes to context file (required)
- `[NEXT STEPS]` - What's planned next (required)

For `all` mode, all three parameters are required and combined into one sync operation.

---

## RESPONSE FORMAT

### Commit mode:
```
✅ Committed: [message]
📤 Pushed to: [branch name]
📝 Commit: [hash] - [message]
```

### Context mode:
```
✅ Updated context file
📝 Added: [timestamp] - [change summary]
📤 Pushed to: [branch name]
```

### All mode (Full Sync):
```
======================================================================
FULL PROJECT SYNC
======================================================================

📝 Step 1: Committing working changes...
✅ Working changes committed and pushed

📝 Step 2: Updating context file...
✅ Context file updated and pushed

======================================================================
✅ FULL SYNC COMPLETE
======================================================================
```

---

*Quick sync command for projects - commit, push, and update context all at once*
