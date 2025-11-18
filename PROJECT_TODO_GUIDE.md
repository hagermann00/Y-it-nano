# Y-It Project Todo Agent - Usage Guide

**Status:** ✅ Active and ready to use
**Location:** `.claude/commands/project-todo.md` (slash command)
**Processor:** `.claude/scripts/project-todo-processor.py`
**Data:** `.claude/data/project-todo.json` (persistent storage)

---

## Quick Start

The project todo agent is now integrated into your Claude Code environment. Use these commands:

### View Full Todo List
```bash
python3 .claude/scripts/project-todo-processor.py
```

Displays all tasks organized by urgency with progress bars and subtask previews.

### Get Details on Specific Task
```bash
python3 .claude/scripts/project-todo-processor.py inquiry phase1-biz-setup
```

Shows:
- Task ID, urgency level, status, and due date
- Full description and success criteria
- Complete subtask checklist
- Related dependencies

### Update Task Progress
```bash
python3 .claude/scripts/project-todo-processor.py update dropship-content 50 in-progress "Chapters 1-4 written, editing Chapter 5"
```

Parameters:
- `update` - Operation
- `dropship-content` - Task ID
- `50` - Progress percentage (0-100)
- `in-progress` - Status (pending, in-progress, completed)
- `"Notes..."` - Optional notes field (timestamps automatically added)

### Mark Task Complete
```bash
python3 .claude/scripts/project-todo-processor.py complete phase1-biz-setup
```

Automatically sets progress to 100% and marks as completed.

### Add New Task
```bash
python3 .claude/scripts/project-todo-processor.py add "Topic 11 research" MEDIUM 2026-01-20 "Social Media Marketing - 7800 words manuscript"
```

Parameters:
- `add` - Operation
- Task title
- Urgency level (CRITICAL, HIGH, MEDIUM, LOW)
- Due date (YYYY-MM-DD)
- Description

---

## Current Todo List

### 🔴 CRITICAL Priority (3 tasks)
These must complete before major milestones or launch:

1. **Week 7: LAUNCH - Dropshipping Book Live**
   - ID: `week7-launch`
   - Due: 2025-12-27
   - Subtasks: Book live, landing page, evaluator operational, sequences live, analytics

2. **Week 13: Validation Decision Point**
   - ID: `week13-validation`
   - Due: 2026-01-10
   - Subtasks: Review metrics, gates passed, customer feedback, scale decision

3. **Week 7-13: Validation & Gate Reviews**
   - ID: `validation-gates`
   - Due: 2026-01-10
   - Subtasks: 7 gates covering content, design, KDP, evaluator, payment, analytics

### 🟠 HIGH Priority (4 tasks)
Core path items that may block downstream work:

1. **Week 1: Business Setup & Contractor Onboarding**
   - ID: `phase1-biz-setup`
   - Due: 2025-11-15
   - Subtasks: LLC setup, tool stack, design contractor, dev contractor

2. **Week 1-2: Dropshipping Content Creation**
   - ID: `dropship-content`
   - Due: 2025-11-22
   - Subtasks: Research, write 10K, compress to 7.8K, map to 24-page structure

3. **Week 2: Design Specification & Handoff**
   - ID: `design-specs`
   - Due: 2025-11-22
   - Subtasks: Design docs, image specs, design brief, contractor handoff

4. **Week 3-4: KDP Account & Processes**
   - ID: `kdp-setup`
   - Due: 2025-11-29
   - Subtasks: KDP account, ISBN process, proof copy workflow, upload procedures

### 🟡 MEDIUM Priority (4 tasks)
Important but may not block critical path:

1. **Week 3-6: Write Batch A Topics (2-5)**
   - ID: `batch-a-content`
   - Due: 2025-12-20
   - Subtasks: FBA, Crypto, POD, Affiliate content

2. **Week 4-5: AI Evaluator Configuration**
   - ID: `evaluator-setup`
   - Due: 2025-12-06
   - Subtasks: OpenAI API, prompt config, form, PDF testing

3. **Week 5-6: Email Automation Setup**
   - ID: `email-automation`
   - Due: 2025-12-13
   - Subtasks: ConvertKit setup, 4-email sequence, tracking, CTAs

4. **Week 8-9: Design Batch B (Topics 6-10)**
   - ID: `batch-b-design`
   - Due: 2026-01-10
   - Subtasks: Dropshipping final, NFT, Freelance, VA, Digital Products

### 🟢 LOW Priority (1 task)
Setup/foundation, less time-critical:

1. **Week 6+: Platform Development Phase 1 (Minimal)**
   - ID: `platform-phase1`
   - Due: 2025-12-27
   - Subtasks: Landing page, email setup, manual evaluator, analytics

---

## How the System Works

### Persistent Storage
All todo data stored in `.claude/data/project-todo.json`:
- ✅ Persists across sessions
- ✅ All Claude agents see same list
- ✅ Historical notes tracked
- ✅ Timestamps on all updates

