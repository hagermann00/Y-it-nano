# Google Drive Backup Setup Guide

Complete setup instructions for Y-IT Google Drive backup system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Automation](#automation)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 14+ installed
- ✅ PostgreSQL client tools (`pg_dump`) installed
- ✅ Access to Y-IT production database
- ✅ Google Cloud Platform account
- ✅ Terminal/SSH access to backup server

### Check Prerequisites

```bash
# Check Node.js version
node --version  # Should be 14.0.0 or higher

# Check pg_dump
pg_dump --version  # Should output PostgreSQL version

# Check database connectivity
psql -h your-rds-endpoint.amazonaws.com -U postgres -d yit_database -c "SELECT version();"
```

---

## Google Cloud Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Project Name: `Y-IT-Backups`
4. Click **Create**
5. Wait for project creation (30-60 seconds)

### Step 2: Enable Google Drive API

1. In Google Cloud Console, select your project
2. Navigate to **APIs & Services** → **Library**
3. Search for "Google Drive API"
4. Click **Google Drive API**
5. Click **Enable**
6. Wait for API activation (10-30 seconds)

### Step 3: Create Service Account

1. Navigate to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **Service Account**
3. Fill in details:
   - **Service account name:** `yit-backup-service`
   - **Service account ID:** `yit-backup-service` (auto-generated)
   - **Description:** `Service account for automated Y-IT database backups`
4. Click **CREATE AND CONTINUE**
5. **Grant this service account access to project:**
   - Skip this step (click **CONTINUE**)
6. **Grant users access to this service account:**
   - Skip this step (click **DONE**)

### Step 4: Create Service Account Key

1. On the **Credentials** page, find your service account
2. Click on the service account name (`yit-backup-service@...`)
3. Navigate to **KEYS** tab
4. Click **ADD KEY** → **Create new key**
5. Select **JSON** format
6. Click **CREATE**
7. A JSON file will download automatically
8. **IMPORTANT:** Keep this file secure! It provides full access to Google Drive.

### Step 5: Create Google Drive Backup Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Click **+ New** → **Folder**
3. Name: `Y-IT-Backups`
4. Click **Create**
5. Open the folder
6. **Share with service account:**
   - Click **Share** (or right-click → **Share**)
   - Add the service account email (from Step 3): `yit-backup-service@yit-backups.iam.gserviceaccount.com`
   - Set permission to **Editor**
   - Click **Send**
7. **Get Folder ID:**
   - Look at the URL: `https://drive.google.com/drive/folders/1abc123def456`
   - Copy the ID after `/folders/`: `1abc123def456`
   - Save this for configuration

---

## Installation

### Step 1: Navigate to Backup Directory

```bash
cd /home/user/Y-it-nano/infrastructure/google-drive-backup
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `googleapis` - Google Drive API client
- `dotenv` - Environment variable management
- `node-fetch` - For Slack notifications

### Step 3: Create Credentials Directory

```bash
mkdir -p credentials
chmod 700 credentials  # Secure permissions
```

### Step 4: Upload Service Account Key

Copy the JSON key file downloaded in **Step 4** of Google Cloud Setup:

```bash
# From your local machine (where you downloaded the key)
scp ~/Downloads/yit-backups-xxxxx.json user@your-server:/home/user/Y-it-nano/infrastructure/google-drive-backup/credentials/service-account-key.json

# OR if you're already on the server, paste the content:
nano credentials/service-account-key.json
# Paste the JSON content, save (Ctrl+O), exit (Ctrl+X)
```

**Secure the file:**

```bash
chmod 600 credentials/service-account-key.json
```

---

## Configuration

### Step 1: Create Environment File

```bash
cp .env.example .env
```

### Step 2: Edit Configuration

```bash
nano .env
```

**Required settings:**

```bash
# Google Drive
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
GDRIVE_BACKUP_FOLDER_ID=1abc123def456  # From Step 5 of Google Cloud Setup
GDRIVE_FOLDER_NAME=Y-IT-Backups

# Database (use your actual credentials)
DB_HOST=yit-production.c9abc123xyz.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=yit_database
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# Backup settings
BACKUP_TEMP_DIR=/tmp/yit-backups
BACKUP_RETENTION_DAYS=30
COMPRESSION_LEVEL=9

# Notifications
NOTIFICATIONS_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL  # Optional
```

**Save:** `Ctrl+O`, **Exit:** `Ctrl+X`

### Step 3: Secure Environment File

```bash
chmod 600 .env
```

---

## Testing

### Test 1: Verify Service Account Connection

```bash
node -e "
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

(async () => {
  try {
    const credentials = JSON.parse(fs.readFileSync('./credentials/service-account-key.json'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.about.get({ fields: 'user' });
    console.log('✓ Connected as:', res.data.user.emailAddress);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
  }
})();
"
```

**Expected output:** `✓ Connected as: yit-backup-service@yit-backups.iam.gserviceaccount.com`

### Test 2: Database Connection Test

```bash
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM topics;"
```

**Expected output:** A count of topics in your database

### Test 3: Run Configuration Backup Only

```bash
npm run backup:config
```

**Expected output:**
```
✓ Google Drive API initialized successfully
✓ Using existing backup folder: Y-IT-Backups
✓ Configuration backup created: yit_config_2025-11-08_14-30-00.tar.gz (2.5 KB)
✓ Uploaded: yit_config_2025-11-08_14-30-00.tar.gz (2.5 KB)
✓ Checksum verified: a1b2c3d4...
✅ SUCCESS
```

### Test 4: Run Database Backup Only

```bash
npm run backup:database
```

**Expected output:**
```
✓ Google Drive API initialized successfully
✓ Database dump created: yit_db_2025-11-08_14-35-00.dump (128.5 MB)
✓ Uploaded: yit_db_2025-11-08_14-35-00.dump (128.5 MB)
✓ Checksum verified: e5f6g7h8...
✅ SUCCESS
```

### Test 5: Run Full Backup

```bash
npm run backup:full
```

**Expected output:**
```
✓ Google Drive API initialized successfully
✓ Database dump created: yit_db_2025-11-08_14-40-00.dump (128.5 MB)
✓ Uploaded: yit_db_2025-11-08_14-40-00.dump (128.5 MB)
✓ Configuration backup created: yit_config_2025-11-08_14-40-00.tar.gz (2.5 KB)
✓ Uploaded: yit_config_2025-11-08_14-40-00.tar.gz (2.5 KB)
✓ Cleanup completed
✅ SUCCESS
Files Uploaded: 2
Total Size: 128.5 MB
```

### Verify in Google Drive

1. Open [Google Drive](https://drive.google.com/)
2. Navigate to **Y-IT-Backups** folder
3. You should see a folder named with today's date (e.g., `2025-11-08`)
4. Open the date folder
5. Verify files are present:
   - `yit_db_YYYY-MM-DD_HH-MM-SS.dump`
   - `yit_config_YYYY-MM-DD_HH-MM-SS.tar.gz`

---

## Automation

### Option 1: Cron (Recommended for Linux/Unix)

#### Step 1: Open Crontab

```bash
crontab -e
```

#### Step 2: Add Backup Schedule

**Hourly Database Backups (runs at minute 0 of every hour):**

```bash
0 * * * * cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js --type=database >> /var/log/yit-gdrive-backup.log 2>&1
```

**Daily Full Backup (runs at 2 AM every day):**

```bash
0 2 * * * cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js --type=full >> /var/log/yit-gdrive-backup.log 2>&1
```

**Weekly Config Backup (runs at 3 AM every Sunday):**

```bash
0 3 * * 0 cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js --type=config >> /var/log/yit-gdrive-backup.log 2>&1
```

#### Step 3: Save and Exit

- **nano:** `Ctrl+O`, `Enter`, `Ctrl+X`
- **vim:** `Esc`, `:wq`, `Enter`

#### Step 4: Verify Cron Jobs

```bash
crontab -l
```

#### Step 5: Create Log File

```bash
sudo touch /var/log/yit-gdrive-backup.log
sudo chmod 666 /var/log/yit-gdrive-backup.log
```

### Option 2: systemd Timer (Alternative)

Create systemd service and timer files for more advanced scheduling.

**Create service file:**

```bash
sudo nano /etc/systemd/system/yit-backup.service
```

```ini
[Unit]
Description=Y-IT Google Drive Backup Service
After=network.target

[Service]
Type=oneshot
User=your-username
WorkingDirectory=/home/user/Y-it-nano/infrastructure/google-drive-backup
ExecStart=/usr/bin/node /home/user/Y-it-nano/infrastructure/google-drive-backup/backup-to-gdrive.js --type=full
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Create timer file:**

```bash
sudo nano /etc/systemd/system/yit-backup.timer
```

```ini
[Unit]
Description=Y-IT Backup Timer
Requires=yit-backup.service

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

**Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable yit-backup.timer
sudo systemctl start yit-backup.timer
```

**Check status:**

```bash
sudo systemctl status yit-backup.timer
```

---

## Monitoring

### View Backup Logs

```bash
# View last 50 lines
tail -50 /var/log/yit-gdrive-backup.log

# Follow logs in real-time
tail -f /var/log/yit-gdrive-backup.log

# Search for errors
grep -i error /var/log/yit-gdrive-backup.log

# Search for successful backups
grep -i "SUCCESS" /var/log/yit-gdrive-backup.log
```

### Check Backup Status in Google Drive

```bash
# List recent backups using Google Drive API
node -e "
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

(async () => {
  const credentials = JSON.parse(fs.readFileSync('./credentials/service-account-key.json'));
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: \"'${process.env.GDRIVE_BACKUP_FOLDER_ID}' in parents and trashed=false\",
    fields: 'files(name, createdTime, size)',
    orderBy: 'createdTime desc',
    pageSize: 10
  });

  console.log('Recent backups:');
  res.data.files.forEach(f => {
    const size = (f.size / 1024 / 1024).toFixed(2);
    console.log(\`- \${f.name} (\${size} MB) - \${f.createdTime}\`);
  });
})();
"
```

### Slack Notifications Setup

1. Create Slack incoming webhook:
   - Go to [Slack API](https://api.slack.com/messaging/webhooks)
   - Click **Create your Slack app** → **From scratch**
   - App Name: `Y-IT Backup Notifications`
   - Workspace: Select your workspace
   - Click **Create App**
   - Navigate to **Incoming Webhooks**
   - Toggle **Activate Incoming Webhooks** to On
   - Click **Add New Webhook to Workspace**
   - Select channel: `#infrastructure` or `#alerts`
   - Click **Allow**
   - Copy webhook URL

2. Add to `.env`:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   NOTIFICATIONS_ENABLED=true
   ```

3. Test notification:
   ```bash
   npm run backup:config
   ```
   Check Slack channel for notification.

---

## Troubleshooting

### Problem: "Service account key not found"

**Solution:**
```bash
ls -la credentials/service-account-key.json
# If file doesn't exist, re-upload from Google Cloud
```

### Problem: "Authentication error" or "Invalid credentials"

**Solution:**
1. Verify service account key is valid JSON:
   ```bash
   cat credentials/service-account-key.json | jq .
   ```
2. Check service account has Drive API access in Google Cloud Console
3. Re-download service account key if corrupted

### Problem: "pg_dump: command not found"

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql-client

# Amazon Linux / RHEL
sudo yum install postgresql

# macOS
brew install postgresql
```

### Problem: "Database connection failed"

**Solution:**
1. Test database connection manually:
   ```bash
   PGPASSWORD=yourpass psql -h yourhost -U postgres -d yit_database -c "SELECT 1;"
   ```
2. Check database host, port, credentials in `.env`
3. Verify security group allows connection from backup server
4. Confirm RDS instance is running

### Problem: "Upload failed: Insufficient permissions"

**Solution:**
1. Verify folder is shared with service account:
   - Open folder in Google Drive
   - Click **Share**
   - Confirm `yit-backup-service@...` has **Editor** access
2. Check GDRIVE_BACKUP_FOLDER_ID is correct in `.env`

### Problem: "Checksum verification failed"

**Cause:** File corruption during upload

**Solution:**
1. Script will automatically retry (up to 3 times)
2. Check network stability
3. If persistent, increase `RETRY_DELAY_MS` in `.env`

### Problem: "Out of disk space"

**Solution:**
1. Check temp directory space:
   ```bash
   df -h /tmp
   ```
2. Cleanup old temp files:
   ```bash
   rm -rf /tmp/yit-backups/*
   ```
3. Change `BACKUP_TEMP_DIR` to location with more space

### Problem: Cron job not running

**Solution:**
1. Check cron service is running:
   ```bash
   sudo systemctl status cron
   ```
2. View cron logs:
   ```bash
   sudo tail -f /var/log/syslog | grep CRON
   ```
3. Ensure absolute paths in crontab:
   ```bash
   # Bad: cd google-drive-backup && node backup-to-gdrive.js
   # Good: cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js
   ```

### Problem: "Module not found: googleapis"

**Solution:**
```bash
cd /home/user/Y-it-nano/infrastructure/google-drive-backup
npm install
```

---

## Backup Retention Policy

**Default:** 30 days

**To change:**
```bash
# Edit .env
nano .env
# Change: BACKUP_RETENTION_DAYS=60

# Or pass as argument:
node backup-to-gdrive.js --retention-days=60
```

**How it works:**
- Script runs cleanup after each backup
- Deletes entire date folders older than retention period
- Example: If retention is 30 days, folders older than 30 days are deleted

**Manual cleanup:**
```bash
# List old backups
node -e "
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

(async () => {
  const credentials = JSON.parse(fs.readFileSync('./credentials/service-account-key.json'));
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
  const drive = google.drive({ version: 'v3', auth });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const res = await drive.files.list({
    q: \"'${process.env.GDRIVE_BACKUP_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and createdTime < '\${cutoff.toISOString()}'\",
    fields: 'files(name, createdTime)',
    orderBy: 'createdTime'
  });

  console.log('Folders older than 30 days:');
  res.data.files.forEach(f => console.log(\`- \${f.name} (\${f.createdTime})\`));
})();
"
```

---

## Security Best Practices

1. **Service Account Key:**
   - Store in secure location with `chmod 600`
   - Never commit to git
   - Rotate annually
   - Use separate service account per environment

2. **Database Credentials:**
   - Store in `.env` file (`chmod 600`)
   - Use read-only database user if possible
   - Rotate passwords quarterly

3. **Google Drive Folder:**
   - Share only with service account
   - Do not make public
   - Use folder-level encryption if handling PII/PCI data

4. **Backup Files:**
   - Encrypted in transit (HTTPS)
   - Consider encryption at rest (Google Drive default encryption)
   - For additional security, encrypt before upload:
     ```bash
     # Encrypt dump before upload
     gpg --encrypt --recipient admin@yourdomain.com yit_db.dump
     ```

5. **Access Logs:**
   - Monitor Google Drive audit logs
   - Set up alerts for unauthorized access
   - Review shared permissions monthly

---

## Integration with AWS S3 Backup

This Google Drive backup system complements the existing AWS S3 backup:

**Backup Strategy:**
- **AWS S3:** Primary backup (hourly, 30-day retention)
- **Google Drive:** Secondary backup (hourly, 30-day retention)

**Why both?**
- **Redundancy:** Two independent cloud providers
- **Disaster Recovery:** If AWS has outage, Google Drive backup available
- **Geographic Distribution:** Different data centers
- **Compliance:** Some regulations require multi-provider backup

**Cost Comparison:**
- **AWS S3:** ~$23/TB/month (Standard storage)
- **Google Drive:** ~$20/TB/month (via Google Workspace)
- **For ~500GB backups:** $10-12/month per provider

**Recovery Priority:**
1. Try AWS S3 restore (faster, same provider)
2. If S3 unavailable, use Google Drive
3. Both backups available for point-in-time recovery

---

## Next Steps

✅ **Completed Setup:**
- Google Cloud project created
- Service account configured
- Script installed and tested
- Cron job scheduled

🔜 **Recommended:**
1. Set up monitoring dashboard (see [SPRINT_BOARD_CRITICAL_FIXES.md](../../SPRINT_BOARD_CRITICAL_FIXES.md) Issue #10)
2. Test restore procedure once (validate backups work)
3. Document restore procedure in disaster recovery plan
4. Set up CloudWatch alarms for backup failures
5. Create runbook for on-call engineers

---

## Support

**Issues?**
- Check troubleshooting section above
- Review logs: `/var/log/yit-gdrive-backup.log`
- Test manually: `npm run backup:config`

**Questions?**
- See [README.md](./README.md) for quick reference
- See [disaster_recovery.md](../disaster_recovery.md) for recovery procedures

---

**Last Updated:** November 8, 2025
**Version:** 1.0.0
