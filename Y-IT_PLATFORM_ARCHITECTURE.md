# Y-IT PLATFORM ARCHITECTURE v1.0

## Universal Infrastructure for 50+ Nano-Books (Topic-Agnostic)

**Principle:** One platform, infinite topics. Topic = content variable only.

---

## SYSTEM OVERVIEW

```
USER JOURNEY:

1. FREE LEAD MAGNET (AI Evaluator)
   └─ User submits idea in any Y-IT topic
   └─ AI evaluator generates "roast" (1-2 pages, PDF)
   └─ Email captured + topic-specific nurture begins

2. OWNED FUNNEL (Email Sequence)
   └─ Free evaluator PDF sent
   └─ Day 3: Case study excerpt from relevant book
   └─ Day 7: Social proof + preview
   └─ Day 14: Purchase CTA (print/digital/web)

3. PURCHASE OPTIONS (Same Across All Topics)
   └─ Print: $2.99 (KDP)
   └─ Digital: $3.99 (Gumroad PDF/ePub)
   └─ Print + Digital Bundle: $5.99
   └─ Web Interactive + 1-year access: $7.99
   └─ All formats + annual subscription: $12.99
   └─ All 50 books annual: $99/year

4. DELIVERY (Multi-Format Ecosystem)
   └─ Print: Ships via KDP (automated)
   └─ Digital: Instant PDF/ePub download
   └─ Web: Interactive version with calculators, expandable sections
   └─ Podcast: Topic-specific episode on Spotify/Apple/YouTube
   └─ Bonus: Case study repository, resources, tools

5. RETENTION (Cross-Sell & Community)
   └─ In-book cross-sell to other Y-IT topics
   └─ Email campaigns (other books)
   └─ Bundle offers (print + related topics)
   └─ Annual subscription (all content, all updates)
```

---

## TECH STACK (Minimal, Proven, Scalable)

### Frontend (User-Facing)
- **Website Framework:** Next.js or Vue.js (React-based preferred)
- **CMS:** Headless CMS (Contentful or Strapi) - allows content management without coding
- **Authentication:** Auth0 or Firebase (handles login, subscriptions)
- **Payment Processing:** Stripe (handles all transactions, subscriptions)
- **Email Platform:** ConvertKit or ActiveCampaign (handles sequences, tagging, automation)

### Backend (Infrastructure)
- **Server:** Node.js + Express OR Django
- **Database:** PostgreSQL (relational, handles complex queries)
- **File Storage:** AWS S3 (PDFs, ePubs, images)
- **API:** RESTful API (connects frontend to database)
- **Hosting:** Vercel (frontend) + Heroku/AWS (backend)

### AI/Automation
- **AI Evaluator Engine:** OpenAI GPT API (ChatGPT)
- **Automation:** Zapier or Make.com (connects all services)
- **Scheduling:** Bull Queue or Celery (handles async tasks - email, PDF generation)

### Analytics & Tracking
- **Analytics:** Mixpanel or Amplitude (user behavior, funnel tracking)
- **Email Tracking:** Built into ConvertKit/ActiveCampaign
- **CRM:** Segment (centralizes all customer data)

### Content Delivery
- **Web Interactive:** Webflow or custom React component
- **Podcast Hosting:** Buzzsprout or Podbean
- **PDF Generation:** PDFKit or Puppeteer (dynamic PDFs based on user)

---

## DATABASE SCHEMA (Universal, Topic-Agnostic)

### Core Tables (Every Topic Uses Same Schema)

