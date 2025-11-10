# Y-IT CRITICAL FIXES - QUICK START

**Total Time to Setup:** 2-3 hours
**Prerequisites:** Node.js 18+, PostgreSQL 12+, Redis, AWS account

---

## 🚀 SETUP IN 30 MINUTES (Fast Track)

### 1. Install Dependencies (5 min)

```bash
# Clone repository (if not already done)
cd /home/user/Y-it-nano

# Install Node dependencies
npm install stripe redis express-rate-limit rate-limit-redis react-hook-form zod @hookform/resolvers

# Install Redis
# macOS:
brew install redis && brew services start redis

# Linux:
sudo apt-get install redis-server && sudo systemctl start redis

# Verify installations
node --version  # Should be 18+
redis-cli ping  # Should return PONG
psql --version  # Should be 12+
```

### 2. Setup Environment Variables (5 min)

```bash
# Copy template
cp .env.example .env.local

# Edit with your credentials
nano .env.local

# Minimum required variables:
# - DATABASE_URL
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - REDIS_URL
# - OPENAI_API_KEY
```

### 3. Setup Database (10 min)

```bash
# Backup existing database
pg_dump -U postgres -Fc yit_database > backup_$(date +%Y%m%d).dump

# Run migration (creates indexes)
psql -U postgres -d yit_database -f database/migrations/001_add_performance_indexes.sql

# Verify indexes created
psql -U postgres -d yit_database -c "\di"
```

### 4. Deploy Fixes (5 min)

```bash
# Copy all files to your app structure
# Stripe webhook
mkdir -p app/api/webhooks/stripe
cp api/webhooks/stripe/route.js app/api/webhooks/stripe/

# Rate limiter
mkdir -p lib
cp middleware/rateLimiterConfig.js lib/

# Evaluator endpoint
mkdir -p app/api/evaluator/generate
cp api/evaluator/generate/route.js app/api/evaluator/generate/

# Optimized form
mkdir -p components/evaluator
cp components/evaluator/EvaluatorFormOptimized.jsx components/evaluator/
```

### 5. Test Locally (5 min)

```bash
# Start development server
npm run dev

# Test Stripe webhook (in separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test rate limiting
curl -X POST http://localhost:3000/api/evaluator/generate \
  -H "Content-Type: application/json" \
  -d '{"topic_slug":"dropshipping","customer_email":"test@example.com","customer_name":"Test"}'

# Should work first time, fail second time (rate limited)
```

### 6. Deploy to Production (5 min)

```bash
# Add environment variables to Vercel
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add REDIS_URL production
# ... (add all required vars)

# Deploy
vercel --prod

# Test production
curl https://your-domain.com/health
```

---

## 📋 POST-DEPLOYMENT CHECKLIST

**Immediately After Deployment:**

- [ ] Stripe webhook receiving events (check Stripe Dashboard)
- [ ] Redis connected (check application logs)
- [ ] Database queries fast (<100ms)
- [ ] Backup script scheduled (cron)
- [ ] Form loads and submits successfully

**Within 24 Hours:**

- [ ] Monitor rate limiting rejections (should be <1%)
- [ ] Verify backups created in S3
- [ ] Check CloudWatch alarms configured
- [ ] Test disaster recovery procedure

**Within 1 Week:**

- [ ] Review A/B test results (100+ submissions)
- [ ] Monitor database query performance
- [ ] Verify index usage (pg_stat_user_indexes)
- [ ] Check OpenAI costs (should be controlled)

---

## 🔍 VERIFY EVERYTHING IS WORKING

### Test #1: Stripe Webhook

```bash
# Send test webhook from Stripe Dashboard
# OR use Stripe CLI:
stripe trigger payment_intent.succeeded

# Check logs:
vercel logs --prod | grep "Stripe webhook"

# Expected:
# ✅ Webhook signature verified. Event type: payment_intent.succeeded
```

### Test #2: Rate Limiting

```bash
# Submit twice with same email
curl -X POST https://your-domain.com/api/evaluator/generate \
  -H "Content-Type: application/json" \
  -d '{"topic_slug":"dropshipping","customer_email":"test@example.com","customer_name":"Test"}'

# First: 200 OK
# Second: 429 Too Many Requests
```

### Test #3: Database Performance

```bash
psql -U postgres -d yit_database <<EOF
EXPLAIN ANALYZE
SELECT topic_id, COUNT(*)
FROM evaluator_responses
WHERE topic_id = 1 AND submission_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY topic_id;
EOF

# Expected: Execution Time: <50 ms
# Should show: Index Scan using idx_evaluator_responses_topic_date
```