### Urgency Levels
```
CRITICAL 🔴 - Must complete before major launch/milestone
HIGH     🟠 - Core path items, may block downstream work
MEDIUM   🟡 - Important but may not block critical path
LOW      🟢 - Setup/foundation, less time-critical
```

### Task Statuses
- **pending** ⬜ - Not started
- **in-progress** ⏳ - Currently working on
- **completed** ✅ - Finished

### Progress Tracking
- Display includes visual progress bar (0-100%)
- Update notes are timestamped
- Multiple notes per task create audit trail
- Completion date automatically recorded

---

## Example Workflow

### Day 1: Start Week 1 Tasks
```bash
# View all tasks
python3 .claude/scripts/project-todo-processor.py

# Start business setup
python3 .claude/scripts/project-todo-processor.py update phase1-biz-setup 20 in-progress "LLC formation documents submitted"

# Start content creation
python3 .claude/scripts/project-todo-processor.py update dropship-content 15 in-progress "Research phase started"
```

### Day 3: Progress Update
```bash
# Update both tasks
python3 .claude/scripts/project-todo-processor.py update phase1-biz-setup 50 in-progress "Waiting for LLC approval, tool accounts 80% done"

python3 .claude/scripts/project-todo-processor.py update dropship-content 30 in-progress "7 case studies researched, outline complete"

# Get details on design specs
python3 .claude/scripts/project-todo-processor.py inquiry design-specs
```

### Week 1 End: Mark Complete
```bash
# Complete business setup
python3 .claude/scripts/project-todo-processor.py complete phase1-biz-setup

# View summary
python3 .claude/scripts/project-todo-processor.py
```

---

## Integration with Git

All todo updates can be paired with git commits:

```bash
# Make progress
python3 .claude/scripts/project-todo-processor.py update dropship-content 75 in-progress "Chapters 1-7 written"

# Check what changed
git diff .claude/data/project-todo.json

# Commit together
git add .claude/data/project-todo.json
git commit -m "Update progress: dropshipping content 75% complete"

git push origin claude/agent-project-todo-list-011CUw97yCPqnjjbtMgmNiTg
```

---

## Advanced Features

### View Full Task Details
```bash
python3 .claude/scripts/project-todo-processor.py inquiry week7-launch
```

Shows:
- Task ID and metadata
- Full description (why this task matters)
- All subtasks (complete checklist)
- Related phases and milestones
- Success criteria

### Track Multiple Updates
Task notes create an audit trail:

```bash
python3 .claude/scripts/project-todo-processor.py update dropship-content 25 in-progress "Day 1: Research phase"
python3 .claude/scripts/project-todo-processor.py update dropship-content 50 in-progress "Day 2-3: Writing chapters"
python3 .claude/scripts/project-todo-processor.py update dropship-content 75 in-progress "Day 4-5: Editing and compression"
python3 .claude/scripts/project-todo-processor.py update dropship-content 100 completed "Ready for design handoff"
```

Each note is timestamped in the JSON file.

### Project Phases
The system recognizes three phases:

**Phase 1: Launch & Validate (Weeks 1-13)**
- Dropshipping test case validated
- First 20 topics live
- Platform validated at scale
- Revenue model confirmed

**Phase 2: Full Rollout (Weeks 14-21)**
- All 50 topics live
- Cross-sell optimization
- Bundle strategy refined
- Annual subscription launched

**Phase 3: Optimize & Scale (Months 6-12)**
- A/B test pricing
- Improve conversion funnels
- Add advanced features
- International expansion

---

## Key Metrics Tracked

### Week 7 Launch Targets
- Book live on Amazon ✓
- Evaluator operational ✓
- 50+ evaluator submissions
- <10 platform bugs

### Week 13 Validation Targets
- 500+ customers acquired
- $5,000+ total revenue
- 10%+ evaluator-to-purchase conversion
- 4.0+ star Amazon rating
- <2 month payback period
- >70% positive customer feedback

---

## Tips & Best Practices

1. **Update Daily:** Keep progress fresh for accurate tracking
2. **Add Notes:** Use update notes to capture blockers and decisions
3. **Batch Related Tasks:** Group similar work (all design work, all writing)
4. **Review Weekly:** Run the full display each week to assess progress
5. **Complete Early:** Mark tasks complete as soon as done (don't batch)
6. **Commit Together:** Pair todo updates with git commits for history

---

## File Locations

```
Y-it-nano/
├── .claude/
│   ├── commands/
│   │   └── project-todo.md                 # Slash command definition
│   ├── data/
│   │   └── project-todo.json               # Persistent task storage
│   └── scripts/
│       └── project-todo-processor.py       # Python task processor
└── PROJECT_TODO_GUIDE.md                   # This file
```

---

## Support

**View full list:**
```bash
python3 .claude/scripts/project-todo-processor.py
```

**Get help on any task:**
```bash
python3 .claude/scripts/project-todo-processor.py inquiry [TASK_ID]
```

**See what files were changed:**
```bash
git log --oneline -- .claude/data/project-todo.json
```

---

*Y-It Project Todo Agent - Ready for implementation tracking*
