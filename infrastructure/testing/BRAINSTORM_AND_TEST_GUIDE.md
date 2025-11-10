# Brainstorming & Testing Guide: Web Scraping + Image Generation

**Purpose:** Interactive brainstorming and testing framework for MCP-powered research
**Status:** Ready to Use
**Last Updated:** November 10, 2025

---

## **Quick Start: Brainstorming Mode**

### **What is Brainstorming Mode?**

Use Claude with MCP servers to:
- Research image creation options in real-time
- Test different AI image generation models
- Compare free vs paid image sources
- Explore web scraping capabilities
- Prototype research workflows

### **Setup Checklist**

- [ ] MCP servers configured (see `claude_desktop_config.example.json`)
- [ ] API keys obtained (Brave Search, Replicate)
- [ ] Test folders created (`infrastructure/testing/image-generation/`)
- [ ] Read MCP integration guide (`infrastructure/mcp-integration-guide.md`)

---

## **Brainstorming Sessions**

### **Session 1: Image Creation Options Research**

**Goal:** Explore and document all viable image creation options

**Prompts to Try:**

```
"I need to research image creation options for commercial documents.
Can you search the web for:
1. Free CC0 stock photo sites with commercial licenses
2. AI image generation tools that allow commercial use
3. Cost comparison between different options
4. Legal considerations for using images in for-profit books

Use Brave Search to find current information from 2024-2025."
```

**Expected Outputs:**
- List of CC0 image sources
- AI image generation platforms with pricing
- License comparison table
- Legal best practices summary

**Save Results To:** `data/web-research/reports/image-options-research-YYYY-MM-DD.md`

---

### **Session 2: Test AI Image Generation**

**Goal:** Generate sample images using different prompts and models

**Prompts to Try:**

```
"Using Replicate, generate 3 test images with these prompts:

1. 'Satirical business illustration of overwhelmed entrepreneur
    surrounded by unsold inventory, editorial cartoon style,
    muted professional colors'

2. 'Infographic-style diagram showing guru promises vs reality,
    split-screen comparison, professional business illustration'

3. 'Realistic photo-style image of empty warehouse with
    FOR LEASE sign, symbolizing failed business'

Use the FLUX model and save to:
infrastructure/testing/image-generation/ai-generated/replicate-flux/

Record the cost, generation time, and quality for each."
```

**Expected Outputs:**
- 3 generated images
- Cost per image (~$0.04-0.05)
- Generation time (<30 seconds each)
- Metadata file with details

**Evaluation Criteria:**
- Quality: 1-10 score
- Relevance to prompt
- Commercial viability
- Cost-effectiveness

---

### **Session 3: Search Free Stock Photos**

**Goal:** Find relevant CC0 images from free sources

**Prompts to Try:**

```
"Search Unsplash for high-quality CC0 images matching these concepts:
- warehouse inventory and shipping
- stressed entrepreneur working late
- empty office space (failed business)
- financial charts showing decline
- cardboard shipping boxes

Download the top 2 results for each search to:
infrastructure/testing/image-generation/cc0-stock/unsplash/

Verify CC0 license and record metadata including:
- Source URL
- Photographer
- Dimensions
- License type
- Download date"
```

**Expected Outputs:**
- 10 downloaded images (2 per concept)
- Metadata JSON file
- License verification
- Quality assessment

---

### **Session 4: Web Scraping Competitive Intelligence**

**Goal:** Test web scraping for market research

**Prompts to Try:**

```
"I want to research the dropshipping guru market. Can you:

1. Use Brave Search to find the top 5 dropshipping course providers
2. List their course names, pricing, and marketing claims
3. Use Fetch to retrieve their pricing pages
4. Extract and compare:
   - Course prices
   - Promises made (income claims, success rates)
   - Refund policies
   - Number of students (if visible)

Save findings to:
data/web-research/scraped-data/dropshipping-gurus-YYYY-MM-DD.json"
```

**Expected Outputs:**
- Structured data file with guru comparison
- Pricing analysis
- Marketing claims documentation
- Source URLs and timestamps

**Use Cases:**
- Validate book research claims
- Find current market statistics
- Track guru marketing trends
- Source case study leads

---

### **Session 5: Multi-Source Image Comparison**

**Goal:** Compare AI-generated vs stock photos for same concept

**Prompts to Try:**

```
"Let's compare image options for the concept: 'failed business / entrepreneurial struggle'

1. Generate 1 AI image via Replicate FLUX with satirical style
2. Search Unsplash for 2 realistic stock photos
3. Search Pexels for 2 alternative stock photos
4. Create a comparison showing:
   - Cost (total and per image)
   - Quality score (1-10)
   - Uniqueness score (1-10)
   - Commercial license status
   - Download/generation time

Save all images to appropriate test folders and create
a comparison report in markdown format."
```

