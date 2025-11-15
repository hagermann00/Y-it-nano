# Setup Guide - Y-It Topic Backup System

Complete step-by-step setup instructions for the Y-It topic backup system.

## Prerequisites

- Node.js 16+ installed
- Google account with Drive access
- Git (for version control)
- Terminal/command line access

## Step 1: Install Dependencies

```bash
cd /home/user/Y-it-nano/infrastructure/topic-backup-system
npm install
```

This installs:
- `googleapis` - Google Drive API client
- `chokidar` - File system watcher
- `better-sqlite3` - Database
- `chalk`, `ora` - CLI formatting
- Other utilities

## Step 2: Google Drive Setup

You have two options: **Service Account** (recommended for automation) or **OAuth 2.0** (interactive).

### Option A: Service Account (Recommended)

**Best for:** Automated, headless sync operations.

#### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project**
3. Name: `Y-IT-Backup`
4. Click **Create**

#### 2.2 Enable Google Drive API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click **Enable**

#### 2.3 Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Name: `y-it-backup-service`
4. Click **Create and Continue**
5. Role: **Editor** (or custom with Drive permissions)
6. Click **Continue** > **Done**

#### 2.4 Generate Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON**
5. Click **Create**
6. Save the JSON file (e.g., `service-account-key.json`)

#### 2.5 Extract Credentials

Open the JSON file and copy:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

#### 2.6 Share Google Drive Folder

1. Create folder in Google Drive: `Y-IT-Production`
2. Right-click > **Share**
3. Add the service account email (e.g., `y-it-backup-service@y-it-backup.iam.gserviceaccount.com`)
4. Give **Editor** permissions
5. Click **Share**

**Important:** The service account needs explicit access to the folder!

### Option B: OAuth 2.0 (Interactive)

**Best for:** Manual sync operations, development.

#### 2.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API (same as above)
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth Client ID**
5. Application type: **Desktop app**
6. Name: `Y-It Backup Desktop`
7. Click **Create**

#### 2.2 Download Credentials

1. Click the download icon next to your OAuth client
2. Save as `credentials.json`

#### 2.3 First-time Authorization

Run the authorization flow:

```bash
node authorize-oauth.js
```

This will:
1. Open browser to Google login
2. Ask for Drive permissions
3. Save tokens to `.tokens.json`

## Step 3: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
nano .env
```

### For Service Account:

```bash
# Google Drive API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=y-it-backup-service@y-it-backup.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# Local Configuration
PRODUCTION_ROOT=/home/user/Y-it-nano/production
DATABASE_PATH=./sync-state.db

# Sync Settings
WATCH_MODE=true
COMPRESSION_ENABLED=true
```

### For OAuth 2.0:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# (Same local config as above)
```

**Important Notes:**

- Private key must be in quotes with `\n` for newlines
- Don't commit `.env` to git (already in `.gitignore`)
- Keep credentials secure

## Step 4: Initialize Database

```bash
npm run setup
```

This creates:
- `sync-state.db` - SQLite database
- Database schema (files, topics, phases, etc.)
- Initial topic/batch data

You should see:

```
✓ Database schema created
✓ Batch data initialized
✓ 50 topics initialized

Database Statistics:
  Topics: 50
  Batches: 8
  Files: 0
```

## Step 5: Create Production Directory Structure

```bash
# Create production root
mkdir -p /home/user/Y-it-nano/production

# Create first topic directory
mkdir -p /home/user/Y-it-nano/production/dropshipping
```

Your local structure should mirror:

```
/home/user/Y-it-nano/production/
├── dropshipping/
│   ├── dropshipping_research_engine.md
│   ├── dropshipping_research_summary.md
│   ├── dropshipping_case_studies.md
│   └── ... (other phase files)
├── print-on-demand/
├── affiliate-marketing/
└── ... (50 topics total)
```

## Step 6: Test Connection

```bash
# Test Google Drive connection
npm run sync -- --dry-run --topic=dropshipping
```

Expected output:

```
Y-It Topic Backup Sync

✓ Connected to Google Drive

=== Syncing Topic: Dropshipping (01) ===

[DRY RUN] Would create folder: Y-IT-Production
[DRY RUN] Would create folder: Topics
[DRY RUN] Would upload: dropshipping_research_engine.md (2.3 KB)
...

✓ Topic sync complete: Dropshipping
```

If you see errors, check:
1. `.env` credentials are correct
2. Service account has folder access
3. Google Drive API is enabled

## Step 7: First Real Sync

```bash
# Sync your first topic
npm run sync -- --topic=dropshipping
```

This will:
1. Connect to Google Drive
2. Create folder structure
3. Upload all files for dropshipping
4. Record in database

Check Google Drive: `Y-IT-Production/Topics/01-Dropshipping/`

## Step 8: Verify Sync

```bash
# Generate report
npm run report

# Open dashboard
npm run dashboard
# Visit: http://localhost:3000
```

You should see:
- Topic: Dropshipping
- Files synced
- Phases detected
- Progress percentage

## Step 9: Enable Watch Mode (Optional)

For real-time sync:

```bash
# Start watcher
npm run watch
```

Now any file changes in `/home/user/Y-it-nano/production` will auto-sync to Google Drive within 5 seconds.

