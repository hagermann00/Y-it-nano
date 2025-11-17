# Y-It WEB PLATFORM ARCHITECTURE

## Overview

Complete architecture for the Y-It web platform supporting:
- 50 nano-books with universal content delivery
- AI-powered evaluator (lead magnet) with email capture
- Multi-format experience (web, print, digital, podcast)
- Customer accounts and purchase management
- Email marketing automation
- Real-time analytics dashboards
- Subscription management
- Admin/content management system

**Design Philosophy:** Universal from topic standpoint - same platform delivers all 50 books using topic_id as the only variable.

---

## USER JOURNEY

### Visitor → Customer Path (Ideal Conversion)

```
1. DISCOVERY
   ├─ Organic search ("dropshipping failure rate")
   ├─ Paid ads (Google, Facebook)
   ├─ Email/newsletter
   └─ Referral/word-of-mouth

2. LANDING
   ├─ Topic homepage (e.g., /dropshipping)
   ├─ Hero section + book preview
   ├─ "Roast My Idea" CTA (AI evaluator lead magnet)
   └─ Social proof, rating, testimonials

3. LEAD MAGNET ENGAGEMENT
   ├─ Click "Roast My Dropshipping Idea"
   ├─ Fill evaluation form (3-4 questions)
   ├─ Submit → AI generates roast (1-2 pages)
   ├─ Download roast PDF
   └─ Email captured (unsubscribe option, privacy notice)

4. EMAIL NURTURE SEQUENCE
   ├─ Email 1 (immediate): Roast + book preview + "Get the full book"
   ├─ Email 2 (day 3): Case study from book
   ├─ Email 3 (day 7): Social proof + cross-sells + bonus content
   └─ Email 4 (day 14): Final CTA + scarcity + purchase options

5. PURCHASE DECISION
   ├─ Click "Get the book" in email
   ├─ View purchase page: 3 options
   │  ├─ Print ($2.99) → KDP checkout
   │  ├─ Digital ($3.99) → Gumroad checkout
   │  └─ Bundle ($12.99) → Stripe checkout
   └─ Complete payment

6. POST-PURCHASE
   ├─ Order confirmation email
   ├─ Download links (if digital/bundle)
   ├─ Shipping tracking (if print)
   ├─ Account access: /my-purchases
   └─ Cross-sell: other Y-It books, annual subscription

7. REPEAT PURCHASE / SUBSCRIPTION
   ├─ Browse other topics
   ├─ Use evaluators for other topics (Roast My Print-on-Demand Idea, etc.)
   ├─ Subscribe for all-access ($99/year)
   └─ Lifetime value per customer: goal $200+
```

---

## FRONTEND ARCHITECTURE

### Technology Stack

```
Framework: Next.js 14+ (React + Node.js)
  - Server-side rendering for SEO
  - Static generation for topic pages
  - API routes for backend integration

UI Framework: Tailwind CSS + Headless UI
  - Rapid responsive design
  - Consistent across all topics
  - Dark mode support (Y-It aesthetic)

Client State: TanStack Query (React Query)
  - API caching and synchronization
  - Evaluator form data persistence
  - Optimistic updates

Forms: React Hook Form + Zod validation
  - Evaluator forms
  - Account creation
  - Checkout

Payment: Stripe React
  - Payment processing
  - Subscription management

Email: ConvertKit API (headless)
  - Email capture
  - Sequence trigger

Analytics: Vercel Analytics + Custom Events
  - User behavior tracking
  - Conversion funnel analysis
  - A/B testing
```

### Page Structure (Universal Template)

**Every topic page follows identical structure with topic-specific content:**