```sql
-- BOOKS TABLE (One row per topic/book)
CREATE TABLE books (
  id UUID PRIMARY KEY,
  topic_id VARCHAR(50) UNIQUE,  -- "dropshipping", "print-on-demand", etc
  title VARCHAR(255),            -- "Why Your Dropship Probably Will Fail"
  subtitle VARCHAR(255),
  slug VARCHAR(255) UNIQUE,      -- Used in URLs: /books/dropshipping
  description TEXT,
  cover_image_url VARCHAR(255),
  hero_image_url VARCHAR(255),
  status ENUM ('draft', 'published', 'archived'),
  published_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- CHAPTERS TABLE (Always 8 chapters per book)
CREATE TABLE chapters (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  chapter_number INT (1-8),
  title VARCHAR(255),            -- "Chapter 1: The Lie", etc
  content LONGTEXT,              -- Full chapter markdown
  word_count INT,
  order_position INT,
  status ENUM ('draft', 'published'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- STATISTICS TABLE (Every book has topic-specific stats)
CREATE TABLE statistics (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  statistic_key VARCHAR(100),    -- "failure_rate_120_days", "avg_investment", etc
  statistic_value VARCHAR(255),  -- "92%", "$4,832", etc
  statistic_description TEXT,    -- "92% fail within 120 days"
  source_url VARCHAR(255),       -- Citation link
  data_year INT,
  confidence_level ENUM ('high', 'medium', 'low'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- CASE STUDIES TABLE (7-11 per book, universally structured)
CREATE TABLE case_studies (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  case_study_number INT (1-11),
  character_name VARCHAR(100),   -- "Karen the Bored Mom", etc
  archetype VARCHAR(100),        -- "mlm-refugee", "influencer", etc
  setup_line TEXT,               -- One-liner: who they are
  advantage_line TEXT,           -- What they thought they had
  execution_line TEXT,           -- What they did
  outcome_line TEXT,             -- How it failed (+ punchline)
  full_narrative LONGTEXT,       -- 1,500 word web expansion
  financial_loss DECIMAL,        -- $3,400, $12,000, etc
  timeline_days INT,             -- How long before failure
  case_study_image_url VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- RESOURCES TABLE (Worksheets, tools, references per book)
CREATE TABLE resources (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  resource_type ENUM ('worksheet', 'calculator', 'reference', 'checklist'),
  title VARCHAR(255),
  description TEXT,
  content LONGTEXT,              -- Markdown or HTML
  file_url VARCHAR(255),         -- PDF, Excel, etc
  order_position INT,
  visible_in_print BOOLEAN,      -- Is this in the 24-page book?
  visible_on_web BOOLEAN,        -- Is this expanded on web?
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- CASE STUDIES FULL VERSION TABLE (Web-only expansion)
CREATE TABLE case_studies_expanded (
  id UUID PRIMARY KEY,
  case_study_id UUID REFERENCES case_studies(id),
  content LONGTEXT,              -- Full 1,500-word narrative
  sections JSONB,                -- { "background", "strategy", "execution", "analysis" }
  expert_commentary TEXT,        -- Why this archetype fails
  financial_breakdown JSONB,     -- { "investment": X, "loss": Y }
  timeline JSONB,                -- Day-by-day breakdown
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- LEAD MAGNET EVALUATOR TABLE
CREATE TABLE evaluator_prompts (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  evaluator_type VARCHAR(100),   -- "product-roast", "course-roast", "trading-roast"
  system_prompt LONGTEXT,        -- Base prompt for AI evaluator
  example_input_1 TEXT,          -- Sample user input
  example_output_1 LONGTEXT,     -- Sample AI output
  example_input_2 TEXT,
  example_output_2 LONGTEXT,
  instructions TEXT,             -- How to use the evaluator
  references JSONB,              -- Which chapters/stats to cite
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- EVALUATOR RESPONSES TABLE (Track all roasts generated)
CREATE TABLE evaluator_responses (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  user_email VARCHAR(255),       -- Email captured
  user_input TEXT,               -- What user submitted (product, course, etc)
  ai_response LONGTEXT,          -- Generated roast (1-2 pages)
  pdf_url VARCHAR(255),          -- Generated PDF sent to user
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  email_opened BOOLEAN,          -- Tracking
  cta_clicked VARCHAR(255)       -- Which CTA clicked in email
);
```

### CRM/Marketing Tables

