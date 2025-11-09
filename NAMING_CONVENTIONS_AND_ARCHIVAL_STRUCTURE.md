# Y-IT Naming Conventions and Archival Structure

**Last Updated:** November 9, 2025
**Version:** 1.0
**Responsibility:** Archival Curator Agent

---

## **PROJECT NOMENCLATURE STANDARDS**

### Topic Slugs (Primary Identifier)

All topics use a consistent slug format throughout the project.

**Format Rules:**
- Lowercase letters only
- Hyphens to separate words (no spaces, no underscores)
- 2-3 words max
- Descriptive and concise
- Globally unique

**Examples:**
```
✅ dropshipping
✅ affiliate-marketing
✅ course-creation
✅ print-on-demand
✅ freelancing
✅ niche-sites
✅ personal-branding
✅ community-building
✅ saas-startup
✅ e-commerce
```

**Invalid Examples:**
```
❌ dropshipping_business (underscore)
❌ Dropshipping (capital)
❌ dropshipping business (space)
❌ dropshipping-business-guide (4 words)
```

### Topic Slug Registry

**Master Registry Location:** `/archives/00-METADATA/TOPIC_SLUG_REGISTRY.md`

**Format:**
```markdown
# Y-IT Topic Slug Registry

| Slug | Full Title | Status | Batch | Notes |
|------|-----------|--------|-------|-------|
| dropshipping | Dropshipping: Why It Fails & What Works | Live | A | Highest priority |
| affiliate-marketing | Affiliate Marketing: The False Promise | In Progress | A | |
| course-creation | Course Creation: Why Gurus Lie | Queued | A | |
| print-on-demand | Print-on-Demand: Scale Myth | Queued | B | |
| [...]| | | | |
```

---

## **COMPLETE ARCHIVAL STRUCTURE**

### Root Directory Architecture

