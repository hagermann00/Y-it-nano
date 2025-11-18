# Y-it-nano Naming Standardization: Breaking Changes Analysis
## From "Y-IT" to "Y-It" Standardization

**Analysis Date:** November 18, 2025
**Codebase:** Y-it-nano
**Scope:** Identify all breaking changes and cascading effects from naming standardization

---

## EXECUTIVE SUMMARY

This analysis identifies **CRITICAL breaking changes** that would cause runtime failures if the naming standardization from "Y-IT" to "Y-It" is not properly managed. The most critical issues are:

1. **Database name mismatch** - hardcoded as `yit_database` in multiple places
2. **External service identifiers** - Google Cloud service accounts, AWS S3 buckets, domain names
3. **Systemd service names** - backup service and timer configuration
4. **Log file paths** - hardcoded in scripts and cron jobs
5. **File paths in code** - hardcoded absolute paths referencing the repository name
6. **Package/module names** - npm package names with legacy naming

---

## CRITICAL FINDINGS

### 1. HARDCODED REFERENCES IN CODE

#### 1.1 Database Name References

**CRITICAL - WILL CAUSE RUNTIME FAILURES**

| File | Line | Type | Content | Impact |
|------|------|------|---------|--------|
| `.env.example` | 8, 13 | Config | `DATABASE_URL=postgresql://user:password@localhost:5432/yit_database`<br>`DB_NAME=yit_database` | Database connection will fail if name is changed |
| `infrastructure/google-drive-backup/.env.example` | 22 | Config | `DB_NAME=yit_database` | Backup system cannot connect to database |
| `infrastructure/topic-backup-system/.env.example` | 18 | Config | `PRODUCTION_ROOT=/home/user/Y-it-nano/production` | Hardcoded path with old directory name |
| `infrastructure/google-drive-backup/backup-to-gdrive.js` | 58 | Code | `name: process.env.DB_NAME \|\| 'yit_database'` | Fallback to old database name if env var not set |
| `infrastructure/scripts/backup.sh` | 31 | Script | `DB_NAME="${DB_NAME:-yit_database}"` | Default fallback to old database name |
| `database/migrations/001_add_performance_indexes.sql` | 10 | SQL | `psql -U postgres -d yit_database -f 001_...` | Comment references old database name |

**Resolution:**
- Database must be renamed to `yit_database` (or created with this name)
- All `.env` files must be updated consistently
- Default values in code must be updated

**Risk Level:** CRITICAL - Connection failures will prevent application from starting

---

#### 1.2 File Path References (Absolute Paths)

**WARNING - WILL FAIL IF DIRECTORY IS RENAMED**

| File | Line | Type | Content | Impact |
|------|------|------|---------|--------|
| `cli/dashboard.js` | 17 | Hardcoded | `/home/user/Y-it-nano/infrastructure/testing/image-generation/book-covers/dropshipping` | Image generation will fail |
| `scripts/pdf_generator.py` | 703 | Hardcoded | `/home/user/Y-it-nano/styles/kdp-template.css` | CSS stylesheet not found |
| `templates/dropshipping-example-config.json` | 8-10 | Config | `/home/user/Y-it-nano/DROPSHIPPING_LEG1_RAW_MANUSCRIPT.md` etc. | PDF generation references invalid paths |
| `templates/amazon-fba-example-config.json` | 8-10 | Config | Relative paths (partially safe) | Some configs use absolute paths |
| `infrastructure/google-drive-backup/backup-to-gdrive.js` | 84-86 | Code | Array of critical files with absolute paths | Backup of non-existent files |

**Resolution:**
- Update all absolute paths if repository is moved
- Consider using environment variables for base paths
- Update example configs to use relative paths where possible

**Risk Level:** CRITICAL if directory is renamed; INFORMATIONAL if not

---

#### 1.3 Author/Creator Metadata References

**INFORMATIONAL - AFFECTS DOCUMENTATION ONLY**

