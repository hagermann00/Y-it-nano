# Y-It DATABASE SCHEMA DESIGN

## Overview

Complete PostgreSQL schema for Y-It platform supporting:
- 50 nano-books (topics)
- Content management (chapters, case studies, statistics)
- User accounts and purchases
- Email marketing automation (ConvertKit integration)
- Subscription management (monthly/annual)
- AI evaluator submissions and tracking
- Revenue/billing history
- Analytics and metadata

**Design Principle:** Universal from topic standpoint
- `topic_id` is the only topic-specific variable
- All tables reference `topic_id` via foreign keys
- Same schema handles all 50 books identically

---

## DATABASE ARCHITECTURE

### Schema Diagram (Entity Relationships)

```
TOPICS (Master)
├── CHAPTERS (8 per topic)
├── CASE_STUDIES (7-11 per topic)
├── STATISTICS (5-10 per topic)
├── EVALUATOR_PROMPTS (1 per topic)
├── IMAGES (8-10 per topic)
└── RESOURCES (variable per topic)

CUSTOMERS (Users)
├── PURCHASES (transactions)
├── SUBSCRIPTIONS (recurring)
├── EVALUATOR_RESPONSES (lead magnet submissions)
└── EMAIL_INTERACTIONS (tracking)

MARKETING
├── EMAIL_SEQUENCES (templates)
├── EVALUATOR_PROMPTS (AI generation config)
└── EMAIL_TRACKING (opens, clicks, conversions)

BUSINESS
├── BILLING_HISTORY (invoices, charges)
└── REVENUE_REPORTS (analytics)
```

---

## CORE TABLES

### 1. TOPICS TABLE

```sql
CREATE TABLE topics (
  topic_id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'draft', -- draft, content_complete, design_complete, published, live
  tier INT (1-5) DEFAULT NULL,

  -- Batch production tracking
  batch_name VARCHAR(50) DEFAULT NULL, -- 'Batch A', 'Batch B', etc.
  batch_order INT DEFAULT NULL,

  -- Content metadata
  word_count INT DEFAULT 7800, -- target ~7,800 words
  chapter_count INT DEFAULT 8, -- always 8 chapters
  case_study_count INT DEFAULT 9, -- typically 7-11
  statistic_count INT DEFAULT 6, -- number of key statistics
  image_count INT DEFAULT 10, -- number of images

  -- Publishing
  kdp_asin VARCHAR(20) DEFAULT NULL,
  kdp_url VARCHAR(500) DEFAULT NULL,
  kdp_live_date DATE DEFAULT NULL,
  print_status VARCHAR(50) DEFAULT 'not_started', -- ordered, printing, shipped, fulfilled

  web_version_live BOOLEAN DEFAULT FALSE,
  web_url VARCHAR(500) DEFAULT NULL,

  gumroad_url VARCHAR(500) DEFAULT NULL,

  -- AI Evaluator
  evaluator_active BOOLEAN DEFAULT FALSE,
  evaluator_launches DATE DEFAULT NULL,

  -- Metrics
  total_purchases INT DEFAULT 0,
  total_evaluator_submissions INT DEFAULT 0,
  evaluator_to_purchase_rate DECIMAL(5,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_tier ON topics(tier);
CREATE INDEX idx_topics_batch ON topics(batch_name);
CREATE INDEX idx_topics_slug ON topics(slug);
```

---

### 2. CHAPTERS TABLE

```sql
CREATE TABLE chapters (
  chapter_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  chapter_number INT NOT NULL, -- 1-8 (always 8)
  title VARCHAR(255) NOT NULL,

  -- Content
  content TEXT NOT NULL, -- full chapter text (topic-specific)
  word_count INT NOT NULL,

  -- Metadata
  summary VARCHAR(500) DEFAULT NULL, -- brief description

  -- Structure (always same for all topics)
  chapter_type VARCHAR(50) DEFAULT NULL, -- e.g., 'intro', 'analysis', 'case_studies', 'alternatives', 'conclusion'
  section_order INT DEFAULT NULL,

  -- Page mapping (for print)
  print_start_page INT DEFAULT NULL,
  print_end_page INT DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(topic_id, chapter_number)
);

CREATE INDEX idx_chapters_topic ON chapters(topic_id);
CREATE INDEX idx_chapters_number ON chapters(chapter_number);
```

---

### 3. CASE_STUDIES TABLE

