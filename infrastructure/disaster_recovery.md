# Y-IT DISASTER RECOVERY PLAN

**Version:** 1.0
**Last Updated:** 2025-01-09
**Owner:** Technical Operations
**Review Frequency:** Quarterly

---

## RECOVERY OBJECTIVES

### RTO (Recovery Time Objective)
**Target: < 1 hour**

Maximum acceptable downtime for the Y-IT platform:
- Database failure: 30-45 minutes
- Application failure: 15-30 minutes
- Total system failure: 60 minutes maximum

### RPO (Recovery Point Objective)
**Target: < 15 minutes**

Maximum acceptable data loss:
- Database data: 15 minutes (hourly backups + transaction logs)
- File storage (S3): 0 minutes (versioning enabled)
- Configuration: 0 minutes (version controlled in Git)

---

## DISASTER SCENARIOS & RECOVERY PROCEDURES

### Scenario 1: Database Failure

**Symptoms:**
- Application cannot connect to database
- Database queries timing out
- PostgreSQL process crashed
- Data corruption detected

**Impact:**
- Complete platform outage
- No evaluator submissions possible
- No purchases can be processed
- Email sequences disrupted

**Recovery Steps:**

#### Option A: Automated AWS RDS Recovery (Recommended)

```bash
# 1. Identify failure time
aws rds describe-db-instances \
  --db-instance-identifier yit-production \
  --query 'DBInstances[0].LatestRestorableTime'

# 2. Restore to point-in-time (5 minutes before failure)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier yit-production \
  --target-db-instance-identifier yit-production-recovery \
  --restore-time "2025-01-09T14:55:00Z"

# 3. Wait for restoration (15-30 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier yit-production-recovery

# 4. Get new endpoint
NEW_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier yit-production-recovery \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# 5. Update application environment variables
# In Vercel dashboard or via CLI:
vercel env add DATABASE_URL "postgresql://user:pass@${NEW_ENDPOINT}:5432/yit_database" production

# 6. Redeploy application
vercel --prod

# 7. Verify connections
curl https://api.yit.app/health/database
# Expected: {"status": "healthy", "connections": X}

# 8. Run validation queries
psql -h $NEW_ENDPOINT -U postgres -d yit_database -c "
  SELECT 'topics' as table_name, COUNT(*) FROM topics
  UNION ALL
  SELECT 'customers', COUNT(*) FROM customers
  UNION ALL
  SELECT 'purchases', COUNT(*) FROM purchases
  UNION ALL
  SELECT 'evaluator_responses', COUNT(*) FROM evaluator_responses;
"

# 9. Delete old database instance (after validation)
aws rds delete-db-instance \
  --db-instance-identifier yit-production \
  --skip-final-snapshot

# 10. Rename recovery instance to production
aws rds modify-db-instance \
  --db-instance-identifier yit-production-recovery \
  --new-db-instance-identifier yit-production \
  --apply-immediately
```

**Estimated Recovery Time:** 30-45 minutes
**Data Loss:** < 15 minutes (from last automated backup)

#### Option B: Manual Backup Restoration

```bash
# 1. List available backups
aws s3 ls s3://yit-backups/postgres/ --recursive | sort -r | head -10

# 2. Download latest backup
BACKUP_FILE="yit_db_20250109_140000.dump"
aws s3 cp s3://yit-backups/postgres/$BACKUP_FILE ./$BACKUP_FILE

# 3. Verify backup integrity
pg_restore --list $BACKUP_FILE | head -20

# 4. Drop existing database (if corrupted)
psql -U postgres -c "DROP DATABASE yit_database;"

# 5. Create fresh database
psql -U postgres -c "CREATE DATABASE yit_database;"

# 6. Restore from backup
pg_restore \
  --host=$DB_HOST \
  --username=postgres \
  --dbname=yit_database \
  --no-owner \
  --no-acl \
  --verbose \
  $BACKUP_FILE

# 7. Verify restoration
psql -U postgres -d yit_database -c "\dt"
psql -U postgres -d yit_database -c "SELECT COUNT(*) FROM topics;"

# 8. Restart application
vercel --prod
```

**Estimated Recovery Time:** 45-60 minutes
**Data Loss:** Up to 1 hour (from last manual backup)

---

### Scenario 2: File Storage Failure (S3)

**Symptoms:**
- Cannot download PDFs
- Images not loading
- 403/404 errors from S3

**Impact:**
- Roast PDFs cannot be delivered
- Book covers missing
- Case study images broken

**Recovery Steps:**

```bash
# 1. Check S3 bucket status
aws s3api head-bucket --bucket yit-production-files

# 2. List recent objects to verify accessibility
aws s3 ls s3://yit-production-files/roasts/ --recursive | tail -20

# 3. If bucket deleted, restore from versioning
aws s3api list-object-versions \
  --bucket yit-production-files \
  --prefix roasts/ \
  --max-items 1000 \
  --query 'Versions[?IsLatest==`false`]'

# 4. Restore specific files
aws s3api copy-object \
  --bucket yit-production-files \
  --copy-source yit-production-files/roasts/12847.pdf?versionId=xxx \
  --key roasts/12847.pdf

# 5. Or create new bucket and sync from backup
aws s3 mb s3://yit-production-files-recovery
aws s3 sync s3://yit-production-files s3://yit-production-files-recovery

# 6. Update CloudFront distribution
aws cloudfront update-distribution \
  --id DISTRIBUTION_ID \
  --origin-domain-name yit-production-files-recovery.s3.amazonaws.com
```

