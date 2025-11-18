# Y-It-Nano: Breaking Changes Quick Reference
**Naming Standardization: Y-IT → Y-It**

## TL;DR - Critical Issues

| Issue | Current Value | Risk | Action |
|-------|---------------|------|--------|
| Database Name | `yit_database` | CRITICAL | DO NOT CHANGE |
| Systemd Services | `yit-backup.service/timer` | CRITICAL | DO NOT CHANGE |
| AWS S3 Bucket | `yit-backups` | CRITICAL | DO NOT CHANGE |
| Google Drive Folder | `Y-IT-Backups` | CRITICAL | Change to `Y-It-Backups` |
| Log Paths | `/var/log/yit-*.log` | CRITICAL | Keep as-is (configurable) |
| Repo Absolute Paths | `/home/user/Y-it-nano/...` | CRITICAL | Update if repo moves |

---

## What WILL Break (If Changed)

1. **Database Connection** - All apps will fail to connect if `yit_database` name changes
2. **Backup System** - Systemd services/timers won't find backups if names don't match
3. **AWS Resources** - S3, ElastiCache, RDS must use exact names configured
4. **Cron Jobs** - Scheduled backups won't execute if paths are wrong
5. **Google Drive Sync** - Backups will go to wrong folder if name doesn't match

---

## What's SAFE to Change

✓ Documentation file names (Y-It_*.md)  
✓ PDF author metadata  
✓ Marketing URLs in docs  
✓ Email addresses  
✓ Package descriptions  

---

## Critical Files by Category

### Database
- `/home/user/Y-it-nano/.env.example` - DB connection string

### Backups & Infrastructure
- `/home/user/Y-it-nano/infrastructure/google-drive-backup/backup-to-gdrive.js` - GDrive config
- `/home/user/Y-it-nano/infrastructure/google-drive-backup/.env.example` - Backup paths
- `/home/user/Y-it-nano/infrastructure/google-drive-backup/setup-gdrive-backup.md` - Setup docs

### Paths & Config
- `/home/user/Y-it-nano/templates/*-example-config.json` - Absolute paths
- `/home/user/Y-it-nano/cli/dashboard.js` - Absolute paths
- `/home/user/Y-it-nano/scripts/pdf_generator.py` - CSS path

### Cron/Scheduling
- `/home/user/Y-it-nano/infrastructure/google-drive-backup/cron-schedule.txt` - Job paths

---

## Migration Checklist

### Pre-Migration
- [ ] Backup all databases
- [ ] Export all .env variables
- [ ] Document current AWS resource IDs
- [ ] Document Google Drive setup

### Code Updates
- [ ] Update .env.example with new naming
- [ ] Update absolute paths if repo moves
- [ ] Update Google Drive folder name references
- [ ] Update cron job path references

### Infrastructure Updates
- [ ] Create/verify yit_database PostgreSQL database
- [ ] Verify yit-backups S3 bucket exists
- [ ] Verify yit-rate-limiter ElastiCache exists
- [ ] Verify yit-backup-service GCP service account
- [ ] Create log directories (/var/log/yit-*)
- [ ] Create temp directory (/tmp/yit-backups)

### Testing
- [ ] Test database connection
- [ ] Test backup script execution
- [ ] Test cron job runs
- [ ] Verify logs are created
- [ ] Test Google Drive sync

### Deployment
- [ ] Deploy updated code
- [ ] Restart systemd services
- [ ] Monitor backup jobs
- [ ] Verify no errors in logs

---

## Configuration Reference

### Environment Variables (DO NOT CHANGE THESE)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/yit_database
DB_NAME=yit_database
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://yit-rate-limiter.cache.amazonaws.com:6379
S3_BACKUP_BUCKET=yit-backups
BACKUP_TEMP_DIR=/tmp/yit-backups
GDRIVE_FOLDER_NAME=Y-IT-Backups  # Can change to Y-It-Backups
```

### Service Names (DO NOT CHANGE THESE)
```bash
systemctl status yit-backup.service
systemctl status yit-backup.timer
```

### Log Locations
```bash
/var/log/yit-backup.log           # Database backup logs
/var/log/yit-gdrive-backup.log    # Google Drive backup logs
/var/log/yit-backup-monitor.log   # Backup monitoring logs
```

### AWS Resources (DO NOT CHANGE THESE)
```
S3 Bucket: yit-backups
RDS Instance: yit-production
ElastiCache: yit-rate-limiter
```

### Google Cloud (DO NOT CHANGE SERVICE ACCOUNT UNLESS RECREATING)
```
Service Account: yit-backup-service@yit-backups.iam.gserviceaccount.com
Project ID: yit-backups
Backup Folder: Y-IT-Backups (can change to Y-It-Backups)
```

---

## Troubleshooting

### Database Connection Fails
- Verify `yit_database` exists: `psql -l | grep yit_database`
- Check `DATABASE_URL` environment variable
- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`

### Backup Script Fails
- Check `/var/log/yit-backup.log` for errors
- Verify `/tmp/yit-backups` directory exists: `ls -ld /tmp/yit-backups`
- Verify AWS credentials: `aws sts get-caller-identity`
- Verify S3 bucket: `aws s3 ls s3://yit-backups`

### Google Drive Sync Fails
- Verify `yit-backup-service` credentials exist
- Check permissions on service account in Google Drive
- Verify `GDRIVE_FOLDER_NAME` matches actual folder in Drive
- Check `/var/log/yit-gdrive-backup.log` for errors

### Cron Jobs Not Running
- Verify cron job entry: `crontab -l | grep yit`
- Check paths in cron entry exist
- Verify log file is writable: `touch /var/log/yit-backup.log`
- Check cron daemon: `systemctl status cron`

---

## Files to Review

1. **Full Analysis:** `/home/user/Y-it-nano/BREAKING_CHANGES_ANALYSIS.md` (22KB)
2. **JSON Summary:** `/home/user/Y-it-nano/BREAKING_CHANGES_SUMMARY.json` (11KB)
3. **This Guide:** `/home/user/Y-it-nano/BREAKING_CHANGES_QUICK_REFERENCE.md`

---

## Support

For questions about specific breaking changes:
1. Check the full analysis document
2. Review the JSON summary for structured data
3. Consult specific configuration files listed above
4. Review AWS/Google Cloud setup documentation in infrastructure/ folder

**Last Updated:** November 18, 2025  
**Analysis Tool:** Automated codebase analysis  
**Codebase:** Y-it-nano  
