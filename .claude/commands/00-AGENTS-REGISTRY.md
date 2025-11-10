# Y-IT Agents System Registry

**Last Updated:** November 10, 2025
**Total Agents:** 21 (4 Core + 17 Supporting)
**System Status:** ✅ READY FOR DEPLOYMENT

---

## **QUICK START**

### Invoke an Agent
```bash
/agent-[agent-name] [arguments]

Examples:
/agent-research-validator dropshipping validate
/agent-topic-architect affiliate-marketing scaffold
/agent-metrics-designer kpis
```

### Agent Categories
- **Core Validation (4)** - Mandatory for project success
- **Content (4)** - Content creation and quality
- **Design (3)** - Visual design and branding
- **Infrastructure (5)** - Technical and operational systems
- **Analytics (3)** - Metrics and financial analysis
- **Marketing (3)** - Growth and sales strategies
- **Operations (2)** - Contractor management and compliance

---

## **CORE VALIDATION AGENTS (4)** ⭐

These agents must run first on any topic before proceeding to other phases.

### 1. `/agent-research-validator` 🔬
**Priority:** MANDATORY - First phase
**Purpose:** Validate research data, sources, and statistics
**Key Actions:** validate, sources, gaps, stats, timeline
**Deliverables:** Research validation report, source registry, gap roadmap
**Status:** ✅ Ready
**Questions Waiting:** Q1 (research status)

```
Invocation:
/agent-research-validator [topic] validate

Example:
/agent-research-validator dropshipping validate
```

---

### 2. `/agent-case-study-auditor` 📊
**Priority:** MANDATORY - First phase
**Purpose:** Validate and organize all case studies
**Key Actions:** audit, anonymize, extract, standardize, gaps
**Deliverables:** Case study validation matrix, failure mechanisms, standardization report
**Status:** ✅ Ready
**Questions Waiting:** Q1 (case study source clarity)

```
Invocation:
/agent-case-study-auditor [topic] audit

Example:
/agent-case-study-auditor dropshipping audit
```

---

### 3. `/agent-archival-curator` 📁
**Priority:** MANDATORY - Infrastructure
**Purpose:** Manage file structure, nomenclature, and archival system
**Key Actions:** structure, nomenclature, migrate, audit, metadata, versioning
**Deliverables:** File structure document, naming conventions handbook, migration checklist
**Status:** ✅ Ready
**Questions Waiting:** Q1 (structure preferences)

```
Invocation:
/agent-archival-curator [action] [scope]

Examples:
/agent-archival-curator structure global
/agent-archival-curator nomenclature topic
```

---

### 4. `/agent-topic-architect` 🏗️
**Priority:** MANDATORY - Content planning
**Purpose:** Organize topic content, chapters, and inline assets
**Key Actions:** scaffold, chapters, inline, dependencies, workflow
**Deliverables:** Topic scaffold document, chapter templates, inline asset manifest
**Status:** ✅ Ready
**Questions Waiting:** Q1 (topic and research status)

```
Invocation:
/agent-topic-architect [topic] [action]

Examples:
/agent-topic-architect dropshipping scaffold
/agent-topic-architect affiliate-marketing chapters
```

---

## **CONTENT AGENTS (4)**

Handle content creation, editing, and quality assurance.

### 5. `/agent-content-researcher` 📚
**Purpose:** Deep research on specific topics and compile findings
**Key Actions:** alternatives, competitive, data, case-studies, deep-dive
**When to Use:** Need additional research beyond core validation
**Status:** ✅ Ready

### 6. `/agent-editor-review` ✏️
**Purpose:** Edit, refine, and ensure manuscript quality
**Key Actions:** dev, copy, final, tone
**When to Use:** After first draft complete, before fact-checking
**Status:** ✅ Ready

### 7. `/agent-fact-checker` ✓
**Purpose:** Cross-reference all claims against source data
**Key Actions:** full, critical, statistics, quotes, spot
**When to Use:** Before final manuscript approval
**Status:** ✅ Ready