```sql
-- CUSTOMERS TABLE
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  topics_interested JSONB,       -- ["dropshipping", "print-on-demand"]
  evaluators_used JSONB,         -- ["dropshipping", "affiliate-marketing"]
  source VARCHAR(50),            -- "evaluator", "email", "organic", "paid-ads"
  lead_score INT,                -- 0-100 (engagement score)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- PURCHASES TABLE (Tracks all revenue)
CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  book_id UUID REFERENCES books(id),
  product_type ENUM ('print', 'digital', 'web', 'bundle', 'subscription'),
  price DECIMAL,
  stripe_transaction_id VARCHAR(255),
  payment_status ENUM ('pending', 'completed', 'refunded'),
  purchase_date TIMESTAMP,
  refund_date TIMESTAMP,
  created_at TIMESTAMP
);

-- EMAIL SEQUENCES TABLE (Automation)
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  sequence_type ENUM ('lead-magnet-follow-up', 'cross-sell', 'abandoned-cart', 'win-back'),
  email_number INT (1-N),
  subject_line VARCHAR(255),
  content LONGTEXT,              -- Email body HTML
  cta_text VARCHAR(100),         -- Button text
  cta_link VARCHAR(255),         -- Button destination
  send_delay_hours INT,          -- Send X hours after previous email
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- EMAIL TRACKING TABLE
CREATE TABLE email_tracking (
  id UUID PRIMARY KEY,
  sequence_id UUID REFERENCES email_sequences(id),
  customer_id UUID REFERENCES customers(id),
  email_sent TIMESTAMP,
  email_opened BOOLEAN,
  email_opened_at TIMESTAMP,
  link_clicked BOOLEAN,
  link_clicked_at TIMESTAMP,
  conversion BOOLEAN,            -- Did they purchase?
  conversion_amount DECIMAL
);

-- ANALYTICS TABLE (Funnel tracking)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  event_type VARCHAR(100),       -- "evaluator_accessed", "book_page_viewed", "purchase_initiated", etc
  event_data JSONB,              -- Flexible event details
  book_id UUID REFERENCES books(id),
  timestamp TIMESTAMP,
  session_id VARCHAR(255)        -- Group events by session
);
```

### Subscription/Billing Tables

```sql
-- SUBSCRIPTIONS TABLE
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  subscription_type ENUM ('monthly-all-books', 'annual-all-books', 'book-specific'),
  books_included JSONB,          -- ["dropshipping", "print-on-demand"] OR null (all)
  price_monthly DECIMAL,
  price_annually DECIMAL,
  stripe_subscription_id VARCHAR(255),
  status ENUM ('active', 'paused', 'cancelled'),
  billing_date TIMESTAMP,
  next_billing_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- BILLING HISTORY TABLE
CREATE TABLE billing_history (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255),
  amount DECIMAL,
  currency VARCHAR(3),           -- USD, EUR, etc
  billing_date TIMESTAMP,
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  status ENUM ('pending', 'paid', 'failed', 'refunded'),
  created_at TIMESTAMP
);
```

### Content Management Tables

```sql
-- BOOKS_CONTENT TABLE (Version control for chapters)
CREATE TABLE books_content_versions (
  id UUID PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id),
  content LONGTEXT,
  version_number INT,
  author VARCHAR(100),           -- Who made changes
  change_description TEXT,       -- What changed and why
  created_at TIMESTAMP,
  is_live BOOLEAN
);

-- IMAGES TABLE (Centralized image management)
CREATE TABLE images (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  image_type ENUM ('hero', 'chapter-comic', 'case-study', 'chart', 'graph', 'avatar'),
  title VARCHAR(255),
  image_url_small VARCHAR(255),  -- Thumbnail
  image_url_medium VARCHAR(255), -- Web version
  image_url_large VARCHAR(255),  -- Print version (300 DPI)
  alt_text VARCHAR(255),         -- Accessibility
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## API ENDPOINTS (What Frontend Calls)

### Public Endpoints (No Auth Required)

```
GET /api/books
├─ Returns: List of all published books
├─ Query params: ?topic=dropshipping, ?status=published
├─ Response: [{ id, title, subtitle, slug, cover_url }]

GET /api/books/{topic_slug}
├─ Returns: Full book data (all chapters, case studies, stats)
├─ Response: Book object with nested chapters, cases, resources

GET /api/evaluator/{topic_slug}
├─ Returns: Evaluator form and instructions
├─ Response: { form_fields, example_roasts, system_message }

POST /api/evaluator/{topic_slug}
├─ Accepts: User input for roast (product, course, etc)
├─ Calls: OpenAI API with topic-specific prompt
├─ Returns: Generated roast + PDF download link
├─ Side effect: Creates evaluator_responses record + captures email

GET /api/case-studies/{topic_slug}
├─ Returns: All case studies for topic (print + web versions)
├─ Response: [{ character, archetype, print_summary, web_full }]

