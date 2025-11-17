# Project Todo Agent

**Purpose:** Manage Y-It Nano-Book ecosystem project with persistent, urgency-prioritized todo list

**Usage:**
- `/project-todo` - Display current todo list with urgency scale and progress
- `/project-todo update [task] [progress%] [status] [notes]` - Update specific task
- `/project-todo inquiry [task-id]` - Expand details on specific todo item
- `/project-todo complete [task-id]` - Mark task as complete
- `/project-todo add [title] [urgency] [dueDate] [details]` - Add new task

---

## COMMAND BEHAVIOR

### Display Mode (No Args)
When invoked without arguments, display:
```
Y-It NANO-BOOK ECOSYSTEM - PROJECT TODO LIST
Last Updated: [timestamp]

[CRITICAL PRIORITY]
├─ 🔴 HIGH impact, must complete before proceeding
│
├─ Week 7: LAUNCH - Dropshipping Book Live [0% PROGRESS]
│  Due: 2025-12-27
│  Subtasks: (4/4) - Dropshipping book LIVE, landing page LIVE, evaluator operational, sequences live, analytics starts
│  ➜ Type: `/project-todo inquiry week7-launch` for full details

├─ Week 13: Validation Decision Point [0% PROGRESS]
│  Due: 2026-01-10
│  Subtasks: (4/4) - Review metrics, gates passed, customer feedback, scale decision
│  ➜ Type: `/project-todo inquiry week13-validation` for full details

[HIGH PRIORITY]
├─ 🟠 MEDIUM-HIGH - Core path items, may block downstream work
│
├─ Week 1: Business Setup & Contractor Onboarding [0% PROGRESS]
│  Due: 2025-11-15
│  Subtasks: (4/4) - LLC setup, tool stack, design contractor, dev contractor
│  ➜ Type: `/project-todo inquiry phase1-biz-setup` for full details

├─ Week 1-2: Dropshipping Content Creation [0% PROGRESS]
│  Due: 2025-11-22
│  Subtasks: (4/4) - Research, write 10K words, compress to 7.8K, map to pages
│  ➜ Type: `/project-todo inquiry dropship-content` for full details

├─ Week 2: Design Specification & Handoff [0% PROGRESS]
│  Due: 2025-11-22
│  Subtasks: (4/4) - Design docs, image specs, design brief, contractor handoff
│  ➜ Type: `/project-todo inquiry design-specs` for full details

[MEDIUM PRIORITY]
├─ 🟡 MEDIUM - Important, may not block critical path
│
├─ Week 3-6: Write Batch A Topics (2-5) [0% PROGRESS]
│  Due: 2025-12-20
│  Subtasks: (4/4) - FBA, Crypto, POD, Affiliate content
│  ➜ Type: `/project-todo inquiry batch-a-content` for full details

├─ Week 4-5: AI Evaluator Configuration [0% PROGRESS]
│  Due: 2025-12-06
│  Subtasks: (4/4) - OpenAI setup, prompt config, form, PDF testing
│  ➜ Type: `/project-todo inquiry evaluator-setup` for full details

[LOWER PRIORITY]
├─ 🟢 LOW - Setup/foundation, less time-critical
│
├─ Week 6+: Platform Phase 1 (Minimal) [0% PROGRESS]
│  Due: 2025-12-27
│  Subtasks: (4/4) - Landing page, email setup, manual evaluator, analytics
│  ➜ Type: `/project-todo inquiry platform-phase1` for full details

---

## SUMMARY BY STATUS
```
Pending:   12 items (0% avg progress)
In Progress: 0 items
Completed: 0 items
```

## KEY MILESTONES
- **Week 1 (Nov 8-15):** Business + Contractor Setup
- **Week 2 (Nov 15-22):** Dropshipping Content + Design Specs
- **Week 7 (Dec 27):** LAUNCH - Dropshipping Book Live
- **Week 13 (Jan 10):** Validation Decision Point
- **Week 21 (Feb 21):** All 50 Topics Live

---

## HOW TO USE

### To Update Progress
```
/project-todo update dropship-content 50 in-progress Manuscript outline complete, writing chapters 1-3
```

### To Get Task Details
```
/project-todo inquiry dropship-content
```

Returns full task details including:
- Complete subtask list with checkmarks
- Full description and success criteria
- Dependencies and related tasks
- Time estimates and resource requirements

### To Mark Complete
```
/project-todo complete dropship-content
```

### To Add New Task
```
/project-todo add "Topic 6 content" MEDIUM 2025-12-20 "NFT Creation manuscript - 7800 words"
```

---

## PERSISTENT STORAGE
All todo data stored in: `.claude/data/project-todo.json`

This ensures:
- ✅ Todos persist across sessions
- ✅ All agents see same list
- ✅ Progress tracked historically
- ✅ Updates immediate and visible

## URGENCY SCALE
- **CRITICAL:** Must complete before major milestones/launch
- **HIGH:** Core path items, may block downstream work
- **MEDIUM:** Important, may not block critical path
- **LOW:** Setup/foundation, less time-critical

---

## NEXT STEPS
You are on branch: `claude/agent-project-todo-list-011CUw97yCPqnjjbtMgmNiTg`

1. Review full todo list: `/project-todo`
2. Check specific task details: `/project-todo inquiry [task-id]`
3. Update progress as you work: `/project-todo update [task-id] [%] [status] [notes]`
4. Commit changes to git when batch complete

---

*Y-It Project Agent - Repository-Wide Todo Management*
