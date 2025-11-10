# CRITICAL FIXES CHECKLIST: Before Week 1 Launch

## Status: READY TO IMPLEMENT

**Target Completion:** This week (before Week 1 production begins)
**Total Effort:** 28 hours
**Risk If Not Done:** HIGH (5 critical items affect launch viability)

---

## 🔴 CRITICAL SECTION (5 Items - 20 hours)

### FIX #1: Stripe Webhook Signature Verification ⚠️ SECURITY

**Current State:** Missing entirely
**Impact:** Fraudsters can create fake purchase orders
**Fix Time:** 2 hours
**Status:** ❌ NOT IMPLEMENTED

**Action Items:**

```javascript
// In /api/webhooks/stripe (backend)

// BEFORE (VULNERABLE):
const handleStripeWebhook = async (event) => {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Create purchase... (accepts ANY webhook)
  }
};

// AFTER (SECURE):
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    // Verify signature BEFORE processing
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // NOW safe to process webhook
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Create purchase record
    await db.query(
      `INSERT INTO purchases (customer_id, topic_id, amount_cents, status)
       VALUES ($1, $2, $3, 'completed')`,
      [paymentIntent.metadata.customer_id,
       paymentIntent.metadata.topic_id,
       paymentIntent.amount]
    );
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

**Checklist:**
- [ ] Get `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
- [ ] Add to `.env.local` file
- [ ] Implement signature verification (code above)
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Verify fake webhooks are rejected
- [ ] Deploy and test in staging

---

### FIX #2: Rate Limiting on Evaluator Form ⚠️ COST CONTROL

**Current State:** Missing entirely
**Impact:** Users can spam form, inflate OpenAI costs unbounded
**Fix Time:** 4 hours
**Status:** ❌ NOT IMPLEMENTED

**Action Items:**

```javascript
// Install: npm install rate-limit-redis redis

import redis from 'redis';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Rate limiter configurations
const evaluatorLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'evaluator:',
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 request per email per 24 hours
  keyGenerator: (req) => req.body.customer_email,
  message: 'You can only submit one roast per email address per 24 hours',
  standardHeaders: false,
  legacyHeaders: false,
});

const ipLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'evaluator-ip:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per IP per hour
  keyGenerator: (req) => req.ip,
  message: 'Too many roast requests from this IP, please try again later',
  standardHeaders: false,
  legacyHeaders: false,
});

// Apply to endpoint
app.post(
  '/api/evaluator/generate',
  [evaluatorLimiter, ipLimiter],
  async (req, res) => {
    // Generate roast
  }
);
```

**Checklist:**
- [ ] Install Redis (local dev, AWS ElastiCache for production)
- [ ] Install rate-limit-redis package
- [ ] Implement email-based limiter (1/email/24h)
- [ ] Implement IP-based limiter (10/IP/hour)
- [ ] Add response headers (X-RateLimit-Remaining, etc.)
- [ ] Test: Try to spam form, verify rejection at limit
- [ ] Test: Verify different emails can submit
- [ ] Test: Verify same email can't submit twice in 24h

---

### FIX #3: Database Composite Indexes for Performance

**Current State:** Basic indexes only, no time-range indexes
**Impact:** Queries degrade after 1-2 months of data (10K+ evaluator rows)
**Fix Time:** 6 hours
**Status:** ⚠️ PARTIALLY DEFINED (need implementation)

**Action Items:**

```sql
-- Add to database migration/setup script

-- CRITICAL: Evaluator time-range queries
CREATE INDEX idx_evaluator_responses_topic_date
  ON evaluator_responses(topic_id, submission_timestamp DESC);

CREATE INDEX idx_evaluator_responses_email_date
  ON evaluator_responses(customer_email, submission_timestamp DESC);

-- CRITICAL: Email tracking performance
CREATE INDEX idx_email_tracking_customer_sent
  ON email_tracking(customer_id, sent_at DESC);

CREATE INDEX idx_email_tracking_sequence_date
  ON email_tracking(sequence_id, sent_at DESC);

-- CRITICAL: Purchase revenue queries
CREATE INDEX idx_purchases_topic_date
  ON purchases(topic_id, purchased_at DESC);

CREATE INDEX idx_purchases_customer_date
  ON purchases(customer_id, purchased_at DESC);

-- CRITICAL: Conversion funnel
CREATE INDEX idx_evaluator_responses_purchase
  ON evaluator_responses(purchase_id)
  WHERE purchase_id IS NOT NULL;

-- OPTIONAL: Full-text search for future
CREATE INDEX idx_case_studies_search
  ON case_studies USING GIN (to_tsvector('english', outcome));
```

