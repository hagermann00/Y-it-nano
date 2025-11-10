# Y-It Google Drive Backup System

Automated PostgreSQL database and critical files backup to Google Drive as a secondary backup location alongside AWS S3.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup Google Cloud credentials (see setup-gdrive-backup.md)
# Follow the complete guide in setup-gdrive-backup.md

# 3. Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 4. Run backup
npm run backup:full
```

## Features

✅ **Automated PostgreSQL Backups**
- Hourly database dumps using `pg_dump`
- Custom compression (default: level 9)
- Point-in-time recovery capability

✅ **Critical Files Backup**
- Configuration files (.env, package.json)
- Infrastructure documentation
- Customizable file list

✅ **Google Drive Integration**
- Service Account authentication
- Organized folder structure (by date)
- Automatic folder creation

✅ **Reliability**
- Automatic retry logic (3 attempts)
- MD5 checksum verification
- Error handling and logging

✅ **Retention Management**
- Configurable retention policy (default: 30 days)
- Automatic cleanup of old backups
- Space-efficient storage

✅ **Notifications**
- Slack webhook integration
- Success/failure alerts
- Backup statistics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Y-It Backup Strategy                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRIMARY BACKUP         SECONDARY BACKUP                    │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   AWS S3     │      │ Google Drive │                   │
│  │              │      │              │                   │
│  │ • Hourly     │      │ • Hourly     │                   │
│  │ • 30 days    │      │ • 30 days    │                   │
│  │ • us-east-1  │      │ • Global     │                   │
│  └──────────────┘      └──────────────┘                   │
│         ▲                      ▲                           │
│         │                      │                           │
│         └──────────┬───────────┘                           │
│                    │                                       │
│          ┌─────────▼─────────┐                            │
│          │   PostgreSQL DB    │                            │
│          │   (AWS RDS)        │                            │
│          └────────────────────┘                            │
│                                                             │
│  RTO: < 1 hour  |  RPO: < 15 minutes                      │
└─────────────────────────────────────────────────────────────┘
```

## Backup Types

### 1. Database Backup

```bash
npm run backup:database
```

- Creates compressed PostgreSQL dump
- Uses `pg_dump` with custom format
- Includes all tables, indexes, and data
- Typical size: 100-500 MB (compressed)
- Duration: 2-5 minutes

### 2. Configuration Backup

```bash
npm run backup:config
```

- Archives critical configuration files
- Creates `.tar.gz` archive
- Includes:
  - `.env.production`
  - `package.json`
  - Infrastructure documentation
- Typical size: 1-10 MB
- Duration: <30 seconds

### 3. Full Backup

```bash
npm run backup:full
```

- Combines database + configuration
- Recommended for comprehensive backup
- Duration: 2-6 minutes

## Folder Structure in Google Drive

```
Y-IT-Backups/
├── 2025-11-08/
│   ├── yit_db_2025-11-08_00-00-00.dump
│   ├── yit_db_2025-11-08_01-00-00.dump
│   ├── yit_db_2025-11-08_02-00-00.dump
│   ├── ...
│   └── yit_config_2025-11-08_02-00-00.tar.gz
├── 2025-11-09/
│   ├── yit_db_2025-11-09_00-00-00.dump
│   └── ...
└── 2025-11-10/
    └── ...
```

- **Date folders** created automatically
- **Retention policy** deletes folders older than configured days
- **Naming convention:** `yit_[type]_YYYY-MM-DD_HH-MM-SS.[ext]`

## Configuration

### Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` | Yes | `./credentials/service-account-key.json` | Path to Google service account key |
| `GDRIVE_BACKUP_FOLDER_ID` | No | Auto-created | Google Drive folder ID |
| `GDRIVE_FOLDER_NAME` | No | `Y-IT-Backups` | Backup folder name |
| `DB_HOST` | Yes | - | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | `yit_database` | Database name |
| `DB_USER` | Yes | `postgres` | Database user |
| `DB_PASSWORD` | Yes | - | Database password |
| `BACKUP_TEMP_DIR` | No | `/tmp/yit-backups` | Temp directory |
| `BACKUP_RETENTION_DAYS` | No | `30` | Retention policy (days) |
| `COMPRESSION_LEVEL` | No | `9` | gzip compression (0-9) |
| `NOTIFICATIONS_ENABLED` | No | `false` | Enable notifications |
| `SLACK_WEBHOOK_URL` | No | - | Slack webhook URL |