```sql
CREATE TABLE case_studies (
  case_study_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Character info
  character_name VARCHAR(100) NOT NULL,
  character_archetype VARCHAR(100) NOT NULL, -- e.g., 'The Optimist', 'The Wannabe', 'The Expert'

  -- Story structure
  background VARCHAR(500) NOT NULL, -- 1-2 lines (print version)
  strategy VARCHAR(500) NOT NULL, -- what they believed
  execution VARCHAR(500) NOT NULL, -- what they did
  outcome VARCHAR(500) NOT NULL, -- how it failed + punchline

  -- Metrics specific to this case
  investment_amount DECIMAL(10,2) DEFAULT NULL,
  time_invested_hours INT DEFAULT NULL,
  revenue_achieved DECIMAL(10,2) DEFAULT NULL,
  months_to_failure INT DEFAULT NULL,

  -- Web expansion (full narrative)
  full_narrative TEXT DEFAULT NULL, -- 1,500 words (web version)

  -- Character visual
  character_image_url VARCHAR(500) DEFAULT NULL,
  character_visual_description VARCHAR(255) DEFAULT NULL,

  -- Ordering and status
  display_order INT NOT NULL, -- 1-11 (controls print layout)
  status VARCHAR(50) DEFAULT 'draft', -- draft, approved, published

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(topic_id, character_name)
);

CREATE INDEX idx_case_studies_topic ON case_studies(topic_id);
CREATE INDEX idx_case_studies_archetype ON case_studies(character_archetype);
```

---

### 4. STATISTICS TABLE

```sql
CREATE TABLE statistics (
  statistic_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Statistic content
  stat_name VARCHAR(255) NOT NULL, -- e.g., "Failure Rate Within 120 Days"
  stat_value VARCHAR(100) NOT NULL, -- e.g., "92%"

  -- Context
  description TEXT DEFAULT NULL, -- full explanation
  context_explanation VARCHAR(500) DEFAULT NULL, -- why this matters

  -- Source tracking
  source_citation VARCHAR(255) NOT NULL, -- where data comes from
  source_url VARCHAR(500) DEFAULT NULL,
  source_date DATE DEFAULT NULL, -- when data was published
  source_verified BOOLEAN DEFAULT FALSE,

  -- Data analysis
  is_primary_stat BOOLEAN DEFAULT FALSE, -- featured statistic
  stat_category VARCHAR(100) DEFAULT NULL, -- 'failure_rate', 'cost', 'timeline', 'success_rate', 'hidden_cost'

  -- Usage tracking
  chapter_appeared INT DEFAULT NULL, -- which chapter(s) feature this stat
  visual_representation BOOLEAN DEFAULT FALSE, -- is there a chart/graphic?

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(topic_id, stat_name)
);

CREATE INDEX idx_statistics_topic ON statistics(topic_id);
CREATE INDEX idx_statistics_category ON statistics(stat_category);
```

---

### 5. IMAGES TABLE

```sql
CREATE TABLE images (
  image_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Image metadata
  image_filename VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_type VARCHAR(50) NOT NULL, -- 'hero', 'character', 'chart', 'comic', 'icon', 'infographic'

  -- Image specs (for compliance)
  width_px INT NOT NULL, -- pixel width
  height_px INT NOT NULL, -- pixel height
  dpi INT DEFAULT 300, -- must be 300 for print
  color_space VARCHAR(20) DEFAULT 'CMYK', -- CMYK for print, RGB for web
  file_size_kb INT DEFAULT NULL,

  -- Design specifications
  description VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NOT NULL, -- for accessibility

  -- Placement in book
  chapter_id INT DEFAULT NULL REFERENCES chapters(chapter_id) ON DELETE SET NULL,
  print_page INT DEFAULT NULL,
  placement_description VARCHAR(255) DEFAULT NULL, -- 'hero page', 'header', 'inline', etc.

  -- Rights and licensing
  source VARCHAR(255) DEFAULT NULL, -- designer, stock, etc.
  usage_rights VARCHAR(100) DEFAULT 'owned', -- 'owned', 'licensed', 'royalty_free'

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, approved, final, production_ready
  final_approved_at TIMESTAMP DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(topic_id, image_filename)
);

CREATE INDEX idx_images_topic ON images(topic_id);
CREATE INDEX idx_images_type ON images(image_type);
CREATE INDEX idx_images_status ON images(status);
```

---

### 6. EVALUATOR_PROMPTS TABLE

