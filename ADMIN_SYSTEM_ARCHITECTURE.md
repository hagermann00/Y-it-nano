# Y-It ADMIN SYSTEM ARCHITECTURE
**Future-Proof Stack for Managing 50 Books + Affiliate Programs**

**Created:** November 10, 2025
**Purpose:** Web-based admin system for Y-It project management
**Scope:** Research tracking, affiliate management, content pipeline, analytics

---

## 🎯 SYSTEM OVERVIEW

### What This Admin System Does:
1. **Track research progress** across all 50 topics
2. **Manage 3,900+ affiliate programs** (78 per topic × 50 topics)
3. **Monitor content pipeline** (Research → Content → Design → Production)
4. **Visualize revenue** (book sales + affiliate commissions)
5. **Quality assurance** (validation rates, source counts, etc.)
6. **Automation triggers** (launch agents, send emails, update status)

### Users:
- **You** (primary admin)
- **Content writers** (future team members)
- **Designers** (future contractors)
- **Marketing team** (future hires)

---

## 🏗️ TECH STACK (Modern, Future-Proof)

### Frontend:
**Framework:** Next.js 14+ (React)
- Why: Server-side rendering, API routes, file-based routing
- Benefits: SEO, performance, full-stack in one repo

**UI Library:** shadcn/ui + Tailwind CSS
- Why: Modern, accessible, customizable components
- Benefits: Consistent design, fast development

**Charts:** Recharts or Chart.js
- Why: Beautiful, responsive charts
- Benefits: Revenue tracking, progress visualization

**Tables:** TanStack Table (React Table v8)
- Why: Powerful filtering, sorting, pagination
- Benefits: Perfect for affiliate catalog (3,900+ rows)

### Backend:
**Framework:** Next.js API Routes + tRPC
- Why: Type-safe API, no REST boilerplate
- Benefits: Full TypeScript end-to-end

**Database:** PostgreSQL (Supabase hosted)
- Why: Relational data, JSON support, real-time subscriptions
- Benefits: Handles complex relationships, scalable

**ORM:** Prisma
- Why: Type-safe database client, migrations, schema as code
- Benefits: Auto-completion, validation, easy changes

**File Storage:** Supabase Storage OR AWS S3
- Why: Research files, cover designs, PDFs
- Benefits: CDN, cheap, scalable

### Authentication:
**Auth:** Clerk OR Supabase Auth
- Why: OAuth, magic links, session management
- Benefits: Secure, no auth code to maintain

### Deployment:
**Host:** Vercel (Next.js creators)
- Why: Zero-config deployment, edge functions, CDN
- Benefits: Fast, auto-scaling, CI/CD built-in

**Domain:** yit-admin.com (or admin.yitbooks.com)

---

## 📊 DATABASE SCHEMA (PostgreSQL)

### Core Tables:

```sql
-- Topics (50 books)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'dropshipping'
  title TEXT NOT NULL, -- 'Dropshipping: Why It Fails & What Works'
  batch TEXT NOT NULL, -- 'A', 'B', 'C', etc.
  tier INTEGER NOT NULL, -- 1-3 (demand level)
  status TEXT NOT NULL, -- 'queued', 'research', 'content', 'design', 'production', 'live'
  start_date DATE,
  target_completion DATE,

  -- Research metrics
  research_word_count INTEGER,
  research_sources_count INTEGER,
  research_validation_rate DECIMAL(5,2), -- 96.00
  research_case_studies_count INTEGER,
  research_affiliates_count INTEGER,

  -- Content metrics
  content_word_count INTEGER,
  content_chapters_count INTEGER,
  content_inline_assets_count INTEGER,

  -- Production metrics
  kdp_asin TEXT, -- Amazon ASIN when published
  cover_url TEXT,
  publish_date DATE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sources (40+ per topic = 2,000+ total)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  credibility_tier INTEGER CHECK (credibility_tier BETWEEN 1 AND 5),
  access_date DATE NOT NULL,
  key_data_points TEXT[], -- Array of extracted facts
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate Programs (78 per topic = 3,900+ total)
CREATE TABLE affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,

  -- Program details
  entity_name TEXT NOT NULL, -- 'Shopify', 'Upwork', etc.
  category TEXT NOT NULL, -- 'Platform', 'Tool', 'Guru Course', 'Supplier', 'Alternative'
  has_affiliate BOOLEAN NOT NULL,

  -- Commission details
  commission_rate TEXT, -- '20%', '$150', '40% lifetime'
  commission_type TEXT, -- 'recurring', 'one-time', 'hybrid'
  cookie_duration INTEGER, -- days

  -- Program logistics
  signup_url TEXT,
  requirements TEXT,
  payout_method TEXT, -- 'PayPal', 'Direct deposit'
  payout_threshold DECIMAL(10,2), -- $50.00

  -- Rankings
  revenue_potential TEXT, -- 'Very High', 'High', 'Medium', 'Low'
  ethical_score DECIMAL(3,1), -- 9.5

  -- Status
  research_status TEXT, -- 'complete', 'needs_inquiry', 'no_program'
  signup_status TEXT, -- 'not_started', 'applied', 'approved', 'rejected'
  affiliate_link TEXT, -- Actual tracking URL

  -- Tracking
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  revenue_earned DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Case Studies (11 per topic = 550 total)
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  case_number INTEGER NOT NULL, -- 001-011
  character_name TEXT NOT NULL, -- 'Sarah Martinez'
  archetype TEXT NOT NULL, -- 'Side Hustler'
  outcome TEXT NOT NULL, -- 'failure', 'qualified_success'
  investment_lost DECIMAL(10,2),
  time_invested INTEGER, -- hours
  key_failure_mechanism TEXT,
  file_path TEXT, -- Path to markdown file
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Pipeline (tracks progress through phases)
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  stage TEXT NOT NULL, -- 'research', 'content', 'design', 'production', 'marketing'
  status TEXT NOT NULL, -- 'not_started', 'in_progress', 'complete', 'blocked'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  assigned_to TEXT, -- User email or name
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Revenue Tracking
CREATE TABLE revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id),
  affiliate_program_id UUID REFERENCES affiliate_programs(id),

  -- Revenue details
  revenue_type TEXT NOT NULL, -- 'book_sale', 'affiliate_commission'
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  source TEXT, -- 'KDP', 'Shopify Partner', 'Upwork Affiliate'

  -- Attribution
  utm_campaign TEXT,
  utm_source TEXT,
  utm_medium TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Log (audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'research_completed', 'affiliate_approved', 'book_published'
  description TEXT,
  metadata JSONB, -- Flexible JSON for extra data
  created_at TIMESTAMP DEFAULT NOW()
);

-- Research Quality Metrics (historical tracking)
CREATE TABLE quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Quality scores
  validation_rate DECIMAL(5,2),
  sources_count INTEGER,
  word_count INTEGER,
  case_studies_count INTEGER,
  affiliates_count INTEGER,

  -- Comparative
  passes_quality_gates BOOLEAN, -- TRUE if all gates passed
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance:

```sql
-- Speed up common queries
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_batch ON topics(batch);
CREATE INDEX idx_affiliates_topic ON affiliate_programs(topic_id);
CREATE INDEX idx_affiliates_category ON affiliate_programs(category);
CREATE INDEX idx_affiliates_revenue_potential ON affiliate_programs(revenue_potential);
CREATE INDEX idx_revenue_date ON revenue(date DESC);
CREATE INDEX idx_activity_log_date ON activity_log(created_at DESC);
```

---

## 🎨 ADMIN UI PAGES

### 1. **Dashboard (Home)**
**Route:** `/admin/dashboard`

**Widgets:**
- **Overall Progress Card**
  - 1/50 books complete (2%)
  - Current phase: Research
  - Next milestone: Complete Batch A (Nov 17)

- **Batch A Progress Table**
  - 7 rows (topics)
  - Columns: Topic, Status, Progress %, Research Quality, Affiliates, Actions
  - Color-coded status (green=complete, yellow=in-progress, red=blocked)

- **Revenue Chart**
  - Line chart: Book sales + Affiliate revenue over time
  - MTD, YTD toggle

- **Quality Metrics Card**
  - Avg validation rate across topics
  - Avg sources per topic
  - Total affiliates cataloged

- **Recent Activity Feed**
  - "Dropshipping research completed (96% validation)"
  - "78 affiliate programs cataloged for dropshipping"
  - "Marketing messaging framework created"

**Actions:**
- "Launch Research Agent" button
- "Create New Topic" button
- "View Full Pipeline" link

---

### 2. **Topics Management**
**Route:** `/admin/topics`

**Features:**
- **Filterable Table**
  - All 50 topics
  - Filters: Batch, Tier, Status, Phase
  - Search: Topic name/slug

- **Columns:**
  - Topic (with cover thumbnail if available)
  - Batch
  - Status badge
  - Progress bar (0-100%)
  - Research quality score
  - Affiliate count
  - Actions (Edit, View, Delete)

- **Bulk Actions:**
  - "Launch Research for Selected"
  - "Export to CSV"
  - "Move to Batch X"

- **Create New Topic Button:**
  - Modal form: Title, Slug, Batch, Tier
  - Auto-creates folder structure
  - Initializes in "Queued" status

**Detail View (Click on topic):**
- All research metrics
- List of sources (expandable)
- List of affiliates (with signup status)
- Pipeline stages (Research → Content → Design → Production)
- Activity log for this topic
- Edit button

---

### 3. **Affiliate Programs Hub**
**Route:** `/admin/affiliates`

**Features:**
- **Master Table (3,900+ rows)**
  - TanStack Table with virtual scrolling
  - Filters:
    - Topic
    - Category (Platform, Tool, Guru, Supplier, Alternative)
    - Has Affiliate (Yes/No)
    - Revenue Potential (Very High → Low)
    - Ethical Score (10 → 1)
    - Signup Status (Not Started → Approved)

- **Columns:**
  - Entity Name
  - Topic
  - Category badge
  - Commission Rate
  - Revenue Potential badge
  - Ethical Score (colored 10=green, <6=red)
  - Signup Status badge
  - Actions (View, Edit, Mark as Signed Up)

- **Bulk Actions:**
  - "Mark as Applied" (for selected)
  - "Export Filtered Results"
  - "Send Inquiry Email Template"

- **Summary Cards:**
  - Total Programs: 3,900
  - Active Programs: 2,790 (71%)
  - Signed Up: 0
  - Pending: 16 per topic
  - Revenue Potential: $1.8M/year (at 50K sales)

**Detail View (Click on program):**
- Full details (commission, cookie, requirements)
- Link to signup URL (open in new tab)
- Notes field (editable)
- Revenue tracking (clicks, conversions, earnings)
- Edit button

---

### 4. **Research Pipeline**
**Route:** `/admin/pipeline`

**Features:**
- **Kanban Board View**
  - Columns: Queued → Research → Content → Design → Production → Live
  - Drag-and-drop topics between stages
  - Card shows: Topic name, progress %, assigned user

- **Timeline View (Gantt Chart)**
  - X-axis: Dates (weeks/months)
  - Y-axis: Topics
  - Bars show: Start → End for each phase
  - Dependencies shown (research must complete before content)

- **Table View**
  - Topic | Current Stage | Status | Assigned To | Started | Target Completion | Actions
  - Filter by stage, batch, assigned user

- **Quality Gates**
  - Checklist per stage
  - Research: ✅ 95% validation, ✅ 40+ sources, ✅ 11 case studies
  - Auto-advance when gates pass

---

### 5. **Revenue Analytics**
**Route:** `/admin/revenue`

**Features:**
- **Revenue Dashboard**
  - Total Revenue Card: $0 (starting)
  - Book Sales Card: $0
  - Affiliate Revenue Card: $0
  - MTD, QTD, YTD toggle

- **Revenue Chart**
  - Line chart: Book sales (blue) + Affiliate (green)
  - X-axis: Time
  - Y-axis: Revenue ($)
  - Filterable by topic

- **Top Performing Affiliates**
  - Table: Affiliate | Topic | Clicks | Conversions | Revenue
  - Sort by revenue desc

- **Book Sales by Topic**
  - Bar chart: Topic on X, Sales on Y
  - Color-coded by batch

- **Projections Card**
  - Based on current rate, project:
    - Next month revenue
    - End of year revenue
    - Time to $10K/month

---

### 6. **Research Quality Tracker**
**Route:** `/admin/quality`

**Features:**
- **Quality Dashboard**
  - Avg Validation Rate: 96% (target: ≥95%)
  - Avg Sources: 45 (target: ≥40)
  - Avg Word Count: 12,500 (target: ≥3,000)
  - Topics Passing All Gates: 1/1 (100%)

- **Quality Trend Chart**
  - X-axis: Topics (in order completed)
  - Y-axis: Validation rate %
  - Line shows consistency
  - Target line at 95%

- **Topics Comparison Table**
  - Topic | Validation | Sources | Words | Cases | Affiliates | Pass/Fail
  - Color-code: Green if passes, Red if fails
  - Sort by any column

- **Quality Alerts**
  - "⚠️ Print-on-Demand validation at 93% (below target)"
  - "✅ All Batch A topics above quality thresholds"

---

### 7. **Activity Log**
**Route:** `/admin/activity`

**Features:**
- **Timeline Feed**
  - Most recent at top
  - Each entry shows:
    - Timestamp
    - User (or "System")
    - Action (icon + text)
    - Topic (if applicable)
    - Description

- **Filters:**
  - Date range
  - User
  - Action type
  - Topic

- **Export:**
  - "Export to CSV" button
  - Date range selector

**Example Entries:**
- "2m ago | System | ✅ Dropshipping research completed (96% validation)"
- "5m ago | You | 📊 Created affiliate catalog table (78 entities)"
- "1h ago | System | ✓ Case studies validated (11/11 passed)"

---

### 8. **Settings**
**Route:** `/admin/settings`

**Tabs:**

**General:**
- Project name: "Y-It: You've Invested Too Much"
- Total books target: 50
- Current batch: A
- Quality thresholds (validation %, sources, etc.)

**Users:**
- Invite team members (email)
- Assign roles: Admin, Writer, Designer, Marketer
- Permissions per role

**Integrations:**
- KDP API (connect Amazon account for sales data)
- Stripe API (webhook for revenue)
- Email provider (SendGrid for automated emails)
- Analytics (Google Analytics, Plausible)

**Automation:**
- Auto-launch agents when topic created
- Auto-send inquiry emails to affiliates
- Auto-update status based on file changes
- Slack/Discord notifications

**Danger Zone:**
- Delete all data (requires confirmation)
- Reset project to initial state

---

## 🔌 API STRUCTURE (tRPC)

### Example Endpoints:

```typescript
// /trpc/topics.ts
export const topicsRouter = router({
  // Get all topics
  getAll: publicProcedure
    .input(z.object({
      batch: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.db.topics.findMany({
        where: {
          batch: input.batch,
          status: input.status,
        },
        include: {
          affiliatePrograms: true,
          caseStudies: true,
          pipelineStages: true,
        }
      });
    }),

  // Get single topic
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.topics.findUnique({
        where: { id: input.id },
        include: {
          sources: true,
          affiliatePrograms: true,
          caseStudies: true,
          pipelineStages: true,
          qualityMetrics: true,
        }
      });
    }),

  // Create new topic
  create: protectedProcedure
    .input(z.object({
      slug: z.string(),
      title: z.string(),
      batch: z.string(),
      tier: z.number().int().min(1).max(3),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create database record
      const topic = await ctx.db.topics.create({
        data: {
          ...input,
          status: 'queued',
        }
      });

      // Create folder structure
      await createTopicFolders(input.slug);

      // Log activity
      await ctx.db.activityLog.create({
        data: {
          topicId: topic.id,
          userEmail: ctx.user.email,
          action: 'topic_created',
          description: `Created topic: ${input.title}`,
        }
      });

      return topic;
    }),

  // Update topic status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['queued', 'research', 'content', 'design', 'production', 'live']),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.topics.update({
        where: { id: input.id },
        data: { status: input.status, updatedAt: new Date() }
      });
    }),

  // Launch research agent
  launchResearch: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const topic = await ctx.db.topics.findUnique({ where: { id: input.id } });

      // Trigger agent execution (webhook or background job)
      await triggerResearchAgent(topic.slug);

      // Update status
      await ctx.db.topics.update({
        where: { id: input.id },
        data: { status: 'research' }
      });

      return { success: true };
    }),
});