| File | Line | Type | Content | Impact |
|------|------|------|---------|--------|
| `scripts/pdf_generator.py` | 6 | Docstring | `Author: Y-It Guides` | PDF metadata will have author "Y-It Guides" |
| `scripts/pdf_generator.py` | 773-774 | Code | `'Y-It Guides'` as author default | Author metadata in PDFs |
| `templates/*-example-config.json` | author field | Config | `"author": "Y-It Guides"` | PDF author metadata |
| `infrastructure/testing/package.json` | 2 | Package | `"name": "yit-image-generator"` | Package name with old naming |
| `infrastructure/topic-backup-system/package.json` | 2, 4, 23 | Package | `"name": "y-it-topic-backup-system"` | Package name inconsistent |

**Resolution:**
- Update author fields if branding changes
- Update package names for consistency
- Consider if this should match "Y-It Guides" or change to new brand

**Risk Level:** INFORMATIONAL - Won't cause failures

---

### 2. CONFIGURATION FILES

#### 2.1 Environment Variables

**CRITICAL - IMPACTS DEPLOYMENT AND RUNTIME**

| File | Variable | Type | Current Value | Required Update |
|------|----------|------|----------------|-----------------|
| `.env.example` | `DATABASE_URL` | Database | `postgresql://user:password@localhost:5432/yit_database` | YES |
| `.env.example` | `DB_NAME` | Database | `yit_database` | YES |
| `.env.example` | `REDIS_URL` (commented) | Cache | `redis://yit-rate-limiter.xxxxx...` | YES |
| `.env.example` | `S3_BACKUP_BUCKET` | Storage | `yit-backups` | YES |
| `.env.example` | `NEXT_PUBLIC_APP_URL` (commented) | URL | `https://yit.app` | YES |
| `infrastructure/google-drive-backup/.env.example` | `GDRIVE_FOLDER_NAME` | Google Drive | `Y-IT-Backups` | YES - Change to `Y-It-Backups` |
| `infrastructure/google-drive-backup/.env.example` | `BACKUP_TEMP_DIR` | Path | `/tmp/yit-backups` | YES |
| `infrastructure/topic-backup-system/.env.example` | `PRODUCTION_ROOT` | Path | `/home/user/Y-it-nano/production` | YES |

**Resolution:**
- Create migration script to update all `.env` files
- Document which variables need changing
- Provide clear upgrade path for existing installations

**Risk Level:** CRITICAL - Affects all deployments

---

#### 2.2 Configuration JSON Files

**WARNING - MAY AFFECT BACKUP SYSTEM**

| File | Key | Value | Impact |
|------|-----|-------|--------|
| `infrastructure/topic-backup-system/config.json` | `rootFolderName` | `Y-It-Production` | Google Drive backup folder name |

**Resolution:**
- Document that folder name won't change in Google Drive
- Update config if rebranding Google Drive structure

**Risk Level:** WARNING - May require data migration

---

### 3. EXTERNAL DEPENDENCIES & SERVICE IDENTIFIERS

#### 3.1 AWS Services

**CRITICAL - OPERATIONAL INFRASTRUCTURE**

| Service | Identifier | File | References | Impact |
|---------|-----------|------|------------|--------|
| S3 Bucket | `yit-backups` | 5 files | Database backups and config backups | Bucket must exist with this name or be recreated |
| ElastiCache | `yit-rate-limiter` | `.env.example` line 35 | Rate limiting Redis cluster | Redis instance must be named this way |
| RDS Instance | `yit-production` | `infrastructure/disaster_recovery.md` | Database backup/restore references | Instance identifier in AWS |

**Affected Files:**
- `/home/user/Y-it-nano/.env.example` (line 35, 58)
- `/home/user/Y-it-nano/IMPLEMENTATION_GUIDE.md` (lines 177, 184, 196)
- `/home/user/Y-it-nano/infrastructure/scripts/backup.sh` (line 25)
- `/home/user/Y-it-nano/infrastructure/disaster_recovery.md` (multiple lines)

**Resolution:**
- AWS resource names DO NOT need to change (technical identifiers can remain as-is)
- Keep `yit-backups` S3 bucket name as-is
- Keep `yit-rate-limiter` cache cluster name as-is
- Keep `yit-production` RDS identifier as-is
- These are implementation details, not user-facing