```
/[topic-slug]              - Topic homepage
  ├─ Hero section (topic hero image + CTA)
  ├─ Book preview (3-5 key points)
  ├─ Case studies teaser (1-2 featured)
  ├─ Statistics highlight (3 key stats)
  ├─ "Roast My Idea" CTA button
  ├─ FAQ section
  ├─ Purchase options (print, digital, bundle)
  └─ Cross-sell to other topics

/[topic-slug]/read         - Web reader (premium/subscriber)
  ├─ Full chapters (scrollable)
  ├─ Interactive elements (expandable sections, calculators)
  ├─ Case study full narratives
  ├─ Related resources
  └─ Bookmark and annotation features

/[topic-slug]/evaluator    - AI roast form
  ├─ Form with topic-specific questions
  ├─ Progress bar
  ├─ AI loading state
  ├─ Roast preview
  ├─ PDF download
  └─ Email signup with CTA

/[topic-slug]/purchase     - Purchase page
  ├─ 3 purchase options
  ├─ Comparison table (what's included)
  ├─ Payment processor redirect
  └─ FAQ
```

### Key Pages Architecture

#### 1. Homepage `/`

```
Components:
  - Hero: Y-It brand message + search topics
  - Featured topics: (3-4 trending topics)
  - How it works: (visual explainer)
  - Evaluator CTA: "Roast Your Idea Now"
  - All topics grid: (browseable, searchable)
  - Testimonials/social proof
  - FAQ
  - Email signup: Subscribe to Y-It insights
```

#### 2. Topic Homepage `/[topic-slug]`

```
Components:
  - Hero image (topic-specific)
  - Title + subtitle
  - Quick stats (3-4 key numbers)
  - Book preview callout
  - "Roast My Idea" primary CTA
  - Case study preview (1-2 featured characters)
  - Full statistics table (expandable)
  - Purchase options
  - FAQ
  - Related topics carousel

Data flow:
  1. Router receives topic-slug
  2. Fetch topic metadata (title, stats, evaluator status)
  3. Fetch case study previews (2 featured)
  4. Fetch images (hero, characters)
  5. Render page with topic-specific data
  6. Enable evaluator form (if active)
  7. Setup purchase links (if published)
```

#### 3. Evaluator Form `/[topic-slug]/evaluator`

```
Components:
  - Form header (topic-specific title)
  - Multi-step form (3-4 questions)
    ├─ Step 1: Basic info (name, email)
    ├─ Step 2: Idea/project details (topic-specific questions)
    ├─ Step 3: Review + submit
  - AI loading spinner
  - Roast preview (PDF embedded)
  - Download roast button
  - "Get the full book" CTA

Data flow:
  1. User fills form
  2. Frontend validates with Zod schema
  3. Submit to /api/evaluator/generate
  4. Backend sends to OpenAI + gets roast
  5. Backend generates PDF from roast
  6. Store response in database
  7. Trigger email capture with ConvertKit
  8. Return roast PDF URL to frontend
  9. Display roast in iframe + download link

Form variations (topic-specific):
  - Dropshipping: "What's your product idea? How much can you invest?"
  - POD: "What's your design concept? Target audience?"
  - Affiliate: "What niche are you targeting? Why will you win?"
  - Course: "What topic will you teach? Who's your audience?"
  - etc.
```

#### 4. Purchase Page `/[topic-slug]/purchase`

```
Components:
  - 3-option card layout
    ├─ Print ($2.99)
    │  └─ "Buy on Amazon" → KDP redirect
    ├─ Digital ($3.99)
    │  └─ "Buy on Gumroad" → Gumroad redirect
    └─ Bundle - All Formats ($12.99)
       └─ "Buy now" → Stripe checkout

  - Comparison table (what's in each)
  - FAQ
  - Upsell: "Subscribe for all 50 books" ($99/year)

Data flow:
  1. Load topic metadata
  2. Show purchase links (KDP, Gumroad)
  3. Setup Stripe payment for bundle
  4. Track which option clicked
  5. Redirect to respective payment processor
  6. Webhook receives payment confirmation
  7. Send download links / shipping info
```

#### 5. Account Dashboard `/my-account`