```sql
CREATE TABLE evaluator_prompts (
  prompt_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Evaluator form config
  form_title VARCHAR(255) NOT NULL, -- e.g., "Roast My Dropshipping Idea"
  form_subtitle VARCHAR(255) DEFAULT NULL,
  form_cta_text VARCHAR(255) DEFAULT NULL,

  -- Form fields (JSON for flexibility)
  form_fields JSONB DEFAULT '[]', -- array of form field objects

  -- AI System Prompt
  system_prompt TEXT NOT NULL, -- base instruction for GPT

  -- Dynamic content insertion (templates)
  insert_primary_stat VARCHAR(100) DEFAULT NULL, -- which stat to reference
  insert_case_study_id INT DEFAULT NULL REFERENCES case_studies(case_study_id) ON DELETE SET NULL,
  insert_failure_rate VARCHAR(100) DEFAULT NULL,
  insert_timeline_to_failure INT DEFAULT NULL,

  -- Roast output specifications
  roast_length_words INT DEFAULT 500, -- 500-1000 typical
  roast_tone VARCHAR(50) DEFAULT 'satirical', -- cynical, satirical, honest, brutal

  -- Email CTA after roast
  email_cta_text VARCHAR(255) DEFAULT NULL,
  book_recommendation_text TEXT DEFAULT NULL,

  -- Usage tracking
  submission_count INT DEFAULT 0,
  last_used TIMESTAMP DEFAULT NULL,

  -- Status
  active BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft', -- draft, testing, live

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(topic_id)
);

CREATE INDEX idx_evaluator_topic ON evaluator_prompts(topic_id);
```

---

### 7. EVALUATOR_RESPONSES TABLE

```sql
CREATE TABLE evaluator_responses (
  response_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Form submission
  submitted_form_data JSONB NOT NULL, -- captured user input
  submission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Customer info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_id INT DEFAULT NULL REFERENCES customers(customer_id) ON DELETE SET NULL,

  -- AI Generation
  roast_generated_text TEXT DEFAULT NULL, -- the actual roast
  roast_generated_at TIMESTAMP DEFAULT NULL,
  openai_prompt_used TEXT DEFAULT NULL, -- for audit trail
  openai_tokens_used INT DEFAULT NULL,
  openai_cost_cents DECIMAL(6,2) DEFAULT NULL, -- track spend per roast

  -- Roast PDF
  roast_pdf_url VARCHAR(500) DEFAULT NULL,
  roast_pdf_generated_at TIMESTAMP DEFAULT NULL,

  -- Email capture
  email_captured BOOLEAN DEFAULT FALSE,
  email_captured_at TIMESTAMP DEFAULT NULL,
  email_capture_method VARCHAR(50) DEFAULT NULL, -- 'form', 'post_roast'

  -- Customer journey
  email_sequence_id INT DEFAULT NULL REFERENCES email_sequences(sequence_id) ON DELETE SET NULL,
  converted_to_purchase BOOLEAN DEFAULT FALSE,
  purchase_id INT DEFAULT NULL REFERENCES purchases(purchase_id) ON DELETE SET NULL,
  days_to_purchase INT DEFAULT NULL,

  -- Quality metrics
  customer_satisfaction_rating INT DEFAULT NULL, -- 1-5
  opened_roast_email BOOLEAN DEFAULT FALSE,
  clicked_book_link BOOLEAN DEFAULT FALSE,

  -- IP/tracking
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  referrer_source VARCHAR(255) DEFAULT NULL, -- how they found evaluator
  utm_source VARCHAR(100) DEFAULT NULL,
  utm_medium VARCHAR(100) DEFAULT NULL,
  utm_campaign VARCHAR(100) DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(response_id)
);

CREATE INDEX idx_responses_topic ON evaluator_responses(topic_id);
CREATE INDEX idx_responses_email ON evaluator_responses(customer_email);
CREATE INDEX idx_responses_purchase ON evaluator_responses(purchase_id);
CREATE INDEX idx_responses_date ON evaluator_responses(submission_timestamp);
```

---

### 8. CUSTOMERS TABLE