**Risk Level:** LOW for breaking changes (already in production), but document clearly

---

#### 3.2 Google Cloud Services

**CRITICAL - EXTERNAL AUTHENTICATION**

| Service | Identifier | File | Impact |
|---------|-----------|------|--------|
| Service Account | `yit-backup-service` | 8 files | Google Drive API authentication |
| Service Account Project | `yit-backups` | 3 files | GCP project identifier |
| Google Drive Folder | `Y-IT-Backups` | `.env.example` | Backup destination folder name |

**Affected Files:**
- `infrastructure/google-drive-backup/.env.example` (line 16)
- `infrastructure/google-drive-backup/setup-gdrive-backup.md` (lines 67-68, 96, 138, 229)
- `infrastructure/google-drive-backup/backup-to-gdrive.js` (line 50)
- `infrastructure/google-drive-backup/cron-schedule.txt` (multiple references)
- `infrastructure/google-drive-backup/QUICK_START.md` (line 24)
- `GOOGLE_DRIVE_BACKUP_IMPLEMENTATION_REPORT.md` (line 388)

**Resolution:**
- Service account email will be: `yit-backup-service@yit-backups.iam.gserviceaccount.com`
- These should NOT be renamed unless project is recreated
- Consider if public-facing folder name "Y-IT-Backups" should be renamed
- Update `.env.example` to use `Y-It-Backups` (with capital I and lowercase t)

**Risk Level:** CRITICAL - Backup system will fail if renamed

---

### 4. DATABASE AND STORAGE

#### 4.1 PostgreSQL Database Name

**CRITICAL - WILL CAUSE CONNECTION FAILURES**

Database name: `yit_database` (hardcoded throughout)

**Affected Components:**
- Primary application database
- All migration scripts
- Backup/restore procedures
- Disaster recovery runbooks

**Impact if changed:**
- All connection strings must be updated
- Migration scripts must target new database
- Backup scripts must reference new database
- Restores would fail if database doesn't exist

**Resolution:**
- Database MUST be created as `yit_database`
- Do NOT rename existing database
- Update all connection strings to use this name

**Risk Level:** CRITICAL

---

#### 4.2 Database Tables and Indexes

**LOW RISK - Already created with correct names**

SQL migration file references:
- `evaluator_responses` - Table name (no "yit" prefix)
- Index names don't reference "Y-IT"

**Resolution:** No changes needed

---

#### 4.3 S3 Bucket and Paths

**LOW RISK - Technical identifier, not user-facing**

Bucket name: `yit-backups`
Paths: `s3://yit-backups/postgres/` and `s3://yit-backups/config/`

**Resolution:**
- S3 bucket name should remain as-is (technical identifier)
- Document that this is infrastructure naming, not brand naming

**Risk Level:** LOW - Can remain unchanged

---

### 5. URLs AND ENDPOINTS

#### 5.1 Production Domain

**CRITICAL - USER-FACING DOMAIN**

| URL | File | References | Impact |
|-----|------|-----------|--------|
| `yit.app` | 15+ files | Production application URL | All user-facing URLs, OAuth redirects, webhooks |
| `api.yit.app` | Y-It_WEB_PLATFORM_ARCHITECTURE.md | API endpoints | Backend API URLs |
| `cdn.yit.app` | Y-It_WEB_PLATFORM_ARCHITECTURE.md | CDN | Image and asset delivery |
| `pixel.yit.app` | Y-It_WEB_PLATFORM_ARCHITECTURE.md | Tracking | Analytics tracking pixel |
| `y-it.com` | 20+ markdown files | Web version URLs | Documentation references |

**Affected Files:**
- `.env.example` (line 95)
- `IMPLEMENTATION_GUIDE.md` (line 797)
- `QUICK_START.md` (line 330)
- `infrastructure/disaster_recovery.md` (lines 80, 226, 561-562, 574-576)
- `Y-It_WEB_PLATFORM_ARCHITECTURE.md` (multiple lines)
- `Y-It_DROPSHIPPING_VALIDATION_PLAN.md` (lines 272, 328)
- `CRITICAL_FIXES_SUMMARY.md` (line 389)