### Command Line Options

```bash
# Specify backup type
node backup-to-gdrive.js --type=database
node backup-to-gdrive.js --type=config
node backup-to-gdrive.js --type=full

# Custom retention
node backup-to-gdrive.js --retention-days=60

# Combined
node backup-to-gdrive.js --type=full --retention-days=45
```

## Automation

### Recommended Cron Schedule

```bash
# Hourly database backup (matches AWS S3)
0 * * * * cd /path/to/google-drive-backup && node backup-to-gdrive.js --type=database >> /var/log/yit-gdrive-backup.log 2>&1

# Daily configuration backup
0 2 * * * cd /path/to/google-drive-backup && node backup-to-gdrive.js --type=config >> /var/log/yit-gdrive-backup.log 2>&1
```

See [cron-schedule.txt](./cron-schedule.txt) for more scheduling options.

## Monitoring

### View Logs

```bash
# Real-time
tail -f /var/log/yit-gdrive-backup.log

# Last 100 lines
tail -100 /var/log/yit-gdrive-backup.log

# Search for errors
grep ERROR /var/log/yit-gdrive-backup.log

# Search for successful backups
grep "SUCCESS" /var/log/yit-gdrive-backup.log
```

### Backup Statistics

Each backup completion shows:

```
╔════════════════════════════════════════════════════════════╗
║                    BACKUP SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝
Status:         ✅ SUCCESS
Duration:       127.45s
Files Uploaded: 2
Total Size:     128.5 MB
Errors:         0
```

### Slack Notifications

Configure in `.env`:

```bash
NOTIFICATIONS_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Notification includes:
- Status (success/failure)
- Duration
- Files uploaded
- Total size
- Any errors

## Disaster Recovery

### Restore from Google Drive Backup

#### Option 1: Using Google Drive Web Interface

1. Go to [Google Drive](https://drive.google.com/)
2. Navigate to `Y-IT-Backups/[DATE]/`
3. Download desired backup file
4. Restore database:

```bash
# Decompress if needed (already compressed by pg_dump)
pg_restore \
  --host=localhost \
  --port=5432 \
  --username=postgres \
  --dbname=yit_database \
  --clean \
  --verbose \
  yit_db_2025-11-08_14-30-00.dump
```

#### Option 2: Using Google Drive API (Automated)

Create a restore script or use the Drive API to download programmatically:

```javascript
// Download latest backup
const files = await drive.files.list({
  q: "'FOLDER_ID' in parents and name contains 'yit_db'",
  orderBy: 'createdTime desc',
  pageSize: 1
});

const fileId = files.data.files[0].id;
await drive.files.get(
  { fileId, alt: 'media' },
  { responseType: 'stream' }
).pipe(fs.createWriteStream('restore.dump'));
```

### Recovery Time Objectives

- **RTO (Recovery Time Objective):** < 1 hour
  - 10 min: Identify failure
  - 15 min: Download backup from Google Drive
  - 30 min: Restore database
  - 5 min: Validate and reconnect

- **RPO (Recovery Point Objective):** < 1 hour
  - Hourly backups mean max 1 hour data loss
  - Can restore to any hour within retention period

## Security

### Best Practices

✅ **Service Account Key**
- Store with `chmod 600` permissions
- Never commit to version control
- Rotate annually
- Use separate accounts per environment

✅ **Database Credentials**
- Store in `.env` file (excluded from git)
- Use read-only user if possible
- Rotate passwords quarterly

✅ **Google Drive Access**
- Share folder only with service account
- Never make folder public
- Enable audit logging
- Review access monthly

✅ **Backup Files**
- Encrypted in transit (HTTPS)
- Encrypted at rest (Google Drive default)
- Consider additional encryption for PII/PCI data

### Encryption at Rest (Optional)

For additional security, encrypt backups before upload:

```bash
# Encrypt dump
gpg --encrypt --recipient admin@yourdomain.com yit_db.dump