```sql
CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,

  -- Name and contact
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,

  -- Address (for shipping)
  street_address VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state_province VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,

  -- Account info
  account_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT NULL,

  -- Subscription status
  active_subscription BOOLEAN DEFAULT FALSE,
  subscription_id INT DEFAULT NULL REFERENCES subscriptions(subscription_id) ON DELETE SET NULL,

  -- Email preference
  email_opt_in BOOLEAN DEFAULT FALSE,
  email_opt_in_date TIMESTAMP DEFAULT NULL,
  email_unsubscribe_date TIMESTAMP DEFAULT NULL,

  -- Lead source
  lead_source VARCHAR(100) DEFAULT NULL, -- 'evaluator', 'organic', 'paid_ad', 'referral', 'email'
  first_topic_evaluator INT DEFAULT NULL REFERENCES topics(topic_id) ON DELETE SET NULL,

  -- Lifetime value tracking
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_purchases INT DEFAULT 0,
  first_purchase_date DATE DEFAULT NULL,
  last_purchase_date DATE DEFAULT NULL,

  -- Engagement
  total_emails_received INT DEFAULT 0,
  total_emails_opened INT DEFAULT 0,
  total_email_clicks INT DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, unsubscribed, deleted

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_subscription ON customers(active_subscription);
CREATE INDEX idx_customers_ltv ON customers(total_spent DESC);
```

---

### 9. PURCHASES TABLE

```sql
CREATE TABLE purchases (
  purchase_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Purchase details
  purchase_type VARCHAR(50) NOT NULL, -- 'print', 'digital', 'web', 'bundle', 'subscription'
  product_name VARCHAR(255) NOT NULL,

  -- Pricing
  amount_cents INT NOT NULL, -- in cents for precision
  currency VARCHAR(10) DEFAULT 'USD',
  discount_cents INT DEFAULT 0,
  final_amount_cents INT NOT NULL,

  -- Markup for different channels
  print_margin_cents INT DEFAULT NULL, -- KDP margin
  digital_margin_cents INT DEFAULT NULL, -- Gumroad margin
  web_margin_cents INT DEFAULT NULL, -- direct margin

  -- Payment processing
  payment_method VARCHAR(50) DEFAULT NULL, -- stripe, paypal, etc.
  transaction_id VARCHAR(255) UNIQUE DEFAULT NULL,
  stripe_charge_id VARCHAR(255) DEFAULT NULL,

  -- Fulfillment
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, refunded, failed, cancelled
  fulfilled_at TIMESTAMP DEFAULT NULL,

  -- Print fulfillment specific
  shipping_address JSONB DEFAULT NULL,
  tracking_number VARCHAR(100) DEFAULT NULL,
  shipped_at TIMESTAMP DEFAULT NULL,
  delivered_at TIMESTAMP DEFAULT NULL,

  -- Digital fulfillment
  download_link_sent_at TIMESTAMP DEFAULT NULL,
  download_count INT DEFAULT 0,

  -- Refund info
  refund_initiated_at TIMESTAMP DEFAULT NULL,
  refund_completed_at TIMESTAMP DEFAULT NULL,
  refund_reason VARCHAR(255) DEFAULT NULL,
  refund_amount_cents INT DEFAULT NULL,

  -- Attribution
  conversion_from_evaluator BOOLEAN DEFAULT FALSE,
  evaluator_response_id INT DEFAULT NULL REFERENCES evaluator_responses(response_id) ON DELETE SET NULL,
  utm_source VARCHAR(100) DEFAULT NULL,
  utm_medium VARCHAR(100) DEFAULT NULL,
  utm_campaign VARCHAR(100) DEFAULT NULL,
  referrer_topic_id INT DEFAULT NULL REFERENCES topics(topic_id) ON DELETE SET NULL, -- cross-sell tracking

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_customer ON purchases(customer_id);
CREATE INDEX idx_purchases_topic ON purchases(topic_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_date ON purchases(purchased_at DESC);
CREATE INDEX idx_purchases_evaluator ON purchases(evaluator_response_id);
```

---

### 10. SUBSCRIPTIONS TABLE

```sql
CREATE TABLE subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,

  -- Subscription type
  subscription_type VARCHAR(50) NOT NULL, -- 'monthly', 'annual', 'lifetime'

  -- What's included
  includes_print BOOLEAN DEFAULT FALSE,
  includes_digital BOOLEAN DEFAULT FALSE,
  includes_web BOOLEAN DEFAULT TRUE,
  includes_podcast BOOLEAN DEFAULT FALSE,
  all_topics BOOLEAN DEFAULT TRUE,

  -- Pricing
  monthly_price_cents INT NOT NULL,
  annual_price_cents INT DEFAULT NULL,

  -- Status and dates
  status VARCHAR(50) DEFAULT 'active', -- active, paused, cancelled, expired
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_billing_date DATE DEFAULT NULL,
  cancelled_at TIMESTAMP DEFAULT NULL,
  cancellation_reason VARCHAR(255) DEFAULT NULL,

  -- Automatic renewal
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method_on_file BOOLEAN DEFAULT FALSE,

  -- Access
  access_all_topics BOOLEAN DEFAULT TRUE,
  topics_included JSONB DEFAULT '[]', -- array of topic_ids if limited

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date);
```

