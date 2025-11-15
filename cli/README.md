# Y-IT CLI Dashboards

**Created:** November 10, 2025
**Purpose:** Visual command-line dashboards for project monitoring

---

## Available Dashboards

### 1. Main Project Dashboard
**File:** `cli/dashboard.js`
**Command:** `node cli/dashboard.js`

**Shows:**
- Batch A progress (7 topics)
- Research quality metrics (dropshipping)
- Affiliate revenue projections
- Production pipeline status (Research → Content → Design → Production → Marketing)
- Recent activity feed
- Next action items

**Use When:** You want a high-level overview of entire Y-IT project

---

### 2. Affiliate Opportunities Dashboard
**File:** `cli/affiliate-dashboard.js`
**Command:** `node cli/affiliate-dashboard.js`

**Shows:**
- Summary: 78 entities, 62 active programs
- Top 10 revenue opportunities
- Breakdown by category (Platforms, Tools, Suppliers, etc.)
- Ethical score tiers (10/10 perfect to <6/10 questionable)
- 16 programs needing inquiry
- Quick CSV filter suggestions

**Use When:** Reviewing affiliate opportunities, deciding which to signup for

---

### 3. Research Progress Dashboard
**File:** `cli/research-dashboard.js`
**Command:** `node cli/research-dashboard.js`

**Shows:**
- Detailed progress for all 7 Batch A topics
- Per-topic metrics (research brief, sources, validation, cases, affiliates)
- Batch summary (1/7 complete = 14%)
- Quality consistency targets (all topics must meet same standards)
- 7-day research timeline breakdown
- Next actions

**Use When:** Tracking research phase progress, understanding workflow timeline

---

## Installation

**Prerequisites:**
- Node.js installed

**Run Dashboards:**
```bash
# Main dashboard
node cli/dashboard.js

# Affiliate dashboard
node cli/affiliate-dashboard.js

# Research progress dashboard
node cli/research-dashboard.js
```

**Make Executable (Optional):**
```bash
chmod +x cli/*.js

# Then run directly:
./cli/dashboard.js
./cli/affiliate-dashboard.js
./cli/research-dashboard.js
```

---

## Features

### Color-Coded Status
- 🟢 **Green:** Complete, high ethical score, high revenue
- 🟡 **Yellow:** In progress, medium priority
- 🔴 **Red:** Blocked, low ethical score, action required
- ⚫ **Dim:** Queued, pending, low priority

### Progress Bars
Visual representation of completion:
- `[████████████████████████░░░░░]` 80%
- Color changes based on progress (red → blue → yellow → green)

### Real-Time Metrics
- Research quality (validation rate, sources, word count)
- Affiliate revenue projections
- Timeline progress
- Action items

---

## Dashboard Screenshots (Text Format)

### Main Dashboard Example:
```
╔════════════════════════════════════════════════════════════════════════════╗
║                      Y-IT BOOK PRODUCTION DASHBOARD                        ║
║                   "You've Invested Too Much" Series                        ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━ BATCH A: E-COMMERCE TRIO + HIGH-DEMAND (7 Books) ━━━

✅ Dropshipping              [████████████████████████████] 100%
⏸️  Amazon FBA               [░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
⏸️  Print-on-Demand          [░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
...
```

### Affiliate Dashboard Example:
```
━━━ TOP 10 REVENUE OPPORTUNITIES ━━━

#   Name                 Commission            Potential  Ethical  Category
──────────────────────────────────────────────────────────────────────────
1   Shopify Partner      $150 OR 20% rec       Very High  9/10     Platform
2   BigCommerce          200% (~$160-600)      Very High  9/10     Platform
3   Upwork               70% of $150 + 5%      Very High  10/10    Alternative
...
```

---

## Customization

### Update Data
Dashboards currently show hardcoded dropshipping data. To make dynamic:

1. **Read from actual files:**
```javascript
const fs = require('fs');
const researchBrief = fs.readFileSync('archives/01-RESEARCH/dropshipping/01_RESEARCH_BRIEF.md', 'utf8');
// Parse YAML frontmatter for word_count, validation_rate, etc.
```

2. **Parse CSV for affiliates:**
```javascript
const csv = require('csv-parser');
fs.createReadStream('archives/01-RESEARCH/dropshipping/AFFILIATE_CATALOG_TABLE.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Process affiliate data
  });
```

3. **Read topic registry:**
```javascript
const registry = fs.readFileSync('archives/00-METADATA/TOPIC_SLUG_REGISTRY.md', 'utf8');
// Parse markdown table to get real-time topic status
```

### Auto-Refresh
Uncomment in each dashboard:
```javascript
// Auto-refresh every 5 seconds
setInterval(render, 5000);
```

---

## Future Enhancements

### Phase 1 (Basic):
- ✅ Color-coded CLI output
- ✅ Progress bars
- ✅ Static data display

### Phase 2 (Dynamic):
- [ ] Read from actual research files
- [ ] Parse CSV affiliate data
- [ ] Real-time topic status from registry
- [ ] Git commit history integration

### Phase 3 (Interactive):
- [ ] Keyboard navigation (arrow keys, Enter)
- [ ] Filter affiliate table by category
- [ ] Drill down into topic details
- [ ] Interactive decision prompts

### Phase 4 (Web UI):
- [ ] Express.js server
- [ ] Real-time WebSocket updates
- [ ] Charts/graphs (Chart.js)
- [ ] Click to edit/update status

---

## Use Cases

### Daily Standup
```bash
node cli/dashboard.js
# Quick overview: What's complete? What's blocked? What's next?
```

### Affiliate Review Session
```bash
node cli/affiliate-dashboard.js
# Review top opportunities
# Identify which need signup
# Filter by ethical score
```

### Research Sprint Check
```bash
node cli/research-dashboard.js
# Track progress across 7 topics
# Ensure quality consistency
# Monitor timeline adherence
```

---

## Troubleshooting

### Colors not showing
- Ensure terminal supports ANSI colors
- Try different terminal (iTerm2, Windows Terminal, etc.)

### Layout broken
- Increase terminal width (minimum 80 characters recommended)
- Some emojis may not render in all terminals

### Can't run node
- Install Node.js: https://nodejs.org/
- Verify: `node --version`

---

**Status:** 3 dashboards created, ready to use
**Next:** Make dynamic by reading actual project files
**Enhancement:** Add interactive keyboard navigation