# Decrypt for restore
gpg --decrypt yit_db.dump.gpg > yit_db.dump
```

## Cost Estimation

### Storage Costs

**Assumptions:**
- Database size: 500 MB compressed
- Hourly backups: 24 per day
- Retention: 30 days
- Config backups: 5 MB (daily)

**Total storage:**
- Database: 500 MB × 24 × 30 = 360 GB
- Config: 5 MB × 30 = 150 MB
- **Total: ~360 GB**

**Google Workspace Cost:**
- Business Standard: $12/user/month (2 TB storage)
- **Estimated: $12/month** (shared with other uses)

**Alternative (Google Cloud Storage):**
- Standard Storage: $0.020/GB/month
- 360 GB × $0.020 = **$7.20/month**

### API Costs

Google Drive API is **free** for:
- Service account access
- File uploads/downloads
- Folder operations

Only quota limits apply (generous for backup use case).

### Total Monthly Cost

- **With Google Workspace:** $12/month (includes 2TB)
- **With Google Cloud Storage:** $7.20/month (360GB only)

**Comparison to AWS S3:**
- S3 Standard: 360 GB × $0.023 = **$8.28/month**

**Recommendation:** Use Google Workspace if you already have it, otherwise Google Cloud Storage is most cost-effective.

## Performance

### Backup Duration

| Operation | Size | Duration | Network |
|-----------|------|----------|---------|
| pg_dump | 500 MB | 60-90s | - |
| Compression | - | Included in pg_dump | - |
| Upload to Drive | 500 MB | 30-60s | 10-20 Mbps |
| Checksum verify | 500 MB | 5-10s | - |
| **Total** | 500 MB | **2-3 min** | - |

### Optimization Tips

1. **Compression:** Level 9 is slowest but smallest
   - Level 6: Faster, slightly larger (~10%)
   - Adjust `COMPRESSION_LEVEL` in `.env`

2. **Parallel uploads:** For multiple databases
   - Run separate backup processes
   - Monitor memory usage

3. **Network bandwidth:** Upload during off-peak
   - Schedule large backups at night
   - Use `nice` to reduce CPU priority

4. **Temp directory:** Use fast storage
   - SSD preferred over HDD
   - Ensure sufficient space (2x database size)

## Troubleshooting

### Common Issues

#### "Service account key not found"
```bash
ls -la credentials/service-account-key.json
# Re-download from Google Cloud Console if missing
```

#### "Database connection failed"
```bash
# Test connection
PGPASSWORD=yourpass psql -h yourhost -U postgres -d yit_database -c "SELECT 1;"
```

#### "Upload failed"
- Check internet connectivity
- Verify service account has Editor access to folder
- Check folder ID in `.env`

#### "Checksum mismatch"
- Network corruption during upload
- Script will auto-retry (up to 3 times)

See [setup-gdrive-backup.md](./setup-gdrive-backup.md) for detailed troubleshooting.

## Files

```
infrastructure/google-drive-backup/
├── backup-to-gdrive.js         # Main backup script
├── package.json                # Node.js dependencies
├── .env.example                # Configuration template
├── .env                        # Your configuration (gitignored)
├── README.md                   # This file
├── setup-gdrive-backup.md      # Complete setup guide
├── cron-schedule.txt           # Cron job examples
├── credentials/                # Service account keys (gitignored)
│   └── service-account-key.json
└── node_modules/               # Dependencies (gitignored)
```

## Dependencies

- **googleapis** (v128.0.0): Google Drive API client
- **dotenv** (v16.3.1): Environment variable management
- **node-fetch** (v3.3.2): HTTP client for notifications

## Requirements

- Node.js 14+
- PostgreSQL client tools (pg_dump)
- Google Cloud service account with Drive API access
- Network access to Google Drive API

## Support

### Documentation
- **Setup Guide:** [setup-gdrive-backup.md](./setup-gdrive-backup.md)
- **Cron Examples:** [cron-schedule.txt](./cron-schedule.txt)
- **Disaster Recovery:** [../disaster_recovery.md](../disaster_recovery.md)

### Logs
- Backup logs: `/var/log/yit-gdrive-backup.log`
- Cron logs: `/var/log/syslog` (Ubuntu) or `journalctl -u cron`

### Testing
```bash
# Test configuration backup (fastest)
npm run backup:config

# Test database backup
npm run backup:database

# Test full backup
npm run backup:full
```

## License

MIT

## Version

**Current Version:** 1.0.0
**Last Updated:** November 8, 2025

---

**Next Steps:**

1. ✅ Complete Google Cloud setup → [setup-gdrive-backup.md](./setup-gdrive-backup.md)
2. ✅ Install dependencies → `npm install`
3. ✅ Configure environment → Edit `.env`
4. ✅ Test backup → `npm run backup:config`
5. ✅ Schedule cron jobs → [cron-schedule.txt](./cron-schedule.txt)
6. ✅ Test restore procedure → See disaster recovery docs