**Expected Outputs:**
- 5 images (1 AI + 4 stock)
- Side-by-side comparison table
- Cost/benefit analysis
- Recommendation for production use

---

## **Testing Workflows**

### **Test 1: End-to-End Research Pipeline**

**Scenario:** Full research workflow for "Dropshipping" nano-book

**Steps:**

1. **Market Research** (Brave Search + Fetch)
   ```
   Search for:
   - Dropshipping failure statistics 2024-2025
   - Dropshipping course saturation data
   - E-commerce guru market analysis
   - Dropshipping profit margin data
   ```

2. **Competitive Intelligence** (Puppeteer)
   ```
   Scrape top 5 dropshipping guru sites:
   - Course pricing
   - Marketing claims
   - Student testimonials
   - Refund policies
   ```

3. **Image Sourcing** (Replicate + Unsplash)
   ```
   Generate/find images for:
   - Cover concept
   - Chapter illustrations (5)
   - Infographics (3)
   - Case study visuals (2)
   ```

4. **Data Compilation** (Filesystem)
   ```
   Organize into topic folder:
   /data/web-research/dropshipping/
     /scraped-data/
     /images/
     /reports/
   ```

**Success Criteria:**
- ✅ Complete dataset in < 2 hours
- ✅ All sources cited
- ✅ Images have verified licenses
- ✅ Cost < $2 total
- ✅ Data ready for manuscript integration

---

### **Test 2: Image Generation Batch Processing**

**Scenario:** Generate 10 custom illustrations for one book

**Batch Prompt Template:**

```
"Generate a complete image set for 'Dropshipping' nano-book using Replicate FLUX:

1. Cover illustration: [detailed prompt]
2. Guru satire: [detailed prompt]
3. Failure statistics infographic: [detailed prompt]
4. Cost breakdown diagram: [detailed prompt]
5. Timeline visualization: [detailed prompt]
6-8. Case study illustrations: [3 prompts]
9. Alternative opportunities chart: [detailed prompt]
10. Warning graphic: [detailed prompt]

For each image:
- Use consistent style: editorial business illustration
- Color palette: muted professional (navy, grey, burnt orange)
- Resolution: 2048x2048px minimum
- Save to: infrastructure/testing/image-generation/ai-generated/replicate-flux/batch-test-01/
- Track: cost, generation time, quality score

Generate all in parallel if possible to minimize total time."
```

**Target Metrics:**
- Total time: < 10 minutes
- Total cost: < $0.50
- Average quality: 8+/10
- All meet print quality standards

---

### **Test 3: Real-Time Data Validation**

**Scenario:** Verify book statistics against current web sources

**Example Validation Workflow:**

```
"I have this claim in my manuscript:
'85% of dropshipping businesses fail within the first year'

Can you:
1. Use Brave Search to find recent (2024-2025) sources for this statistic
2. Verify the percentage across 3+ authoritative sources
3. Check if the timeframe (first year) is accurate
4. Find the original source if possible
5. Report any discrepancies or updated numbers

Provide:
- Source URLs with credibility rating (Tier 1/2/3)
- Exact statistics found
- Publication dates
- Recommendation: keep as-is, update, or add qualifier"
```

**Use Cases:**
- Fact-checking manuscripts
- Updating outdated statistics
- Finding primary sources
- Validating guru claims

---

## **Brainstorming Prompts Library**

### **Research & Discovery**

```
"What are the current trends in AI image generation for commercial use?
Search for 2025 updates on licensing, pricing, and model capabilities."
```

```
"Find recent case studies of failed dropshipping businesses.
Look for blog posts, forums, Reddit discussions with real numbers and timelines."
```

```
"Compare the top 3 web scraping tools/services for market research.
What are the legal considerations and best practices?"
```

### **Image Creation**

```
"Brainstorm 10 satirical image concepts for a book about
social media influencer failures. Include visual metaphors and composition ideas."
```

```
"Search for the best free stock photo sites for business/entrepreneurship imagery.
Compare selection, quality, and license terms."
```

```
"What are the current copyright and licensing rules for AI-generated images?
Find authoritative sources on commercial use rights."
```

### **Workflow Optimization**

```
"Design an automated workflow for:
1. Scraping competitor pricing weekly
2. Storing data in PostgreSQL
3. Generating alerts for price changes
4. Creating monthly comparison reports"
```

```
"What's the most cost-effective way to generate 500 custom images
for 50 books while maintaining commercial rights?"
```

---

## **Evaluation Templates**

### **Image Quality Assessment**