```
Authenticated routes:
  /my-account
    ├─ /purchases       - Order history + downloads
    ├─ /subscriptions   - Active subscription + billing
    ├─ /profile         - User info + preferences
    ├─ /evaluators      - History of roasts submitted
    ├─ /library         - All books accessible (if subscriber)
    └─ /settings        - Email preferences + logout

Components:
  - Purchase history (filterable by topic, date)
  - Download links (for digital purchases)
  - Subscription status + renewal date
  - Billing history
  - Roast history (topic + date)
  - Library access (if subscriber)
  - Email preference toggle
```

---

## BACKEND API ARCHITECTURE

### API Structure (Node.js + Express)

```
Base URL: api.yit.app/v1

PUBLIC ENDPOINTS:
├─ GET  /topics                    - List all topics
├─ GET  /topics/:topic_slug        - Topic metadata
├─ GET  /topics/:topic_slug/chapters - Chapter content (preview)
├─ GET  /topics/:topic_slug/statistics - Statistics data
├─ GET  /topics/:topic_slug/case-studies - Case study data
│
├─ POST /evaluator/generate        - Submit evaluator form, get roast
├─ GET  /evaluator/:topic_slug     - Evaluator prompt config
│
├─ POST /purchase/stripe           - Stripe payment intent
├─ POST /webhooks/stripe           - Stripe webhook (payment confirmation)
├─ POST /webhooks/convertkit       - ConvertKit webhook (email events)
│
├─ POST /auth/register             - Create customer account
├─ POST /auth/login                - Login (JWT)
├─ POST /auth/logout               - Logout
│
└─ GET  /public/images/:image_id   - Image delivery

PROTECTED ENDPOINTS (Require JWT):
├─ GET  /customer/profile          - User account info
├─ GET  /customer/purchases        - Purchase history
├─ GET  /customer/subscriptions    - Active subscriptions
├─ GET  /customer/evaluators       - Evaluator submission history
├─ PUT  /customer/profile          - Update account
├─ GET  /topics/:topic_id/read     - Premium book access
│
└─ POST /subscription/create       - Start annual subscription

ADMIN ENDPOINTS (Require admin JWT):
├─ POST /admin/topics              - Create topic
├─ PUT  /admin/topics/:topic_id    - Update topic
├─ POST /admin/content/chapters    - Upload chapter content
├─ POST /admin/images              - Upload images
├─ POST /admin/evaluator-prompts   - Configure evaluator
├─ GET  /admin/analytics/topics    - Revenue dashboard
├─ GET  /admin/analytics/customers - Customer segments
├─ GET  /admin/analytics/email     - Email metrics
└─ GET  /admin/analytics/evaluator - Evaluator funnel
```

### Key API Endpoints

#### 1. GET `/topics/:topic_slug`

```javascript
// Request
GET /topics/dropshipping

// Response (200 OK)
{
  topic_id: 1,
  slug: "dropshipping",
  title: "The Dropshipping Delusion",
  subtitle: "Why 92% Fail (And Why You're Next)",
  description: "...",
  status: "published",

  // Content metadata
  chapters: [
    {
      chapter_id: 1,
      chapter_number: 1,
      title: "The Lie",
      preview: "First 200 characters...",
      word_count: 1500
    },
    // ... 7 more chapters
  ],

  case_studies: [
    {
      case_study_id: 1,
      character_name: "Karen",
      archetype: "The Bored Mom",
      outcome: "Sold 11 necklaces, 9 returned..."
    },
    // ... 10 more case studies
  ],

  statistics: [
    {
      stat_name: "Failure Rate Within 120 Days",
      stat_value: "92%",
      source: "E-commerce Times",
      source_url: "..."
    },
    // ... 5 more stats
  ],

  // Purchase info
  purchase_options: [
    {
      type: "print",
      price: 299, // cents
      currency: "USD",
      kdp_url: "amazon.com/...",
      kdp_asin: "B0CK5ZXXXX"
    },
    {
      type: "digital",
      price: 399,
      gumroad_url: "gumroad.com/..."
    },
    {
      type: "bundle",
      price: 1299,
      stripe_product_id: "prod_xxx"
    }
  ],

  // Evaluator status
  evaluator_active: true,
  evaluator_submissions_30d: 342,

  // Images
  images: {
    hero: "https://cdn.yit.app/topics/1/hero.png",
    characters: [
      { character_name: "Karen", url: "..." },
      // ... 10 more
    ]
  },

  // Engagement metrics
  total_sales: 1847,
  evaluator_to_purchase_rate: 0.12,

  // Timestamps
  published_at: "2025-01-07T00:00:00Z",
  updated_at: "2025-01-10T14:23:45Z"
}
```

