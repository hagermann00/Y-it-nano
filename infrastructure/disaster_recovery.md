# Y-IT Disaster Recovery Plan

**Version:** 1.0.0
**Last Updated:** November 8, 2025
**Owner:** DevOps Team
**Review Schedule:** Quarterly

---

## Executive Summary

This document outlines the disaster recovery (DR) procedures for the Y-IT nano-book platform. It defines recovery objectives, backup strategies, and step-by-step recovery procedures to ensure business continuity in the event of system failures.

**Recovery Objectives:**
- **RTO (Recovery Time Objective):** < 1 hour
- **RPO (Recovery Point Objective):** < 15 minutes

**Backup Strategy:**
- **Primary:** AWS S3 (hourly, 30-day retention)
- **Secondary:** Google Drive (hourly, 30-day retention)
- **Database:** AWS RDS automated backups + manual dumps

---

## Table of Contents

1. [Recovery Objectives](#recovery-objectives)
2. [Backup Strategy](#backup-strategy)
3. [Disaster Scenarios](#disaster-scenarios)
4. [Recovery Procedures](#recovery-procedures)
5. [Testing & Validation](#testing--validation)
6. [Roles & Responsibilities](#roles--responsibilities)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Communication Plan](#communication-plan)

---

## Recovery Objectives

### RTO: Recovery Time Objective

**Target: < 1 hour**

Maximum acceptable downtime for the platform.

**Breakdown:**
- **Detection:** 10 minutes (automated monitoring)
- **Assessment:** 5 minutes (identify failure type)
- **Decision:** 5 minutes (choose recovery method)
- **Execution:** 30 minutes (restore from backup)
- **Validation:** 10 minutes (verify system integrity)

**Total: 60 minutes maximum**

### RPO: Recovery Point Objective

**Target: < 15 minutes**

Maximum acceptable data loss.

**Strategy:**
- Hourly backups to AWS S3 and Google Drive
- AWS RDS automated snapshots every 5 minutes
- Point-in-time recovery available

**Worst case:** 1 hour of data loss (between hourly backups)
**Best case:** < 5 minutes (using RDS point-in-time recovery)

---

## Backup Strategy

### 1. Database Backups

#### AWS RDS Automated Backups

**Configuration:**
- **Frequency:** Continuous (automated snapshots)
- **Retention:** 30 days
- **Point-in-time recovery:** Yes (5-minute granularity)
- **Cross-region replication:** us-east-1 → us-west-2
- **Storage:** AWS managed (encrypted at rest)

**Enable in AWS Console:**
```bash
# Via AWS CLI
aws rds modify-db-instance \
  --db-instance-identifier yit-production \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately
```

#### Manual PostgreSQL Backups

**Primary: AWS S3**

**Script:** `/infrastructure/backup.sh`

```bash
#!/bin/bash
# Y-IT Database Backup to AWS S3

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="yit_db_${TIMESTAMP}.dump"
S3_BUCKET="yit-backups"
DB_HOST="${DB_HOST}"
DB_NAME="${DB_NAME:-yit_database}"
DB_USER="${DB_USER:-postgres}"

# Create compressed database dump
echo "Creating database dump..."
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  --host="${DB_HOST}" \
  --port=5432 \
  --username="${DB_USER}" \
  --format=custom \
  --compress=9 \
  --file="/tmp/${BACKUP_FILE}" \
  "${DB_NAME}"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "/tmp/${BACKUP_FILE}" "s3://${S3_BUCKET}/postgres/${BACKUP_FILE}" \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256

# Cleanup
rm "/tmp/${BACKUP_FILE}"

echo "Backup completed: s3://${S3_BUCKET}/postgres/${BACKUP_FILE}"
```

**Cron Schedule:**
```bash
# Hourly backup
0 * * * * /infrastructure/backup.sh >> /var/log/yit-s3-backup.log 2>&1
```

**Secondary: Google Drive**

**Script:** `/infrastructure/google-drive-backup/backup-to-gdrive.js`

**Cron Schedule:**
```bash
# Hourly backup
0 * * * * cd /infrastructure/google-drive-backup && node backup-to-gdrive.js --type=database >> /var/log/yit-gdrive-backup.log 2>&1
```

See [google-drive-backup/README.md](./google-drive-backup/README.md) for details.

### 2. Application Code Backups

**GitHub Repository:** Primary source of truth

- **Repository:** `github.com/yourusername/Y-it-nano`
- **Branches:** `main`, `staging`, `production`
- **Protection:** Branch protection rules enabled
- **Backup:** GitHub's infrastructure (99.9% uptime SLA)

**Additional Backup:**
- Weekly zip archives to S3
- Includes: `.env` files, configuration, documentation

### 3. Configuration Files

**Critical Files:**
- `.env.production` (database credentials, API keys)
- `package.json` / `package-lock.json`
- Infrastructure documentation
- Nginx/Apache configuration
- SSL certificates

**Backup Location:**
- AWS S3: `s3://yit-backups/config/`
- Google Drive: `Y-IT-Backups/[DATE]/yit_config_*.tar.gz`

**Frequency:** Daily (2 AM)

### 4. Static Assets

**Files:**
- Book covers (images)
- PDF files (evaluator roasts, ebooks)
- Case study images

**Storage:** AWS S3 (primary)

**Backup:** S3 cross-region replication
- Source: `us-east-1`
- Replica: `us-west-2`

**Configuration:**
```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket yit-static-assets \
  --versioning-configuration Status=Enabled

# Enable replication
aws s3api put-bucket-replication \
  --bucket yit-static-assets \
  --replication-configuration file://replication-config.json
```

---

## Disaster Scenarios

### Scenario 1: Database Corruption

**Symptoms:**
- Unable to query database
- Application errors (500)
- Data integrity issues

**Recovery Procedure:** [See Section 4.1](#41-database-recovery)

**Estimated RTO:** 30 minutes

---

### Scenario 2: Complete RDS Instance Failure

**Symptoms:**
- RDS instance unreachable
- Connection timeouts
- AWS console shows instance in failed state

**Recovery Procedure:** [See Section 4.2](#42-rds-instance-recovery)

**Estimated RTO:** 45 minutes

---

### Scenario 3: Application Server Failure

**Symptoms:**
- Web application unresponsive
- Server unreachable via SSH
- High error rates

**Recovery Procedure:** [See Section 4.3](#43-application-server-recovery)

**Estimated RTO:** 20 minutes

---

### Scenario 4: AWS Region Outage

**Symptoms:**
- All services in us-east-1 unavailable
- Cannot connect to RDS, S3, or EC2

**Recovery Procedure:** [See Section 4.4](#44-regional-failover)

**Estimated RTO:** 60 minutes

---

### Scenario 5: Data Loss / Accidental Deletion

**Symptoms:**
- Missing records in database
- Deleted files or tables
- User reports data loss

**Recovery Procedure:** [See Section 4.5](#45-point-in-time-recovery)

**Estimated RTO:** 15 minutes

---

## Recovery Procedures

### 4.1 Database Recovery

**Use Case:** Database corruption, accidental deletion, or data integrity issues

#### Step 1: Assess Damage

```bash
# Connect to database
psql -h ${DB_HOST} -U postgres -d yit_database

# Check table counts
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Exit
\q
```

#### Step 2: Identify Recovery Point

**Option A: Latest hourly backup (AWS S3 or Google Drive)**

```bash
# List recent S3 backups
aws s3 ls s3://yit-backups/postgres/ --recursive | sort -r | head -10

# List recent Google Drive backups
# See google-drive-backup/README.md for instructions
```

**Option B: AWS RDS automated snapshot**

```bash
# List RDS snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier yit-production \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]' \
  --output table
```

#### Step 3: Download Backup

**From AWS S3:**

```bash
# Download latest backup
LATEST_BACKUP=$(aws s3 ls s3://yit-backups/postgres/ | sort -r | head -1 | awk '{print $4}')
aws s3 cp "s3://yit-backups/postgres/${LATEST_BACKUP}" /tmp/restore.dump
```

**From Google Drive:**

1. Navigate to [Google Drive](https://drive.google.com/)
2. Open `Y-IT-Backups/[DATE]/`
3. Download `yit_db_*.dump` file
4. Upload to server via SCP or download directly using Drive API

#### Step 4: Stop Application

```bash
# Stop application server to prevent writes
sudo systemctl stop yit-app

# Or if using PM2
pm2 stop all
```

#### Step 5: Restore Database

**Option A: Restore to existing database (destructive)**

```bash
# Drop and recreate database (CAUTION!)
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres -c "DROP DATABASE IF EXISTS yit_database;"
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres -c "CREATE DATABASE yit_database;"

# Restore from dump
PGPASSWORD="${DB_PASSWORD}" pg_restore \
  --host=${DB_HOST} \
  --port=5432 \
  --username=postgres \
  --dbname=yit_database \
  --clean \
  --no-owner \
  --no-acl \
  --verbose \
  /tmp/restore.dump

# Check restore success
echo "Exit code: $?"
```

**Option B: Restore to new database (safer)**

```bash
# Create new database
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres -c "CREATE DATABASE yit_database_restore;"

# Restore to new database
PGPASSWORD="${DB_PASSWORD}" pg_restore \
  --host=${DB_HOST} \
  --username=postgres \
  --dbname=yit_database_restore \
  --verbose \
  /tmp/restore.dump

# Verify data
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres -d yit_database_restore -c "SELECT COUNT(*) FROM topics;"

# Swap databases (if verification passes)
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres <<EOF
ALTER DATABASE yit_database RENAME TO yit_database_old;
ALTER DATABASE yit_database_restore RENAME TO yit_database;
EOF
```

#### Step 6: Validate Restore

```bash
# Check table counts
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres -d yit_database -c "
SELECT
  'topics' as table_name, COUNT(*) as count FROM topics
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases;
"

# Run application tests
npm run test:integration

# Check critical queries
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres -d yit_database -c "
SELECT * FROM topics ORDER BY created_at DESC LIMIT 5;
"
```

#### Step 7: Restart Application

```bash
# Start application
sudo systemctl start yit-app

# Or if using PM2
pm2 start all

# Check application health
curl -f http://localhost:3000/api/health || echo "Health check failed!"
```

#### Step 8: Monitor

```bash
# Watch application logs
tail -f /var/log/yit-app.log

# Check error rates
# Monitor dashboard for 30 minutes
```

**Total Time:** 30-45 minutes

---

### 4.2 RDS Instance Recovery

**Use Case:** Complete RDS instance failure or corruption

#### Step 1: Restore from RDS Snapshot

```bash
# Identify snapshot to restore
aws rds describe-db-snapshots \
  --db-instance-identifier yit-production \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]' \
  --output table

# Restore snapshot to new instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier yit-production-restored \
  --db-snapshot-identifier rds:yit-production-2025-11-08-12-00 \
  --db-instance-class db.t3.medium \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name yit-db-subnet-group

# Wait for instance to become available (10-15 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier yit-production-restored
```

#### Step 2: Update Application Configuration

```bash
# Get new endpoint
NEW_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier yit-production-restored \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "New DB endpoint: $NEW_ENDPOINT"

# Update .env file
sed -i "s/DB_HOST=.*/DB_HOST=${NEW_ENDPOINT}/" /path/to/.env.production

# Or update in AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name /yit/production/db-host \
  --value "${NEW_ENDPOINT}" \
  --type SecureString \
  --overwrite
```

#### Step 3: Restart Application

```bash
# Restart application with new DB endpoint
sudo systemctl restart yit-app

# Verify connection
npm run db:test-connection
```

#### Step 4: Update DNS/Load Balancer

If using Route53 or load balancer:

```bash
# Update Route53 CNAME record
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://update-db-record.json
```

**Total Time:** 45-60 minutes

---

### 4.3 Application Server Recovery

**Use Case:** EC2 instance failure, application crash

#### Step 1: Launch New Instance

```bash
# Launch from AMI backup
aws ec2 run-instances \
  --image-id ami-xxxxxxxxx \  # Your latest AMI
  --instance-type t3.medium \
  --key-name yit-production-key \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=yit-production-web}]'
```

#### Step 2: Configure Instance

```bash
# SSH to new instance
ssh -i yit-production-key.pem ubuntu@<NEW_INSTANCE_IP>

# Clone repository
git clone https://github.com/yourusername/Y-it-nano.git
cd Y-it-nano

# Install dependencies
npm install

# Copy configuration from S3
aws s3 cp s3://yit-backups/config/latest/.env.production .env

# Start application
pm2 start ecosystem.config.js
pm2 save
```

#### Step 3: Update Load Balancer

```bash
# Register new instance with load balancer
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/yit-prod/xxx \
  --targets Id=<NEW_INSTANCE_ID>

# Deregister old instance
aws elbv2 deregister-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/yit-prod/xxx \
  --targets Id=<OLD_INSTANCE_ID>
```

**Total Time:** 20-30 minutes

---

### 4.4 Regional Failover

**Use Case:** Complete AWS us-east-1 region outage

#### Prerequisites

- Cross-region RDS replication configured (us-east-1 → us-west-2)
- S3 bucket replication enabled
- Application AMI available in us-west-2

#### Step 1: Promote Read Replica

```bash
# Promote read replica in us-west-2 to standalone instance
aws rds promote-read-replica \
  --db-instance-identifier yit-production-replica-west \
  --region us-west-2

# Wait for promotion (5-10 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier yit-production-replica-west \
  --region us-west-2
```

#### Step 2: Launch Application in us-west-2

```bash
# Launch instances in us-west-2
# (Same process as Section 4.3, but in us-west-2 region)

# Update DNS to point to us-west-2 load balancer
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://failover-to-west.json
```

**Total Time:** 60 minutes

---

### 4.5 Point-in-Time Recovery

**Use Case:** Accidental data deletion, need to restore to specific timestamp

#### Step 1: Identify Recovery Point

```bash
# User reports data loss at 2:15 PM
# Restore to 2:00 PM (before deletion)

TARGET_TIME="2025-11-08T14:00:00Z"
```

#### Step 2: Restore RDS to Point-in-Time

```bash
# Create new instance from point-in-time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier yit-production \
  --target-db-instance-identifier yit-production-pitr \
  --restore-time "${TARGET_TIME}" \
  --db-instance-class db.t3.medium

# Wait for instance
aws rds wait db-instance-available \
  --db-instance-identifier yit-production-pitr
```

#### Step 3: Extract Missing Data

```bash
# Connect to restored instance
PITR_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier yit-production-pitr \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Export missing data
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  --host="${PITR_ENDPOINT}" \
  --username=postgres \
  --table=customers \
  --data-only \
  --file=/tmp/recovered_customers.sql

# Import to production
PGPASSWORD="${DB_PASSWORD}" psql \
  --host="${DB_HOST}" \
  --username=postgres \
  --dbname=yit_database \
  --file=/tmp/recovered_customers.sql
```

#### Step 4: Verify and Cleanup

```bash
# Verify data restored
PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U postgres -d yit_database -c \
  "SELECT COUNT(*) FROM customers WHERE created_at < '${TARGET_TIME}';"

# Delete PITR instance (no longer needed)
aws rds delete-db-instance \
  --db-instance-identifier yit-production-pitr \
  --skip-final-snapshot
```

**Total Time:** 15-20 minutes

---

## Testing & Validation

### Monthly Recovery Test

**Schedule:** 3rd Friday of each month, 2 AM - 4 AM ET

**Procedure:**

1. **Select random backup** (from last 7 days)
2. **Restore to test environment**
3. **Validate data integrity:**
   - Row counts match expected ranges
   - Critical tables are present
   - Sample queries return correct results
4. **Run automated tests** against restored database
5. **Document results** in test log
6. **Clean up test resources**

**Test Checklist:**

```bash
#!/bin/bash
# Monthly DR Test Script

# 1. Download random backup
BACKUP=$(aws s3 ls s3://yit-backups/postgres/ | shuf -n 1 | awk '{print $4}')
aws s3 cp "s3://yit-backups/postgres/${BACKUP}" /tmp/test-restore.dump

# 2. Restore to test database
PGPASSWORD="${TEST_DB_PASSWORD}" pg_restore \
  --host=${TEST_DB_HOST} \
  --username=postgres \
  --dbname=yit_test \
  --clean \
  /tmp/test-restore.dump

# 3. Validate
PGPASSWORD="${TEST_DB_PASSWORD}" psql -h ${TEST_DB_HOST} -U postgres -d yit_test -c "
SELECT
  'topics' as table, COUNT(*) FROM topics
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases;
"

# 4. Run tests
npm run test:integration -- --db=${TEST_DB_HOST}

# 5. Report results
echo "DR test completed at $(date)" >> /var/log/dr-tests.log
```

---

## Roles & Responsibilities

### Incident Response Team

| Role | Name | Contact | Responsibilities |
|------|------|---------|------------------|
| **Incident Commander** | `[Name]` | `[Phone]`, `[Email]` | Coordinate recovery, make decisions |
| **Database Lead** | `[Name]` | `[Phone]`, `[Email]` | Database recovery procedures |
| **DevOps Lead** | `[Name]` | `[Phone]`, `[Email]` | Infrastructure recovery |
| **Application Lead** | `[Name]` | `[Phone]`, `[Email]` | Application restart, validation |
| **Communications** | `[Name]` | `[Phone]`, `[Email]` | Customer notifications, status updates |

### On-Call Rotation

**Schedule:** Weekly rotation

| Week | On-Call Engineer | Backup |
|------|------------------|--------|
| Nov 8-14 | `[Engineer 1]` | `[Engineer 2]` |
| Nov 15-21 | `[Engineer 2]` | `[Engineer 3]` |
| Nov 22-28 | `[Engineer 3]` | `[Engineer 1]` |

**On-Call Responsibilities:**
- Respond to alerts within 15 minutes
- Assess incident severity
- Initiate recovery procedures
- Escalate if needed

---

## Monitoring & Alerts

### CloudWatch Alarms

**Database Alarms:**

```bash
# CPU > 80% for 5 minutes
aws cloudwatch put-metric-alarm \
  --alarm-name yit-db-high-cpu \
  --alarm-description "Database CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=yit-production \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:xxx:yit-alerts

# Connections > 80% of max
aws cloudwatch put-metric-alarm \
  --alarm-name yit-db-high-connections \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=yit-production \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:xxx:yit-alerts

# Disk space > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name yit-db-low-storage \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 10000000000 \  # 10GB in bytes
  --comparison-operator LessThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=yit-production \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:xxx:yit-alerts
```

**Backup Verification Alarms:**

```bash
# Alert if no successful backup in 90 minutes
# Implemented in check-backup-status.sh (runs via cron)
0 */2 * * * /infrastructure/google-drive-backup/check-backup-status.sh
```

---

## Communication Plan

### Internal Communication

**Slack Channels:**
- `#incidents` - Real-time incident updates
- `#infrastructure` - Infrastructure alerts
- `#on-call` - On-call engineer coordination

**Status Updates:**
- **Every 15 minutes** during active incident
- **Final update** when incident resolved

### External Communication

**Customer Communication:**

**Template: Service Disruption**

```
Subject: Y-IT Service Status Update

We are currently experiencing technical difficulties with the Y-IT platform.

Status: [Investigating / Identified / Monitoring / Resolved]
Impact: [Description of user impact]
ETA: [Estimated resolution time]

We apologize for the inconvenience and are working to resolve this as quickly as possible.

Updates will be posted at: https://status.yit.com

Thank you for your patience.
```

**Communication Channels:**
- Email: `status@yit.com`
- Status page: `https://status.yit.com`
- Twitter: `@YITstatus`

---

## Appendix

### Backup Locations

**AWS S3:**
- Bucket: `s3://yit-backups/`
- Database dumps: `s3://yit-backups/postgres/`
- Config files: `s3://yit-backups/config/`
- Retention: 30 days

**Google Drive:**
- Folder: `Y-IT-Backups/`
- Organization: Daily subfolders (YYYY-MM-DD)
- Retention: 30 days

**AWS RDS:**
- Automated snapshots: 30 days
- Point-in-time recovery: Up to 30 days back

### Contact Information

**AWS Support:** 1-800-xxx-xxxx
**Google Cloud Support:** 1-800-xxx-xxxx
**Database Vendor:** PostgreSQL Community

---

**Document Version History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-11-08 | Initial version | DevOps Team |

---

**Next Review Date:** February 8, 2026