**Resolution:**
- Domain names are NOT part of naming convention standardization
- `yit.app` should be preserved as-is (technical implementation)
- If branding domain changes (to y-it.com), update all references
- API subdomain depends on infrastructure setup

**Risk Level:** CRITICAL if changed - would break all production URLs

---

#### 5.2 Marketing/User-Facing URLs

**INFORMATIONAL - DOCUMENTATION REFERENCES**

| URL | Context | Impact |
|-----|---------|--------|
| `y-it.com/dropshipping` | Markdown docs, book content | User-facing web version |
| `y-it.com/subscribe` | Email signup | Email capture |
| `y-it.com/[topic]` | General pattern | WordPress site URLs |

**Resolution:**
- These are references in documentation and user content
- Will need to be updated if domain or structure changes
- Not critical for code functionality

**Risk Level:** LOW - Documentation only

---

### 6. DYNAMIC STRING CONSTRUCTION

#### 6.1 Log File Paths

**CRITICAL - LOGGING WILL FAIL**

| Path | File | References |
|------|------|------------|
| `/var/log/yit-backup.log` | 3 files | Database backup logs |
| `/var/log/yit-gdrive-backup.log` | 10+ files | Google Drive backup logs |
| `/var/log/yit-backup-monitor.log` | 2 files | Backup monitoring logs |

**Affected Files:**
- `infrastructure/scripts/backup.sh` (line 35)
- `infrastructure/google-drive-backup/backup-to-gdrive.js` (N/A - uses dynamic path)
- `infrastructure/google-drive-backup/check-backup-status.sh` (line 21)
- Multiple documentation files with cron schedule examples

**Resolution:**
- These log paths are configured via environment variables
- If changed, cron jobs will write to wrong locations
- Ensure log directories exist with proper permissions

**Risk Level:** CRITICAL - Logs will fail silently

---

#### 6.2 Temporary Directory Paths

**CRITICAL - TEMP FILES MIGHT NOT CLEAN UP**

| Path | Purpose | Files |
|------|---------|-------|
| `/tmp/yit-backups` | Temporary backup staging | 4 files |

**Affected Files:**
- `infrastructure/scripts/backup.sh` (line 24)
- `infrastructure/google-drive-backup/.env.example` (line 29)
- `infrastructure/google-drive-backup/backup-to-gdrive.js` (line 65)
- `infrastructure/google-drive-backup/check-backup-status.sh` (line 107)

**Resolution:**
- Temp directory path is configurable via `BACKUP_TEMP_DIR` env var
- Default to `/tmp/yit-backups`
- Ensure cleanup scripts reference correct path

**Risk Level:** CRITICAL - Disk space issues if paths mismatch

---

#### 6.3 Cron Job References

**CRITICAL - SCHEDULED JOBS WILL FAIL**

Cron jobs reference paths and commands with "yit" naming:

```bash
# Database backup cron
0 * * * * /home/user/Y-it-nano/infrastructure/scripts/backup.sh >> /var/log/yit-backup.log 2>&1

# Google Drive backup crons
0 * * * * cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js --type=database >> /var/log/yit-gdrive-backup.log 2>&1
0 2 * * * cd /home/user/Y-it-nano/infrastructure/google-drive-backup && /usr/bin/node backup-to-gdrive.js --type=config >> /var/log/yit-gdrive-backup.log 2>&1
0 */2 * * * /home/user/Y-it-nano/infrastructure/google-drive-backup/check-backup-status.sh >> /var/log/yit-backup-monitor.log 2>&1
```

**Affected Files:**
- `infrastructure/google-drive-backup/cron-schedule.txt` (lines 33-37, 46, 51, 55, 59, 63, 67, 71, 78, 81, 84, 101-102)
- `IMPLEMENTATION_GUIDE.md` (line 478)
- `GOOGLE_DRIVE_BACKUP_IMPLEMENTATION_REPORT.md` (lines 451, 454, 457)
- `infrastructure/google-drive-backup/QUICK_START.md` (lines 98-99)
- `QUICK_START.md` (line 14)