GET /api/statistics/{topic_slug}
├─ Returns: All statistics for topic
├─ Response: [{ key, value, description, source, year }]

GET /api/resources/{topic_slug}
├─ Returns: Worksheets, calculators, checklists for topic
├─ Query params: ?type=worksheet, ?visible_in=web
├─ Response: [{ title, description, file_url }]
```

### Protected Endpoints (Auth Required)

```
POST /api/purchases
├─ Creates purchase record
├─ Calls: Stripe API
├─ Returns: Payment URL or confirmation

GET /api/customer/purchases
├─ Returns: Customer's purchase history
├─ Query params: ?format=web, ?format=digital

GET /api/customer/subscription
├─ Returns: Current subscription status and books included

POST /api/customer/subscription
├─ Updates subscription (pause, resume, change tier)

GET /api/customer/email-preferences
├─ Returns: Email opt-in status, topic interests

POST /api/customer/email-preferences
├─ Updates email settings
```

### Admin Endpoints (Admin Only)

```
POST /api/admin/books
├─ Create new book/topic
├─ Body: { topic_id, title, subtitle, description }

PUT /api/admin/books/{topic_slug}
├─ Update book metadata

POST /api/admin/chapters/{topic_slug}
├─ Add or update chapter content
├─ Version control maintained

POST /api/admin/case-studies/{topic_slug}
├─ Add case study
├─ Body: { character, archetype, setup, advantage, execution, outcome, full_narrative }

POST /api/admin/statistics/{topic_slug}
├─ Add statistic
├─ Body: { key, value, description, source_url, year, confidence }

POST /api/admin/evaluator-prompts/{topic_slug}
├─ Set up evaluator for new topic
├─ Body: { evaluator_type, system_prompt, examples, references }

GET /api/admin/analytics
├─ Returns: Funnel metrics, conversion rates, revenue
├─ Query params: ?topic=dropshipping, ?date_range=last_30_days

POST /api/admin/email-sequence
├─ Create/update email sequences
├─ Body: { sequence_type, emails: [{subject, content, delay_hours, cta}] }
```

---

## DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    END USER (Browser)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│             FRONTEND (Next.js / Vercel)                     │
│  ├─ Landing pages (book previews)                           │
│  ├─ Evaluator interface (form + results)                    │
│  ├─ Shopping cart & checkout                                │
│  ├─ User dashboard (purchases, downloads)                   │
│  ├─ Email preference center                                 │
│  └─ Admin panel (manage content)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Calls (REST)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           BACKEND API (Node.js / Heroku or AWS)             │
│  ├─ Authentication (Auth0)                                  │
│  ├─ Routes (all /api endpoints)                             │
│  ├─ Business logic                                          │
│  ├─ Database queries                                        │
│  └─ Integrations (Stripe, OpenAI, Email, etc)              │
└──────┬──────────────────────────────────────────────────────┘
       │
       ├─────────────────────┬──────────────────────────────┐
       │                     │                              │
       ▼                     ▼                              ▼
┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  PostgreSQL    │  │   AWS S3        │  │   Stripe API     │
│  Database      │  │  (file storage) │  │  (payments)      │
│                │  │                 │  │                  │
│ - Books        │  │ - PDFs          │  │ - Transactions   │
│ - Chapters     │  │ - ePubs         │  │ - Subscriptions  │
│ - Cases        │  │ - Images        │  │ - Webhooks       │
│ - Stats        │  │ - Audiofiles    │  │                  │
│ - Customers    │  │                 │  │                  │
│ - Purchases    │  │                 │  │                  │
│ - Emails       │  │                 │  │                  │
└────────────────┘  └─────────────────┘  └──────────────────┘
       │
       │ EXTERNAL SERVICES (via API)
       │
       ├──────────────────────┬──────────────────┬──────────────┐
       │                      │                  │              │
       ▼                      ▼                  ▼              ▼
┌─────────────┐  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ OpenAI API  │  │ ConvertKit/Active│  │   Zapier     │  │  Buzzsprout  │
│             │  │   Campaign       │  │              │  │  (Podcasts)  │
│ - ChatGPT   │  │                  │  │ - Workflows  │  │              │
│ - Evaluator │  │ - Email sending  │  │ - Automation │  │ - Hosting    │
│   roasts    │  │ - Sequences      │  │ - Triggers   │  │ - Distribution
│             │  │ - Tags/segments  │  │              │  │              │
└─────────────┘  └──────────────────┘  └──────────────┘  └──────────────┘
```