### 8. `/agent-voice-consistency` 🎤
**Purpose:** Maintain consistent satirical voice across books
**Key Actions:** full, satire, consistency, brand, tone-shift
**When to Use:** Editing phase and cross-topic audits
**Status:** ✅ Ready

---

## **DESIGN AGENTS (3)**

Handle visual design, assets, and brand consistency.

### 9. `/agent-visual-spec` 🎨
**Purpose:** Create detailed visual specifications for design
**Key Actions:** brief, cover, interior, typography, colors
**When to Use:** Before design phase starts
**Status:** ✅ Ready

### 10. `/agent-asset-generator` 🖼️
**Purpose:** Create and manage all design and multimedia assets
**Key Actions:** covers, illustrations, charts, photos, package
**When to Use:** During design execution phase
**Status:** ✅ Ready

### 11. `/agent-brand-auditor` 🏷️
**Purpose:** Ensure consistent brand identity across all 50 books
**Key Actions:** audit, guidelines, visual, voice, coverage
**When to Use:** Quarterly cross-topic audits
**Status:** ✅ Ready

---

## **INFRASTRUCTURE AGENTS (5)**

Handle technical systems, backups, deployment, and web research automation.

### 12. `/agent-backup-auditor` 💾
**Purpose:** Validate backup and disaster recovery systems
**Key Actions:** audit, recovery, test, health, optimization
**When to Use:** Monthly maintenance, before major milestones
**Status:** ✅ Ready

### 13. `/agent-deployment-orchestrator` 🚀
**Purpose:** Orchestrate book launches and multi-platform deployments
**Key Actions:** prepare, kdp, multi-format, schedule, rollback
**When to Use:** Ready to launch each topic
**Status:** ✅ Ready

### 14. `/agent-database-architect` 🗄️
**Purpose:** Design and optimize PostgreSQL for metrics and analytics
**Key Actions:** schema, queries, indexes, performance, scaling
**When to Use:** Platform development phase
**Status:** ✅ Ready

### 15. `/agent-infrastructure-validator` ✔️
**Purpose:** Validate all infrastructure components and production readiness
**Key Actions:** audit, vendor, architecture, readiness, scaling
**When to Use:** Pre-launch validation, production readiness gate
**Status:** ✅ Ready

### 16. `/agent-web-research-orchestrator` 🌐
**Purpose:** Orchestrate web scraping, real-time research, and image sourcing via MCP servers
**Key Actions:** scrape, monitor, gather, images, validate, orchestrate
**When to Use:** Current market research, competitor intelligence, image sourcing, data validation
**Status:** ✅ Ready
**MCP Dependencies:** brave-search, puppeteer, fetch, replicate, filesystem

```
Invocation:
/agent-web-research-orchestrator [task] [target]

Examples:
/agent-web-research-orchestrator scrape competitor-pricing dropshipping
/agent-web-research-orchestrator gather statistics "e-commerce failure rates 2024"
/agent-web-research-orchestrator images dropshipping warehouse,packages,shipping
/agent-web-research-orchestrator orchestrate dropshipping full-intel
```

**Key Features:**
- Real-time web scraping and data extraction
- AI image generation (Replicate FLUX, DALL-E)
- Free CC0 stock photo sourcing (Unsplash, Pexels, Pixabay)
- Multi-source research aggregation
- Automated competitor monitoring
- Commercial license verification

**Deliverables:**
- Scraped data packages (JSON/CSV/PostgreSQL)
- Research intelligence reports
- Image libraries with verified licenses
- Competitor monitoring dashboards

---

## **ANALYTICS AGENTS (3)**

Handle metrics, monitoring, and financial projections.

### 17. `/agent-metrics-designer` 📈
**Purpose:** Design KPIs and metrics dashboards
**Key Actions:** kpis, dashboard, tracking, goals, reporting
**When to Use:** Pre-launch, before Week 7 go-live
**Status:** ✅ Ready

