# Y-IT Topic Backup System

Intelligent, progressive file backup system for Y-IT nano-book production workflow. Automatically organizes and syncs all production files to Google Drive by topic and phase.

## Overview

The Y-IT production process generates 20-30+ files per topic across 10 phases (Phase 0-9). With 50 topics planned, that's over 1,000+ files to manage. This backup system:

- **Organizes by topic & phase** - Auto-detects which phase a file belongs to
- **Progressive sync** - Only uploads new/changed files (incremental)
- **Real-time watching** - Monitors production folder for changes
- **Batch operations** - Sync entire batches (A-H) at once
- **Version history** - Keeps last 3 versions of each file
- **Compression** - Gzip text files before upload to save space
- **Progress tracking** - SQLite database tracks sync state
- **Smart resumption** - Resumes interrupted uploads
- **Phase validation** - Warns if phases incomplete or out of order

## Features

### Topic-Centric Organization

```
Google Drive: Y-IT-Production/
├── Topics/
│   ├── 01-Dropshipping/
│   │   ├── Phase-0-Research/
│   │   ├── Phase-1-Strategy/
│   │   ├── Phase-2-Case-Studies/
│   │   ├── ...
│   │   └── Phase-9-Quality/
│   ├── 02-Print-On-Demand/
│   └── ... (50 topics)
```

### Progressive Sync

- MD5 hash comparison (skip unchanged files)
- Resumable uploads for large files (>5MB)
- Exponential backoff retry logic
- Parallel uploads (3 concurrent)
- Compression for text files

### Intelligence

- Auto-detect phase from filename patterns
- Track completion % per topic
- Validate phase dependencies
- Notify on phase/batch completion (Slack)
- Generate comprehensive reports

## Quick Start

### 1. Installation

```bash
cd infrastructure/topic-backup-system
npm install
```

### 2. Google Drive Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Google Drive credentials
nano .env
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed Google Drive setup instructions.

### 3. Initialize Database

```bash
npm run setup
```

### 4. Sync Your First Topic

```bash
# Sync a specific topic
npm run sync -- --topic=dropshipping

# Dry run (preview without uploading)
npm run sync -- --topic=dropshipping --dry-run
```

## Usage

### Sync Commands

```bash
# Sync specific topic
npm run sync -- --topic=dropshipping
npm run sync -- --topic=01

# Sync entire batch
npm run sync -- --batch=A

# Sync specific phase across all topics
npm run sync -- --phase=3

# Sync specific phase for specific topic
npm run sync -- --topic=dropshipping --phase=3

# Force re-upload (even if unchanged)
npm run sync -- --topic=dropshipping --force

# Dry run (preview)
npm run sync -- --dry-run --topic=dropshipping

# Verbose output
npm run sync -- --verbose --topic=dropshipping
```

### Watch Mode (Real-time Sync)

```bash
# Monitor production folder for changes
npm run watch

# Auto-syncs files within 5 seconds of change
# Press Ctrl+C to stop
```

### Validation

```bash
# Validate topic structure
npm run validate -- --topic=dropshipping

# Validate entire batch
npm run validate -- --batch=A

# Validate all topics
npm run validate

# Strict mode (fail on warnings)
npm run validate -- --strict

# Check phase dependencies
npm run validate -- --topic=dropshipping --verbose
```

### Restore

```bash
# Restore topic from Google Drive
npm run restore -- --topic=dropshipping --to=/path/to/restore

# Restore specific phase
npm run restore -- --topic=dropshipping --phase=3 --to=/path

# Interactive mode (select files)
npm run restore -- --topic=dropshipping --interactive

# Overwrite existing files
npm run restore -- --topic=dropshipping --overwrite

# List available topics for restore
npm run restore
```

### Reports

```bash
# Console report
npm run report

# Detailed console report
npm run report -- --detailed

# Export to JSON
npm run report -- --output=./report.json

# Export to CSV
npm run report -- --output=./report.csv

# Export to HTML
npm run report -- --output=./report.html
```

### Dashboard

```bash
# Start web dashboard
npm run dashboard

# Open browser to: http://localhost:3000
```

## Configuration

### config.json

Main configuration file:

```json
{
  "googleDrive": {
    "compressionEnabled": true,
    "resumableUploadThreshold": 5242880,
    "maxRetries": 3,
    "keepVersions": 3
  },
  "local": {
    "productionRoot": "/home/user/Y-it-nano/production"
  },
  "sync": {
    "watchMode": true,
    "watchDebounceMs": 5000,
    "parallelUploads": 3
  }
}
```

### file-patterns.json

Phase detection patterns:

