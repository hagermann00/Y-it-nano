-- =====================================================================
-- FIX #3: DATABASE COMPOSITE INDEXES FOR PERFORMANCE
-- =====================================================================
--
-- Purpose: Optimize query performance for time-range queries and joins
-- Impact: Prevents degradation after 1-2 months of data (10K+ evaluator rows)
-- Estimated Index Size: <1GB for 50 topics with 1 year of data
--
-- Installation:
-- psql -U postgres -d yit_database -f 001_add_performance_indexes.sql
--
-- Testing:
-- Run EXPLAIN ANALYZE on queries before and after to measure improvement
--
-- Rollback:
-- See end of file for DROP INDEX statements
-- =====================================================================

\timing on

-- Start transaction
BEGIN;

-- =====================================================================
-- SECTION 1: CRITICAL EVALUATOR INDEXES
-- =====================================================================
-- These indexes optimize the most common evaluator queries:
-- - Time-range queries (last 30 days, last 7 days)
-- - Email lookup (check if email already submitted)
-- - Conversion tracking (evaluator → purchase funnel)

-- Index 1: Topic + Date range queries
-- Used for: Dashboard analytics, topic performance metrics
-- Query pattern: WHERE topic_id = X AND submission_timestamp > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evaluator_responses_topic_date
  ON evaluator_responses(topic_id, submission_timestamp DESC);

COMMENT ON INDEX idx_evaluator_responses_topic_date IS
  'Optimizes time-range queries per topic (e.g., submissions in last 30 days)';

-- Index 2: Email + Date lookup
-- Used for: Rate limiting checks, duplicate submission prevention
-- Query pattern: WHERE customer_email = X AND submission_timestamp > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evaluator_responses_email_date
  ON evaluator_responses(customer_email, submission_timestamp DESC);

COMMENT ON INDEX idx_evaluator_responses_email_date IS
  'Optimizes email-based rate limiting and duplicate checks';

-- Index 3: Purchase conversion tracking
-- Used for: Conversion funnel analysis (evaluator → purchase)
-- Query pattern: WHERE purchase_id IS NOT NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evaluator_responses_purchase
  ON evaluator_responses(purchase_id)
  WHERE purchase_id IS NOT NULL;

COMMENT ON INDEX idx_evaluator_responses_purchase IS
  'Partial index for conversion tracking (only rows with purchases)';

-- Index 4: Topic + Email (composite for duplicate prevention)
-- Used for: Fast lookup when checking if email already submitted for topic
-- Query pattern: WHERE topic_id = X AND customer_email = Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evaluator_responses_topic_email
  ON evaluator_responses(topic_id, customer_email);

COMMENT ON INDEX idx_evaluator_responses_topic_email IS
  'Fast duplicate detection per topic per email';

-- =====================================================================
-- SECTION 2: EMAIL TRACKING INDEXES
-- =====================================================================
-- These indexes optimize email campaign performance queries

-- Index 5: Customer + Date (email tracking)
-- Used for: Customer email history, engagement tracking
-- Query pattern: WHERE customer_id = X AND sent_at > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_customer_sent
  ON email_tracking(customer_id, sent_at DESC);

COMMENT ON INDEX idx_email_tracking_customer_sent IS
  'Optimizes customer email history queries';

-- Index 6: Sequence + Date (campaign performance)
-- Used for: Email sequence analytics, campaign reporting
-- Query pattern: WHERE sequence_id = X AND sent_at > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_sequence_date
  ON email_tracking(sequence_id, sent_at DESC);

COMMENT ON INDEX idx_email_tracking_sequence_date IS
  'Optimizes email sequence performance queries';

-- Index 7: Conversion tracking (email → purchase)
-- Used for: Email attribution, ROI calculations
-- Query pattern: WHERE purchase_id IS NOT NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_purchase
  ON email_tracking(purchase_id)
  WHERE purchase_id IS NOT NULL;

COMMENT ON INDEX idx_email_tracking_purchase IS
  'Partial index for email conversion tracking';

-- =====================================================================
-- SECTION 3: PURCHASE/REVENUE INDEXES
-- =====================================================================
-- These indexes optimize revenue queries and reporting

