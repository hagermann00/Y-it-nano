# Google Drive Backup - Quick Start Guide

**5-Minute Setup for Experienced Developers**

---

## Prerequisites Checklist

```bash
# Verify you have:
node --version          # 14.0.0 or higher
pg_dump --version       # PostgreSQL client installed
git --version           # Git installed
```

---

## Step 1: Google Cloud Setup (15 minutes)

1. **Create Project:** [console.cloud.google.com](https://console.cloud.google.com/) → New Project → "Y-It-Backups"
2. **Enable API:** APIs & Services → Library → Search "Google Drive API" → Enable
3. **Create Service Account:**
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Name: `yit-backup-service`
   - Role: None (skip)
   - Create → Keys → Add Key → JSON → Download
4. **Setup Google Drive:**
   - [drive.google.com](https://drive.google.com/) → New → Folder → "Y-It-Backups"
   - Share folder → Add service account email → Editor permission
   - Copy folder ID from URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`

---

## Step 2: Installation (5 minutes)

```bash
cd /home/user/Y-it-nano/infrastructure/google-drive-backup

# Install dependencies
npm install

# Setup credentials
mkdir -p credentials
chmod 700 credentials
# Upload your service-account-key.json to credentials/
chmod 600 credentials/service-account-key.json

# Configure
cp .env.example .env
nano .env  # Edit with your settings
chmod 600 .env
```

---

## Step 3: Configure `.env` (5 minutes)

**Minimum required:**

```bash
# Google Drive
GDRIVE_BACKUP_FOLDER_ID=your_folder_id_here

# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_NAME=yit_database
DB_USER=postgres
DB_PASSWORD=your_password_here
```

---

## Step 4: Test (5 minutes)

```bash
# Test config backup (fast)
npm run backup:config

# Verify in Google Drive
# Should see: Y-It-Backups/YYYY-MM-DD/yit_config_*.tar.gz

# Test database backup (slower)
npm run backup:database

# Verify in Google Drive
# Should see: Y-It-Backups/YYYY-MM-DD/yit_db_*.dump
```

---

## Step 5: Automate (5 minutes)

```bash
# Edit crontab
crontab -e

# Add these lines:
0 * * * * cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js --type=database >> /var/log/yit-gdrive-backup.log 2>&1
0 2 * * * cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js --type=config >> /var/log/yit-gdrive-backup.log 2>&1

# Save and exit

# Create log file
sudo touch /var/log/yit-gdrive-backup.log
sudo chmod 666 /var/log/yit-gdrive-backup.log
```

---

## Step 6: Verify (5 minutes)

```bash
# Watch for first backup
tail -f /var/log/yit-gdrive-backup.log

# Check cron is scheduled
crontab -l

# List cron jobs running
ps aux | grep cron
```

---

## Common Commands

```bash
# Manual backup
npm run backup:full                    # Database + config
npm run backup:database                # Database only
npm run backup:config                  # Config only

# View logs
tail -f /var/log/yit-gdrive-backup.log

# Check status
./check-backup-status.sh

# List backups
ls -lh /tmp/yit-backups/  # Local temp files (should be empty after backup)
```

---

## Troubleshooting

**"Service account key not found"**
```bash
ls -la credentials/service-account-key.json
```

**"Cannot connect to database"**
```bash
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"
```

**"Upload failed"**
- Check folder is shared with service account (Editor permission)
- Verify GDRIVE_BACKUP_FOLDER_ID in `.env`

---

## Next Steps

1. ✅ Test restore procedure (see disaster_recovery.md)
2. ✅ Setup Slack notifications (add SLACK_WEBHOOK_URL to .env)
3. ✅ Schedule monthly DR test (3rd Friday)
4. ✅ Train on-call team on restore procedure

---

**Full Documentation:** See `README.md` and `setup-gdrive-backup.md`
**Support:** Check logs at `/var/log/yit-gdrive-backup.log`