**Checklist:**
- [ ] Create migration file: `001_add_performance_indexes.sql`
- [ ] Test in development database
- [ ] Measure index size (should be <1GB for 50 topics)
- [ ] Run EXPLAIN ANALYZE on conversion query (should be <100ms)
- [ ] Add to staging database
- [ ] Verify impact on query performance (use pgBadger for analysis)

---

### FIX #4: Disaster Recovery RTO/RPO Specifications

**Current State:** Basic `pg_dump` command only, no recovery procedures
**Impact:** If database fails, no recovery plan = data loss
**Fix Time:** 4 hours
**Status:** ❌ NOT DOCUMENTED

**Action Items:**

**Create: `/infrastructure/disaster_recovery.md`**

```markdown
# Disaster Recovery Plan

## Recovery Objectives

**RTO (Recovery Time Objective):** < 1 hour
**RPO (Recovery Point Objective):** < 15 minutes

## Backup Strategy

### Automated Backups
- **Frequency:** Hourly full backups
- **Retention:** 30 days rolling window
- **Method:** AWS RDS automated backups (native)
- **Location:** Separate AWS region (cross-region)

### Implementation

#### 1. AWS RDS Automated Backups
```bash
# Already enabled by default on RDS
# Verify in AWS console:
# RDS → Databases → [instance] → Backups
# Enable automated backups: YES
# Backup retention period: 30 days
```

#### 2. Manual Backup Script (redundancy)
```bash
#!/bin/bash
# backup.sh - Manual backup to S3

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="yit_db_${TIMESTAMP}.dump"

pg_dump \
  --host=$DB_HOST \
  --username=$DB_USER \
  --no-password \
  --format=custom \
  --compress=9 \
  --file=$BACKUP_FILE \
  yit_database

# Upload to S3 (versioning enabled)
aws s3 cp $BACKUP_FILE \
  s3://yit-backups/postgres/${BACKUP_FILE}

# Cleanup local
rm $BACKUP_FILE

echo "Backup completed: ${BACKUP_FILE}"
```

Schedule: `0 * * * *` (every hour via cron)

### Point-in-Time Recovery

**Window:** 30 days (via AWS RDS automated backups)

**Recovery Steps:**
1. Identify failure time
2. In AWS console: RDS → Databases → [instance] → Modify
3. Set "Backup restore point" to time before failure
4. Create new DB instance from backup
5. Update connection string in application
6. Test connections
7. Run migration scripts if needed

**Estimated Time:** 30-45 minutes

### Testing

**Monthly Recovery Test (3rd Friday of each month)**
1. Restore latest backup to test database
2. Run data validation queries (row counts, checksums)
3. Verify all tables present and uncorrupted
4. Run sample business queries (conversion funnel, revenue)
5. Document results in shared spreadsheet

## Monitoring & Alerts

- **CloudWatch Alerts:** Database CPU >80%, connections >80
- **Backup Verification:** Automated daily validation
- **Response Team:** On-call rotation (weekly)

## Post-Incident Checklist

- [ ] Notified customer/users
- [ ] Identified root cause
- [ ] Applied fix
- [ ] Tested recovery procedure
- [ ] Documented incident
- [ ] Updated runbook if needed
```

**Checklist:**
- [ ] Enable AWS RDS automated backups (30-day retention)
- [ ] Setup manual backup script to S3
- [ ] Schedule backup script hourly (cron)
- [ ] Document recovery procedure (above)
- [ ] Setup CloudWatch alarms (CPU, connections)
- [ ] Assign monthly recovery test owner
- [ ] Create on-call schedule

