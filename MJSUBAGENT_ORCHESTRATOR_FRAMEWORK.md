# MULTI-AGENT ORCHESTRATION FRAMEWORK
## Content Creation & Refinement Pipeline

**Role:** You are the ORCHESTRATOR
**System:** Two parallel agent legs (Creation + Refinement)
**Goal:** Mass content production with quality gates
**Scale:** 7 Batch A topics → 50 total topics

---

## SYSTEM ARCHITECTURE

```
YOU (ORCHESTRATOR)
├── Route tasks
├── Manage workflow
├── Quality gates
└── Decision making

LEG 1: CONTENT CREATION AGENT
├── Research brief analysis
├── Case study extraction
├── Page copy generation
├── Module development
└── Content assembly

LEG 2: REFINEMENT & QA AGENT
├── Copy editing
├── Tone/voice alignment
├── Fact-checking
├── KDP compliance review
├── Final approval
```

---

## LEG 1: CONTENT CREATION AGENT

### Role
**Create all raw content for 24-page KDP books in parallel**

### Input
- Research brief (populated)
- Case studies (11 available)
- KDP execution plan
- Y-It tone guide

### Process

#### Step 1: Research Analysis (Per Topic)
```
INPUT: 01_RESEARCH_BRIEF.md (e.g., amazon-fba)
OUTPUT: Content outline with key data points

TASK:
- Extract 8 key statistics
- Identify 7-8 failure mechanisms
- Pull 3-4 guru quotes
- Flag 5-6 best case studies for KDP version
- Create module transitions
```

#### Step 2: Case Study Compression (Per Topic)
```
INPUT: 11 archived case studies
OUTPUT: 7 compressed case studies (200 words each)

TASK:
- Select most relevant 7 (diversity across archetypes)
- Compress from 1,200 → 200 words
- Preserve failure mechanism clarity
- Anonymize completely
- Extract 1-line punchline per case
```

#### Step 3: Module Content Generation (8 modules per topic)
```
INPUT: Research brief + case studies + execution plan
OUTPUT: Raw copy for all 24 pages

MODULE ASSIGNMENTS:
- Module 1 (Pages 4-5): Dream vs. Data
  * Extract guru claims from research
  * Pull contradictory statistics
  * Write comparison narrative

- Module 2 (Pages 6-7): How It's Sold
  * Create sales funnel description
  * Timeline narrative (Month 0 → Month 6)
  * Emotional journey documentation

- Module 3 (Pages 8-9): Hidden Costs
  * Guru cost estimates (from execution plan)
  * Real cost breakdown (from research)
  * Waterfall narrative

- Module 4 (Pages 10-11): Failure Points
  * 8 distinct failure mechanisms (from research)
  * Timeline placement for each
  * Financial impact per mechanism

- Module 5 (Pages 12-15): Case Studies
  * 7 compressed case studies (from step 2)
  * Character portraits (anonymized names)
  * Failure archetype labels

- Module 6 (Pages 16-17): The Numbers
  * Statistical summary (from research)
  * Income distribution breakdown
  * Survival curve narrative

- Module 7 (Pages 18-19): The Verdict
  * Decision matrix creation
  * Alternative paths comparison
  * Success probability calculation

- Module 8 (Pages 20-21): Body Count
  * Final statistics visualization
  * Call-to-action narrative
  * Resource linking
```

#### Step 4: Copy Assembly (Per Topic)
```
INPUT: 8 modules of raw content
OUTPUT: Complete 24-page manuscript (raw draft)

TASK:
- Organize modules in order
- Add page breaks
- Create temporary callout boxes
- Flag image placement areas
- Note visualization requirements
- Document word counts per page
```

### Timeline Per Topic
- Step 1 (Analysis): 30 minutes
- Step 2 (Case studies): 1 hour
- Step 3 (Modules): 3 hours
- Step 4 (Assembly): 1 hour
- **Total: 5.5 hours per topic**
- **All 7 topics parallel: ~6 hours wall time**

### Deliverables
- 7 raw manuscripts (24 pages each)
- 7 case study packs (7 compressed stories per topic)
- 7 data/statistics bundles
- 7 image/visualization requirement lists

---

## LEG 2: REFINEMENT & QA AGENT

### Role
**Polish, verify, and quality-gate all content before design**

