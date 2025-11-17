# AFFILIATE SCORING SPREADSHEET TEMPLATE
## Complete Google Sheets Structure for Affiliate Evaluation

**Purpose:** Systematically evaluate and rank affiliate programs for all 50 topics
**Format:** Can be copied directly to Google Sheets
**Update Frequency:** Monthly (track performance changes)

---

## 📊 SHEET 1: MASTER AFFILIATE PROGRAMS

**Columns:** A-O

```
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Program Name | Commission % | Cookie Duration | Approval Status | Conversion Rate % | Brand Relevance | Integration Difficulty | Approval Date | Current Balance | Monthly Avg | Commission Score | Conversion Score | Relevance Score | Overall Score | Status |
| Shopify Affiliate | 25% | 30 days | Approved | 4.5% | 9/10 | Easy | 10/1/25 | $450.00 | $150.00 | 2 | 2 | 2 | 9.5 | Active |
| ConvertKit | 30% | 60 days | Approved | 3.2% | 8/10 | Easy | 10/3/25 | $320.00 | $120.00 | 2 | 2 | 1.5 | 9.0 | Active |
| Teachable | 20% | 30 days | Approved | 2.8% | 8/10 | Medium | 10/5/25 | $280.00 | $85.00 | 1.5 | 1.5 | 1.5 | 8.2 | Active |
| Kajabi | 25% | 30 days | Pending | 3.1% | 7/10 | Medium | - | $0.00 | $0.00 | 2 | 1.5 | 1 | 7.5 | Pending |
| Stripe | 20% | 30 days | Approved | 5.2% | 9/10 | Easy | 10/2/25 | $520.00 | $200.00 | 1.5 | 2 | 2 | 9.0 | Active |
| [Program Name] | [X%] | [X days] | [Status] | [X%] | [X/10] | [Difficulty] | [Date] | $[Amount] | $[Amount] | [0-2] | [0-2] | [0-2] | [Score] | [Status] |
```

**Key Definitions:**

- **Commission %:** What Y-It earns per sale (higher is better)
- **Cookie Duration:** How long Y-It gets credit (30+ days optimal)
- **Approval Status:** Approved / Pending / Rejected
- **Conversion Rate %:** Estimated % of customers who purchase (historical data)
- **Brand Relevance:** 1-10 scale (how well does this fit the topic)
- **Integration Difficulty:** Easy / Medium / Hard (effort to integrate)
- **Commission Score:** 0-2 (2=30%+, 1=15-30%, 0=<15%)
- **Conversion Score:** 0-2 (2=>5%, 1=2-5%, 0=<2%)
- **Relevance Score:** 0-2 (2=Perfect fit, 1=Good fit, 0=Poor fit)
- **Overall Score:** Sum of all scores (max 10)
- **Status:** Active / Pending / Discontinued

---

## 📊 SHEET 2: AFFILIATE SCORING METHODOLOGY

**Reference guide for scoring consistency**

```
SCORING RUBRIC
==============

Commission Score (0-2):
  2 points: 30% or higher commission
  1 point:  15-29% commission
  0 points: Less than 15% commission

Conversion Rate Score (0-2):
  2 points: 5%+ conversion rate (exceptional)
  1 point:  2-4.9% conversion rate (good)
  0 points: Less than 2% conversion rate

Brand Relevance (0-2):
  2 points: Perfect fit for this topic
            (e.g., Shopify for Dropshipping)
  1 point:  Good fit (somewhat related)
            (e.g., ConvertKit for Email Monetization)
  0 points: Poor fit (tangential)
            (e.g., Crypto platform for Dropshipping)

Integration Difficulty (scoring note):
  Easy:   Can integrate in 1-2 hours
  Medium: Requires 4-8 hours of work
  Hard:   Requires 16+ hours or custom development

EXAMPLE SCORES
==============

Shopify (Dropshipping topic):
  • Commission: 25% → Score 2
  • Conversion: 4.5% → Score 2
  • Relevance: 9/10 (perfect fit) → Score 2
  • Difficulty: Easy
  • OVERALL: 9.5/10 → TIER 1 AFFILIATE

ConvertKit (Email Monetization topic):
  • Commission: 30% → Score 2
  • Conversion: 3.2% → Score 1
  • Relevance: 8/10 (good fit) → Score 1.5
  • Difficulty: Easy
  • OVERALL: 8.5/10 → TIER 1 AFFILIATE

Random Crypto Tool (Dropshipping topic):
  • Commission: 20% → Score 1.5
  • Conversion: 1.2% → Score 0
  • Relevance: 2/10 (poor fit) → Score 0
  • Difficulty: Medium
  • OVERALL: 1.5/10 → DISCONTINUE
```

---

## 📊 SHEET 3: BY-TOPIC AFFILIATE ANALYSIS

**Each topic gets its own analysis sheet**

**Example: Dropshipping Topic**