---

### 11. EMAIL_SEQUENCES TABLE

```sql
CREATE TABLE email_sequences (
  sequence_id SERIAL PRIMARY KEY,
  topic_id INT DEFAULT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Sequence metadata
  sequence_name VARCHAR(255) NOT NULL,
  sequence_type VARCHAR(50) NOT NULL, -- 'post_evaluator', 'nurture', 'promotional', 'educational', 'winback'

  -- Activation
  trigger_event VARCHAR(100) DEFAULT NULL, -- 'evaluator_submit', 'purchase', 'signup', 'time_based'
  trigger_topic_id INT DEFAULT NULL REFERENCES topics(topic_id) ON DELETE SET NULL,

  -- Emails in sequence
  email_count INT DEFAULT 4, -- typically 4-5 emails

  -- Template content (JSONB for flexibility)
  emails JSONB NOT NULL, -- array of email objects with subject, body, delay, cta

  -- Configuration
  send_immediately_email BOOLEAN DEFAULT TRUE,
  email_1_subject VARCHAR(255) DEFAULT NULL,
  email_1_delay_hours INT DEFAULT 0,

  email_2_subject VARCHAR(255) DEFAULT NULL,
  email_2_delay_hours INT DEFAULT 72, -- 3 days

  email_3_subject VARCHAR(255) DEFAULT NULL,
  email_3_delay_hours INT DEFAULT 168, -- 7 days

  email_4_subject VARCHAR(255) DEFAULT NULL,
  email_4_delay_hours INT DEFAULT 336, -- 14 days

  -- A/B testing
  is_control_variant BOOLEAN DEFAULT TRUE, -- for A/B tests
  variant_name VARCHAR(100) DEFAULT NULL,

  -- Status
  active BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft', -- draft, testing, live, archived

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sequences_topic ON email_sequences(topic_id);
CREATE INDEX idx_sequences_type ON email_sequences(sequence_type);
CREATE INDEX idx_sequences_active ON email_sequences(active);
```

---

### 12. EMAIL_TRACKING TABLE

```sql
CREATE TABLE email_tracking (
  tracking_id SERIAL PRIMARY KEY,

  -- Email reference
  sequence_id INT NOT NULL REFERENCES email_sequences(sequence_id) ON DELETE CASCADE,
  email_number INT NOT NULL, -- which email in sequence (1-4)

  -- Customer
  customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,

  -- Sending
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_via VARCHAR(50) DEFAULT 'convertkit', -- email service provider
  convertkit_email_id VARCHAR(100) DEFAULT NULL,

  -- Opens and clicks
  opened_at TIMESTAMP DEFAULT NULL,
  open_count INT DEFAULT 0,

  clicked_at TIMESTAMP DEFAULT NULL,
  click_count INT DEFAULT 0,

  -- Link tracking
  clicked_links JSONB DEFAULT '[]', -- array of {link_url, click_count, clicked_at}
  primary_cta_clicked BOOLEAN DEFAULT FALSE,
  primary_cta_url VARCHAR(500) DEFAULT NULL,

  -- Conversion tracking
  converted_at TIMESTAMP DEFAULT NULL,
  purchase_id INT DEFAULT NULL REFERENCES purchases(purchase_id) ON DELETE SET NULL,

  -- Engagement metrics
  bounce BOOLEAN DEFAULT FALSE,
  spam_complaint BOOLEAN DEFAULT FALSE,
  unsubscribe_at TIMESTAMP DEFAULT NULL,

  -- Analytics
  device_type VARCHAR(50) DEFAULT NULL, -- 'mobile', 'desktop', 'tablet'
  email_client VARCHAR(100) DEFAULT NULL, -- 'gmail', 'outlook', etc.

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_tracking_customer ON email_tracking(customer_id);
CREATE INDEX idx_email_tracking_sequence ON email_tracking(sequence_id);
CREATE INDEX idx_email_tracking_sent ON email_tracking(sent_at DESC);
CREATE INDEX idx_email_tracking_conversion ON email_tracking(purchase_id);
```

---

### 13. BILLING_HISTORY TABLE