### Input
- Raw manuscripts (from Leg 1)
- Research briefs (source verification)
- Y-It brand voice guide
- KDP specifications

### Process

#### Step 1: Copy Editing (Per Topic)
```
REVIEW: All 24 pages of raw content

EDIT FOR:
- Grammar & punctuation
- Sentence structure clarity
- Paragraph flow
- Reading level (11-12 grade)
- Word count targets (200-250 words max per full page)
- Callout box brevity (30-50 words max)

OUTPUT:
- Clean, grammar-correct manuscript
- Editorial notes on any rewrites needed
```

#### Step 2: Tone & Voice Alignment (Per Topic)
```
REVIEW: Every section for Y-It voice consistency

Y-It VOICE CHECKLIST:
- ✓ Sarcasm/humor present (not mean-spirited)
- ✓ Data-driven (every claim has source)
- ✓ Honest (admits complexity)
- ✓ Empathetic (understands why people try)
- ✓ No shame (failures are structural, not personal)
- ✓ Callouts punchy (1-2 sentence max for power)
- ✓ Transitions smooth (flows between modules)
- ✓ Urgency without pressure (honest assessment, not FUD)

TONE VIOLATIONS TO FLAG:
- ✗ "You're stupid for trying this"
- ✗ "Only losers fail" (shame language)
- ✗ "Never try this" (absolutist)
- ✗ "Trust me bro" (unsourced claims)
- ✗ Dry/academic (boring)
- ✗ Fake pessimism (cynical for clicks)

OUTPUT:
- Tone-corrected manuscript
- Voice alignment notes
```

#### Step 3: Fact-Checking (Per Topic)
```
VERIFY: All statistics against original research brief

CHECKLIST:
- [ ] Market size statistic verified (3+ sources in brief)
- [ ] Failure rate sourced and cited
- [ ] Cost breakdown matches research findings
- [ ] Income distribution data matches research
- [ ] Timeline to failure realistic (matches case studies)
- [ ] Guru quotes accurate (pull from research)
- [ ] Case study failure mechanisms align with research
- [ ] No contradictory statistics on same page
- [ ] Numbers formatted consistently

FLAG ANY:
- Unsourced statistics
- Numbers that don't match brief
- Conflicting data presented as fact
- Missing context around statistics

OUTPUT:
- Fact-checked, source-verified manuscript
- Any corrections required from Leg 1
```

#### Step 4: KDP Compliance Review (Per Topic)
```
VERIFY: Content meets KDP guidelines

COMPLIANCE CHECKLIST:
- [ ] No explicit illegal activity promotion
- [ ] No medical/financial advice without disclaimers
- [ ] Copyright-safe language (no trademark violations)
- [ ] No defamation of named individuals
- [ ] Case studies anonymized completely
- [ ] No misleading income claims
- [ ] Proper disclaimers where needed
- [ ] No hate speech or discrimination
- [ ] Affiliate disclosure ready (if needed)
- [ ] FTC compliance (no fake testimonials)

OUTPUT:
- Compliance-verified manuscript
- Any required disclaimer additions
- Legal review notes
```

#### Step 5: Final Approval (Per Topic)
```
GATE: Manuscript ready for design?

FINAL CHECKLIST:
- [ ] Copy editing complete
- [ ] Tone/voice aligned
- [ ] All facts verified
- [ ] KDP compliant
- [ ] Word counts optimized per page
- [ ] All image/chart requirements documented
- [ ] Callout boxes finalized
- [ ] Case studies compressed
- [ ] Transitions smooth
- [ ] Punchlines land correctly

DECISION:
- ✅ APPROVED → Send to design
- 🔄 REVISIONS NEEDED → Back to Leg 1
- ❌ MAJOR ISSUES → Escalate to Orchestrator
```

### Timeline Per Topic
- Step 1 (Editing): 1 hour
- Step 2 (Voice): 1 hour
- Step 3 (Fact-check): 1.5 hours
- Step 4 (Compliance): 1 hour
- Step 5 (Approval): 30 minutes
- **Total: 5 hours per topic**
- **All 7 topics parallel: ~5-6 hours wall time**

### Deliverables
- 7 final, approved manuscripts
- 7 fact-check reports
- 7 compliance clearance forms
- 7 design-ready content packs

---

## ORCHESTRATOR WORKFLOW (YOU)

### Role
**Route tasks between legs, make decisions, manage bottlenecks**