```
DROPSHIPPING - AFFILIATE PROGRAM RANKINGS
==========================================

Total Programs Evaluated:     78
Programs with Score 8+:        12 (Tier 1)
Programs with Score 5-7:       18 (Tier 2)
Programs with Score <5:        48 (Not recommended)

TOP 12 TIER 1 PROGRAMS (Recommended for Integration)
====================================================

Rank | Program | Score | Commission | Conversion | Chapters to Integrate | Annual Projection
-----|---------|-------|-----------|-----------|-----|---
1 | Shopify Affiliate | 9.5 | 25% | 4.5% | Ch2, Ch7 | $3,200 |
2 | Stripe | 9.0 | 20% | 5.2% | Ch2 | $2,800 |
3 | ConvertKit | 9.0 | 30% | 3.2% | Ch7 | $2,400 |
4 | Bluehost | 8.8 | 50%+ | 2.1% | Ch6, Ch7 | $1,800 |
5 | NameCheap | 8.5 | $88 per sale | 1.8% | Ch6 | $1,500 |
6 | WP Engine | 8.2 | $200/year + 20% | 1.4% | Ch6, Ch7 | $1,200 |
7 | Sumo | 8.0 | 30% | 2.8% | Ch1, Ch4 | $1,100 |
8 | Kajabi | 7.9 | 25% | 2.5% | Ch7 (alternatives) | $950 |
9 | Gumroad | 7.7 | 10% | 6.1% | Ch8 | $900 |
10 | Thinkific | 7.5 | 20% | 2.2% | Ch7 (alternatives) | $750 |
11 | Leadpages | 7.3 | 30% | 1.9% | Ch6, Ch8 | $680 |
12 | Mailchimp | 7.1 | 20% | 1.5% | Ch7 (alternatives) | $600 |

TIER 1 TOTAL ANNUAL PROJECTION: $17,980/year

TIER 2 PROGRAMS (Score 5-7) - Consider if Tier 1 saturated
==========================================================
Programs 13-30: Various scores 5.0-7.0
Potential additional: $8,000-12,000/year if integrated

NON-RECOMMENDED (Score <5)
==========================
Programs 31-78: Not worth integrating
(Low commission, poor conversion, poor relevance)
```

---

## 📊 SHEET 4: TOPIC × AFFILIATE MATRIX

**See which programs work best for each topic**

```
TOPIC AFFILIATE MATCHING MATRIX
================================

Rows: All 50 topics (organized by tier)
Columns: Top 30 affiliate programs
Values: 0-10 score (blank = not relevant)

EXAMPLE:
           Shopify | Stripe | ConvertKit | Teachable | Bluehost | [... 25 more]
Dropshipping    9.5 |    9.0 |        7.2 |       6.5 |      8.8 |
Amazon FBA      8.2 |    8.1 |        6.8 |       7.5 |      7.2 |
Print-on-Demand 7.8 |    7.5 |        6.2 |       5.8 |      7.0 |
YouTube         4.2 |    3.1 |        8.9 |       7.2 |      2.1 |
Course Creation 5.5 |    4.2 |        9.1 |       9.5 |      3.2 |
SMMA            6.8 |    5.9 |        7.8 |       6.2 |      7.5 |
[... 44 more]   ... |    ... |        ... |       ... |      ... |

HOW TO USE:
1. For each topic, identify which programs score 8+
2. Those are the "Top Programs" to integrate
3. Programs scoring 5-7 are secondary options
4. Programs scoring <5 should be ignored

BUILT-IN FEATURES:
- Automatically highlights top 12 per topic
- Calculates total programs per topic (for coverage)
- Identifies "power programs" (high score across many topics)
- Shows which topics have best affiliate potential
```

---

## 📊 SHEET 5: REVENUE PROJECTIONS

**Forecast affiliate revenue by topic and channel**

```
AFFILIATE REVENUE FORECAST
===========================

ASSUMPTION INPUTS (top of sheet):
- Monthly Customer Target: [X]
- Average Customer Lifecycle: [X months]
- Affiliate CTR (Click-Through Rate): [X%]
- Affiliate Conversion Rate: [X%]
- Average Commission per Sale: $[X]

TOPIC | Monthly Customers | Clicks to Affiliates | Conversions | Avg Commission | Annual Revenue
------|---|---|---|---|---
Dropshipping | 300 | 42 (14%) | 4 (9.5%) | $85 | $3,200 |
Amazon FBA | 250 | 35 (14%) | 3 (8.6%) | $72 | $2,160 |
Print-on-Demand | 200 | 28 (14%) | 2 (7.1%) | $58 | $1,400 |
YouTube | 250 | 38 (15%) | 3 (7.9%) | $45 | $1,620 |
Course Creation | 280 | 45 (16%) | 4 (8.9%) | $78 | $2,800 |
SMMA | 220 | 31 (14%) | 2 (6.5%) | $62 | $1,490 |
[... all 50 topics] | ... | ... | ... | ... | ... |

BATCH TOTALS:
Batch A (7 topics):     ~ $12,670/month affiliate revenue
Batch B (10 topics):    ~ $18,100/month affiliate revenue
[... through Batch J]

ALL 50 TOPICS:          ~ $35,000-45,000/month affiliate revenue
                        = $420K-540K annually
```