```sql
CREATE TABLE billing_history (
  billing_id SERIAL PRIMARY KEY,

  -- Invoice info
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,

  -- Customer reference
  customer_id INT DEFAULT NULL REFERENCES customers(customer_id) ON DELETE SET NULL,

  -- Line items
  line_items JSONB NOT NULL, -- array of {topic_id, product, amount}

  -- Totals
  subtotal_cents INT NOT NULL,
  tax_cents INT DEFAULT 0,
  total_cents INT NOT NULL,

  -- Payment
  payment_method VARCHAR(50) DEFAULT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  paid_at TIMESTAMP DEFAULT NULL,

  -- Shipping (if applicable)
  shipping_cost_cents INT DEFAULT 0,
  shipped_at TIMESTAMP DEFAULT NULL,

  -- Notes
  notes TEXT DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_customer ON billing_history(customer_id);
CREATE INDEX idx_billing_status ON billing_history(payment_status);
CREATE INDEX idx_billing_date ON billing_history(invoice_date DESC);
```

---

## ANALYTICS & AGGREGATION TABLES

### 14. TOPIC_METRICS TABLE (Summary/Cache)

```sql
CREATE TABLE topic_metrics (
  metric_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL UNIQUE REFERENCES topics(topic_id) ON DELETE CASCADE,

  -- Content metrics
  published_date DATE DEFAULT NULL,
  days_since_published INT DEFAULT NULL,

  -- Sales metrics (this week, this month, all time)
  print_sales_week INT DEFAULT 0,
  print_sales_month INT DEFAULT 0,
  print_sales_all_time INT DEFAULT 0,

  digital_sales_week INT DEFAULT 0,
  digital_sales_month INT DEFAULT 0,
  digital_sales_all_time INT DEFAULT 0,

  web_revenue_week DECIMAL(10,2) DEFAULT 0,
  web_revenue_month DECIMAL(10,2) DEFAULT 0,
  web_revenue_all_time DECIMAL(10,2) DEFAULT 0,

  -- Evaluator metrics
  evaluator_submissions_week INT DEFAULT 0,
  evaluator_submissions_month INT DEFAULT 0,
  evaluator_submissions_all_time INT DEFAULT 0,

  evaluator_to_purchase_rate DECIMAL(5,2) DEFAULT 0,

  -- Email metrics
  email_sequences_sent INT DEFAULT 0,
  email_open_rate DECIMAL(5,2) DEFAULT 0,
  email_click_rate DECIMAL(5,2) DEFAULT 0,

  -- Customer acquisition
  customers_acquired_month INT DEFAULT 0,
  customers_acquired_all_time INT DEFAULT 0,
  cost_per_acquisition DECIMAL(8,2) DEFAULT 0,

  -- Revenue per topic
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_profit DECIMAL(12,2) DEFAULT 0,
  roi_percentage DECIMAL(8,2) DEFAULT 0,

  -- Timestamps
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metrics_topic ON topic_metrics(topic_id);
```

---

### 15. CUSTOMER_METRICS TABLE

```sql
CREATE TABLE customer_metrics (
  metric_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL UNIQUE REFERENCES customers(customer_id) ON DELETE CASCADE,

  -- Engagement
  total_evaluators_submitted INT DEFAULT 0,
  total_emails_received INT DEFAULT 0,
  total_emails_opened INT DEFAULT 0,
  avg_email_open_rate DECIMAL(5,2) DEFAULT 0,
  total_email_clicks INT DEFAULT 0,

  -- Purchase behavior
  first_purchase_date DATE DEFAULT NULL,
  last_purchase_date DATE DEFAULT NULL,
  days_since_last_purchase INT DEFAULT NULL,
  purchase_frequency_days INT DEFAULT NULL,

  -- Lifetime value
  lifetime_value DECIMAL(12,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  total_purchases INT DEFAULT 0,

  -- Product preferences
  preferred_format VARCHAR(50) DEFAULT NULL, -- print, digital, web
  topics_purchased JSONB DEFAULT '[]', -- array of topic_ids purchased
  total_topics_purchased INT DEFAULT 0,

  -- Subscription status
  is_subscriber BOOLEAN DEFAULT FALSE,
  subscription_months_active INT DEFAULT 0,

  -- Engagement score (0-100)
  engagement_score INT DEFAULT 0,

  -- Churn risk
  at_risk_of_churn BOOLEAN DEFAULT FALSE,
  last_activity_date DATE DEFAULT NULL,
  days_since_last_activity INT DEFAULT NULL,

  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_metrics_ltv ON customer_metrics(lifetime_value DESC);
CREATE INDEX idx_customer_metrics_at_risk ON customer_metrics(at_risk_of_churn);
```

---

## KEY QUERIES & USAGE PATTERNS

### Get All Data for a Topic