#### 2. POST `/evaluator/generate`

```javascript
// Request
POST /evaluator/generate
Content-Type: application/json

{
  topic_slug: "dropshipping",
  form_data: {
    customer_name: "John",
    customer_email: "john@example.com",
    product_idea: "Vintage leather wallets",
    investment: "$500",
    plan: "Facebook ads targeting men 25-40",
    research_done: "Searched AliExpress, found similar products"
  },
  utm_source: "google",
  utm_medium: "search",
  utm_campaign: "dropshipping_ads"
}

// Response (200 OK)
{
  response_id: 12847,
  roast_generated: true,
  roast_pdf_url: "https://cdn.yit.app/roasts/12847.pdf",
  roast_text: "...", // 500-1000 words

  email_captured: true,
  customer_email: "john@example.com",

  // Email sequence triggered
  email_sequence_id: 42,
  first_email_sent_at: "2025-01-10T14:23:45Z",
  next_email_scheduled: "2025-01-13T09:00:00Z", // 3 days

  // Tracking
  tracking_pixel: "https://pixel.yit.app/track/12847",

  // CTA
  cta_url: "https://yit.app/dropshipping/purchase?from=evaluator&response_id=12847",

  // Timestamps
  created_at: "2025-01-10T14:23:45Z",
  openai_tokens_used: 287,
  openai_cost_cents: 0.29
}
```

#### 3. POST `/purchase/stripe`

```javascript
// Request
POST /purchase/stripe
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  topic_id: 1,
  purchase_type: "bundle",
  customer_name: "John Doe",
  customer_email: "john@example.com",
  return_url: "https://yit.app/purchase-success"
}

// Response (200 OK)
{
  payment_intent_id: "pi_1234567890",
  client_secret: "pi_xxx_secret_xxx",
  status: "requires_payment_method",

  // Stripe checkout URL
  checkout_url: "https://checkout.stripe.com/pay/cs_xxx",

  // Redirect instructions
  redirect_method: "POST",
  redirect_url: "https://checkout.stripe.com/pay/cs_xxx"
}
```

#### 4. POST `/webhooks/stripe`

```javascript
// Stripe sends webhook event
{
  type: "payment_intent.succeeded",
  data: {
    object: {
      id: "pi_1234567890",
      amount: 1299, // cents ($12.99)
      currency: "usd",
      status: "succeeded",
      customer_email: "john@example.com",
      metadata: {
        topic_id: "1",
        purchase_type: "bundle",
        response_id: "12847" // from evaluator
      }
    }
  }
}

// Backend response:
// 1. Create purchase record in database
// 2. Send confirmation email via ConvertKit
// 3. Generate download links (if digital)
// 4. Queue print fulfillment (if print)
// 5. Update customer LTV
// 6. Trigger cross-sell sequences
```

---

## INTEGRATION POINTS

### 1. OpenAI API Integration (Evaluator)