```
/Y-it-nano/
│
├── /archives/                           # MASTER ARCHIVAL SYSTEM
│   │
│   ├── /00-METADATA/                    # System metadata and registry
│   │   ├── PROJECT_TAXONOMY.md
│   │   ├── NAMING_CONVENTIONS.md
│   │   ├── TOPIC_SLUG_REGISTRY.md
│   │   ├── FILE_REGISTRY.md
│   │   └── ARCHIVAL_STANDARDS.md
│   │
│   ├── /01-RESEARCH/                    # Research phase archives
│   │   ├── /dropshipping/
│   │   ├── /affiliate-marketing/
│   │   └── /[50-topic-directories]/
│   │       ├── 01_RESEARCH_BRIEF.md
│   │       ├── 02_SOURCE_REGISTRY.md
│   │       ├── 03_DATA_VALIDATION.md
│   │       ├── 04_GURU_LANDSCAPE.md
│   │       └── /case-studies/
│   │           ├── [TOPIC]_CS_001_[Name].md
│   │           ├── [TOPIC]_CS_002_[Name].md
│   │           └── [TOPIC]_CASE_STUDY_AUDIT_REPORT.md
│   │
│   ├── /02-CONTENT/                     # Content phase archives
│   │   ├── /dropshipping/
│   │   └── /[50-topic-directories]/
│   │       ├── 01_OUTLINE.md
│   │       ├── 02_DRAFT_FULL.md
│   │       ├── 03_CHAPTERS/
│   │       │   ├── DROPSHIPPING_CHAPTER_1_THE_LIE.md
│   │       │   ├── DROPSHIPPING_CHAPTER_2_THE_MATH.md
│   │       │   └── [... chapters 3-8 ...]
│   │       ├── 04_MANUSCRIPT_DRAFT_v1.0.md
│   │       ├── 05_MANUSCRIPT_DRAFT_v1.1.md
│   │       ├── 06_MANUSCRIPT_FINAL_v1.0.md
│   │       ├── /inline-assets/
│   │       │   ├── CHARTS_STATISTICS.md
│   │       │   ├── CALLOUT_BOXES.md
│   │       │   └── WORKSHEETS_FRAMEWORKS.md
│   │       └── /addendum/
│   │           ├── RESOURCES_REFERENCES.md
│   │           └── WORKSHEETS.md
│   │
│   ├── /03-DESIGN/                      # Design phase archives
│   │   ├── /dropshipping/
│   │   └── /[50-topic-directories]/
│   │       ├── 01_DESIGN_BRIEF.md
│   │       ├── 02_VISUAL_SPECS.md
│   │       ├── 03_COLOR_PALETTE.md
│   │       ├── 04_TYPOGRAPHY_GUIDE.md
│   │       ├── /mockups/
│   │       │   ├── DROPSHIPPING_COVER_MOCKUP_v1.pdf
│   │       │   ├── DROPSHIPPING_INTERIOR_MOCKUP_v1.pdf
│   │       │   └── DROPSHIPPING_LAYOUT_GRID.pdf
│   │       └── /production/
│   │           ├── DROPSHIPPING_COVER_FINAL.pdf
│   │           ├── DROPSHIPPING_INTERIOR_FINAL.pdf
│   │           └── DROPSHIPPING_KDP_PACKAGE.zip
│   │
│   ├── /04-PRODUCTION/                  # Production and launch phase
│   │   ├── /dropshipping/
│   │   └── /[50-topic-directories]/
│   │       ├── 01_PRODUCTION_CHECKLIST.md
│   │       ├── 02_KDP_SUBMISSION.md
│   │       ├── 03_AMAZON_LISTING.md
│   │       ├── 04_LAUNCH_RECORD.md
│   │       └── /fulfillment/
│   │           ├── PRINT_ISBN.txt
│   │           ├── DIGITAL_ASIN.txt
│   │           └── WEB_URL.txt
│   │
│   ├── /05-METRICS/                     # Performance and metrics
│   │   ├── /dropshipping/
│   │   └── /[50-topic-directories]/
│   │       ├── SALES_RECORD.md
│   │       ├── RATING_FEEDBACK.md
│   │       ├── PERFORMANCE_ANALYSIS.md
│   │       └── /weekly/
│   │           ├── WEEK_7_SALES.md
│   │           ├── WEEK_8_SALES.md
│   │           └── [... continuing ...]
│   │
│   └── /06-SUPPORT/                     # Supporting systems
│       ├── /contracts/
│       │   ├── CONTRACTOR_AGREEMENT_TEMPLATE.md
│       │   ├── NDA_TEMPLATE.md
│       │   └── /executed/
│       │
│       ├── /templates/
│       │   ├── RESEARCH_ENGINE_UNIVERSAL.md
│       │   ├── CASE_STUDY_TEMPLATE.md
│       │   ├── CONTENT_OUTLINE_TEMPLATE.md
│       │   ├── DESIGN_BRIEF_TEMPLATE.md
│       │   └── /email-templates/
│       │
│       ├── /infrastructure/
│       │   ├── BACKUP_SYSTEM.md
│       │   ├── DATABASE_SCHEMA.md
│       │   └── MONITORING_CONFIG.md
│       │
│       └── /tools/
│           ├── AI_EVALUATOR_SPEC.md
│           └── ANALYTICS_DASHBOARD_CONFIG.md
│
├── /projects/                           # Active work in progress
│   ├── /batch-a/                        # 35 books for Week 7 launch
│   │   ├── /dropshipping/
│   │   ├── /affiliate-marketing/
│   │   ├── /course-creation/
│   │   └── [... 32 more topics ...]
│   │
│   ├── /batch-b/                        # 15 books for Week 13+ scaling
│   │   └── [empty until Phase 2]
│   │
│   └── /research-queue/                 # Topics queued for research
│
├── /templates/                          # Reusable templates (master copies)
│   ├── RESEARCH_ENGINE_UNIVERSAL.md
│   ├── CASE_STUDY_TEMPLATE.md
│   ├── CONTENT_OUTLINE_TEMPLATE.md
│   └── DESIGN_BRIEF_TEMPLATE.md
│
├── /docs/                               # Strategic documentation
│   ├── Claude.md                        # Master project context
│   ├── EXECUTION_ROADMAP.md
│   ├── FINANCIAL_MODEL.md
│   └── [... other strategic docs ...]
│
└── .claude/                             # Claude Code configuration
    └── /commands/                       # Slash commands (20 agents)
        ├── 00-AGENTS-REGISTRY.md
        ├── agent-research-validator.md
        ├── agent-case-study-auditor.md
        ├── [... 18 more agents ...]
        └── agent-compliance-auditor.md
```

---

## **FILE NAMING CONVENTIONS**

