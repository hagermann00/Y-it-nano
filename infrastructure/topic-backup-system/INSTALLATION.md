# Installation & Quick Start

**5-minute setup guide for the Y-IT Topic Backup System**

## Prerequisites

- Node.js 16+ installed
- Google account
- 15-20 minutes for full setup

## Quick Setup (5 Steps)

### Step 1: Install Dependencies (2 minutes)

```bash
cd /home/user/Y-it-nano/infrastructure/topic-backup-system
npm install
```

This will install all required packages automatically.

### Step 2: Configure Google Drive (10 minutes)

**Option A: Service Account (Recommended for automation)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Y-IT-Backup"
3. Enable Google Drive API
4. Create Service Account
5. Download JSON key
6. Share a Google Drive folder with service account email

**Option B: OAuth 2.0 (For manual use)**

1. Create OAuth credentials in Google Cloud Console
2. Download credentials.json
3. Run authorization flow

**See SETUP_GUIDE.md for detailed instructions.**

### Step 3: Configure Environment (2 minutes)

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
nano .env
```

Add your Google Drive credentials to `.env`:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----"
PRODUCTION_ROOT=/home/user/Y-it-nano/production
```

### Step 4: Initialize Database (1 minute)

```bash
npm run setup
```

You should see:
```
✓ Database schema created
✓ 50 topics initialized
✓ 8 batches initialized
```

### Step 5: Test First Sync (5 minutes)

```bash
# Create test topic directory
mkdir -p /home/user/Y-it-nano/production/dropshipping

# Add a test file
echo "# Test Research" > /home/user/Y-it-nano/production/dropshipping/dropshipping_research_engine.md

# Dry run (preview)
npm run sync -- --dry-run --topic=dropshipping

# Real sync
npm run sync -- --topic=dropshipping

# Check Google Drive - you should see your file!
```

## Daily Usage

### Start Watch Mode (Recommended)

```bash
npm run watch
```

All file changes auto-sync within 5 seconds. Leave running in background.

### Manual Sync

```bash
# Sync specific topic
npm run sync -- --topic=dropshipping

# Sync entire batch
npm run sync -- --batch=A

# Sync specific phase
npm run sync -- --topic=dropshipping --phase=3
```

### Check Status

```bash
# Console report
npm run report

# Web dashboard
npm run dashboard
# Open: http://localhost:3000
```

### Validate Structure

```bash
# Validate topic
npm run validate -- --topic=dropshipping

# Validate batch
npm run validate -- --batch=A
```

### Restore Files

```bash
# Restore entire topic
npm run restore -- --topic=dropshipping --to=/restore/path

# Restore specific phase
npm run restore -- --topic=dropshipping --phase=3

# Interactive selection
npm run restore -- --topic=dropshipping --interactive
```

## Common Issues

### "Failed to connect to Google Drive"

**Check:**
- `.env` has correct credentials
- Google Drive API is enabled
- Service account has access to folder

**Fix:**
```bash
# Test connection
npm run sync -- --dry-run --topic=dropshipping
```

### "Phase not detected"

**Check:**
- File name matches pattern in `file-patterns.json`
- File is in correct directory

**Fix:**
```bash
# Use verbose mode to see detection
npm run sync -- --verbose --topic=dropshipping
```

### "Database locked"

**Fix:**
```bash
# Close other processes
pkill -f watch

# Restart sync
npm run sync -- --topic=dropshipping
```

## Next Steps

1. ✅ **Read README.md** - Full documentation
2. ✅ **Read WORKFLOW_INTEGRATION.md** - Integrate with your production process
3. ✅ **Enable watch mode** - Auto-sync all changes
4. ✅ **Setup notifications** - Slack integration (optional)
5. ✅ **Train your team** - Share QUICK_REFERENCE.md

## File Organization

Your local structure should be:

```
/home/user/Y-it-nano/production/
├── dropshipping/
│   ├── dropshipping_research_engine.md
│   ├── dropshipping_case_studies.md
│   └── ... (other phase files)
├── print-on-demand/
└── ... (50 topics total)
```

Google Drive structure (auto-created):

```
Y-IT-Production/
└── Topics/
    ├── 01-Dropshipping/
    │   ├── Phase-0-Research/
    │   ├── Phase-1-Strategy/
    │   └── ... (10 phases)
    ├── 02-Print-On-Demand/
    └── ... (50 topics)
```

## Help & Support

- **Quick commands:** See QUICK_REFERENCE.md
- **Full documentation:** See README.md
- **Setup help:** See SETUP_GUIDE.md
- **Workflow integration:** See WORKFLOW_INTEGRATION.md
- **Costs & ROI:** See COST_ANALYSIS.md

## Cost

- **Google Drive (100GB):** $1.99/month
- **Setup time:** 20 minutes one-time
- **Ongoing time:** 8 min/week (mostly automatic)

**Total annual cost:** ~$24

**Annual value:** $3,000+ (time saved + risk avoided)

**ROI:** 12,666%

---

**You're now ready to backup all Y-IT production files safely and automatically!**

Start with: `npm run watch`