**Estimated Recovery Time:** 15-30 minutes
**Data Loss:** 0 (S3 versioning enabled)

---

### Scenario 3: Application Deployment Failure

**Symptoms:**
- Application not accessible
- 500 errors on all pages
- Vercel deployment failed

**Impact:**
- Complete platform outage
- Website unreachable
- API endpoints down

**Recovery Steps:**

```bash
# 1. Check deployment status
vercel list

# 2. Identify last successful deployment
vercel list --meta state=READY | head -5

# 3. Rollback to previous deployment
PREVIOUS_DEPLOYMENT_URL="yit-abc123.vercel.app"
vercel alias set $PREVIOUS_DEPLOYMENT_URL yit.app --prod

# 4. Verify rollback
curl https://yit.app/health
# Expected: {"status": "healthy"}

# 5. Investigate failed deployment
vercel logs https://yit-failed-xyz.vercel.app

# 6. Fix issue in code and redeploy
git revert HEAD
git push origin main
vercel --prod
```

**Estimated Recovery Time:** 5-15 minutes
**Data Loss:** 0 (no data stored in application layer)

---

### Scenario 4: Complete Infrastructure Failure

**Symptoms:**
- Database down
- Application down
- S3 inaccessible
- DNS not resolving

**Impact:**
- Total platform outage
- All services offline

**Recovery Steps:**

```bash
# 1. Activate incident response team
# - Send alert to on-call engineer
# - Notify stakeholders
# - Open incident ticket

# 2. Check AWS service health
aws health describe-events --filter eventTypeCategories=issue

# 3. Restore database (see Scenario 1)
# 4. Restore application (see Scenario 3)
# 5. Verify S3 (see Scenario 2)

# 6. Run full system health check
./infrastructure/scripts/health_check.sh

# 7. Notify customers of restoration
# - Post status update
# - Send email to affected customers
# - Update social media
```

**Estimated Recovery Time:** 60 minutes
**Data Loss:** < 15 minutes

---

## BACKUP STRATEGY

### Automated Backups

#### 1. AWS RDS Automated Backups

**Configuration:**
- Enabled: YES
- Retention: 30 days
- Backup window: 02:00-03:00 UTC (off-peak)
- Multi-AZ: YES (high availability)

**Verification:**

```bash
# Check RDS backup status
aws rds describe-db-instances \
  --db-instance-identifier yit-production \
  --query 'DBInstances[0].{
    BackupRetention:BackupRetentionPeriod,
    LatestBackup:LatestRestorableTime,
    MultiAZ:MultiAZ
  }'

# List available automated backups
aws rds describe-db-snapshots \
  --db-instance-identifier yit-production \
  --snapshot-type automated \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]' \
  --output table
```

#### 2. Manual Database Backups to S3

**Frequency:** Hourly
**Retention:** 30 days rolling
**Script:** `/infrastructure/scripts/backup.sh`

See backup script below for implementation.

#### 3. File Storage Backups (S3)

**Configuration:**
- Versioning: ENABLED
- Lifecycle policy: Transition to Glacier after 90 days
- Replication: Cross-region to us-west-2 (if primary is us-east-1)

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket yit-production-files \
  --versioning-configuration Status=Enabled

# Configure lifecycle
aws s3api put-bucket-lifecycle-configuration \
  --bucket yit-production-files \
  --lifecycle-configuration file://s3-lifecycle.json
```

---

## MONITORING & ALERTS

### CloudWatch Alarms

```bash
# Database CPU > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name yit-db-cpu-high \
  --alarm-description "Database CPU usage above 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:yit-alerts

# Database connections > 80% of max
aws cloudwatch put-metric-alarm \
  --alarm-name yit-db-connections-high \
  --alarm-description "Database connections above 80%" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:yit-alerts

# Application errors > 10/minute
aws cloudwatch put-metric-alarm \
  --alarm-name yit-app-errors-high \
  --alarm-description "Application error rate above threshold" \
  --metric-name Errors \
  --namespace YIT/Application \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:yit-alerts
```

### Backup Verification

**Daily automated check:**

```bash
#!/bin/bash
# /infrastructure/scripts/verify_backups.sh

# Check RDS latest restorable time (should be < 15 minutes old)
LATEST_RESTORABLE=$(aws rds describe-db-instances \
  --db-instance-identifier yit-production \
  --query 'DBInstances[0].LatestRestorableTime' \
  --output text)

CURRENT_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)
DIFF_SECONDS=$(( $(date -d "$CURRENT_TIME" +%s) - $(date -d "$LATEST_RESTORABLE" +%s) ))