### Phase Files (Sequential Numbering)

**Format:** `[NUMBER]_[PHASE]_[DESCRIPTOR].md`

**Numbers (Sequential):**
```
01 - Research phase
02 - Content phase
03 - Design phase
04 - Production phase
05 - Metrics/Performance
06 - Support/Reference
```

**Examples:**
```
✅ 01_RESEARCH_BRIEF.md
✅ 02_SOURCE_REGISTRY.md
✅ 03_DATA_VALIDATION.md
✅ 04_GURU_LANDSCAPE.md
❌ 1_RESEARCH_BRIEF.md (missing leading zero)
❌ RESEARCH_BRIEF_01.md (wrong order)
```

### Topic-Specific Files

**Format:** `[TOPIC_SLUG]_[DESCRIPTOR]_v[VERSION].md`

**Examples:**
```
✅ DROPSHIPPING_CHAPTER_1_THE_LIE.md
✅ DROPSHIPPING_CASE_STUDY_001_TechEnthusiast.md
✅ DROPSHIPPING_MANUSCRIPT_FINAL_v1.0.md
✅ DROPSHIPPING_DESIGN_BRIEF.md
❌ dropshipping_chapter_1 (missing version, all lowercase)
❌ Chapter 1 - The Lie (spaces instead of underscores)
```

### Versioning Convention

**Format:** `v[MAJOR].[MINOR].[PATCH]`

**Semantics:**
```
v1.0.0 - Initial major release
v1.1.0 - Minor feature addition
v1.0.1 - Patch/typo fix

Examples:
✅ MANUSCRIPT_v1.0.0.md (initial manuscript)
✅ MANUSCRIPT_v1.1.0.md (added section)
✅ MANUSCRIPT_v1.0.1.md (typo fix)
✅ MANUSCRIPT_v2.0.0.md (major revision)
❌ MANUSCRIPT_v1.md (incomplete)
❌ MANUSCRIPT_final.md (no version number)
```

### Status Flags (Optional Suffix)

**Format:** `[FILENAME]_[STATUS].md`

**Status Types:**
```
✅ [FILENAME]_DRAFT.md
✅ [FILENAME]_IN_REVIEW.md
✅ [FILENAME]_FINAL.md
✅ [FILENAME]_ARCHIVED.md
```

**Examples:**
```
✅ DROPSHIPPING_MANUSCRIPT_DRAFT_v1.0.md
✅ DROPSHIPPING_MANUSCRIPT_IN_REVIEW_v1.1.md
✅ DROPSHIPPING_MANUSCRIPT_FINAL_v1.0.md
```

### PDF and Design Files

**Format:** `[TOPIC_SLUG]_[ASSET_TYPE]_[DESCRIPTOR]_[STATUS].pdf`

**Examples:**
```
✅ DROPSHIPPING_COVER_DRAFT_v1.pdf
✅ DROPSHIPPING_COVER_FINAL.pdf
✅ DROPSHIPPING_INTERIOR_MOCKUP_v2.pdf
✅ DROPSHIPPING_INTERIOR_FINAL.pdf
✅ DROPSHIPPING_KDP_PACKAGE_READY.zip
```

### Case Study Files

**Format:** `[TOPIC_SLUG]_CS_[NUMBER]_[Anonymized_Name].md`

**Examples:**
```
✅ DROPSHIPPING_CS_001_TechEnthusiast.md
✅ DROPSHIPPING_CS_002_RetailBackground.md
✅ DROPSHIPPING_CS_011_SecondAttempt.md
```

**Number Format:** Always 3 digits (001-011 for 11 case studies)

### Chapter Files

**Format:** `[TOPIC_SLUG]_CHAPTER_[NUMBER]_[Title].md`

**Examples:**
```
✅ DROPSHIPPING_CHAPTER_1_THE_LIE.md
✅ DROPSHIPPING_CHAPTER_2_THE_MATH.md
✅ DROPSHIPPING_CHAPTER_8_IF_YOU'RE_STILL_HERE.md
```

---

## **METADATA STANDARDS**

### YAML Front Matter (All Markdown Files)