### Daily Standup (5 minutes)
```
LEG 1 (Content Creation):
- What's done: [topics completed]
- What's blocked: [waiting on?]
- What's next: [topics in progress]

LEG 2 (Refinement):
- What's done: [topics approved]
- What's blocked: [pending review?]
- What's next: [topics in review]

ORCHESTRATOR DECISIONS:
- Route new topics to Leg 1?
- Route completed work to Leg 2?
- Any bottlenecks to resolve?
- Any escalations needed?
```

### Task Routing Matrix

```
SCENARIO 1: Leg 1 finishes Amazon FBA content
ACTION:
→ Route to Leg 2 immediately
→ Leg 1 starts Print-on-Demand content
→ Parallel processing continues

SCENARIO 2: Leg 2 finds fact errors in Dropshipping
ACTION:
→ Flag specific issues
→ Route back to Leg 1 for corrections
→ Leg 2 continues with next topic
→ Once corrected, re-review before approval

SCENARIO 3: Both legs idle
ACTION:
→ Orchestrator escalates blockers
→ Prioritize bottleneck removal
→ Get both legs moving again

SCENARIO 4: One leg ahead of other
ACTION:
→ Leg 1 (faster creation) starts next batch topics
→ OR Leg 2 (slower review) gets second pair of eyes
→ Keep both moving
```

### Quality Gates (Orchestrator Authority)

**GATE 1: Content Creation Output**
- Manuscript meets minimum word count per page
- All 8 modules present
- Case studies compressed
- Image requirements documented
→ Route to Leg 2 if PASS
→ Send back to Leg 1 if FAIL

**GATE 2: Refinement Output**
- Fact-checking complete
- Tone/voice aligned
- KDP compliant
- Final approval signed
→ Route to design if PASS
→ Send back to Leg 1 if major issues
→ Leg 1 makes minor edits if small issues

**GATE 3: Design Readiness**
- Manuscript + case studies received
- Design brief created
- InDesign template ready
→ Release to designer if PASS
→ Flag dependencies if blockers

### Decision Framework

```
QUESTION: Is content good enough for design?

CRITERIA:
✓ No factual errors
✓ Y-It voice consistent
✓ KDP compliant
✓ Word counts correct
✓ Case studies compressed
✓ All modules present

DECISION:
- All 5 ✓: APPROVE
- 4 ✓, 1 issue: CONDITIONAL (minor edits OK)
- 3 ✓, 2 issues: REVISIONS NEEDED
- <3 ✓: REJECT (back to Leg 1)
```

---

## PARALLEL EXECUTION EXAMPLE

### Timeline: 7 Batch A Topics (Concurrent)

```
DAY 1:

TIME 0:00 → LEG 1 STARTS DROPSHIPPING
           - Analysis (30 min)
           - Case studies (1 hour)
           - Modules (3 hours)
           - Assembly (1 hour)
           - Status: 30% done

TIME 2:00 → LEG 2 STARTS DROPSHIPPING
           (From archive - already has case studies)
           - Copy editing (1 hour)
           - Voice alignment (1 hour)
           - Fact-checking (1.5 hours)

TIME 5:30 → LEG 1 FINISHES DROPSHIPPING
           ORCHESTRATOR ROUTES TO DESIGN
           LEG 1 STARTS AMAZON FBA

TIME 7:00 → LEG 2 FINISHES DROPSHIPPING
           ORCHESTRATOR APPROVES FOR DESIGN
           LEG 2 STARTS AMAZON FBA REVIEW

TIME 10:30 → LEG 1 FINISHES AMAZON FBA
            ORCHESTRATOR ROUTES TO LEG 2
            LEG 1 STARTS PRINT-ON-DEMAND

TIME 12:00 → LEG 2 FINISHES AMAZON FBA
            ORCHESTRATOR APPROVES
            LEG 2 STARTS PRINT-ON-DEMAND REVIEW

RESULT: Both legs continuously working
        New topics flowing to design queue
        No idle time
        Parallel throughput: ~2 topics/day per leg
```