### Test #4: Backup Script

```bash
# Run backup manually
/home/user/Y-it-nano/infrastructure/scripts/backup.sh

# Check S3
aws s3 ls s3://yit-backups/postgres/

# Expected: yit_db_YYYYMMDD_HHMMSS.dump
```

### Test #5: Optimized Form

```bash
# Visit evaluator page
open https://your-domain.com/dropshipping/evaluator

# Verify:
# - Only 2 fields (name, email)
# - Trust badges visible
# - Loading state works
# - Roast displays correctly
```

---

## 🆘 TROUBLESHOOTING

### Issue: "Webhook signature verification failed"

**Cause:** Wrong STRIPE_WEBHOOK_SECRET

**Solution:**
```bash
# Get correct secret from Stripe Dashboard
# Update environment variable
vercel env rm STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_WEBHOOK_SECRET whsec_xxxxx production
vercel --prod
```

### Issue: "Redis connection failed"

**Cause:** Redis not running or wrong REDIS_URL

**Solution:**
```bash
# Local:
brew services start redis
redis-cli ping  # Should return PONG

# Production:
# Check ElastiCache endpoint in AWS console
# Update REDIS_URL
```

### Issue: "Queries still slow after indexes"

**Cause:** Statistics not updated

**Solution:**
```bash
# Update database statistics
psql -U postgres -d yit_database -c "VACUUM ANALYZE;"

# Verify indexes being used
psql -U postgres -d yit_database -c "
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
"
```

### Issue: "Backup script failing"

**Cause:** AWS credentials not configured or wrong S3 bucket

**Solution:**
```bash
# Configure AWS credentials
aws configure

# Test S3 access
aws s3 ls s3://yit-backups/

# If bucket doesn't exist:
aws s3 mb s3://yit-backups
```

### Issue: "Form not submitting"

**Cause:** API endpoint not deployed or CORS issue

**Solution:**
```bash
# Check API endpoint exists
curl https://your-domain.com/api/evaluator/generate

# Check browser console for errors
# Verify environment variables set
vercel env ls production
```

---

## 📊 MONITORING DASHBOARD

### Key Metrics to Watch

| Metric | Target | Alert If |
|--------|--------|----------|
| Stripe webhook success rate | >99% | <95% |
| Rate limiting rejection rate | <1% | >5% |
| Database query time (p95) | <100ms | >500ms |
| Backup success rate | 100% | <100% |
| Form completion rate | >60% | <50% |
| OpenAI API costs/day | <$5 | >$10 |

### Where to Monitor

- **Stripe webhooks:** https://dashboard.stripe.com/webhooks
- **Redis:** `redis-cli info stats`
- **Database:** `psql -c "SELECT * FROM pg_stat_user_indexes;"`
- **Backups:** AWS S3 console or `aws s3 ls s3://yit-backups/postgres/`
- **Application:** Vercel logs or `vercel logs --prod`
- **Errors:** Sentry dashboard (if configured)

---

## 📞 SUPPORT

**Issues or Questions?**

1. Check this guide first
2. Review IMPLEMENTATION_GUIDE.md for detailed instructions
3. Check individual fix files for specific documentation
4. Review logs: `vercel logs --prod`

**Emergency Contact:**
- On-call engineer: See infrastructure/disaster_recovery.md
- Slack: #yit-incidents
- Email: devops@yit.app

---

## ✅ COMPLETION CHECKLIST

Mark each item when completed:

**Setup:**
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database migration run
- [ ] All files copied to correct locations
- [ ] Deployed to production

**Testing:**
- [ ] Stripe webhook verified
- [ ] Rate limiting tested
- [ ] Database indexes verified
- [ ] Backup script tested
- [ ] Optimized form tested

**Monitoring:**
- [ ] CloudWatch alarms created
- [ ] Backup cron scheduled
- [ ] Metrics dashboard configured
- [ ] Team trained on procedures

**Documentation:**
- [ ] Disaster recovery plan reviewed
- [ ] On-call schedule assigned
- [ ] Runbooks accessible to team

---

**Status:** Ready for Week 1 Launch ✅

**Time Saved:**
- Security vulnerability prevented: ✅
- API costs controlled: ✅
- Performance optimized: ✅
- Data protected: ✅
- Conversion improved: ✅

**Launch with confidence! 🚀**
