#!/bin/bash

# ============================================================================
# Y-IT Backup Status Checker
# ============================================================================
#
# This script checks if backups are running successfully and sends alerts
# if backups haven't run in the expected timeframe.
#
# Usage:
#   ./check-backup-status.sh
#
# Cron schedule (every 2 hours):
#   0 */2 * * * /path/to/check-backup-status.sh >> /var/log/yit-backup-monitor.log 2>&1
#
# ============================================================================

set -euo pipefail

# Configuration
BACKUP_LOG="/var/log/yit-gdrive-backup.log"
MAX_AGE_MINUTES=90  # Alert if no backup in last 90 minutes
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# Functions
# ============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

send_slack_alert() {
    local message="$1"
    local color="$2"  # good, warning, danger

    if [ -z "$SLACK_WEBHOOK" ]; then
        return 0
    fi

    curl -X POST "$SLACK_WEBHOOK" \
        -H 'Content-Type: application/json' \
        -d "{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"Y-IT Backup Alert\",
                \"text\": \"$message\",
                \"ts\": $(date +%s)
            }]
        }" 2>/dev/null || true
}

check_backup_age() {
    if [ ! -f "$BACKUP_LOG" ]; then
        log "${RED}ERROR: Backup log not found: $BACKUP_LOG${NC}"
        send_slack_alert "❌ Backup log file not found: $BACKUP_LOG" "danger"
        return 1
    fi

    # Find last successful backup
    local last_success=$(grep "SUCCESS" "$BACKUP_LOG" | tail -1)

    if [ -z "$last_success" ]; then
        log "${RED}ERROR: No successful backups found in log${NC}"
        send_slack_alert "❌ No successful backups found in log" "danger"
        return 1
    fi

    # Extract timestamp (assumes log format: [YYYY-MM-DD HH:MM:SS])
    # This is a simplified check - adjust regex based on actual log format
    local now=$(date +%s)
    local last_backup_time=$(stat -c %Y "$BACKUP_LOG" 2>/dev/null || stat -f %m "$BACKUP_LOG" 2>/dev/null)
    local age_minutes=$(( (now - last_backup_time) / 60 ))

    log "Last backup log update: $age_minutes minutes ago"

    if [ "$age_minutes" -gt "$MAX_AGE_MINUTES" ]; then
        log "${RED}WARNING: Backup is overdue (last: $age_minutes min ago, max: $MAX_AGE_MINUTES min)${NC}"
        send_slack_alert "⚠️ Y-IT backup is overdue!\n\nLast backup: $age_minutes minutes ago\nThreshold: $MAX_AGE_MINUTES minutes" "warning"
        return 1
    else
        log "${GREEN}OK: Backup is current (last: $age_minutes min ago)${NC}"
        return 0
    fi
}

check_recent_errors() {
    local error_count=$(grep -c "ERROR\|FAILED" "$BACKUP_LOG" 2>/dev/null || echo "0")
    local recent_errors=$(grep "ERROR\|FAILED" "$BACKUP_LOG" | tail -5)

    if [ "$error_count" -gt 0 ]; then
        log "${YELLOW}Found $error_count error(s) in backup log${NC}"
        log "Recent errors:"
        echo "$recent_errors"
    else
        log "${GREEN}No errors found in backup log${NC}"
    fi
}

check_disk_space() {
    local temp_dir="/tmp/yit-backups"
    local usage=$(df -h "$temp_dir" 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ -z "$usage" ]; then
        return 0
    fi

    log "Temp directory disk usage: ${usage}%"

    if [ "$usage" -gt 90 ]; then
        log "${RED}WARNING: Disk space is low (${usage}% used)${NC}"
        send_slack_alert "⚠️ Low disk space on backup temp directory: ${usage}% used" "warning"
        return 1
    else
        log "${GREEN}OK: Sufficient disk space (${usage}% used)${NC}"
        return 0
    fi
}

# ============================================================================
# Main
# ============================================================================

main() {
    log "========================================="
    log "Y-IT Backup Status Check"
    log "========================================="

    local exit_code=0

    # Check backup age
    if ! check_backup_age; then
        exit_code=1
    fi

    # Check for recent errors
    check_recent_errors

    # Check disk space
    if ! check_disk_space; then
        exit_code=1
    fi

    log "========================================="

    if [ $exit_code -eq 0 ]; then
        log "${GREEN}All checks passed${NC}"
    else
        log "${RED}Some checks failed${NC}"
    fi

    return $exit_code
}

# Run main function
main "$@"