**Resolution:**
- Update all cron job schedules if directory is moved
- Update log file paths in cron entries
- Use absolute paths to avoid confusion

**Risk Level:** CRITICAL - Backups won't run if cron paths are wrong

---

### 7. CROSS-FILE DEPENDENCIES

#### 7.1 Package Names

**WARNING - AFFECTS MODULE IMPORTS**

| Package | Location | Current Name | Impact |
|---------|----------|--------------|--------|
| Image Generator | `infrastructure/testing/package.json` | `yit-image-generator` | Local module name |
| Topic Backup System | `infrastructure/topic-backup-system/package.json` | `y-it-topic-backup-system` | NPM package name (inconsistent) |

**Affected Files:**
- `infrastructure/testing/package.json` (line 2)
- `infrastructure/topic-backup-system/package.json` (line 2)

**Resolution:**
- These are internal packages not published to npm
- Renaming won't affect external dependencies
- Consider consistency: use either `yit-` or `y-it-` prefix
- Update if rebranding package names

**Risk Level:** LOW - Internal packages only

---

#### 7.2 Node Module Descriptions

**INFORMATIONAL - AFFECTS METADATA ONLY**

| Module | Description | Location | Current Value |
|--------|-------------|----------|---|
| Topic Backup | Description | `infrastructure/topic-backup-system/package.json` | "Intelligent progressive backup system for Y-It nano-book production workflow" |

**Resolution:**
- Update if branding changes
- Not critical for functionality

**Risk Level:** INFORMATIONAL

---

### 8. SYSTEMD SERVICE FILES

#### 8.1 Service and Timer Units

**CRITICAL - BACKUP SYSTEM DEPENDS ON THIS**

| File | Name | Location | Impact |
|------|------|----------|--------|
| Service | `yit-backup.service` | `/etc/systemd/system/yit-backup.service` | Database backup service |
| Timer | `yit-backup.timer` | `/etc/systemd/system/yit-backup.timer` | Backup scheduler |

**Documentation References:**
- `infrastructure/google-drive-backup/setup-gdrive-backup.md` (lines 356, 379, 385, 399-400, 406)
- `GOOGLE_DRIVE_BACKUP_IMPLEMENTATION_REPORT.md` (lines 451-454)

**Service Content (from docs):**
```ini
[Unit]
Description=Y-It Google Drive Backup Service

[Service]
ExecStart=/usr/bin/node /home/user/Y-it-nano/infrastructure/google-drive-backup/backup-to-gdrive.js
WorkingDirectory=/home/user/Y-it-nano/infrastructure/google-drive-backup

[Timer]
Requires=yit-backup.service
```

**Resolution:**
- Service files MUST be named `yit-backup.service` and `yit-backup.timer`
- These names are hardcoded in systemd references
- If directory is moved, update `WorkingDirectory` and `ExecStart` paths
- Consider if service names should be updated (lower risk)

**Risk Level:** CRITICAL - Backup system won't run if service names don't match

---

### 9. EXTERNAL EMAIL SERVICE IDENTIFIERS

**LOW RISK - EXTERNAL SERVICE REFERENCES**

| Service | Identifier | Files | Impact |
|---------|-----------|-------|--------|
| ConvertKit | Contact email | 2 files | Email capture integration |
| DevOps Contact | `devops@yit.app` | Multiple docs | Support email (hardcoded) |

**Affected Files:**
- `IMPLEMENTATION_GUIDE.md` (line 797)
- `QUICK_START.md` (line 330)
- `CRITICAL_FIXES_SUMMARY.md` (line 389)
- `infrastructure/disaster_recovery.md` (lines 574-576)

**Resolution:**
- Email addresses are external identifiers
- Update if branding or support structure changes
- Not critical for code execution

**Risk Level:** LOW - External references

---

## SEVERITY CLASSIFICATION