**Required Fields:**
```yaml
---
title: [Descriptive Title]
topic_slug: [topic-slug]
status: [draft|in-review|final|archived]
version: [X.X.X]
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
owner: [Your Name / Contractor Name]
archive_path: /archives/[XX-PHASE]/[topic-slug]/
word_count: [number]
phase: [research|content|design|production|metrics|support]
dependencies:
  - [RELATED_FILE_1]
  - [RELATED_FILE_2]
tags:
  - [tag1]
  - [topic-slug]
  - [phase]
---
```

**Example:**
```yaml
---
title: Dropshipping Research Brief
topic_slug: dropshipping
status: final
version: 1.0.0
created: 2025-11-09
updated: 2025-11-09
owner: You
archive_path: /archives/01-RESEARCH/dropshipping/
word_count: 3200
phase: research
dependencies:
  - DROPSHIPPING_SOURCE_REGISTRY
  - DROPSHIPPING_CASE_STUDY_AUDIT_REPORT
tags:
  - research
  - dropshipping
  - data-validation
---
```

---

## **FILE ORGANIZATION BY PHASE**

### Research Phase (`/archives/01-RESEARCH/[topic]/`)

```
Essential Files:
├── 01_RESEARCH_BRIEF.md
│   ├── Market overview
│   ├── Key findings summary
│   └── Critical statistics
│
├── 02_SOURCE_REGISTRY.md
│   ├── All sources with URLs
│   ├── Credibility ratings (Tier 1-5)
│   ├── Date accessed
│   └── Notes on relevance
│
├── 03_DATA_VALIDATION.md
│   ├── Verified statistics
│   ├── Data gaps identified
│   ├── Missing research items
│   └── Estimated time to complete
│
├── 04_GURU_LANDSCAPE.md
│   ├── Active courses and gurus
│   ├── Saturation metrics
│   ├── Competitive analysis
│   └── Market trends
│
└── /case-studies/
    ├── [TOPIC]_CS_001_[Name].md
    ├── [TOPIC]_CS_002_[Name].md
    ├── ... (all 11)
    └── [TOPIC]_CASE_STUDY_AUDIT_REPORT.md
        ├── Validation matrix
        ├── Anonymization check
        ├── Failure mechanisms summary
        └── Standardization report
```

### Content Phase (`/archives/02-CONTENT/[topic]/`)

```
Manuscript Development:
├── 01_OUTLINE.md
│   ├── 8-chapter structure
│   ├── Section breakdown
│   ├── Word count targets
│   └── Inline asset placeholders
│
├── 02_DRAFT_FULL.md
│   └── Initial full draft (7,800+ words)
│
├── 03_CHAPTERS/
│   ├── [TOPIC]_CHAPTER_1_THE_LIE.md
│   ├── [TOPIC]_CHAPTER_2_THE_MATH.md
│   └── [... chapters 3-8 ...]
│
├── 04_MANUSCRIPT_DRAFT_v1.0.md
│   └── First complete draft (7,800 words)
│
├── 05_MANUSCRIPT_DRAFT_v1.1.md
│   └── Developmental edit pass (revised)
│
├── 06_MANUSCRIPT_FINAL_v1.0.md
│   └── Final approved manuscript
│
├── /inline-assets/
│   ├── CHARTS_STATISTICS.md
│   │   ├── Chart 1.1: Failure rate timeline
│   │   ├── Chart 1.2: Guru saturation
│   │   ├── Table 2.1: Cost breakdown
│   │   └── [... all inline graphics ...]
│   │
│   ├── CALLOUT_BOXES.md
│   │   ├── Callout 1.1: "What gurus don't mention"
│   │   ├── Callout 2.1: "The real investment"
│   │   └── [... all callouts ...]
│   │
│   └── WORKSHEETS_FRAMEWORKS.md
│       ├── Worksheet 2.1: Cost calculator
│       ├── Worksheet 6.1: Decision framework
│       └── [... all worksheets ...]
│
└── /addendum/
    ├── RESOURCES_REFERENCES.md
    │   ├── Recommended books
    │   ├── Tools & services
    │   └── Online resources
    │
    └── WORKSHEETS.md
        ├── Extended worksheets
        └── Templates for reader use
```

### Design Phase (`/archives/03-DESIGN/[topic]/`)