```json
{
  "phaseDetection": {
    "Phase-0-Research": {
      "patterns": [".*_research_engine\\.md$", ".*market_analysis.*"]
    }
  }
}
```

### .env

Credentials and settings:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
PRODUCTION_ROOT=/home/user/Y-it-nano/production
```

## Database Schema

SQLite database (`sync-state.db`) tracks:

- **files** - Every synced file with MD5, status, timestamps
- **topics** - Per-topic progress and stats
- **phases** - Phase completion per topic
- **sync_history** - Audit log of all operations
- **file_versions** - Version history (last 3)
- **batches** - Batch-level progress

## Architecture

### Core Components

1. **topic-backup-sync.js** - Main sync engine
2. **watch-production-folder.js** - File watcher
3. **validate-topic-structure.js** - Structure validator
4. **restore-topic.js** - Restore from Google Drive
5. **sync-report.js** - Report generator
6. **dashboard.html** - Web dashboard

### Flow

```
Production Files
    ↓
File Watcher (optional)
    ↓
Sync Engine
    ↓
Phase Detection → Validation
    ↓
MD5 Check → Skip if unchanged
    ↓
Compress (if text)
    ↓
Upload to Google Drive (resumable)
    ↓
Update Database
    ↓
Track Progress
```

## Integration with Production SOP

Add sync checkpoints after each phase:

```bash
# After Phase 0 (Research)
npm run sync -- --topic=dropshipping --phase=0

# After Phase 3 (Content)
npm run sync -- --topic=dropshipping --phase=3

# After Phase 6 (Designer Handoff)
npm run sync -- --topic=dropshipping --phase=6

# After Phase 8 (Final Assets)
npm run sync -- --topic=dropshipping --phase=8
```

Or run watch mode during production:

```bash
# Start watch mode
npm run watch

# All changes auto-sync in background
```

## Notifications

Enable Slack notifications in `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NOTIFY_ON_PHASE_COMPLETE=true
NOTIFY_ON_BATCH_COMPLETE=true
```

Notifications sent when:
- Phase completes for a topic
- Batch completes
- Errors occur during sync

## Performance

### Benchmarks

- **Small files (<1MB)**: ~500ms upload
- **Medium files (1-5MB)**: ~2-5s upload
- **Large files (>5MB)**: Resumable upload, varies
- **Batch sync (5 topics)**: ~5-10 minutes
- **Full sync (50 topics)**: ~60-90 minutes

### Optimization

- Parallel uploads (3 concurrent)
- Compression (60-80% reduction for .md files)
- Incremental sync (skip unchanged)
- Local SQLite caching
- Resumable uploads

## Troubleshooting

### Connection Issues

```bash
# Test Google Drive connection
node -e "require('./topic-backup-sync').initDrive()"
```

### Database Issues

```bash
# Reset database
rm sync-state.db
npm run setup
```

### Sync Stuck

```bash
# Check sync status
npm run report

# Force re-sync
npm run sync -- --topic=dropshipping --force
```

### Phase Detection Fails

Check `file-patterns.json` and ensure file names match patterns.

## Storage Estimate

For 50 topics:

- **Per topic**: ~50MB average
- **Total uncompressed**: ~2.5GB
- **With compression**: ~1.5GB
- **With 3 versions**: ~4.5GB

Google Drive free tier: 15GB (sufficient)

## Cost Analysis

### Google Drive

- **Free tier**: 15GB (enough for ~50 topics)
- **100GB**: $1.99/month
- **2TB**: $9.99/month

### Recommended

Start with free tier, upgrade to 100GB if needed (~$24/year).

## Development

### Running Tests

```bash
npm test
```

### Adding New Phase

1. Update `config.json` phases array
2. Update `file-patterns.json` with detection patterns
3. Re-run database setup: `npm run setup`

### Adding New Topic

Topics auto-loaded from `config.json`. Add to topics array and batches.

## Security

- Credentials stored in `.env` (gitignored)
- Service account recommended for automation
- Read/write access only to specific folder
- File versions kept (accidental deletion protection)
- Local database encrypted at rest (optional)

## Support

For issues or questions:

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Check [WORKFLOW_INTEGRATION.md](./WORKFLOW_INTEGRATION.md)
3. Review error logs: `./logs/sync.log`
4. Run validation: `npm run validate`

## Roadmap

- [ ] Web UI for managing sync
- [ ] Email notifications
- [ ] S3/Dropbox/OneDrive support
- [ ] Automated scheduling (cron)
- [ ] Conflict resolution UI
- [ ] Team collaboration features

## License

MIT

## Credits

Built for Y-IT nano-book production workflow.