if [ $DIFF_SECONDS -gt 900 ]; then
  echo "❌ WARNING: Latest restorable time is $DIFF_SECONDS seconds old (> 15 minutes)"
  # Send alert
  aws sns publish \
    --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:yit-alerts \
    --message "Backup verification failed: RDS backup too old"
  exit 1
fi

# Check S3 backup exists from last hour
HOUR_AGO=$(date -u -d '1 hour ago' +%Y%m%d_%H)
BACKUP_COUNT=$(aws s3 ls s3://yit-backups/postgres/ | grep "$HOUR_AGO" | wc -l)

if [ $BACKUP_COUNT -eq 0 ]; then
  echo "❌ WARNING: No backup found from last hour"
  exit 1
fi

echo "✅ All backups verified successfully"
```

---

## MONTHLY RECOVERY TEST

**Schedule:** 3rd Friday of each month, 10:00 AM ET
**Duration:** 2 hours
**Owner:** Technical Operations Team

### Test Procedure

```bash
# 1. Create test database from latest backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier yit-recovery-test-$(date +%Y%m%d) \
  --db-snapshot-identifier rds:yit-production-$(date +%Y-%m-%d-%H-%M) \
  --db-instance-class db.t3.medium \
  --publicly-accessible

# 2. Wait for availability
aws rds wait db-instance-available \
  --db-instance-identifier yit-recovery-test-$(date +%Y%m%d)

# 3. Get endpoint
TEST_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier yit-recovery-test-$(date +%Y%m%d) \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# 4. Run validation queries
psql -h $TEST_ENDPOINT -U postgres -d yit_database <<EOF
-- Verify table row counts
SELECT 'topics' as table_name, COUNT(*) as row_count FROM topics
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases
UNION ALL
SELECT 'evaluator_responses', COUNT(*) FROM evaluator_responses;

-- Verify data integrity (no orphaned records)
SELECT COUNT(*) as orphaned_purchases
FROM purchases p
LEFT JOIN customers c ON p.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

-- Verify indexes exist
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Sample data validation
SELECT * FROM topics LIMIT 5;
SELECT * FROM evaluator_responses ORDER BY submission_timestamp DESC LIMIT 5;
EOF

# 5. Test application connection
DATABASE_URL="postgresql://postgres:password@${TEST_ENDPOINT}:5432/yit_database"
node -e "
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: '$DATABASE_URL' });
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Connection failed:', err);
      process.exit(1);
    }
    console.log('✅ Connection successful:', res.rows[0]);
    pool.end();
  });
"

# 6. Document results in spreadsheet
# - Backup timestamp
# - Restoration time
# - Data validation results
# - Any issues encountered
# - Next steps/improvements

# 7. Cleanup test database
aws rds delete-db-instance \
  --db-instance-identifier yit-recovery-test-$(date +%Y%m%d) \
  --skip-final-snapshot
```

---

## POST-INCIDENT CHECKLIST

After any disaster recovery incident:

- [ ] Document incident timeline (what happened, when, how long)
- [ ] Identify root cause (database crash, deployment error, AWS outage, etc.)
- [ ] Document recovery steps taken
- [ ] Measure actual RTO vs target (< 1 hour)
- [ ] Measure actual RPO vs target (< 15 minutes)
- [ ] Calculate financial impact (lost revenue, customer refunds, etc.)
- [ ] Notify affected customers (email, status page)
- [ ] Update runbook if new procedures discovered
- [ ] Schedule post-mortem meeting (within 48 hours)
- [ ] Implement preventive measures
- [ ] Update monitoring/alerts to detect earlier
- [ ] Review and update disaster recovery plan

---

## ON-CALL SCHEDULE

**Rotation:** Weekly (Monday-Sunday)
**Response SLA:** 15 minutes acknowledgment, 30 minutes engagement

| Week | Primary | Secondary |
|------|---------|-----------|
| Week 1 | Engineer A | Engineer B |
| Week 2 | Engineer B | Engineer C |
| Week 3 | Engineer C | Engineer A |

**Contact Methods:**
- PagerDuty: https://yit.pagerduty.com
- Slack: #yit-incidents
- Phone: On-call engineer's mobile

---

## APPENDIX: USEFUL COMMANDS

### Quick Health Checks

```bash
# Database health
psql -U postgres -d yit_database -c "SELECT version();"
psql -U postgres -d yit_database -c "SELECT COUNT(*) FROM pg_stat_activity;"

# Application health
curl https://yit.app/health
curl https://api.yit.app/health/database

# S3 health
aws s3 ls s3://yit-production-files/

# Redis health
redis-cli -h $REDIS_HOST ping
```

### Emergency Contacts

- **AWS Support:** 1-800-XXX-XXXX (Enterprise Support)
- **Database Admin:** db-admin@yit.app
- **DevOps Lead:** devops@yit.app
- **CTO:** cto@yit.app

---

**Last Tested:** [Date]
**Next Test:** [3rd Friday of next month]
**Status:** ACTIVE