```javascript
// Evaluator generation flow
const generateRoast = async (topicId, formData) => {
  // 1. Get evaluator prompt for topic
  const prompt = await db.query(
    'SELECT system_prompt, insert_primary_stat FROM evaluator_prompts WHERE topic_id = $1',
    [topicId]
  );

  // 2. Get topic statistics
  const stats = await db.query(
    'SELECT * FROM statistics WHERE topic_id = $1 AND is_primary_stat = true LIMIT 1',
    [topicId]
  );

  // 3. Get a random case study for reference
  const caseStudy = await db.query(
    'SELECT * FROM case_studies WHERE topic_id = $1 ORDER BY RANDOM() LIMIT 1',
    [topicId]
  );

  // 4. Build the actual message to send to GPT
  const messageContent = `
  ${prompt.system_prompt}

  Their situation:
  ${JSON.stringify(formData, null, 2)}

  Key fact to reference: ${stats.rows[0].stat_name}: ${stats.rows[0].stat_value}
  Example to mention: ${caseStudy.rows[0].outcome}
  `;

  // 5. Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a brutally honest business analyst..."
      },
      {
        role: "user",
        content: messageContent
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  // 6. Extract and store roast
  const roastText = response.choices[0].message.content;
  const tokensUsed = response.usage.total_tokens;
  const costCents = (tokensUsed / 1000) * 0.03 * 100; // ~$0.003 per roast

  // 7. Generate PDF from roast
  const pdfUrl = await generatePdfFromText(roastText, topicId);

  // 8. Store in database
  await db.query(
    `INSERT INTO evaluator_responses
    (topic_id, submitted_form_data, roast_generated_text, roast_pdf_url, openai_tokens_used, openai_cost_cents, customer_email)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [topicId, JSON.stringify(formData), roastText, pdfUrl, tokensUsed, costCents, formData.customer_email]
  );

  return { roastText, pdfUrl, costCents };
};
```

### 2. ConvertKit Email Integration

```javascript
// Trigger email sequence after evaluator submission
const triggerEmailSequence = async (customerId, topicId, responseId) => {
  // 1. Get customer email
  const customer = await db.query('SELECT email FROM customers WHERE id = $1', [customerId]);

  // 2. Get email sequence for topic
  const sequence = await db.query(
    'SELECT * FROM email_sequences WHERE topic_id = $1 AND sequence_type = "post_evaluator"',
    [topicId]
  );

  // 3. Subscribe customer to ConvertKit list
  const ckResponse = await fetch('https://api.convertkit.com/v3/subscribers', {
    method: 'POST',
    body: JSON.stringify({
      email: customer.rows[0].email,
      api_key: process.env.CONVERTKIT_API_KEY,
      api_secret: process.env.CONVERTKIT_API_SECRET
    })
  });

  const ckSubscriber = await ckResponse.json();

  // 4. Tag subscriber with topic + evaluator response
  await fetch(`https://api.convertkit.com/v3/subscribers/${ckSubscriber.subscriber.id}/tags`, {
    method: 'POST',
    body: JSON.stringify({
      tag_ids: [
        process.env.CK_TAG_EVALUATOR, // All evaluator respondents
        process.env[`CK_TAG_TOPIC_${topicId}`], // Topic-specific
        process.env.CK_TAG_POST_EVALUATOR // Post-evaluator segment
      ]
    })
  });

  // 5. Schedule sequence emails
  const emails = JSON.parse(sequence.rows[0].emails);
  let scheduledTime = new Date();

  for (const email of emails) {
    scheduledTime.setHours(scheduledTime.getHours() + email.delay_hours);

    await fetch('https://api.convertkit.com/v3/broadcasts', {
      method: 'POST',
      body: JSON.stringify({
        subject: email.subject,
        content: email.body,
        subscribe_ids: [ckSubscriber.subscriber.id],
        scheduled_at: scheduledTime.toISOString(),
        from_email_subject: email.from_line
      })
    });
  }

  // 6. Store in database for tracking
  await db.query(
    'UPDATE email_sequences SET submission_count = submission_count + 1 WHERE id = $1',
    [sequence.rows[0].id]
  );
};
```

### 3. Stripe Payment Integration

```javascript
// Stripe checkout flow
const createStripeCheckout = async (customerId, topicId, purchaseType) => {
  // 1. Validate purchase type and get pricing
  const pricing = {
    bundle: 1299, // $12.99
    web_annual: 9900 // $99/year
  };

  // 2. Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: pricing[purchaseType],
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      customer_id: customerId,
      topic_id: topicId,
      purchase_type: purchaseType
    }
  });

  // 3. Return client secret for frontend
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
};