### 7-Day Timeline to Completion
```
DAY 1: Dropshipping content → design (approved by noon)
DAY 2: Amazon FBA content → design + Affiliate Marketing in creation
DAY 3: Print-on-Demand → design + Course Creation in creation
DAY 4: Course Creation → design + SMMA in creation
DAY 5: Affiliate Marketing → design + YouTube in creation
DAY 6: SMMA → design + remaining topics finalized
DAY 7: YouTube → design + all 7 approved + design queue full

ALL 7 TOPICS: Content creation + refinement complete by end of Day 7
READY FOR DESIGN: Queue of 7 approved, ready-to-design manuscripts
```

---

## COMMUNICATION PROTOCOL

### LEG 1 → ORCHESTRATOR
**Daily Update:**
"[Topic] content assembly complete.
Word count: XXX pages.
Issues: [any blockers?]
Next: [next topic starting]"

### LEG 2 → ORCHESTRATOR
**Daily Update:**
"[Topic] refinement complete.
Status: APPROVED / REVISIONS NEEDED / MAJOR ISSUES
Issues: [what needs fixing?]
Next: [next topic starting]"

### ORCHESTRATOR → LEG 1 (If revisions needed)
"[Topic] needs corrections:
1. [Specific issue with location]
2. [Specific issue with location]
Expected return: [date]"

### ORCHESTRATOR → LEG 2 (Approval decision)
"[Topic] APPROVED for design.
Design brief: [file]
Designer contact: [info]
Timeline: [target date]"

---

## SCALING BEYOND BATCH A

### Current (7 Topics):
```
Leg 1: 1 agent (or person) handling content creation
Leg 2: 1 agent (or person) handling refinement
Orchestrator: You managing flow
Speed: 2-3 topics/day
Timeline: 3-4 days for all 7
```

### Scale to 50 Topics:
```
Leg 1: 2-3 agents (parallel teams)
       → 5-6 topics/day creation
Leg 2: 2 agents (parallel review teams)
       → 4-5 topics/day refinement
Orchestrator: You managing both teams
Speed: 4-5 topics/day throughput
Timeline: 10-12 days for all 50
```

---

## METRICS TO TRACK

### Leg 1 (Content Creation)
- Topics started per day
- Topics completed per day
- Average time per topic
- Quality gate pass rate
- Major revisions needed

### Leg 2 (Refinement)
- Topics reviewed per day
- Approval rate (first pass)
- Revision requests
- Average time per topic
- Fact errors caught

### Orchestrator
- Total topics in queue
- Topics approved for design
- Bottlenecks identified
- Decision turnaround time
- Overall velocity (topics/day)

---

## CONTINGENCY PLANS

### If Leg 1 gets ahead
```
OPTIONS:
1. Leg 1 starts Phase 0 queued topics
2. Leg 1 creates expanded versions (40+ page)
3. Leg 1 creates companion digital content
4. Leg 1 waits (buffer = good)
```

### If Leg 2 gets behind
```
OPTIONS:
1. Bring in second reviewer for Leg 2
2. Leg 1 self-edits (rough pass) before Leg 2
3. Combine fact-check + tone into single pass
4. Prioritize highest-value topics first
```

### If design queue backs up
```
OPTIONS:
1. Parallelize designer (multiple files)
2. Batch design work (create template variations)
3. Content team pauses (good checkpoint)
4. Pre-design prep (gather images, create charts)
```

---

## SUCCESS CRITERIA

✅ **Content Creation Leg:**
- 7 topics content complete in <1 week
- Minimal revision requests from Leg 2
- Case studies properly compressed
- All data sourced correctly

✅ **Refinement Leg:**
- 100% fact accuracy
- Y-It voice consistent across all topics
- Zero KDP compliance issues
- Quick turnaround (5 hours per topic)

✅ **Orchestrator:**
- Smooth workflow with no blockers
- Clear communication between legs
- Quality gates maintained
- All 7 topics approved by deadline

✅ **Overall System:**
- 7 design-ready manuscripts in hand
- Design queue full and ready
- No rework needed post-approval
- Ready to move to InDesign phase

---

## NEXT STEPS

**TODAY:**
1. Confirm Leg 1 starts on [next topic]
2. Confirm Leg 2 starts on [topic to review]
3. You (Orchestrator) monitor flow
4. Flag any bottlenecks

**DAILY:**
- Morning standup (5 min)
- Route completed work
- Unblock any issues
- Approve for design

**BY END OF WEEK:**
- All 7 Batch A topics content-complete
- All 7 approved for design
- Design queue full
- Next batch (Phase 0) ready to start

---

**Framework Ready: Start delegating to both legs**

