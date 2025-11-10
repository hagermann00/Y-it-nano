#!/bin/bash

# =====================================================================
# Y-IT DATABASE BACKUP SCRIPT
# =====================================================================
#
# Purpose: Automated hourly backups to S3 with compression and logging
# Schedule: 0 * * * * (every hour via cron)
# Retention: 30 days (lifecycle policy in S3)
#
# Setup:
# 1. chmod +x /infrastructure/scripts/backup.sh
# 2. Add to crontab: crontab -e
#    0 * * * * /path/to/infrastructure/scripts/backup.sh >> /var/log/yit-backup.log 2>&1
# 3. Ensure AWS credentials configured: aws configure
# =====================================================================

set -euo pipefail  # Exit on error, undefined var, or pipe failure

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_HOUR=$(date +%Y%m%d_%H)
BACKUP_FILE="yit_db_${TIMESTAMP}.dump"
TEMP_DIR="/tmp/yit-backups"
S3_BUCKET="yit-backups"
S3_PREFIX="postgres"

# Database connection (from environment or config)
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-yit_database}"
DB_PORT="${DB_PORT:-5432}"

# Logging
LOG_FILE="/var/log/yit-backup.log"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"  # Optional Slack notifications

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =====================================================================
# FUNCTIONS
# =====================================================================

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

send_slack_notification() {
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"$1\"}" \
      --silent --output /dev/null
  fi
}

cleanup() {
  log "Cleaning up temporary files..."
  rm -f "${TEMP_DIR}/${BACKUP_FILE}"
  rm -f "${TEMP_DIR}/${BACKUP_FILE}.gz"
}

# =====================================================================
# PRE-FLIGHT CHECKS
# =====================================================================

log "========================================="
log "Starting Y-IT Database Backup"
log "Timestamp: $TIMESTAMP"
log "========================================="

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
  error "pg_dump not found. Please install PostgreSQL client tools."
  exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  error "AWS CLI not found. Please install AWS CLI."
  exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  error "AWS credentials not configured. Run 'aws configure'."
  exit 1
fi

# Create temp directory
mkdir -p "$TEMP_DIR"

# =====================================================================
# DATABASE BACKUP
# =====================================================================

log "Starting database dump..."
log "Database: $DB_NAME"
log "Host: $DB_HOST"
log "Format: Custom (compressed)"

# Start time tracking
START_TIME=$(date +%s)

# Perform backup with pg_dump
if PGPASSWORD="$DB_PASSWORD" pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="${TEMP_DIR}/${BACKUP_FILE}" 2>&1 | tee -a "$LOG_FILE"; then

  success "Database dump completed successfully"
else
  error "Database dump failed"
  send_slack_notification "❌ Y-IT Database Backup FAILED at $TIMESTAMP"
  cleanup
  exit 1
fi

# Calculate dump duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
log "Dump duration: ${DURATION} seconds"

# Get backup file size
BACKUP_SIZE=$(du -h "${TEMP_DIR}/${BACKUP_FILE}" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# =====================================================================
# UPLOAD TO S3
# =====================================================================

log "Uploading backup to S3..."
log "Bucket: s3://${S3_BUCKET}/${S3_PREFIX}/"

# Upload with metadata
if aws s3 cp "${TEMP_DIR}/${BACKUP_FILE}" \
  "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" \
  --storage-class STANDARD_IA \
  --metadata "timestamp=${TIMESTAMP},database=${DB_NAME},size=${BACKUP_SIZE},duration=${DURATION}" \
  --server-side-encryption AES256 \
  2>&1 | tee -a "$LOG_FILE"; then

  success "Upload to S3 completed successfully"
else
  error "Upload to S3 failed"
  send_slack_notification "❌ Y-IT Database Backup upload FAILED at $TIMESTAMP"
  cleanup
  exit 1
fi

# =====================================================================
# VERIFICATION
# =====================================================================

log "Verifying backup in S3..."

# Check if file exists in S3
if aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" &> /dev/null; then
  success "Backup verified in S3"

  # Get S3 file size
  S3_SIZE=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" | awk '{print $3}')
  log "S3 file size: $S3_SIZE bytes"
else
  error "Backup verification failed - file not found in S3"
  send_slack_notification "❌ Y-IT Database Backup verification FAILED at $TIMESTAMP"
  cleanup
  exit 1
fi

# =====================================================================
# RETENTION MANAGEMENT
# =====================================================================

log "Managing backup retention (30 days)..."

# List backups older than 30 days
CUTOFF_DATE=$(date -d '30 days ago' +%Y%m%d)
OLD_BACKUPS=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
  awk '{print $4}' | \
  grep "yit_db_" | \
  awk -F'_' '{print $3"_"$4, $0}' | \
  awk -v cutoff="$CUTOFF_DATE" '$1 < cutoff {print $2}')

if [ -n "$OLD_BACKUPS" ]; then
  log "Found $(echo "$OLD_BACKUPS" | wc -l) old backups to delete"

  while IFS= read -r old_backup; do
    log "Deleting old backup: $old_backup"
    aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${old_backup}"
  done <<< "$OLD_BACKUPS"

  success "Old backups cleaned up"
else
  log "No old backups to delete"
fi

# =====================================================================
# CLEANUP & SUMMARY
# =====================================================================

cleanup

TOTAL_DURATION=$(($(date +%s) - START_TIME))

log "========================================="
log "Backup Summary:"
log "  - Backup file: $BACKUP_FILE"
log "  - Size: $BACKUP_SIZE"
log "  - Duration: ${TOTAL_DURATION} seconds"
log "  - Location: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}"
log "  - Status: SUCCESS"
log "========================================="

# Send success notification to Slack
send_slack_notification "✅ Y-IT Database Backup completed successfully
  • Time: $TIMESTAMP
  • Size: $BACKUP_SIZE
  • Duration: ${TOTAL_DURATION}s
  • Location: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}"

success "Backup completed successfully!"

exit 0

# =====================================================================
# TROUBLESHOOTING
# =====================================================================
#
# Common issues:
#
# 1. "pg_dump: error: connection to server failed"
#    - Check DB_HOST and DB_PORT
#    - Verify database is running: psql -h $DB_HOST -U $DB_USER -c "SELECT 1;"
#    - Check firewall rules
#
# 2. "aws: command not found"
#    - Install AWS CLI: pip install awscli
#    - Or: brew install awscli (Mac)
#
# 3. "An error occurred (AccessDenied) when calling the PutObject operation"
#    - Check AWS credentials: aws sts get-caller-identity
#    - Verify IAM permissions for S3 bucket
#
# 4. "PGPASSWORD environment variable not set"
#    - Add to script: export PGPASSWORD="your_password"
#    - Or create .pgpass file: echo "$DB_HOST:$DB_PORT:$DB_NAME:$DB_USER:$DB_PASSWORD" > ~/.pgpass
#    - chmod 600 ~/.pgpass
#
# 5. Backup taking too long
#    - Use --exclude-table-data for large tables that don't need backup
#    - Consider streaming directly to S3: pg_dump ... | gzip | aws s3 cp - s3://...
#
# =====================================================================