```
Design Development:
├── 01_DESIGN_BRIEF.md
│   ├── Visual strategy
│   ├── Mood board references
│   ├── Design principles
│   └── Key messages
│
├── 02_VISUAL_SPECS.md
│   ├── Trim size (6.0" × 9.0")
│   ├── Bleed (0.125")
│   ├── Color space (CMYK)
│   ├── Font specifications
│   └── Layout grid
│
├── 03_COLOR_PALETTE.md
│   ├── Primary colors (with values)
│   ├── Secondary colors
│   ├── Usage guidelines
│   └── Print CMYK values
│
├── 04_TYPOGRAPHY_GUIDE.md
│   ├── Font families
│   ├── Size specifications
│   ├── Weight usage
│   └── Sample layouts
│
├── /mockups/
│   ├── [TOPIC]_COVER_MOCKUP_v1.pdf
│   ├── [TOPIC]_COVER_MOCKUP_v2.pdf
│   ├── [TOPIC]_INTERIOR_MOCKUP_v1.pdf
│   └── [TOPIC]_LAYOUT_GRID.pdf
│
└── /production/
    ├── [TOPIC]_COVER_FINAL.pdf
    ├── [TOPIC]_INTERIOR_FINAL.pdf
    └── [TOPIC]_KDP_PACKAGE.zip
        ├── [TOPIC]_COVER_FOR_UPLOAD.pdf
        ├── [TOPIC]_MANUSCRIPT_FOR_UPLOAD.pdf
        └── [TOPIC]_SUBMISSION_NOTES.txt
```

### Production Phase (`/archives/04-PRODUCTION/[topic]/`)

```
Launch Preparation:
├── 01_PRODUCTION_CHECKLIST.md
│   ├── File format validation
│   ├── Color space verification
│   ├── Metadata completion
│   └── Final QA sign-off
│
├── 02_KDP_SUBMISSION.md
│   ├── Step-by-step submission guide
│   ├── Form fields filled
│   ├── Submission date
│   └── Confirmation details
│
├── 03_AMAZON_LISTING.md
│   ├── Book description
│   ├── Keywords (5-7)
│   ├── Categories (2)
│   ├── ISBN
│   ├── Pricing
│   └── Royalty tier
│
├── 04_LAUNCH_RECORD.md
│   ├── Go-live date
│   ├── Initial sales
│   ├── Customer feedback
│   └── Launch notes
│
└── /fulfillment/
    ├── PRINT_ISBN.txt (ISBN assigned)
    ├── DIGITAL_ASIN.txt (Amazon product ID)
    └── WEB_URL.txt (If applicable)
```

### Metrics Phase (`/archives/05-METRICS/[topic]/`)

```
Performance Tracking:
├── SALES_RECORD.md
│   ├── Units sold by week
│   ├── Revenue by week
│   ├── Format breakdown (print/digital/web)
│   └── Pricing tier performance
│
├── RATING_FEEDBACK.md
│   ├── Current rating
│   ├── Number of reviews
│   ├── Review excerpts (positive/negative)
│   ├── Customer feedback themes
│   └── Suggestions for improvement
│
├── PERFORMANCE_ANALYSIS.md
│   ├── Week-over-week trends
│   ├── Comparison to goals
│   ├── What's working well
│   ├── What needs improvement
│   └── Optimization recommendations
│
└── /weekly/
    ├── WEEK_7_SALES.md (Launch week)
    ├── WEEK_8_SALES.md
    ├── WEEK_9_SALES.md
    └── [... continuing through Week 21 ...]
        ├── Units sold
        ├── Revenue
        ├── Rating
        ├── Customer feedback
        └── Notes
```

---

## **MIGRATION CHECKLIST**

For existing files, use this checklist to migrate to standard naming:

```markdown
# Migration Checklist for [topic]

## Phase 1: Audit
- [ ] List all existing files related to [topic]
- [ ] Categorize by phase (research, content, design, etc.)
- [ ] Identify which can be consolidated
- [ ] Note any unique/custom files

## Phase 2: Rename
- [ ] Apply standard naming convention
- [ ] Update all internal cross-references
- [ ] Create metadata front matter
- [ ] Verify links still work

## Phase 3: Organize
- [ ] Move to correct archive directory
- [ ] Create missing folder structure
- [ ] Create section summary files (if missing)
- [ ] Organize by numbering system

## Phase 4: Link
- [ ] Update topic registry
- [ ] Update file registry
- [ ] Create cross-reference map
- [ ] Test archive navigation

## Phase 5: Validate
- [ ] Verify metadata completeness
- [ ] Check all links working
- [ ] Confirm file naming standards
- [ ] Test archive search functionality
```