// Stripe webhook handler
const handleStripeWebhook = async (event) => {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { customer_id, topic_id, purchase_type } = paymentIntent.metadata;

    // 1. Record purchase in database
    const purchase = await db.query(
      `INSERT INTO purchases (customer_id, topic_id, purchase_type, amount_cents, status)
       VALUES ($1, $2, $3, $4, 'completed')
       RETURNING *`,
      [customer_id, topic_id, purchase_type, paymentIntent.amount]
    );

    // 2. Send confirmation email
    await sendConfirmationEmail(customer_id, purchase.rows[0]);

    // 3. Generate download links if digital
    if (purchase_type === 'bundle') {
      const downloadLinks = await generateDownloadLinks(topic_id);
      await sendDownloadLinks(customer_id, downloadLinks);
    }

    // 4. Update customer metrics
    await updateCustomerMetrics(customer_id);

    // 5. Trigger cross-sell sequences
    await triggerCrossSellSequence(customer_id, topic_id);
  }
};
```

### 4. KDP & Gumroad Integration

```javascript
// KDP and Gumroad are handled via direct links
// No API integration needed, but we track conversions

// When user clicks "Buy on Amazon" or "Buy on Gumroad"
const generatePurchaseLink = (topicId, purchaseType) => {
  const topic = getTopicData(topicId);

  if (purchaseType === 'print') {
    // Redirect to KDP book page
    return {
      redirect_url: topic.kdp_url,
      provider: 'kdp',
      asin: topic.kdp_asin
    };
  }

  if (purchaseType === 'digital') {
    // Redirect to Gumroad
    return {
      redirect_url: topic.gumroad_url,
      provider: 'gumroad'
    };
  }
};

// Pixel tracking for external conversions
// Embed tracking pixel in KDP/Gumroad landing pages to track back to Y-It
const trackExternalConversion = (source, referrer) => {
  // Logs to Google Analytics, ConvertKit
  analytics.track('external_purchase_initiated', {
    source,
    referrer,
    timestamp: new Date()
  });
};
```

---

## CONTENT DELIVERY STRATEGY

### Multi-Format Experience

**For Each Topic:**

1. **Web Reader** (Premium/Subscribers)
   - Full chapters with styling
   - Case studies with full narratives
   - Interactive elements (expandable sections, calculators)
   - Bookmarks and annotations
   - Offline reading capability (PWA)

2. **Print** (via KDP)
   - 24 pages on Amazon
   - Print-on-demand fulfillment
   - Proof copy review before launch

3. **Digital** (via Gumroad)
   - PDF + EPUB + Bonus worksheet
   - One-time purchase
   - No DRM, full ownership

4. **Podcast** (Coming later)
   - 15-25 minute audio narration
   - Extended expert commentary
   - Weekly release schedule

5. **Lead Magnet** (AI Evaluator)
   - Free roast based on idea submission
   - 500-1000 word custom analysis
   - Email capture + nurture sequence

### Content Delivery Architecture

```
┌─────────────────┐
│   All Content   │ (24 pages, 7,800 words)
│   in Database   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬─────────┐
    │          │          │          │         │
    v          v          v          v         v