---

## 📊 SHEET 6: PERFORMANCE TRACKING (Monthly)

**Track actual performance vs projections**

```
DROPSHIPPING - MONTHLY PERFORMANCE LOG
=======================================

Month: November 2025

Program | Affiliate Clicks | Conversions | Commission Rate | Revenue | Status
---------|---|---|---|---|---
Shopify | 14 | 1 | 25% | $125 | Tracking well |
Stripe | 12 | 1 | 20% | $100 | Tracking well |
ConvertKit | 8 | 0 | 30% | $0 | Monitor (low CTR) |
Bluehost | 5 | 0 | 50%+ | $0 | Monitor (low CTR) |
[... other programs] | ... | ... | ... | ... | ... |

MONTHLY TOTALS:
Total Clicks: 85
Total Conversions: 4
Conversion Rate: 4.7% (ABOVE 4.5% target!)
Total Revenue: $542
Monthly Avg (YTD): $542

ANALYSIS:
- Shopify and Stripe performing above expectations
- ConvertKit and Bluehost underperforming on clicks
  → Consider: Better CTA placement, different pages
  → Action: Move ConvertKit CTA to web version sidebar
  → Action: Add Bluehost CTA to Chapter 6 (needs domain)

TOP PERFORMER: Shopify (12.5% conversion rate)
NEEDS IMPROVEMENT: Bluehost (0% conversion rate)
  → Hypothesis: Customers don't realize they need domain
  → Test: Add "Need a domain? Here's the best option" to Ch6

NEXT MONTH ADJUSTMENTS:
- Move ConvertKit link to web version (higher traffic)
- Add context to Bluehost CTA (explain why domain matters)
- Test Kajabi in Chapter 7 (not yet integrated)
- A/B test: Current CTA vs alternative CTA
```

---

## 🎯 IMPLEMENTATION GUIDE

### Step 1: Create Master Sheet in Google Drive

1. Create Google Sheet: "Y-It Affiliate Scoring System"
2. Create 6 tabs:
   - Sheet 1: Master Affiliate Programs
   - Sheet 2: Scoring Methodology
   - Sheet 3: By-Topic Analysis (Dropshipping example)
   - Sheet 4: Topic × Affiliate Matrix
   - Sheet 5: Revenue Projections
   - Sheet 6: Performance Tracking

### Step 2: Populate Initial Data

1. Sheet 1: List all ~500 affiliate programs (78 per topic × 50 topics)
2. Sheet 2: Keep scoring methodology reference
3. Sheet 3: Create one sheet per topic (copy template, customize)
4. Sheet 4: Create matrix with top 30-50 programs across all topics
5. Sheet 5: Input assumptions, calculate projections
6. Sheet 6: Create monthly tracking template

### Step 3: Integrate with Topic Folders

Each topic folder gets:
- Link to its affiliate analysis (Sheet 3 tab)
- Markdown export of [TOPIC]_AFFILIATE_OPPORTUNITIES_SCORED.md
- Recommended integrations by chapter
- Monthly performance tracking tab

### Step 4: Monthly Maintenance

1. Update Sheet 1 with new program approvals
2. Update Sheet 3 tabs with new data
3. Update Sheet 6 with monthly actual performance
4. Compare actual vs projected
5. Adjust integrations based on performance

---

## 🚀 QUICK START

**To use this template:**

1. Copy the Master Affiliate Programs table (Sheet 1) into Google Sheets
2. Fill in 10-20 affiliate programs you know
3. Score each using the methodology (Sheet 2)
4. Create topic-specific sheet (copy Sheet 3 template)
5. Identify top 12 programs per topic
6. Start integrating top 3-5 programs into chapters
7. Launch with Chapter 7 CTA first
8. Monitor performance (Sheet 6)
9. Optimize based on data

**Expected Timeline:**
- Week 1: Setup spreadsheet, populate programs
- Week 2-3: Score programs, integrate into 3 chapters per topic
- Week 4+: Track performance, optimize CTAs, add more programs

---

## 📈 SUCCESS METRICS

**Track these numbers:**

- **CTR (Click-Through Rate):** % of readers who click affiliate link
  - Target: 5-15% (depending on chapter)
  - Good: >10%
  - Excellent: >15%

- **Conversion Rate:** % of clicks that become sales
  - Target: 5-10%
  - Good: >8%
  - Excellent: >12%

- **Revenue per Customer:** Affiliate earnings ÷ book customers
  - Target: $5-15 per customer
  - Good: >$10
  - Excellent: >$15

- **Revenue per Topic:** Annual affiliate earnings
  - Target: $1,500-3,000 per topic
  - Good: >$2,000
  - Excellent: >$3,000

- **Top Program Performance:** Best affiliate program earnings
  - Target: 30-40% of total affiliate revenue
  - Good: >25%
  - Excellent: >35%

---

**File Version:** 1.0
**Status:** Ready to implement
**Last Updated:** November 16, 2025