---

## UNIVERSAL CONTENT STRUCTURE (Topic-Agnostic)

### How Topics Differ (Everything Else Is Identical)

```
DROPSHIPPING BOOK:
├─ Topic ID: "dropshipping"
├─ Title: "Why Your Dropship Probably Will Fail"
├─ Hero image: Sinking ship made of Amazon packages
├─ 8 chapters with dropshipping-specific content
├─ 11 case studies (Karen the Bored Mom, TikTok Tim, etc)
├─ Evaluator: "Roast My Product Idea"
├─ Statistics: Failure rates, avg costs, timelines specific to dropshipping
└─ Resources: Cost calculator, supplier checklist, platform fees reference

PRINT-ON-DEMAND BOOK:
├─ Topic ID: "print-on-demand"
├─ Title: "Why Nobody Wants Your Clever Design"
├─ Hero image: T-shirt designs flying into trash can
├─ 8 chapters with POD-specific content
├─ 11 case studies (different archetypes failing at POD)
├─ Evaluator: "Roast My T-Shirt Design"
├─ Statistics: Failure rates, avg costs, timelines specific to POD
└─ Resources: Design template checklist, printer fee comparison, etc

AFFILIATE MARKETING BOOK:
├─ Topic ID: "affiliate-marketing"
├─ Title: "Why Your Amazon Links Are Lonelier Than You"
├─ Hero image: Website drowning in links
├─ 8 chapters with affiliate-specific content
├─ 11 case studies (different archetypes failing at affiliate)
├─ Evaluator: "Roast My Niche Site Idea"
├─ Statistics: Failure rates, avg costs, timelines specific to affiliates
└─ Resources: Niche validator, keyword research guide, etc
```

### Universal Chapter Structure (EVERY BOOK)

```
CHAPTER 1: The Lie (Guru Promises vs Reality)
├─ Guru promises
├─ Reality statistics
├─ The psychology of the scam
└─ Key metrics

CHAPTER 2: The Math (Costs & Hidden Fees)
├─ Startup costs breakdown
├─ Monthly burn rate
├─ Hidden fees
└─ Upsell carousel

CHAPTER 3: Platform/System Reality
├─ Why choice doesn't matter
├─ Platform/system specific breakdown
├─ Platform conspiracy
└─ Credibility markers

CHAPTER 4: Case Study Snapshots (All 11)
├─ 7-11 compressed failures
├─ Common patterns
└─ QR to web expansion

CHAPTER 5: Hidden Killers (Top Failure Points)
├─ 3-4 main failure mechanisms
├─ Timeline of failure
├─ Reality checks
└─ Addendum reference

CHAPTER 6: Decision Framework
├─ Should you do this?
├─ Three winner categories
├─ Opportunity cost analysis
└─ Decision tree

CHAPTER 7: What Actually Works Instead
├─ 3 realistic alternatives
├─ Why each works better
├─ Stats for each alternative
└─ Cross-sell setup

CHAPTER 8: If You're Still Here
├─ Honesty contract
├─ Tone shift (cynical → hopeful)
├─ Next Y-IT books
└─ Commitment checklist
```

---

## FEATURE ROLLOUT PHASES

### Phase 1: MVP (Week 1 - Testing with Dropshipping)
- ✅ Landing page (one book visible)
- ✅ Evaluator form + basic AI integration
- ✅ Email capture + basic sequence
- ✅ Purchase button (Stripe integration)
- ✅ Basic analytics
- ✅ PDF delivery (via email + link)

**Test:** Run dropshipping book through this. Validate before scaling.

### Phase 2: Multi-Topic Infrastructure (Week 2-3)
- ✅ Database scales to handle 50 topics
- ✅ Topic-specific evaluators (5-7 topics live)
- ✅ Email sequences automated per topic
- ✅ Admin panel for content management
- ✅ Analytics dashboard (funnel by topic)

### Phase 3: Full Ecosystem (Week 4-6)
- ✅ All 50 topics live
- ✅ Web interactive versions live
- ✅ Podcast integration
- ✅ Subscription system
- ✅ Bundle pricing
- ✅ Customer dashboard

