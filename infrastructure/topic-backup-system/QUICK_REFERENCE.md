# Quick Reference - Y-IT Topic Backup System

Cheat sheet for common commands and workflows.

## Essential Commands

### Setup (One-time)

```bash
# Install
npm install

# Setup database
npm run setup

# Test connection
npm run sync -- --dry-run --topic=dropshipping
```

### Daily Usage

```bash
# Start watch mode (auto-sync)
npm run watch

# Sync specific topic
npm run sync -- --topic=dropshipping

# Check status
npm run report

# View dashboard
npm run dashboard
# http://localhost:3000
```

## Command Reference

### Sync Commands

```bash
# Topic sync
npm run sync -- --topic=TOPIC_NAME
npm run sync -- --topic=01

# Batch sync
npm run sync -- --batch=A

# Phase sync
npm run sync -- --phase=3
npm run sync -- --topic=dropshipping --phase=3

# Options
--dry-run          Preview without uploading
--force            Re-upload unchanged files
--verbose          Show detailed output
```

### Watch Mode

```bash
# Start watching
npm run watch

# Stop watching
Ctrl+C

# Background mode (Linux/Mac)
npm run watch &

# Using screen
screen -S backup
npm run watch
# Ctrl+A, D to detach
```

### Validation

```bash
# Validate topic
npm run validate -- --topic=dropshipping

# Validate batch
npm run validate -- --batch=A

# Validate all
npm run validate

# Options
--verbose          Show phase dependencies
--strict           Fail on warnings
```

### Restore

```bash
# Restore topic
npm run restore -- --topic=dropshipping --to=/path

# Restore phase
npm run restore -- --topic=dropshipping --phase=3 --to=/path

# Interactive selection
npm run restore -- --topic=dropshipping --interactive

# Options
--overwrite        Overwrite existing files
```

### Reports

```bash
# Console report
npm run report

# Detailed report
npm run report -- --detailed

# Export formats
npm run report -- --output=report.json
npm run report -- --output=report.csv
npm run report -- --output=report.html
```

## Common Workflows

### New Topic Workflow

```bash
# 1. Create topic directory
mkdir -p production/dropshipping

# 2. Add Phase 0 files
# ... create research files ...

# 3. Sync
npm run sync -- --topic=dropshipping --phase=0

# 4. Validate
npm run validate -- --topic=dropshipping
```

### Designer Handoff

```bash
# 1. Complete Phase 6 files
# ... create designer brief ...

# 2. Sync
npm run sync -- --topic=dropshipping --phase=6

# 3. Validate
npm run validate -- --topic=dropshipping

# 4. Share Google Drive link with designer
# Or restore to designer location:
npm run restore -- --topic=dropshipping --phase=6 --to=/designer/path
```

### Batch Production

```bash
# 1. Complete Batch A topics (1-5)
# ... work on topics 1-5 ...

# 2. Sync entire batch
npm run sync -- --batch=A

# 3. Validate
npm run validate -- --batch=A

# 4. Check status
npm run report | grep "Batch A"
```

### Emergency Recovery

```bash
# 1. List available backups
npm run restore

# 2. Restore specific topic
npm run restore -- --topic=dropshipping --to=/recovery

# 3. Restore specific phase
npm run restore -- --topic=dropshipping --phase=3 --to=/recovery

# 4. Interactive file selection
npm run restore -- --topic=dropshipping --interactive
```

## File Name Patterns

### Phase 0 - Research
- `*_research_engine.md` ✅ Required
- `*_research.md`
- `market_analysis.*`

### Phase 1 - Strategy
- `*_research_summary.md` ✅ Required
- `*_content_strategy.md` ✅ Required

### Phase 2 - Case Studies
- `*_case_studies.md` ✅ Required

### Phase 3 - Content
- `*_manuscript_full.md` ✅ Required
- `*_manuscript_compressed.md` ✅ Required
- `*_content_extraction.md`
- `*_24page_structure.*`

### Phase 4 - Design Specs
- `*_image_specifications.md` ✅ Required
- `*_hero_brief.md`
- `*_comic_strip_brief.md`

### Phase 5 - Audit
- `*_manuscript_audit.md` ✅ Required

### Phase 6 - Designer Handoff
- `*_designer_brief.md` ✅ Required
- `*_complete_spec_package.md` ✅ Required

### Phase 7 - Design Production
- `*.indd` (InDesign)
- `*_proof_v*.pdf`

### Phase 8 - Final Assets
- `*_KDP_final.pdf` ✅ Required
- `*_gumroad.pdf`
- `*_web_version/*`

### Phase 9 - Quality
- `quality_checklist.md` ✅ Required
- `approval_sign_off.md`