// /trpc/affiliates.ts
export const affiliatesRouter = router({
  // Get all affiliates (with pagination)
  getAll: publicProcedure
    .input(z.object({
      topicId: z.string().uuid().optional(),
      category: z.string().optional(),
      hasAffiliate: z.boolean().optional(),
      revenuePotential: z.string().optional(),
      signupStatus: z.string().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(10).max(100).default(50),
    }))
    .query(async ({ input, ctx }) => {
      const skip = (input.page - 1) * input.limit;

      const [programs, total] = await Promise.all([
        ctx.db.affiliatePrograms.findMany({
          where: {
            topicId: input.topicId,
            category: input.category,
            hasAffiliate: input.hasAffiliate,
            revenuePotential: input.revenuePotential,
            signupStatus: input.signupStatus,
          },
          skip,
          take: input.limit,
          include: { topic: true }
        }),
        ctx.db.affiliatePrograms.count({
          where: {
            topicId: input.topicId,
            category: input.category,
            hasAffiliate: input.hasAffiliate,
            revenuePotential: input.revenuePotential,
            signupStatus: input.signupStatus,
          }
        })
      ]);

      return {
        programs,
        total,
        pages: Math.ceil(total / input.limit),
      };
    }),

  // Update signup status
  updateSignupStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      signupStatus: z.enum(['not_started', 'applied', 'approved', 'rejected']),
      affiliateLink: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.affiliatePrograms.update({
        where: { id: input.id },
        data: {
          signupStatus: input.signupStatus,
          affiliateLink: input.affiliateLink,
          updatedAt: new Date(),
        }
      });
    }),

  // Track click
  trackClick: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.affiliatePrograms.update({
        where: { id: input.id },
        data: { clicksCount: { increment: 1 } }
      });
    }),

  // Track conversion
  trackConversion: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      amount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.affiliatePrograms.update({
        where: { id: input.id },
        data: {
          conversionsCount: { increment: 1 },
          revenueEarned: { increment: input.amount },
        }
      });

      // Create revenue record
      await ctx.db.revenue.create({
        data: {
          affiliateProgramId: input.id,
          revenueType: 'affiliate_commission',
          amount: input.amount,
          date: new Date(),
        }
      });

      return { success: true };
    }),
});