```markdown
## Image Evaluation: [filename]

**Source:** [AI/Stock] - [Platform]
**Prompt/Search:** [text]
**Cost:** $X.XX
**Time:** X seconds

### Technical Quality (1-10)
- Resolution: X/10 (meets print standards?)
- Color: X/10 (appropriate palette?)
- Composition: X/10 (clear focal point?)
- File Quality: X/10 (no artifacts?)

### Content Quality (1-10)
- Relevance: X/10 (matches intent?)
- Uniqueness: X/10 (not generic?)
- Brand Fit: X/10 (satirical tone?)
- Commercial Viability: X/10 (no issues?)

**TOTAL SCORE:** XX/80

**Verdict:**
- [ ] Approved for production
- [ ] Approved with edits
- [ ] Reject - [reason]

**Notes:** [observations]
```

### **Research Source Credibility**

```markdown
## Source Evaluation: [source name]

**URL:** [link]
**Type:** [Academic/Industry/News/Blog]
**Publication Date:** YYYY-MM-DD
**Author/Publisher:** [name]

### Credibility Assessment
- **Tier 1** (Government, Academic, Major Research): [ ]
- **Tier 2** (Established Publications, Verified Data): [ ]
- **Tier 3** (Blogs, Unverified, Anecdotal): [ ]

### Data Quality
- Methodology disclosed: Y/N
- Sample size adequate: Y/N
- Recent (2023-2025): Y/N
- Cross-referenced: Y/N

**Reliability Score:** X/10

**Use in Manuscript:**
- [ ] Primary citation
- [ ] Supporting source
- [ ] Background only
- [ ] Do not use

**Notes:** [observations]
```

---

## **Organizing Your Results**

### **Folder Structure**

```
data/web-research/
├── images/
│   ├── dropshipping/
│   ├── print-on-demand/
│   └── affiliate-marketing/
├── scraped-data/
│   ├── competitor-analysis/
│   ├── market-statistics/
│   └── case-study-leads/
└── reports/
    ├── image-options-research.md
    ├── guru-market-analysis.md
    └── technology-comparisons.md

infrastructure/testing/image-generation/
├── ai-generated/
│   ├── replicate-flux/
│   ├── dall-e/
│   └── midjourney/
├── cc0-stock/
│   ├── unsplash/
│   ├── pexels/
│   └── pixabay/
├── metadata/
│   └── image-registry.json
└── test-results.md
```

### **Naming Conventions**

**Images:**
```
[topic]-[concept]-[number]-[source].ext

Examples:
dropshipping-warehouse-failure-01-replicate.png
dropshipping-stressed-entrepreneur-02-unsplash.jpg
pom-tshirt-pile-01-flux.png
```

**Data Files:**
```
[topic]-[data-type]-YYYY-MM-DD.ext

Examples:
dropshipping-competitor-pricing-2025-11-10.json
affiliate-failure-stats-2025-11-10.csv
crypto-guru-analysis-2025-11-10.md
```

---

## **Next Steps After Testing**

### **Once Tests Are Complete:**

1. **Document Findings**
   - Update `test-results.md` with all outcomes
   - Create comparison tables
   - Identify best tools/workflows

2. **Optimize Workflow**
   - Automate repetitive tasks
   - Create prompt templates
   - Set up monitoring/alerts

3. **Integrate with Agent System**
   - Connect to `/agent-web-research-orchestrator`
   - Feed results to `/agent-research-validator`
   - Coordinate with `/agent-asset-generator`

4. **Scale to Production**
   - Apply learnings to first topic (dropshipping)
   - Refine based on results
   - Roll out to remaining 49 topics

---

## **Cost Tracking During Testing**

| Service | Budget | Spent | Remaining | Notes |
|---------|--------|-------|-----------|-------|
| Brave Search | FREE | $0 | N/A | 2K queries/mo free |
| Replicate FLUX | $5 | $0 | $5 | ~100 images budget |
| Unsplash | FREE | $0 | N/A | Unlimited |
| Pexels | FREE | $0 | N/A | Unlimited |
| **TOTAL** | **$5** | **$0** | **$5** | Update as you test |

---

## **Troubleshooting**

### **MCP Server Not Responding**
1. Check `claude_desktop_config.json` syntax
2. Restart Claude Desktop
3. Verify API keys are valid
4. Check Node.js version (need v18+)

### **Image Quality Issues**
1. Increase resolution in prompt
2. Add quality keywords ("high quality, detailed, professional")
3. Try different models/sources
4. Regenerate with refined prompt

### **Web Scraping Blocked**
1. Respect robots.txt
2. Add delays between requests
3. Use different user agent
4. Consider using official APIs instead

---

**Status:** ✅ READY FOR BRAINSTORMING
**Version:** 1.0
**Last Updated:** November 10, 2025

**Start Here:**
1. Configure MCP servers
2. Run Session 1 (Image Options Research)
3. Run Session 2 (Test AI Generation)
4. Run Session 3 (Test Stock Photos)
5. Compare results and choose production approach