-- Index 8: Topic + Date (revenue per topic)
-- Used for: Topic revenue reports, trending analysis
-- Query pattern: WHERE topic_id = X AND purchased_at > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchases_topic_date
  ON purchases(topic_id, purchased_at DESC);

COMMENT ON INDEX idx_purchases_topic_date IS
  'Optimizes revenue queries per topic over time';

-- Index 9: Customer + Date (customer LTV)
-- Used for: Customer lifetime value, purchase history
-- Query pattern: WHERE customer_id = X AND purchased_at > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchases_customer_date
  ON purchases(customer_id, purchased_at DESC);

COMMENT ON INDEX idx_purchases_customer_date IS
  'Optimizes customer purchase history queries';

-- Index 10: Status + Date (completed purchases only)
-- Used for: Revenue reporting (exclude pending/refunded)
-- Query pattern: WHERE status = 'completed' AND purchased_at > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchases_completed_date
  ON purchases(purchased_at DESC)
  WHERE status = 'completed';

COMMENT ON INDEX idx_purchases_completed_date IS
  'Partial index for completed purchases only';

-- Index 11: Evaluator attribution (conversion funnel)
-- Used for: Evaluator ROI, conversion rate calculations
-- Query pattern: WHERE evaluator_response_id IS NOT NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchases_evaluator_attribution
  ON purchases(evaluator_response_id, topic_id)
  WHERE evaluator_response_id IS NOT NULL;

COMMENT ON INDEX idx_purchases_evaluator_attribution IS
  'Optimizes evaluator-to-purchase conversion queries';

-- =====================================================================
-- SECTION 4: FULL-TEXT SEARCH INDEXES (OPTIONAL)
-- =====================================================================
-- These are optional but recommended for future search features

-- Index 12: Case study full-text search
-- Used for: Searching case studies by character, outcome, narrative
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_case_studies_search
  ON case_studies USING GIN (
    to_tsvector('english',
      character_name || ' ' ||
      character_archetype || ' ' ||
      background || ' ' ||
      outcome || ' ' ||
      COALESCE(full_narrative, '')
    )
  );

COMMENT ON INDEX idx_case_studies_search IS
  'Full-text search index for case studies';

-- Index 13: Chapter content full-text search
-- Used for: Searching chapter content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chapters_search
  ON chapters USING GIN (
    to_tsvector('english', title || ' ' || content)
  );

COMMENT ON INDEX idx_chapters_search IS
  'Full-text search index for chapter content';

-- =====================================================================
-- SECTION 5: COVERING INDEXES (ADVANCED OPTIMIZATION)
-- =====================================================================
-- These indexes include commonly-accessed columns to avoid table lookups

-- Index 14: Topic metrics covering index
-- Used for: Dashboard queries that need topic + count + revenue
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchases_topic_metrics
  ON purchases(topic_id, status, purchased_at DESC)
  INCLUDE (final_amount_cents, purchase_type);

COMMENT ON INDEX idx_purchases_topic_metrics IS
  'Covering index for topic revenue queries (includes amount, type)';

-- =====================================================================
-- VALIDATION & TESTING QUERIES
-- =====================================================================