## Configuration Files

### .env
```bash
# Google Drive
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Local paths
PRODUCTION_ROOT=/home/user/Y-it-nano/production
DATABASE_PATH=./sync-state.db

# Settings
WATCH_MODE=true
COMPRESSION_ENABLED=true

# Notifications (optional)
SLACK_WEBHOOK_URL=...
```

### config.json
```json
{
  "googleDrive": {
    "compressionEnabled": true,
    "keepVersions": 3
  },
  "sync": {
    "watchDebounceMs": 5000,
    "parallelUploads": 3
  }
}
```

## Troubleshooting

### Connection Failed
```bash
# Check credentials
cat .env | grep GOOGLE

# Test connection
npm run sync -- --dry-run --topic=dropshipping
```

### Phase Not Detected
```bash
# Check file patterns
cat file-patterns.json | grep "Phase-X"

# Use verbose mode
npm run sync -- --verbose --topic=dropshipping
```

### Database Locked
```bash
# Close other processes
pkill -f watch-production

# Reset database
rm sync-state.db
npm run setup
```

### Upload Failed
```bash
# Check sync status
npm run report

# Retry with force
npm run sync -- --topic=dropshipping --force

# Check error log
tail -f logs/sync.log
```

## Keyboard Shortcuts (Dashboard)

- **Refresh** - Click "Refresh Data" button
- **Auto-refresh** - Every 30 seconds automatically

## File Sizes

| File Type | Typical Size | Compression |
|-----------|--------------|-------------|
| .md | 20-100 KB | 60-80% |
| .pdf (proof) | 10-50 MB | None |
| .pdf (final) | 20-100 MB | None |
| .indd | 50-500 MB | None |

## Storage Guide

| Topics | Storage | Plan Needed |
|--------|---------|-------------|
| 1-8 | <15 GB | Free |
| 9-25 | 15-50 GB | 100 GB ($1.99/mo) |
| 26-50 | 50-100 GB | 100 GB ($1.99/mo) |
| 51-100 | 100-200 GB | 200 GB ($2.99/mo) |

## Topic IDs & Batches

| Batch | Topics | IDs |
|-------|--------|-----|
| A | Dropshipping, POD, Affiliate, Courses, AI | 01-05 |
| B | Social Media, Freelancing, Real Estate, Crypto, NFT | 06-10 |
| C | Amazon FBA, Etsy, YouTube, Podcast, Instagram | 11-15 |
| D | TikTok, Stocks, Forex, Options, Day Trading | 16-20 |
| E | Email, SEO, Web Dev, App Dev, SaaS | 21-25 |
| F | Coaching, Consulting, MLM, Direct Sales, Network | 26-30 |
| G | Writing, Photography, Design, VA, Transcription | 31-40 |
| H | Data Entry, Surveys, Reselling, Rentals, Vending | 41-50 |

## Status Codes

| Status | Meaning |
|--------|---------|
| synced | File uploaded successfully |
| pending | Awaiting upload |
| error | Upload failed (check logs) |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error occurred |

## Log Files

```bash
# Sync log
tail -f logs/sync.log

# Database queries
sqlite3 sync-state.db

# Recent uploads
sqlite3 sync-state.db "SELECT * FROM sync_history ORDER BY created_at DESC LIMIT 10"
```

## Environment Variables

```bash
# Override production root
PRODUCTION_ROOT=/custom/path npm run sync -- --topic=dropshipping

# Override database path
DATABASE_PATH=/custom/sync.db npm run sync

# Enable debug logging
LOG_LEVEL=debug npm run sync
```

## Backup Database

```bash
# Backup
cp sync-state.db sync-state.db.backup

# Restore
cp sync-state.db.backup sync-state.db

# Automated backup (cron)
0 0 * * * cp /path/to/sync-state.db /backups/sync-$(date +\%Y\%m\%d).db
```

## Performance Tips

1. **Use watch mode** - Fastest for active development
2. **Batch operations** - Sync entire batch instead of topics individually
3. **Parallel uploads** - Increase in config.json (but watch rate limits)
4. **Compression** - Enabled by default for text files
5. **Selective sync** - Sync only specific phases when needed

## Support Resources

- **README.md** - Full documentation
- **SETUP_GUIDE.md** - Detailed setup
- **WORKFLOW_INTEGRATION.md** - Production integration
- **COST_ANALYSIS.md** - Costs and ROI
- **GitHub Issues** - Report bugs

## Quick Links

- [Google Drive](https://drive.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [SQLite Documentation](https://sqlite.org/docs.html)

---

**Print this page for offline reference**