---

### FIX #5: Evaluator Form Reduction (UX/Conversion Optimization)

**Current State:** 6 required fields (name, email, idea, investment, plan, research)
**Impact:** High form abandonment (60%+ at 6 fields vs 30% at 2 fields)
**Fix Time:** 4 hours
**Status:** ⚠️ PARTIALLY DEFINED (needs UX redesign)

**Action Items:**

**CURRENT FORM (TOO LONG):**
```
1. customer_name (required, text)
2. customer_email (required, email)
3. product_idea (required, 50+ chars, textarea)
4. investment_amount (required, number)
5. marketing_plan (required, 100+ chars, textarea)
6. research_done (optional, textarea)
```

**NEW FORM (OPTIMIZED):**

```javascript
// Step 1: Email Capture (2 fields only)
// =====================================
<form>
  <input name="name" placeholder="First name" required />
  <input name="email" type="email" placeholder="your@email.com" required />
  <button>Get My Roast</button>
</form>

// Step 2: Generate Roast
// =====================
// (Use submitted email + name + topic to generate roast)
// No additional fields needed

// Step 3: Optional Details (after roast preview)
// ================================================
// "Want a more personalized roast? Tell us more:"
// (Only if user engages after seeing roast preview)
<form>
  <textarea name="product_idea" placeholder="What's your business idea?" />
  <input name="investment" placeholder="How much are you investing?" />
  <textarea name="plan" placeholder="What's your marketing plan?" />
</form>
```

**Implementation:**