┌───────┐ ┌───────┐ ┌───────┐ ┌─────────┐ ┌──────────┐
│ Web   │ │Print  │ │Digital│ │Podcast  │ │Evaluator │
│Reader │ │(KDP)  │ │(PDF)  │ │(Audio)  │ │(Roast)   │
├───────┤ ├───────┤ ├───────┤ ├─────────┤ ├──────────┤
│Full   │ │24-page│ │PDF +  │ │Narrated │ │GPT-4     │
│text + │ │layout │ │EPUB   │ │content  │ │analysis  │
│markup │ │+ imgs │ │+ bonus│ │         │ │+ stats   │
│       │ │       │ │       │ │         │ │+ case    │
│       │ │       │ │       │ │         │ │study     │
└───────┘ └───────┘ └───────┘ └─────────┘ └──────────┘
```

---

## ADMIN DASHBOARD

### Content Management Interface

```
Dashboard: /admin/topics

Sections:
├─ Topic List (filterable by status, batch, tier)
│  ├─ Create new topic
│  ├─ Edit topic metadata
│  ├─ View content progress
│  └─ Publish/unpublish
│
├─ Content Management (per topic)
│  ├─ Chapter editor (rich text + markdown)
│  ├─ Case studies (add/edit/delete)
│  ├─ Statistics (add sources, verify)
│  ├─ Image uploads (hero, characters, charts)
│  └─ Evaluator prompt editor
│
├─ Publishing Pipeline
│  ├─ Content complete? ✓
│  ├─ Design complete? ✓
│  ├─ KDP uploaded? ✓
│  ├─ Evaluator active? ✓
│  ├─ Email sequences ready? ✓
│  └─ Publish → Go Live
│
├─ Analytics Dashboard
│  ├─ Revenue (print, digital, web, bundle, subscription)
│  ├─ Sales by channel (KDP, Gumroad, direct, evaluator)
│  ├─ Evaluator metrics (submissions, conversion rate, cost/roast)
│  ├─ Email metrics (open rate, click rate, conversion)
│  ├─ Customer segments (high-value, at-risk, dormant)
│  ├─ Lifetime value per topic
│  ├─ ROI by topic
│  └─ Graphs and comparisons
│
└─ Email Campaign Management
   ├─ Create/edit sequences
   ├─ Test send
   ├─ Schedule
   ├─ A/B test variants
   ├─ Monitor performance (real-time)
   └─ Archive completed
```

### Analytics Dashboard

```
Key Metrics:

1. Revenue Dashboard
   - Total revenue (YTD)
   - Revenue by topic (sorted highest to lowest)
   - Revenue by channel (print 35%, digital 35%, web 20%, bundles 10%)
   - Month-over-month growth
   - Projected annual revenue

2. Sales Dashboard
   - Total sales this month
   - Sales by product (print, digital, bundle)
   - Sales by topic (heatmap)
   - Sales by geography (if tracked)
   - Repeat purchase rate

3. Customer Dashboard
   - Total customers
   - New customers this month
   - Repeat purchase rate
   - Average customer LTV
   - Churn rate
   - High-value segment size
   - At-risk segment size

4. Evaluator Dashboard
   - Total submissions (all time)
   - Submissions this month
   - Submissions by topic (ranked)
   - Cost per roast (avg, min, max)
   - Email capture rate
   - Conversion rate (evaluator → purchase)
   - Time to purchase from evaluator

5. Email Dashboard
   - Emails sent (total, by sequence)
   - Open rate (by sequence, by topic)
   - Click rate (by sequence, by topic)
   - Unsubscribe rate
   - Bounce rate
   - Revenue from email (attributable)

6. Cohort Analysis
   - Customers acquired by month/source
   - Retention by cohort
   - Lifetime value by cohort
   - Product preferences by cohort

All dashboards update real-time from database
Export capabilities (CSV, PDF)
```

---

## SECURITY & AUTHENTICATION

### JWT Authentication Flow

```javascript
// Login
POST /auth/login
{
  email: "user@example.com",
  password: "secure_password"
}

Response:
{
  access_token: "eyJhbGciOiJIUzI1NiIs...",
  refresh_token: "eyJhbGciOiJIUzI1NiIs...",
  expires_in: 3600, // 1 hour
  user: {
    customer_id: 123,
    email: "user@example.com",
    active_subscription: true
  }
}