```sql
-- Single query to retrieve everything for a topic
SELECT
  t.*,
  json_agg(DISTINCT jsonb_build_object(
    'chapter_id', c.chapter_id,
    'chapter_number', c.chapter_number,
    'title', c.title,
    'word_count', c.word_count
  )) as chapters,
  json_agg(DISTINCT jsonb_build_object(
    'case_study_id', cs.case_study_id,
    'character_name', cs.character_name,
    'archetype', cs.character_archetype,
    'outcome', cs.outcome
  )) as case_studies,
  json_agg(DISTINCT jsonb_build_object(
    'image_id', i.image_id,
    'type', i.image_type,
    'url', i.image_url
  )) as images
FROM topics t
LEFT JOIN chapters c ON t.topic_id = c.topic_id
LEFT JOIN case_studies cs ON t.topic_id = cs.topic_id
LEFT JOIN images i ON t.topic_id = i.topic_id
WHERE t.topic_id = $1
GROUP BY t.topic_id;
```

### Get Evaluator Submissions → Purchases (Conversion Funnel)

```sql
-- Conversion tracking: evaluator → email → purchase
SELECT
  er.topic_id,
  COUNT(DISTINCT er.response_id) as total_evaluators,
  COUNT(DISTINCT CASE WHEN er.email_captured THEN er.response_id END) as emails_captured,
  COUNT(DISTINCT er.purchase_id) as converted_to_purchases,
  ROUND(COUNT(DISTINCT er.purchase_id)::numeric / COUNT(DISTINCT er.response_id) * 100, 2) as conversion_rate
FROM evaluator_responses er
WHERE er.topic_id = $1
  AND er.submission_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY er.topic_id;
```

### Get Revenue by Topic (All Channels)

```sql
-- Revenue aggregation across print, digital, web, subscriptions
SELECT
  t.topic_id,
  t.title,
  COALESCE(SUM(CASE WHEN p.purchase_type = 'print' THEN p.final_amount_cents END), 0) as print_revenue,
  COALESCE(SUM(CASE WHEN p.purchase_type = 'digital' THEN p.final_amount_cents END), 0) as digital_revenue,
  COALESCE(SUM(CASE WHEN p.purchase_type = 'web' THEN p.final_amount_cents END), 0) as web_revenue,
  COALESCE(SUM(CASE WHEN p.purchase_type = 'bundle' THEN p.final_amount_cents END), 0) as bundle_revenue,
  SUM(p.final_amount_cents) as total_revenue,
  COUNT(DISTINCT p.customer_id) as unique_customers
FROM topics t
LEFT JOIN purchases p ON t.topic_id = p.topic_id AND p.status = 'completed'
GROUP BY t.topic_id, t.title
ORDER BY total_revenue DESC;
```

### Email Engagement Metrics

```sql
-- Email sequence performance
SELECT
  es.sequence_id,
  es.sequence_name,
  COUNT(DISTINCT et.tracking_id) as emails_sent,
  COUNT(DISTINCT CASE WHEN et.opened_at IS NOT NULL THEN et.tracking_id END) as opens,
  ROUND(COUNT(DISTINCT CASE WHEN et.opened_at IS NOT NULL THEN et.tracking_id END)::numeric / COUNT(DISTINCT et.tracking_id) * 100, 2) as open_rate,
  COUNT(DISTINCT CASE WHEN et.clicked_at IS NOT NULL THEN et.tracking_id END) as clicks,
  ROUND(COUNT(DISTINCT CASE WHEN et.clicked_at IS NOT NULL THEN et.tracking_id END)::numeric / COUNT(DISTINCT et.tracking_id) * 100, 2) as click_rate,
  COUNT(DISTINCT et.purchase_id) as conversions,
  ROUND(COUNT(DISTINCT et.purchase_id)::numeric / COUNT(DISTINCT et.tracking_id) * 100, 2) as conversion_rate
FROM email_sequences es
LEFT JOIN email_tracking et ON es.sequence_id = et.sequence_id
WHERE es.active = TRUE
  AND et.sent_at >= NOW() - INTERVAL '30 days'
GROUP BY es.sequence_id, es.sequence_name;
```

### Customer Segmentation (High-Value, At-Risk, Dormant)