### 18. `/agent-monitoring-setup` 🔔
**Purpose:** Configure monitoring, alerting, and notifications
**Key Actions:** setup, alerts, dashboards, notifications, testing
**When to Use:** Pre-launch, coordinate with metrics designer
**Status:** ✅ Ready

### 19. `/agent-revenue-modeler` 💰
**Purpose:** Create financial projections and profitability analysis
**Key Actions:** model, scenario, pricing, bundle, breakeven
**When to Use:** Financial planning, pricing decisions
**Status:** ✅ Ready

---

## **MARKETING AGENTS (3)**

Handle growth strategies, copy, and funnel optimization.

### 20. `/agent-copy-optimizer` ✍️
**Purpose:** Create and optimize marketing copy across all channels
**Key Actions:** product, email, landing, ads, social, test
**When to Use:** Before each marketing campaign
**Status:** ✅ Ready

### 21. `/agent-bundle-strategist` 📦
**Purpose:** Design bundling, pricing, and cross-sell strategies
**Key Actions:** design, pricing, cross-sell, promotion, abtest
**When to Use:** Pricing strategy, bundle design phase
**Status:** ✅ Ready

### 22. `/agent-lead-magnet-builder` 🧲
**Purpose:** Design and build AI-powered lead magnet system
**Key Actions:** design, ai-evaluator, funnel, copy, analytics
**When to Use:** Early setup, week 1-2 planning
**Status:** ✅ Ready

---

## **OPERATIONS AGENTS (2)**

Handle contractor management and legal compliance.

### 23. `/agent-contractor-workflows` 👥
**Purpose:** Design and manage contractor relationships
**Key Actions:** onboarding, communication, handoff, performance, sop
**When to Use:** Before hiring contractors
**Status:** ✅ Ready

### 24. `/agent-compliance-auditor` ⚖️
**Purpose:** Ensure legal compliance and manage contracts
**Key Actions:** audit, contracts, ftc, ip, risk
**When to Use:** Legal review, contract creation, pre-launch
**Status:** ✅ Ready

---

## **AGENT WORKFLOWS BY PROJECT PHASE**

### **PHASE 1: RESEARCH & VALIDATION (Week 1)**

**Mandatory Sequence:**
1. `/agent-research-validator [topic] validate`
   - Answer Q1 questions
   - Get validation report
2. `/agent-case-study-auditor [topic] audit`
   - Answer Q1 questions
   - Get audit report
3. `/agent-archival-curator structure global`
   - Answer Q1 on structure preferences
   - Get file structure design

**Supporting (as needed):**
- `/agent-content-researcher [topic] alternatives`
- `/agent-content-researcher [topic] competitive`

---

### **PHASE 2: CONTENT PLANNING (Week 1)**

**Mandatory Sequence:**
1. `/agent-topic-architect [topic] scaffold`
   - Answer Q1 questions
   - Get complete outline
2. `/agent-visual-spec [topic] brief`
   - Get design brief
3. `/agent-copy-optimizer [topic] product`
   - Get marketing copy

**Supporting:**
- `/agent-topic-architect [topic] chapters`
- `/agent-topic-architect [topic] inline`

---

### **PHASE 3: CONTENT CREATION (Weeks 1-2)**

**Content Creation:**
- Write 8 chapters (your task or external writer)
- Create inline assets (charts, callouts, worksheets)
- Create addendum (worksheets, resources, references)

**Parallel Design:**
- `/agent-asset-generator [topic] covers`
- `/agent-asset-generator [topic] illustrations`

---

### **PHASE 4: EDITING & REVIEW (Week 2)**

**Sequential:**
1. `/agent-editor-review [topic] dev`
   - Get developmental feedback
2. `/agent-editor-review [topic] copy`
   - Get copy-edited version
