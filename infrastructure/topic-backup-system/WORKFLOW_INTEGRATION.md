# Workflow Integration Guide

How to integrate the Topic Backup System into the Y-It nano-book production workflow.

## Overview

The Y-It production process has 10 phases (Phase 0-9). This guide shows when and how to sync files at each stage for maximum safety and minimal disruption.

## Integration Strategy

You have **three options** for integrating backup into your workflow:

### Option 1: Real-time Auto-Sync (Recommended)

Run watch mode in background. All changes auto-sync within 5 seconds.

**Pros:**
- Zero manual work
- Files backed up immediately
- No risk of forgetting to sync

**Cons:**
- Requires background process
- Uses bandwidth continuously

**Setup:**

```bash
# Start watcher (run once, keeps running)
cd /home/user/Y-it-nano/infrastructure/topic-backup-system
npm run watch &

# Or using screen/tmux for persistent session
screen -S backup-watcher
npm run watch
# Ctrl+A, D to detach
```

### Option 2: Manual Phase Checkpoints

Sync manually after completing each phase.

**Pros:**
- Full control over when sync happens
- No background process needed
- Can batch multiple topics

**Cons:**
- Must remember to sync
- Risk of losing work if forgotten

**Setup:**

Add to your workflow checklist after each phase.

### Option 3: Scheduled Batch Sync

Sync entire batches on a schedule (e.g., daily).

**Pros:**
- Automated but predictable
- Efficient (batch processing)
- Low bandwidth usage

**Cons:**
- Up to 24 hours between syncs
- Not real-time

**Setup:**

```bash
# Cron job (daily at midnight)
0 0 * * * cd /home/user/Y-it-nano/infrastructure/topic-backup-system && npm run sync -- --batch=A
```

## Recommended Workflow Integration

### For Active Production (Recommended)

**Use Option 1 (Real-time) + Option 2 (Manual checkpoints)**

1. **Start of work session:**
   ```bash
   npm run watch
   ```

2. **After Phase 0, 3, 6, 8:** (Critical milestones)
   ```bash
   npm run sync -- --topic=dropshipping --phase=X
   ```

3. **End of work session:**
   - Check dashboard to verify sync
   - Stop watcher: `Ctrl+C`

### For Batch Production

**Use Option 2 (Manual) or Option 3 (Scheduled)**

- Sync after completing a full batch of topics
- Ideal for designer handoff workflow

## Phase-by-Phase Integration

### Phase 0: Research Intake

**Files Generated:**
- `{topic}_research_engine.md`
- `market_analysis.pdf` (optional)

**When to Sync:** After research validation

```bash
npm run sync -- --topic=dropshipping --phase=0
```

**Validation:**

```bash
npm run validate -- --topic=dropshipping
```

Expected: Phase 0 complete, required files present.

---

### Phase 1: Content Strategy

**Files Generated:**
- `{topic}_research_summary.md`
- `{topic}_content_strategy.md`

**When to Sync:** After strategy approval

```bash
npm run sync -- --topic=dropshipping --phase=1
```

---

### Phase 2: Case Studies

**Files Generated:**
- `{topic}_case_studies.md`

**When to Sync:** After all 7-11 case studies written

```bash
npm run sync -- --topic=dropshipping --phase=2
```

**Validation:**

```bash
# Check if all required files present
npm run validate -- --topic=dropshipping --verbose
```

---

### Phase 3: Content Creation

**Files Generated:**
- `{topic}_manuscript_full.md`
- `{topic}_manuscript_compressed.md`
- `{topic}_content_extraction.md`
- `{topic}_24page_structure.xlsx`

**When to Sync:** After manuscript compression complete

**⚠️ CRITICAL CHECKPOINT** - This is your main content!

```bash
# Sync immediately after compression
npm run sync -- --topic=dropshipping --phase=3

# Verify sync
npm run report -- --detailed | grep dropshipping
```

**Recommended:** Also create manual backup:

```bash
cp production/dropshipping/dropshipping_manuscript_compressed.md \
   backups/dropshipping_manuscript_compressed_$(date +%Y%m%d).md
```

---

### Phase 4: Design Specs

**Files Generated:**
- `{topic}_image_specifications.md`
- `{topic}_hero_brief.md`
- `{topic}_comic_strip_brief.md`

**When to Sync:** After all design specs finalized

```bash
npm run sync -- --topic=dropshipping --phase=4
```

---

### Phase 5: Manuscript Audit

**Files Generated:**
- `{topic}_manuscript_audit.md`

**When to Sync:** After audit complete

```bash
npm run sync -- --topic=dropshipping --phase=5
```

---

### Phase 6: Designer Handoff