```sql
-- Identify customer segments for targeted campaigns
SELECT
  CASE
    WHEN c.total_spent >= 500 AND c.last_purchase_date >= NOW() - INTERVAL '30 days' THEN 'High-Value Active'
    WHEN c.total_spent >= 500 AND c.last_purchase_date < NOW() - INTERVAL '90 days' THEN 'High-Value At-Risk'
    WHEN c.total_spent < 500 AND c.total_spent > 0 AND c.last_purchase_date >= NOW() - INTERVAL '30 days' THEN 'Regular Active'
    WHEN c.total_spent < 500 AND c.total_spent > 0 AND c.last_purchase_date < NOW() - INTERVAL '90 days' THEN 'Regular Dormant'
    WHEN c.total_spent = 0 AND c.email_opt_in = TRUE THEN 'Nurture - Never Purchased'
    WHEN c.total_spent = 0 AND c.email_opt_in = FALSE THEN 'Cold - No Engagement'
  END as segment,
  COUNT(*) as customer_count,
  ROUND(AVG(c.total_spent), 2) as avg_ltv,
  ROUND(AVG(c.total_purchases), 1) as avg_purchases
FROM customers c
GROUP BY segment;
```

---

## INDEXING STRATEGY

### Primary Indexes (Already Defined Above)
- All foreign keys indexed
- Status columns indexed
- Date columns indexed for time-range queries
- Email for customer lookups

### Secondary Indexes (Consider Adding)

```sql
-- Performance optimization for common queries
CREATE INDEX idx_evaluator_date_range ON evaluator_responses(topic_id, submission_timestamp);
CREATE INDEX idx_purchases_customer_date ON purchases(customer_id, purchased_at);
CREATE INDEX idx_email_tracking_customer_sent ON email_tracking(customer_id, sent_at);
CREATE INDEX idx_topics_batch_status ON topics(batch_name, status);

-- Full-text search (if needed)
CREATE INDEX idx_case_studies_search ON case_studies USING GIN (to_tsvector('english', background || ' ' || outcome));
CREATE INDEX idx_chapters_search ON chapters USING GIN (to_tsvector('english', content));
```

---

## DATA INTEGRITY & CONSTRAINTS

### Cascade Behavior
- Deleting a topic cascades to all related content (chapters, case studies, statistics, etc.)
- Deleting a customer cascades to purchases and email tracking (but may want to preserve for analytics)

### Unique Constraints
- One topic_id:chapter_number pair (ensure 8 chapters per topic)
- One character_name per topic (no duplicate case studies)
- One email per customer (no duplicate accounts)
- One customer:topic purchase per transaction

### Check Constraints

```sql
-- Ensure data validity
ALTER TABLE chapters ADD CONSTRAINT check_chapter_number CHECK (chapter_number BETWEEN 1 AND 8);
ALTER TABLE purchases ADD CONSTRAINT check_amount_positive CHECK (final_amount_cents > 0);
ALTER TABLE case_studies ADD CONSTRAINT check_display_order CHECK (display_order BETWEEN 1 AND 11);
ALTER TABLE email_tracking ADD CONSTRAINT check_open_count_positive CHECK (open_count >= 0);
```

---

## MIGRATION STRATEGY

### Phase 1: Core Tables (Week 1)
- topics, chapters, case_studies, statistics, images
- evaluator_prompts, evaluator_responses
- Foundation for Batch A content

### Phase 2: Customer Tables (Week 2)
- customers, purchases, subscriptions
- Ready for first sales (Week 7 launch)

### Phase 3: Email Tables (Week 3)
- email_sequences, email_tracking
- ConvertKit integration ready for Batch A

### Phase 4: Analytics Tables (Week 4)
- topic_metrics, customer_metrics
- Dashboards and reporting

### Phase 5: Optimization (Weeks 5+)
- Add secondary indexes
- Optimize queries based on usage patterns
- Archive old data strategies

---

## BACKUP & RECOVERY

```sql
-- Regular backups
pg_dump -U postgres --no-password -Fc yit_database > backup_$(date +%Y%m%d_%H%M%S).dump

-- Point-in-time restore
pg_restore -U postgres -d yit_database -Fc backup_20250110_120000.dump
```

---

## SCALABILITY NOTES

**Current Design Supports:**
- 50 topics × 8 chapters = 400 chapters
- 50 topics × 9 case studies = 450 case studies
- ~1 million customer records
- ~10 million emails sent (trackable)
- 5 years of daily operations

**When to consider optimization:**
- > 5 million customer records: Archive old customers/transactions
- > 100 million email tracking records: Partition by date
- > 10M evaluator responses: Archive old evaluations

**Database size estimate:**
- Core tables: ~50 MB
- 1 year of data: ~2 GB
- 5 years of data: ~10 GB

---

*Y-It Database Schema v1.0*
*PostgreSQL 12+*
*Universal Topic-Agnostic Design*