**Tip:** Run this in a separate terminal or use `screen`/`tmux`.

## Step 10: Setup Notifications (Optional)

### Slack Integration

1. Create Slack incoming webhook:
   - Go to: https://api.slack.com/messaging/webhooks
   - Create webhook for your workspace
   - Copy webhook URL

2. Add to `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NOTIFY_ON_PHASE_COMPLETE=true
NOTIFY_ON_BATCH_COMPLETE=true
NOTIFY_ON_ERROR=true
```

Now you'll receive Slack messages when:
- A phase completes
- A batch finishes
- Errors occur

## Common Setup Issues

### Issue: "Failed to connect to Google Drive"

**Solution:**
- Check `.env` credentials are correct
- Verify Google Drive API is enabled
- For service account: ensure folder is shared with service account email
- For OAuth: re-run authorization flow

### Issue: "Private key format error"

**Solution:**
Replace literal newlines with `\n`:

```bash
# Correct:
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLine1\nLine2\n-----END PRIVATE KEY-----\n"

# Incorrect:
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Line1
Line2
-----END PRIVATE KEY-----"
```

### Issue: "Permission denied" on Google Drive

**Solution:**
- Service account: Share folder with service account email
- OAuth: Re-authorize with correct scopes

### Issue: "Database locked"

**Solution:**
- Close any other processes using the database
- Delete `sync-state.db` and re-run `npm run setup`

### Issue: "Phase detection not working"

**Solution:**
- Check file names match patterns in `file-patterns.json`
- Use verbose mode: `npm run sync -- --verbose --topic=dropshipping`

## Folder Structure Setup

Create this Google Drive structure (auto-created by system):

```
Google Drive/
└── Y-IT-Production/
    ├── Topics/
    │   ├── 01-Dropshipping/
    │   │   ├── Phase-0-Research/
    │   │   ├── Phase-1-Strategy/
    │   │   ├── Phase-2-Case-Studies/
    │   │   ├── Phase-3-Content/
    │   │   ├── Phase-4-Design-Specs/
    │   │   ├── Phase-5-Audit/
    │   │   ├── Phase-6-Designer-Handoff/
    │   │   ├── Phase-7-Design-Production/
    │   │   ├── Phase-8-Final-Assets/
    │   │   └── Phase-9-Quality/
    │   ├── 02-Print-On-Demand/
    │   └── ... (50 topics)
    ├── Templates/
    ├── Batches/
    │   ├── Batch-A/
    │   ├── Batch-B/
    │   └── ...
    └── Archive/
```

The system creates this automatically on first sync.

## Advanced Configuration

### Custom Production Root

```bash
# In .env
PRODUCTION_ROOT=/custom/path/to/production
```

### Custom Database Path

```bash
DATABASE_PATH=/path/to/sync-state.db
```

### Compression Settings

Edit `config.json`:

```json
{
  "googleDrive": {
    "compressionEnabled": true
  }
}
```

Disable to skip compression (faster but uses more storage).

### Watch Debounce

```bash
# Wait 10 seconds instead of 5 before syncing
WATCH_DEBOUNCE_MS=10000
```

### Parallel Uploads

Edit `config.json`:

```json
{
  "sync": {
    "parallelUploads": 5
  }
}
```

More = faster but risks rate limiting.

## Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Rotate credentials** - Every 90 days
3. **Limit service account scope** - Only Drive access
4. **Use folder sharing** - Don't give full Drive access
5. **Backup database** - `sync-state.db` contains state
6. **Encrypt production files** - If sensitive
7. **Enable 2FA** - On Google account

## Backup & Recovery

### Backup Database

```bash
# Regular backup
cp sync-state.db sync-state.db.backup

# Automated daily backup
echo "0 0 * * * cp /path/to/sync-state.db /backups/sync-state.db.$(date +\%Y\%m\%d)" | crontab -
```

### Restore Database

```bash
cp sync-state.db.backup sync-state.db
```

### Restore from Google Drive

```bash
# Restore entire topic
npm run restore -- --topic=dropshipping --to=/restore/path

# Restore specific phase
npm run restore -- --topic=dropshipping --phase=3 --to=/restore/path
```

## Next Steps

1. ✅ Complete setup
2. ✅ Test sync with one topic
3. ✅ Verify in Google Drive
4. ✅ Enable watch mode
5. ✅ Setup notifications
6. Read [WORKFLOW_INTEGRATION.md](./WORKFLOW_INTEGRATION.md) for production integration

## Scheduled Sync (Optional)

### Using Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add sync every 6 hours
0 */6 * * * cd /home/user/Y-it-nano/infrastructure/topic-backup-system && npm run sync -- --batch=A >> /var/log/y-it-sync.log 2>&1
```

### Using Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at specific time
4. Action: Start a program
5. Program: `node`
6. Arguments: `topic-backup-sync.js --batch=A`
7. Start in: `C:\path\to\topic-backup-system`

## Support

If setup fails:

1. Check error messages carefully
2. Verify all credentials
3. Test Google Drive connection manually
4. Review logs: `./logs/sync.log`
5. Try dry-run mode first

Setup complete! You're ready to start backing up your Y-It production files.