### Phase 4: Advanced Features (Week 7+)
- ✅ AI personalization (roasts tailored per user)
- ✅ Community features (user forums)
- ✅ Mobile app
- ✅ Advanced analytics
- ✅ CRM integration

---

## DATA FLOW EXAMPLE: New Topic Launch

```
1. ADMIN CREATES NEW TOPIC
   ├─ Admin clicks: "New Book"
   ├─ Fills: topic_id, title, description, hero_image
   └─ POST /api/admin/books

2. DATABASE
   ├─ Creates books record (topic_id = "forex-trading")
   └─ Auto-generates slug = "/books/forex-trading"

3. ADMIN UPLOADS CONTENT
   ├─ Uploads 8 chapters (content for each)
   ├─ Creates 11 case studies (character, narrative, etc)
   ├─ Inputs statistics (failure rates, costs, etc)
   ├─ Sets up evaluator prompt ("Roast My Trading Strategy")
   ├─ Uploads images (hero, chapter comics, case study avatars)
   └─ Creates email sequences (lead magnet follow-up)

4. FRONTEND AUTO-UPDATES
   ├─ New book appears on homepage
   ├─ /books/forex-trading route is live
   ├─ Evaluator form appears
   ├─ All case studies visible

5. USER VISITS
   ├─ Sees "Why Your Diamond Hands Are Actually Made of Tissue Paper"
   ├─ Reads 2-3 chapters
   ├─ Clicks: "Get Roasted" (evaluator)
   └─ Submits: "Trading strategy" idea

6. AI EVALUATOR TRIGGERS
   ├─ API calls OpenAI with forex-specific prompt
   ├─ Prompt includes: statistics, case studies, decision framework from topic
   ├─ AI generates: Brutal reality check referencing forex book
   ├─ System creates: PDF of roast
   └─ Records: evaluator_response (email + input + output)

7. EMAIL CAPTURED
   ├─ User added to customers table
   ├─ Tagged: "evaluator-used", "forex-trading"
   ├─ Email sent immediately: Roast PDF + preview of book
   └─ Enters 4-email sequence (day 0, 3, 7, 14)

8. EMAIL SEQUENCE TRIGGERS
   ├─ Day 0: "Your Roast is Ready" + PDF + book preview
   ├─ Day 3: Case study excerpt (one matching their situation)
   ├─ Day 7: Social proof + other Y-IT books
   └─ Day 14: "Last chance" bundle offer

9. USER CONVERTS (Or Doesn't)
   ├─ Click CTA in email
   ├─ Select product: Print / Digital / Web / Bundle
   ├─ Complete Stripe payment
   └─ System records: purchases + sends delivery

10. DELIVERY (Varies by Format)
    ├─ Print: Order shipped via KDP
    ├─ Digital: Email with PDF/ePub download
    ├─ Web: User logged in, full access to book + resources
    └─ All: Cross-sell email campaign starts
```

---

## SCALABILITY METRICS

**With this architecture:**

- **100 concurrent users:** No problem (Vercel auto-scales)
- **1,000 evaluator requests/day:** No problem (OpenAI API scales, costs ~$10/day)
- **10,000 emails/day:** No problem (ConvertKit handles)
- **50 books with 50 evaluators:** No problem (all use same system, topic_id varies)
- **1M customers:** Possible with PostgreSQL optimization

**Cost estimate (first year, moderate volume):**
- Vercel: $20/month
- Heroku/AWS backend: $50/month
- PostgreSQL: $15/month
- Auth0: $0 (free tier)
- Stripe: 2.9% + $0.30/transaction
- OpenAI API: ~$300/month (moderate usage)
- ConvertKit: $25-100/month
- Zapier: $20/month
- Total: ~$500-1,000/month fixed + transaction fees

**Revenue potential (year 1, 50 books, conservative estimates):**
- 10,000 customers acquired
- 15% conversion from evaluators
- Average AOV: $6.50 (mix of products)
- Monthly revenue: ~$39,000-$55,000 (tiered model)
- Less costs: ~$37,500-$53,500/month profit potential

---

*This architecture is universal. Topic is just a variable.*
*Scale from 1 book to 50 books using identical infrastructure.*