// Protected requests include Bearer token
GET /customer/purchases
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Data Security

- All passwords hashed with bcrypt (10+ rounds)
- Sensitive data encrypted at rest (customer addresses, payment info if stored)
- HTTPS enforced
- Rate limiting on auth endpoints
- CORS configured (only yit.app domain)
- CSRF protection on forms
- SQL injection protection (parameterized queries)
- XSS protection (input sanitization, output encoding)

---

## PERFORMANCE OPTIMIZATION

### Caching Strategy

```
Layer 1: Database Query Cache (Redis)
├─ Topic metadata (30-minute TTL)
├─ Top case studies (1-hour TTL)
├─ Statistics (24-hour TTL)
└─ Images metadata (24-hour TTL)

Layer 2: HTTP Caching
├─ Topic pages (public, 1-hour max-age)
├─ Static assets (images, fonts, 30-day max-age)
├─ API responses (auth-required, no-cache)
└─ User-specific content (no-cache)

Layer 3: CDN (Cloudflare)
├─ Static assets globally distributed
├─ Images optimized and cached at edge
├─ Compression enabled (gzip, brotli)
└─ HTTP/2 enabled
```

### Performance Targets

- Page load < 2 seconds (Core Web Vitals)
- API response < 200ms (p95)
- Evaluator generation < 10 seconds (including OpenAI)
- Checkout flow < 5 seconds
- Dashboard load < 3 seconds

---

## MONITORING & OBSERVABILITY

### Metrics Tracked

```
Real-time monitoring:
├─ Server health (CPU, memory, disk)
├─ API response times (by endpoint)
├─ Error rates (by type)
├─ Database query performance (slow queries)
├─ Evaluator generation time
├─ Payment processing success rate
├─ Email delivery rate
└─ User sessions active

Dashboards:
├─ Vercel Analytics (Core Web Vitals)
├─ Sentry (error tracking)
├─ LogRocket (session replay)
├─ Custom dashboard (revenue, customers, evaluators)
└─ Database query logs
```

---

## DEPLOYMENT ARCHITECTURE

### Infrastructure

```
Frontend: Vercel
├─ Next.js hosting
├─ Automatic deployments from git
├─ Global CDN
├─ Serverless functions (API routes)
└─ Built-in analytics

Backend: Node.js (AWS or self-hosted)
├─ Docker containerization
├─ Load balancing
├─ Database replication
└─ Backup automation

Database: PostgreSQL (AWS RDS or self-hosted)
├─ Multi-AZ deployment
├─ Automated backups
├─ Point-in-time recovery
└─ Read replicas for analytics

Storage: AWS S3 + CloudFront
├─ Book PDFs
├─ User-generated roasts
├─ Topic images
└─ Audiobook files

Services:
├─ Stripe (payments)
├─ ConvertKit (email)
├─ OpenAI (evaluator)
├─ Cloudflare (DNS)
└─ UptimeRobot (monitoring)
```

---

## ROADMAP: PHASE 1 vs PHASE 2

### Phase 1 (Week 7 - MVP Launch with Dropshipping)
✅ Topic homepage + hero image
✅ Purchase links (Amazon, Gumroad, Stripe)
✅ Evaluator form + AI roast generation
✅ Email sequence automation (ConvertKit)
✅ Customer accounts (register, login)
✅ Purchase history
✅ Basic analytics

### Phase 2 (Months 2-3 - Full Platform)
→ Web reader (premium access to full chapters)
→ Interactive elements (calculators, expandable sections)
→ Advanced search across all topics
→ Podcast player + distribution
→ Mobile app (iOS/Android)
→ Social sharing
→ Advanced dashboard + reporting
→ Affiliate program
→ API for partners
→ Integration with learning management system

---

*Y-It Web Platform Architecture v1.0*
*Universal Topic-Agnostic Design*
*Ready for Dropshipping Validation Test (Week 7)*