3. `/agent-voice-consistency [topic] full`
   - Get voice audit report
4. `/agent-fact-checker [topic] full`
   - Get fact-check report
5. `/agent-editor-review [topic] final`
   - Get final polish

---

### **PHASE 5: DESIGN (Week 2)**

**Sequential:**
1. Designer receives asset specs from Phase 2
2. `/agent-asset-generator [topic] package`
   - Verify final package ready
3. `/agent-brand-auditor audit` (quarterly)
   - Check brand consistency

---

### **PHASE 6: PRODUCTION & LAUNCH (Week 2-3)**

**Sequential:**
1. `/agent-deployment-orchestrator [topic] prepare`
   - Pre-deployment checklist
2. `/agent-deployment-orchestrator [topic] kdp`
   - KDP submission process
3. `/agent-deployment-orchestrator [topic] multi-format`
   - Multi-format deployment

---

### **PHASE 7: MONITORING & OPTIMIZATION (Week 7+)**

**Weekly:**
- `/agent-monitoring-setup alerts` (review alerts)
- `/agent-metrics-designer tracking` (log metrics)

**Monthly:**
- `/agent-revenue-modeler model` (review projections vs. actual)
- `/agent-backup-auditor test` (backup system test)

**Quarterly:**
- `/agent-brand-auditor coverage` (cross-topic audit)
- `/agent-infrastructure-validator audit` (full system audit)

---

## **AGENT RELATIONSHIP MAP**

```
CORE VALIDATION (Master)
├── Research Validator ←→ Case Study Auditor
├── Research Validator ←→ Fact Checker
├── Archival Curator ←→ All other agents (file organization)
└── Topic Architect ←→ Content agents

CONTENT PIPELINE
├── Content Researcher → Editor Review → Fact Checker → Voice Consistency
└── All feeds into Topic Architect structure

DESIGN PIPELINE
├── Visual Spec → Asset Generator → Brand Auditor
└── All coordinated with Topic Architect

INFRASTRUCTURE
├── Database Architect → Metrics Designer → Monitoring Setup
├── Backup Auditor ←→ Infrastructure Validator
└── All support Deployment Orchestrator

MARKETING
├── Copy Optimizer ←→ Bundle Strategist ←→ Lead Magnet Builder
├── All coordinated with Revenue Modeler
└── All tracked by Metrics Designer

OPERATIONS
├── Contractor Workflows → Compliance Auditor
└── Compliance Auditor ← All agents (legal review)
```

---

## **QUICK REFERENCE: WHO DOES WHAT**

| Task | Agent |
|------|-------|
| Validate research | Research Validator |
| Audit case studies | Case Study Auditor |
| File organization | Archival Curator |
| Topic planning | Topic Architect |
| Additional research | Content Researcher |
| Edit manuscript | Editor Review |
| Check facts | Fact Checker |
| Verify tone | Voice Consistency |
| Design specs | Visual Spec |
| Manage assets | Asset Generator |
| Brand consistency | Brand Auditor |
| Test backups | Backup Auditor |
| Launch book | Deployment Orchestrator |
| Database schema | Database Architect |
| System validation | Infrastructure Validator |
| Define KPIs | Metrics Designer |
| Configure monitoring | Monitoring Setup |
| Financial projections | Revenue Modeler |
| Marketing copy | Copy Optimizer |
| Bundling strategy | Bundle Strategist |
| Lead magnet system | Lead Magnet Builder |
| Contractor management | Contractor Workflows |
| Legal compliance | Compliance Auditor |

---

## **AGENT STATUS DASHBOARD**