**Files Generated:**
- `{topic}_designer_brief.md`
- `{topic}_complete_spec_package.md`

**When to Sync:** Immediately before sending to designer

**⚠️ CRITICAL CHECKPOINT** - Designer needs these files!

```bash
# Sync before handoff
npm run sync -- --topic=dropshipping --phase=6

# Generate package for designer
npm run report -- --output=designer_handoff_dropshipping.html
```

**Workflow:**

1. Complete all Phase 6 files
2. Sync to Google Drive: `npm run sync -- --topic=dropshipping --phase=6`
3. Validate: `npm run validate -- --topic=dropshipping`
4. Share Google Drive link with designer OR
5. Restore to designer's machine: `npm run restore -- --topic=dropshipping --to=/designer/dropbox`

---

### Phase 7: Design Production

**Files Generated:**
- `{topic}.indd` (InDesign file - LARGE)
- `{topic}_proof_v1.pdf`
- `{topic}_proof_v2.pdf`
- etc.

**When to Sync:** After each proof version

**⚠️ Large files** - InDesign files can be 50-500MB

```bash
# Sync with verbose to monitor upload
npm run sync -- --topic=dropshipping --phase=7 --verbose
```

**Note:** Resumable upload enabled for files >5MB.

If upload interrupted:

```bash
# Resume sync (skips completed files)
npm run sync -- --topic=dropshipping --phase=7
```

---

### Phase 8: Final Assets

**Files Generated:**
- `{topic}_KDP_final.pdf`
- `{topic}_gumroad.pdf`
- `{topic}_web_version/` (directory)

**When to Sync:** Immediately after KDP approval

**⚠️ CRITICAL CHECKPOINT** - Final deliverables!

```bash
# Sync final assets
npm run sync -- --topic=dropshipping --phase=8

# Verify all final files present
npm run validate -- --topic=dropshipping --strict
```

---

### Phase 9: Quality Gates

**Files Generated:**
- `quality_checklist.md`
- `approval_sign_off.md`

**When to Sync:** After final approval

```bash
npm run sync -- --topic=dropshipping --phase=9
```

**Completion:**

```bash
# Mark topic as 100% complete
npm run report -- --detailed | grep dropshipping

# Should show:
# Dropshipping | 100% | All phases complete
```

---

## Batch Workflow Integration

### Batch A (Topics 1-5)

**Week 1-2: Content Phase**

All 5 topics go through Phases 0-3 simultaneously.

```bash
# End of Week 2: Sync entire batch
npm run sync -- --batch=A
```

**Week 2-4: Designer Phase**

Designer works on Batch A while content team starts Batch B.

```bash
# Monitor designer progress
npm run report -- | grep "Batch A"

# Designer syncs proofs
npm run sync -- --batch=A --phase=7
```

**Week 4-5: Final Assets**

```bash
# Sync all final assets for Batch A
npm run sync -- --batch=A --phase=8

# Validate entire batch
npm run validate -- --batch=A --strict
```

### Continuous Batching

```bash
# Week 1-2: Batch A content (Topics 1-5)
npm run sync -- --batch=A

# Week 3-4: Batch A design, Batch B content (Topics 6-10)
npm run sync -- --batch=B

# Week 5-6: Batch A final, Batch B design, Batch C content
npm run sync -- --batch=C

# Pattern continues...
```

## Notification Integration

### Slack Notifications

Enable in `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
NOTIFY_ON_PHASE_COMPLETE=true
NOTIFY_ON_BATCH_COMPLETE=true
```

You'll receive:

```
✓ Phase 3 (Phase-3-Content) completed for Dropshipping
```

### Email Notifications (Future)

Coming soon: Email notifications via SendGrid/Mailgun.

## Disaster Recovery Scenarios

### Scenario 1: Lost Local Files

**Problem:** Accidentally deleted production folder.

**Solution:**

```bash
# Restore entire topic
npm run restore -- --topic=dropshipping --to=/home/user/Y-it-nano/production

# Or restore specific phase
npm run restore -- --topic=dropshipping --phase=3 --to=/recovery
```

### Scenario 2: Corrupted File

**Problem:** File corrupted during editing.

**Solution:**

```bash
# Restore previous version (keeps last 3 versions)
npm run restore -- --topic=dropshipping --interactive

# Select specific file from list
# Choose older version
```

### Scenario 3: Need File from Last Week

**Problem:** Made changes, want to revert to last week's version.

**Solution:**

Check version history in database:

```bash
# Query version history
sqlite3 sync-state.db "SELECT * FROM file_versions WHERE file_id = (SELECT id FROM files WHERE file_name LIKE '%manuscript%' AND topic_id = '01') ORDER BY created_at DESC"

# Restore specific version
npm run restore -- --topic=dropshipping --phase=3 --to=/restore/v1
```

### Scenario 4: Designer Needs Files

**Problem:** Designer can't access shared folder.

**Solution:**

```bash
# Option 1: Share Google Drive link
# Open: https://drive.google.com/drive/folders/YOUR_FOLDER_ID

# Option 2: Restore to designer's Dropbox
npm run restore -- --topic=dropshipping --phase=6 --to=/designer/dropbox/dropshipping

# Option 3: Export as ZIP (future feature)
```

## Performance Optimization

### For Large Batches

```bash
# Sync in parallel (3 topics at once)
# Edit config.json:
{
  "sync": {
    "parallelUploads": 5
  }
}
```

### For Slow Connections

```bash
# Disable compression to speed up processing
# Edit .env:
COMPRESSION_ENABLED=false

# Note: Uses more storage
```

### For Designer Handoff

```bash
# Sync only Phase 6 files (faster)
npm run sync -- --topic=dropshipping --phase=6

# Not entire topic
```

## Monitoring & Reporting

### Daily Status Check

```bash
# Morning routine
npm run report

# Check:
# - All topics synced?
# - Any errors?
# - Progress vs timeline
```

### Weekly Dashboard Review

```bash
# Start dashboard
npm run dashboard

# Open: http://localhost:3000

# Review:
# - Batch A progress
# - Phase completion
# - Storage usage
```

### Monthly Audit

```bash
# Full validation
npm run validate

# Full report
npm run report -- --detailed --output=monthly_report_$(date +%Y%m).html

# Email to team
```

## Team Collaboration

### For Solo Work

- Use watch mode
- Sync after critical milestones
- Check dashboard daily

### For Team (Multiple People)

1. **Shared Google Drive folder**
   - Grant team access
   - Each person syncs their topics

2. **Conflict prevention**
   - One person per topic at a time
   - Use topic assignments

3. **Communication**
   - Slack notifications for phase completion
   - Dashboard shows who's working on what

### For Designer Collaboration

1. **Content team:**
   - Complete Phase 6
   - Sync to Google Drive
   - Notify designer via Slack

2. **Designer:**
   - Restore Phase 6 files
   - Work on Phase 7 locally
   - Sync proofs back to Google Drive

3. **Content team:**
   - Review proofs from Google Drive
   - Approve or request changes

## Checklist: Adding Sync to Your SOP

Update `Y-It_NANO_BOOK_PRODUCTION_SOP.md`:

### Phase 0 Checklist

```markdown
**Phase 0 - Research Intake:**
- [ ] Research document complete (all 7 phases)
- [ ] Research validated and current
- [ ] ✅ **SYNC TO GOOGLE DRIVE:** `npm run sync -- --topic={topic} --phase=0`
```

### Phase 3 Checklist

```markdown
**Phase 3 - Content Creation:**
- [ ] Full chapters written (10,000+ words)
- [ ] Content compressed to 7,800 words ±200
- [ ] Page-by-page mapping complete
- [ ] ✅ **SYNC TO GOOGLE DRIVE:** `npm run sync -- --topic={topic} --phase=3`
- [ ] ✅ **VALIDATE:** `npm run validate -- --topic={topic}`
```

### Phase 6 Checklist

```markdown
**Phase 6 - Designer Handoff:**
- [ ] Designer brief created
- [ ] Master specification package created
- [ ] All 4 key documents prepared
- [ ] ✅ **SYNC TO GOOGLE DRIVE:** `npm run sync -- --topic={topic} --phase=6`
- [ ] ✅ **SHARE WITH DESIGNER:** Send Google Drive link
```

### Phase 8 Checklist

```markdown
**Phase 8 - Final Assets:**
- [ ] KDP-ready PDF exported
- [ ] Gumroad PDF created
- [ ] Web version exported
- [ ] ✅ **SYNC TO GOOGLE DRIVE:** `npm run sync -- --topic={topic} --phase=8`
- [ ] ✅ **VALIDATE ALL PHASES:** `npm run validate -- --topic={topic} --strict`
- [ ] ✅ **FINAL BACKUP:** `npm run report -- --output=final_{topic}.html`
```

## Conclusion

Integrate backup seamlessly into your workflow:

1. **Start watch mode** at beginning of work
2. **Sync after critical phases** (0, 3, 6, 8)
3. **Validate before handoff** to designer
4. **Check dashboard** daily
5. **Generate reports** weekly

Zero manual backup effort, maximum safety.

---

**Next:** See [README.md](./README.md) for full command reference.