### CRITICAL (Will cause runtime failures)
1. Database name `yit_database` - hardcoded in connection strings
2. File path references in code - will fail if repository is moved
3. Google Drive folder name `Y-IT-Backups` - backup destination
4. AWS S3 bucket `yit-backups` - backup storage
5. Systemd service names `yit-backup.service/timer` - backup scheduling
6. Log file paths `/var/log/yit-*.log` - logging will fail
7. Temporary directory `/tmp/yit-backups` - temp file staging
8. Cron job references - scheduled jobs won't run

### WARNING (May cause issues during deployment/migration)
1. Absolute file paths in configuration files
2. Environment variable default values
3. Google Drive folder structure naming
4. AWS resource identifiers (RDS instance, ElastiCache cluster)

### INFORMATIONAL (Documentation/metadata only)
1. Author metadata in PDF configs
2. Package names and descriptions
3. Marketing URLs in documentation
4. Email contact addresses
5. File naming with "Y-It" prefix (e.g., `Y-It_DATABASE_SCHEMA_DESIGN.md`)

---

## MIGRATION STRATEGY

### Phase 1: Pre-Migration (Planning)
1. Backup all production databases
2. Export current `.env` variables
3. List all external service identifiers
4. Document current deployment structure

### Phase 2: Code Updates
1. Update all `.env.example` files
2. Update hardcoded paths if repository is renamed
3. Update package.json names for consistency
4. Update documentation with new naming

### Phase 3: Infrastructure Updates
1. Verify database is named `yit_database`
2. Confirm AWS resources use correct names
3. Update Google Drive folder naming
4. Update systemd service descriptions
5. Update cron job logs references

### Phase 4: Testing
1. Test database connection
2. Test backup scripts
3. Test cron job execution
4. Verify log file generation
5. Test Google Drive sync

### Phase 5: Production Deployment
1. Update production environment variables
2. Restart systemd services
3. Verify backup job completion
4. Monitor logs for errors
5. Validate data integrity

---

## RECOMMENDATIONS

### What CAN be safely changed:
- Documentation file names (Y-It_*.md files)
- Author metadata in PDFs
- Package name descriptions
- Marketing documentation
- Email contact strings

### What MUST NOT change:
- Database name (`yit_database`)
- Systemd service names
- AWS resource names (production-critical)
- Google Cloud service account names
- S3 bucket names
- Environment variable names (except for documentation updates)

### What should be standardized:
- Package name format (choose `yit-` or `y-it-` consistently)
- Log file naming convention
- Cron job scheduling documentation
- Configuration file naming

---

## FILES REQUIRING UPDATES

**If branding changes from "Y-IT" to "Y-It":**

Critical files to update:
1. `/home/user/Y-it-nano/.env.example` - Environment variable comments
2. `/home/user/Y-it-nano/infrastructure/google-drive-backup/.env.example` - Folder names
3. `/home/user/Y-it-nano/infrastructure/google-drive-backup/setup-gdrive-backup.md` - Setup instructions
4. `/home/user/Y-it-nano/infrastructure/google-drive-backup/backup-to-gdrive.js` - Folder name constant
5. `/home/user/Y-it-nano/infrastructure/topic-backup-system/config.json` - Google Drive folder name
6. `/home/user/Y-it-nano/scripts/pdf_generator.py` - Author metadata

**If repository is moved/renamed:**

All files with hardcoded paths:
1. `/home/user/Y-it-nano/cli/dashboard.js`
2. `/home/user/Y-it-nano/scripts/pdf_generator.py`
3. `/home/user/Y-it-nano/templates/*-example-config.json`
4. `/home/user/Y-it-nano/infrastructure/google-drive-backup/backup-to-gdrive.js`
5. All cron schedule documentation and references

---

## CONCLUSION

The naming standardization from "Y-IT" to "Y-It" primarily affects **documentation and external-facing branding**. The codebase has wisely kept technical identifiers (database names, service names, AWS resources) separate from display names.

**Key risks:**
- Database connection failures if `yit_database` name is changed
- Backup system failures if service/timer names don't match
- Log file location errors if paths are inconsistent
- Configuration errors if `.env` files aren't updated

**Safe to standardize:**
- Documentation file names
- Metadata and author strings
- Marketing content URLs
- Package descriptions