-- Test Query 1: Evaluator submissions in last 30 days per topic
EXPLAIN ANALYZE
SELECT
  topic_id,
  COUNT(*) as submissions,
  COUNT(CASE WHEN purchase_id IS NOT NULL THEN 1 END) as conversions,
  ROUND(COUNT(CASE WHEN purchase_id IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM evaluator_responses
WHERE topic_id = 1
  AND submission_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY topic_id;
-- Expected: Index Scan using idx_evaluator_responses_topic_date
-- Expected time: <50ms for 10K rows

-- Test Query 2: Customer email history
EXPLAIN ANALYZE
SELECT
  sent_at,
  sequence_id,
  opened_at,
  clicked_at
FROM email_tracking
WHERE customer_id = 123
  AND sent_at >= NOW() - INTERVAL '90 days'
ORDER BY sent_at DESC
LIMIT 20;
-- Expected: Index Scan using idx_email_tracking_customer_sent
-- Expected time: <10ms

-- Test Query 3: Topic revenue in last month
EXPLAIN ANALYZE
SELECT
  topic_id,
  SUM(final_amount_cents) as total_revenue,
  COUNT(*) as total_sales,
  AVG(final_amount_cents) as avg_order_value
FROM purchases
WHERE topic_id = 1
  AND status = 'completed'
  AND purchased_at >= NOW() - INTERVAL '30 days'
GROUP BY topic_id;
-- Expected: Index Scan using idx_purchases_topic_date
-- Expected time: <20ms

-- Test Query 4: Conversion funnel (evaluator → email → purchase)
EXPLAIN ANALYZE
SELECT
  er.topic_id,
  COUNT(DISTINCT er.response_id) as evaluators,
  COUNT(DISTINCT et.tracking_id) as emails_sent,
  COUNT(DISTINCT p.purchase_id) as purchases,
  ROUND(COUNT(DISTINCT p.purchase_id)::numeric / COUNT(DISTINCT er.response_id) * 100, 2) as funnel_conversion
FROM evaluator_responses er
LEFT JOIN email_tracking et ON er.customer_email = et.customer_email
LEFT JOIN purchases p ON er.purchase_id = p.purchase_id
WHERE er.topic_id = 1
  AND er.submission_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY er.topic_id;
-- Expected: Multiple index scans
-- Expected time: <100ms

-- =====================================================================
-- INDEX SIZE ANALYSIS
-- =====================================================================

-- Check index sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('evaluator_responses', 'email_tracking', 'purchases', 'case_studies', 'chapters')
ORDER BY pg_relation_size(indexrelid) DESC;

-- Expected total index size: <500MB for 50 topics with 1 year of data

-- =====================================================================
-- COMMIT TRANSACTION
-- =====================================================================

COMMIT;

-- Display success message
\echo '✅ All indexes created successfully!'
\echo ''
\echo 'Next steps:'
\echo '1. Run VACUUM ANALYZE to update statistics'
\echo '2. Test queries with EXPLAIN ANALYZE'
\echo '3. Monitor index usage with pg_stat_user_indexes'
\echo '4. Consider setting up pg_stat_statements for query analysis'

-- =====================================================================
-- MAINTENANCE COMMANDS
-- =====================================================================

-- Run after index creation to update statistics
VACUUM ANALYZE evaluator_responses;
VACUUM ANALYZE email_tracking;
VACUUM ANALYZE purchases;
VACUUM ANALYZE case_studies;
VACUUM ANALYZE chapters;

-- =====================================================================
-- MONITORING QUERIES
-- =====================================================================

-- Monitor index usage over time
-- Run this weekly to identify unused indexes
/*
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('evaluator_responses', 'email_tracking', 'purchases')
ORDER BY idx_scan ASC;
-- If idx_scan = 0 after 1 month, consider dropping the index
*/

-- Check for missing indexes (slow queries)
-- Run this if queries are slow
/*
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_seq_read
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;
-- High seq_scan + seq_tup_read indicates missing indexes
*/

-- =====================================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================================
/*
-- Uncomment and run if you need to remove all indexes

BEGIN;

DROP INDEX CONCURRENTLY IF EXISTS idx_evaluator_responses_topic_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_evaluator_responses_email_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_evaluator_responses_purchase;
DROP INDEX CONCURRENTLY IF EXISTS idx_evaluator_responses_topic_email;

DROP INDEX CONCURRENTLY IF EXISTS idx_email_tracking_customer_sent;
DROP INDEX CONCURRENTLY IF EXISTS idx_email_tracking_sequence_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_email_tracking_purchase;

DROP INDEX CONCURRENTLY IF EXISTS idx_purchases_topic_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_purchases_customer_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_purchases_completed_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_purchases_evaluator_attribution;

DROP INDEX CONCURRENTLY IF EXISTS idx_case_studies_search;
DROP INDEX CONCURRENTLY IF EXISTS idx_chapters_search;

DROP INDEX CONCURRENTLY IF EXISTS idx_purchases_topic_metrics;

COMMIT;

\echo '✅ All indexes dropped successfully'
*/

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