```javascript
// /[topic-slug]/evaluator/page.jsx

export default function EvaluatorPage() {
  const [step, setStep] = useState(1); // 1=form, 2=loading, 3=roast
  const [roast, setRoast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    product_idea: '', // Optional, filled later
  });

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setStep(2); // Show loading

    const response = await fetch('/api/evaluator/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic_slug: router.query.topic,
        customer_name: formData.name,
        customer_email: formData.email,
        // Optional fields (empty for MVP)
        product_idea: formData.product_idea || 'N/A',
      }),
    });

    const data = await response.json();
    setRoast(data.roast_text);
    setStep(3); // Show roast
  };

  return (
    <div>
      {step === 1 && (
        <form onSubmit={handleStep1Submit}>
          <h2>Roast My {topicName} Idea</h2>
          <p>Free, brutal analysis in 60 seconds</p>
          <input
            name="name"
            placeholder="First name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <button type="submit">Get My Roast</button>
          <p className="trust-badges">
            ✓ No spam  ✓ No signup required  ✓ Instant analysis
          </p>
        </form>
      )}

      {step === 2 && (
        <div className="loading">
          <p>Generating your roast...</p>
          <Spinner />
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="roast-preview">
            <h2>Your {topicName} Reality Check</h2>
            <RoastContent text={roast} />
            <button onClick={() => downloadRoastPDF()}>
              Download as PDF
            </button>
          </div>

          <div className="cta-section">
            <h3>Want the full analysis?</h3>
            <p>Get the complete guide with case studies, statistics, and alternatives.</p>
            <button onClick={() => router.push('/dropshipping/purchase')}>
              Get the Full Book
            </button>
          </div>

          <div className="optional-details">
            <details>
              <summary>Make your roast more personalized (optional)</summary>
              <form onSubmit={handleDetailsSubmit}>
                <textarea
                  name="product_idea"
                  placeholder="What's your specific business idea?"
                />
                <input
                  name="investment"
                  placeholder="How much are you investing?"
                />
                <button type="submit">Update Roast</button>
              </form>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] Redesign form to 2 required fields (name, email)
- [ ] Implement multi-step flow (capture email first)
- [ ] Add trust badges (No spam, Instant, Free)
- [ ] Show roast before asking for details
- [ ] Make additional fields optional/collapsed
- [ ] A/B test: original form vs 2-field form
- [ ] Target: 60%+ completion rate on 2-field form
- [ ] Measure: Email capture rate should increase to 85%+

---

## 🟠 HIGH PRIORITY (8 Items - 8 hours to plan, implement Week 1)

### FIX #6: Correct Gumroad Margin in Financial Model ✅

**Current State:** CORRECTED - Changed from $3.79 to $3.29 margin
**Impact:** Revenue model corrected by -13.2% per digital sale
**Fix Time:** 1 hour (COMPLETED)
**Status:** ✅ CORRECTED

**Actions Completed:**
- ✅ Updated Y-IT_PRODUCTION_ROADMAP_50_TOPICS.md
  - Changed "Gumroad: 100 sales/month @ $3.79 net = $379/month"
  - To: "Gumroad: 100 sales/month @ $3.29 net (after 10% + $0.30 fees) = $329/month"
  - Recalculated portfolio revenue: $644K → $472K-$624K
- ✅ Updated Claude.md, STRATEGIC_SUMMARY.md, COMPLETE_ARCHITECTURE_SUMMARY.md
- ✅ Updated Y-IT_PLATFORM_ARCHITECTURE.md, CURRENT_STATUS_AND_SETUP_RECORD.md

---

### FIX #7: Adjust Revenue Projections to Realistic Levels ✅

**Current State:** CORRECTED - Tiered model implemented
**Impact:** More realistic expectations by tier
**Fix Time:** 2 hours (COMPLETED)
**Status:** ✅ CORRECTED

**Actions Completed:**
- ✅ Created revised projections table in Y-IT_PRODUCTION_ROADMAP_50_TOPICS.md:

| Tier | Topics | Monthly/Topic | Annual Revenue |
|------|--------|---------------|-----------------|
| Tier 1 | 10 | $1,257 | $150,840 |
| Tier 2 | 10 | $814 | $97,680 |
| Tier 3 | 10 | $585 | $70,200 |
| Tier 4 | 10 | $413 | $49,560 |
| Tier 5 | 10 | $262 | $31,440 |
| **Total** | **50** | **~$913** | **$472K-$624K** |

---

### FIX #8: Create Cross-Topic Bundling Strategy

**Current State:** No bundling strategy mentioned (missing $50-150/topic/month)
**Impact:** Leaves revenue on table, misses LTV optimization
**Fix Time:** 8 hours (Week 1)
**Status:** ❌ NOT PLANNED

**Action (Week 1-2):**
- [ ] Design bundle tiers:
  - **Starter:** 3 books ($19.99, or $7/book avg)
  - **Standard:** 7 books ($39.99, or $5.70/book avg)
  - **Complete:** All 50 books ($149.99 launch, $99/year subscription)

- [ ] Create bundling landing page templates
- [ ] Plan cross-sell email sequences
- [ ] Launch bundles Week 8 (after Batch A validation)

---

### FIXES #9-12: (Form optimization, fallback strategies, etc.)

These follow same pattern - documented in Audit Synthesis, can be tracked in issue tracker.

---

## IMPLEMENTATION SCHEDULE

### This Week
- **Monday:** Implement Fixes #1-3 (webhook verification, rate limiting, indexes)
- **Tuesday:** Implement Fix #4 (disaster recovery specs)
- **Wednesday:** Implement Fix #5 (form redesign)
- **Thursday:** Financial corrections (Fixes #6-7)
- **Friday:** Code review and testing

### Week 1
- **Parallel:** Infrastructure setup while fixes are being tested
- **Focus:** Ensure all critical fixes work in staging before production

### Week 2+
- **Track:** Monitor dashboards post-launch for regressions
- **Iterate:** A/B test form, verify indexes, monitor OpenAI costs

---

## SIGN-OFF CHECKLIST

- [ ] All 5 critical fixes implemented and tested
- [ ] Financial model corrected
- [ ] Team capacity confirmed
- [ ] Budget approved ($825K-850K)
- [ ] Week 1 infrastructure setup ready
- [ ] Dropshipping content research complete
- [ ] Launch approval from leadership

**Ready to proceed to Week 1? YES / NO**

---

*Critical Fixes Checklist*
*Before Week 1 Production Launch*
*Total Effort: 28 hours*
