# Project Sync

**Purpose:** Push commits and update context file in one command

**Usage:**
- `/project-sync` - Show status and commit options
- `/project-sync commit "message"` - Commit and push all changes
- `/project-sync context "what changed" "next steps"` - Update context file and push

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

### Full workflow (commit work, then update context)
```bash
/project-sync commit "Write dropshipping manuscript chapters 1-4"
/project-sync context "Dropshipping content 45% complete" "Moving to design specification next"
```

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
```

Parameters:
- `[COMMIT MESSAGE]` - What was done (required)
- `[WHAT CHANGED]` - Summary of changes to context file (required)
- `[NEXT STEPS]` - What's planned next (required)

---

## RESPONSE FORMAT

After running command, you get:

```
✅ Committed: [message]
📤 Pushed to: [branch name]
📝 Commit: [hash] - [message]
```

Or for context updates:

```
✅ Updated context file
📝 Added: [timestamp] - [change summary]
📤 Pushed to: [branch name]
```

---

*Quick sync command for projects - commit, push, and update context all at once*