// /trpc/revenue.ts
export const revenueRouter = router({
  // Get summary
  getSummary: publicProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input, ctx }) => {
      const totalRevenue = await ctx.db.revenue.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: input.startDate,
            lte: input.endDate,
          }
        }
      });

      const bookSales = await ctx.db.revenue.aggregate({
        _sum: { amount: true },
        where: {
          revenueType: 'book_sale',
          date: {
            gte: input.startDate,
            lte: input.endDate,
          }
        }
      });

      const affiliateRevenue = await ctx.db.revenue.aggregate({
        _sum: { amount: true },
        where: {
          revenueType: 'affiliate_commission',
          date: {
            gte: input.startDate,
            lte: input.endDate,
          }
        }
      });

      return {
        total: totalRevenue._sum.amount || 0,
        bookSales: bookSales._sum.amount || 0,
        affiliate: affiliateRevenue._sum.amount || 0,
      };
    }),

  // Get revenue by topic
  getByTopic: publicProcedure
    .query(async ({ ctx }) => {
      const revenue = await ctx.db.revenue.groupBy({
        by: ['topicId'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      });

      const topics = await ctx.db.topics.findMany({
        where: { id: { in: revenue.map(r => r.topicId).filter(Boolean) } }
      });

      return revenue.map(r => ({
        topic: topics.find(t => t.id === r.topicId),
        revenue: r._sum.amount,
      }));
    }),
});
```

---

## 📁 PROJECT FILE STRUCTURE

```
/y-it-admin/
├── /app/
│   ├── /admin/
│   │   ├── /dashboard/
│   │   │   └── page.tsx           # Main dashboard
│   │   ├── /topics/
│   │   │   ├── page.tsx           # Topics list
│   │   │   └── /[id]/
│   │   │       └── page.tsx       # Topic detail
│   │   ├── /affiliates/
│   │   │   ├── page.tsx           # Affiliates table
│   │   │   └── /[id]/
│   │   │       └── page.tsx       # Affiliate detail
│   │   ├── /pipeline/
│   │   │   └── page.tsx           # Kanban board
│   │   ├── /revenue/
│   │   │   └── page.tsx           # Revenue analytics
│   │   ├── /quality/
│   │   │   └── page.tsx           # Quality tracker
│   │   ├── /activity/
│   │   │   └── page.tsx           # Activity log
│   │   └── /settings/
│   │       └── page.tsx           # Settings
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing/login
│
├── /components/
│   ├── /ui/                       # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── /dashboard/
│   │   ├── ProgressCard.tsx
│   │   ├── RevenueChart.tsx
│   │   └── ActivityFeed.tsx
│   ├── /topics/
│   │   ├── TopicsTable.tsx
│   │   └── TopicForm.tsx
│   ├── /affiliates/
│   │   └── AffiliatesTable.tsx
│   └── /shared/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── StatusBadge.tsx
│
├── /lib/
│   ├── /db/
│   │   ├── schema.prisma          # Prisma schema
│   │   └── client.ts              # Prisma client instance
│   ├── /trpc/
│   │   ├── router.ts              # Main tRPC router
│   │   └── /routers/
│   │       ├── topics.ts
│   │       ├── affiliates.ts
│   │       ├── revenue.ts
│   │       └── quality.ts
│   ├── /utils/
│   │   ├── format.ts              # Format numbers, dates
│   │   └── validation.ts          # Zod schemas
│   └── /hooks/
│       ├── useTopics.ts           # React Query hooks
│       └── useAffiliates.ts
│
├── /prisma/
│   ├── schema.prisma              # Database schema
│   └── /migrations/
│       └── ...
│
├── /public/
│   └── /assets/
│       └── logo.png
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── .env.local                     # Environment variables
```

---

## 🔐 AUTHENTICATION & PERMISSIONS

### Roles:

**Admin (You):**
- Full access to everything
- Can create/edit/delete topics
- Can launch agents
- Can manage users

**Content Writer:**
- Read topics
- Edit content files
- Update content pipeline status
- View research (read-only)

**Designer:**
- Read topics
- Upload cover designs
- Update design pipeline status
- View content (read-only)

**Marketer:**
- Read all data
- Update marketing pipeline status
- Create blog posts
- Manage social media campaigns
- View analytics

### Implementation (Clerk):

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/login"],
  afterAuth(auth, req, evt) {
    // Redirect non-admin users
    if (!auth.userId && !isPublicRoute(req)) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

// lib/auth.ts
export function requireAdmin(user: User) {
  if (user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
}

// In tRPC procedures:
protectedProcedure
  .use(async ({ ctx, next }) => {
    requireAdmin(ctx.user);
    return next();
  })
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Phase 1: MVP (Week 1)
- [ ] Set up Next.js project
- [ ] Install dependencies (Prisma, tRPC, shadcn/ui)
- [ ] Create database schema
- [ ] Deploy PostgreSQL (Supabase)
- [ ] Set up authentication (Clerk)
- [ ] Build dashboard page (static data)
- [ ] Build topics table (read-only)
- [ ] Deploy to Vercel

### Phase 2: Core Features (Week 2)
- [ ] Connect to database
- [ ] Implement tRPC routers (topics, affiliates)
- [ ] Build topics CRUD
- [ ] Build affiliates table (with filters)
- [ ] Add activity log
- [ ] Add quality tracker

### Phase 3: Advanced Features (Week 3)
- [ ] Build pipeline Kanban board
- [ ] Add revenue analytics
- [ ] Implement agent triggers
- [ ] Add file upload (covers, PDFs)
- [ ] Create bulk actions

### Phase 4: Automation (Week 4)
- [ ] Sync with file system (read research files)
- [ ] Auto-update database when files change
- [ ] Email notifications
- [ ] Slack/Discord webhooks
- [ ] KDP API integration (sales data)

---

## 💰 COST ESTIMATE

### Hosting & Services (Monthly):
- **Vercel Pro:** $20/month (unlimited projects, analytics)
- **Supabase Pro:** $25/month (8GB database, 100GB storage)
- **Clerk Auth:** $25/month (10K monthly active users)
- **Domain:** $1/month (yit-admin.com)
- **Total:** ~$71/month

### Development (One-Time):
- **Your time:** 40-60 hours (if DIY)
- **Freelancer:** $2,000-4,000 (if outsourced)

**ROI:** If admin system saves 10 hours/month in manual tracking = $300/month value (at $30/hr) → 4.2x ROI

---

## 🎯 SUCCESS METRICS

### Admin System KPIs:
- **Time saved:** 10+ hours/week in manual tracking
- **Data accuracy:** 100% (vs 80% with spreadsheets)
- **User satisfaction:** 9/10 rating from team
- **Uptime:** 99.9%
- **Page load time:** <2 seconds

### Business KPIs (Tracked in System):
- **Books published:** 50/50 by Month 18
- **Total revenue:** $500K+ by Year 2
- **Affiliate signup rate:** 80% of cataloged programs
- **Quality consistency:** 95%+ validation rate across all topics

---

## 🔮 FUTURE ENHANCEMENTS

### Phase 5: AI Integrations
- GPT-4 integration: Auto-write first draft of research briefs
- Claude integration: Auto-validate sources for credibility
- AI content suggestions: "Your dropshipping brief could use more data on X"

### Phase 6: Public Platform
- Public-facing website (separate from admin)
- Research database (subscription model: $9.99/mo)
- Affiliate comparison tool (public, SEO optimized)
- Course reviews (Yelp for guru courses)

### Phase 7: Mobile App
- React Native app
- Push notifications for revenue milestones
- Mobile-friendly dashboards
- On-the-go content editing

---

**STATUS:** Architecture designed, ready to build
**Timeline:** 4 weeks to MVP, 8 weeks to full system
**Cost:** $71/month + development time
**ROI:** 4x+ in time savings + scalability for 50 books