| Agent | Category | Status | Ready For | Q1 Status |
|-------|----------|--------|-----------|-----------|
| Research Validator | Core | ✅ Ready | Phase 1 | Q1 Waiting |
| Case Study Auditor | Core | ✅ Ready | Phase 1 | Q1 Waiting |
| Archival Curator | Core | ✅ Ready | Phase 1 | Q1 Waiting |
| Topic Architect | Core | ✅ Ready | Phase 1 | Q1 Waiting |
| Content Researcher | Content | ✅ Ready | Phase 1-2 | Standalone |
| Editor Review | Content | ✅ Ready | Phase 4 | Standalone |
| Fact Checker | Content | ✅ Ready | Phase 4 | Standalone |
| Voice Consistency | Content | ✅ Ready | Phase 4 | Standalone |
| Visual Spec | Design | ✅ Ready | Phase 2 | Standalone |
| Asset Generator | Design | ✅ Ready | Phase 3 | Standalone |
| Brand Auditor | Design | ✅ Ready | Phase 5+ | Standalone |
| Backup Auditor | Infrastructure | ✅ Ready | Ongoing | Standalone |
| Deployment Orchestrator | Infrastructure | ✅ Ready | Phase 6 | Standalone |
| Database Architect | Infrastructure | ✅ Ready | Phase 1 | Standalone |
| Infrastructure Validator | Infrastructure | ✅ Ready | Phase 6 | Standalone |
| Metrics Designer | Analytics | ✅ Ready | Phase 6 | Standalone |
| Monitoring Setup | Analytics | ✅ Ready | Phase 6 | Standalone |
| Revenue Modeler | Analytics | ✅ Ready | Phase 1 | Standalone |
| Copy Optimizer | Marketing | ✅ Ready | Phase 2 | Standalone |
| Bundle Strategist | Marketing | ✅ Ready | Phase 2 | Standalone |
| Lead Magnet Builder | Marketing | ✅ Ready | Phase 1 | Standalone |
| Contractor Workflows | Operations | ✅ Ready | Pre-Phase 1 | Standalone |
| Compliance Auditor | Operations | ✅ Ready | Pre-Phase 1 | Standalone |

---

## **GETTING STARTED**

### For Your First Topic (Dropshipping):

1. **Day 1-2: Core Validation**
   ```bash
   /agent-research-validator dropshipping validate
   /agent-case-study-auditor dropshipping audit
   /agent-archival-curator structure global
   /agent-topic-architect dropshipping scaffold
   ```

2. **Day 3: Planning**
   ```bash
   /agent-visual-spec dropshipping brief
   /agent-copy-optimizer dropshipping product
   /agent-bundle-strategist design
   /agent-lead-magnet-builder design
   ```

3. **Day 4-7: Content Creation**
   - Write 8 chapters
   - Create inline assets
   - Design cover/interior

4. **Day 8-10: Review**
   ```bash
   /agent-editor-review dropshipping dev
   /agent-editor-review dropshipping copy
   /agent-voice-consistency dropshipping full
   /agent-fact-checker dropshipping full
   ```

5. **Day 11-14: Design & Production**
   - Finalize design
   - ```bash
   /agent-deployment-orchestrator dropshipping prepare
   /agent-deployment-orchestrator dropshipping kdp
   ```

6. **Day 15-21: Launch & Monitor**
   ```bash
   /agent-metrics-designer kpis
   /agent-monitoring-setup setup
   /agent-revenue-modeler model
   ```

---

## **SUPPORT & MAINTENANCE**

- **Agent Updates:** Updated files in `.claude/commands/` directory
- **Questions:** Each agent has built-in Q&A system
- **Customization:** Agents are topic-agnostic, customizable per topic
- **Scaling:** All agents designed to scale to 50 topics
- **Integration:** All agents reference common archival structure

---

## **NEXT STEPS**

1. Answer Q1 questions for core validation agents
2. Resume Agent #1 (Research Validator) with Q1 answers
3. Follow sequential workflow for first topic
4. Monitor agent performance and refine as needed
5. Scale to remaining 49 topics using proven workflow

---

**System Version:** 1.0
**Last Updated:** November 9, 2025
**Maintenance Contact:** You (project owner)