---

## **ARCHIVE NAVIGATION GUIDE**

### Finding Content by Topic
```
Need files for "dropshipping"?
→ /archives/*/dropshipping/
```

### Finding Content by Phase
```
Need all research files?
→ /archives/01-RESEARCH/*/
```

### Finding Specific File Types
```
Need all case studies?
→ /archives/01-RESEARCH/*/case-studies/
→ /archives/01-RESEARCH/*/case-studies/*_CS_*.md

Need all manuscripts?
→ /archives/02-CONTENT/*/
→ /archives/02-CONTENT/*/*MANUSCRIPT*.md

Need all design files?
→ /archives/03-DESIGN/*/
```

### Finding by Version
```
Need latest version of manuscript?
→ Search for MANUSCRIPT_FINAL_v*.md (highest version)
```

---

## **MAINTENANCE & UPDATES**

### Monthly Archive Audit
- [ ] Check for orphaned files
- [ ] Verify metadata currency
- [ ] Update status flags if needed
- [ ] Archive outdated versions

### Quarterly Deep Dive
- [ ] Review entire structure
- [ ] Identify naming inconsistencies
- [ ] Update documentation
- [ ] Plan improvements

### Annual Review
- [ ] Full system audit
- [ ] Update conventions if needed
- [ ] Long-term storage planning
- [ ] Archival strategy review

---

## **COMMON SCENARIOS**

### Scenario 1: Adding a New Topic

```
1. Create topic slug (verify not in registry)
2. Add to TOPIC_SLUG_REGISTRY.md
3. Create folder structure:
   /archives/01-RESEARCH/[new-topic]/
   /archives/02-CONTENT/[new-topic]/
   /archives/03-DESIGN/[new-topic]/
   /archives/04-PRODUCTION/[new-topic]/
   /archives/05-METRICS/[new-topic]/
4. Initialize phase files with metadata
5. Begin research phase
```

### Scenario 2: Updating an Existing File

```
1. Open file
2. Update content
3. Update "updated:" date in metadata
4. Update version number if significant
5. Save with new filename (if major change)
6. Update all cross-references
7. Commit to git with clear message
```

### Scenario 3: Archiving Completed Topic

```
1. Ensure all phases complete
2. Create final archive summary
3. Update status to "archived" in metadata
4. Move to archive folder (if separate)
5. Update topic registry status
6. Backup final version
```

---

## **QUICK REFERENCE CARDS**

### File Naming Cheat Sheet

```
RESEARCH FILES:
01_RESEARCH_BRIEF.md
02_SOURCE_REGISTRY.md
[TOPIC]_CS_001_[Name].md

CONTENT FILES:
02_DRAFT_FULL.md
[TOPIC]_CHAPTER_1_THE_LIE.md
[TOPIC]_MANUSCRIPT_FINAL_v1.0.md

DESIGN FILES:
01_DESIGN_BRIEF.md
[TOPIC]_COVER_FINAL.pdf
[TOPIC]_KDP_PACKAGE.zip

PRODUCTION FILES:
01_PRODUCTION_CHECKLIST.md
04_LAUNCH_RECORD.md

METRICS FILES:
SALES_RECORD.md
RATING_FEEDBACK.md
WEEK_8_SALES.md
```

### Metadata Template (Copy-Paste)

```yaml
---
title: [YOUR TITLE HERE]
topic_slug: [topic-slug]
status: draft
version: 1.0.0
created: 2025-11-09
updated: 2025-11-09
owner: Your Name
archive_path: /archives/[XX-PHASE]/[topic-slug]/
word_count: 0
phase: [research|content|design|production|metrics|support]
dependencies: []
tags:
  - [topic-slug]
---
```

---

## **SUPPORT & TRAINING**

- **Questions?** See `/agent-archival-curator`
- **Need help migrating?** Run `/agent-archival-curator migrate`
- **Want to audit structure?** Run `/agent-archival-curator audit`
- **Ready to implement?** Start with `/agent-archival-curator structure global`

---

**Document Version:** 1.0
**Last Updated:** November 9, 2025
**Maintained by:** Archival Curator Agent
