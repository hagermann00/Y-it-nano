# Image Generation Testing Framework

**Purpose:** Test and validate image creation options for Y-IT nano-books
**Status:** Ready for Testing
**Last Updated:** November 10, 2025

---

## **Folder Structure**

```
infrastructure/testing/image-generation/
├── README.md                    # This file
├── test-prompts/                # Image generation prompt templates
│   ├── satirical-illustrations.txt
│   ├── business-diagrams.txt
│   └── stock-photo-searches.txt
├── ai-generated/                # AI-generated images (Replicate, DALL-E)
│   ├── replicate-flux/
│   ├── dall-e/
│   └── midjourney/
├── cc0-stock/                   # Free CC0 stock images
│   ├── unsplash/
│   ├── pexels/
│   └── pixabay/
├── metadata/                    # Image metadata and licensing info
│   └── image-registry.json
└── test-results.md             # Testing results and evaluations
```

---

## **Testing Objectives**

### **1. Validate Image Quality**
- Resolution sufficient for print (300 DPI, 2550x3300 px for 8.5x11")
- Resolution sufficient for web (1920x1080 minimum)
- Visual quality meets brand standards

### **2. Verify Commercial Rights**
- Confirm license allows commercial use
- Document attribution requirements
- Verify no trademark/copyright violations

### **3. Compare Cost & Speed**
- Cost per image
- Generation/download time
- Batch processing capability

### **4. Test Integration**
- MCP server connectivity
- Automated download and storage
- Metadata tracking

---

## **Test Cases**

### **Test 1: AI Image Generation (Replicate FLUX)**

**Objective:** Generate custom satirical illustrations for book content

**Test Prompts:**
1. "Satirical cartoon of an overwhelmed entrepreneur drowning in unsold dropshipping inventory, business illustration style, muted colors"
2. "Humorous diagram showing guru marketing funnel vs actual dropshipping failure funnel, infographic style"
3. "Realistic photo-style image of empty warehouse with 'FOR LEASE' sign, symbolizing failed e-commerce business"

**Success Criteria:**
- ✅ Image generated in < 30 seconds
- ✅ Commercial license confirmed
- ✅ Quality suitable for print (300 DPI)
- ✅ Cost < $0.05 per image
- ✅ Saved to `/ai-generated/replicate-flux/` with metadata

**How to Run:**
```
Prompt to Claude (with Replicate MCP configured):

"Generate 3 images for dropshipping book using Replicate FLUX model:
1. [prompt 1]
2. [prompt 2]
3. [prompt 3]

Save to infrastructure/testing/image-generation/ai-generated/replicate-flux/
Record metadata in metadata/image-registry.json"
```

---

### **Test 2: Free Stock Photo Search (Unsplash)**

**Objective:** Find high-quality CC0 images for generic business concepts

**Test Searches:**
1. "warehouse shelves inventory"
2. "stressed entrepreneur working late"
3. "empty office space failed startup"
4. "cardboard shipping boxes"
5. "laptop showing declining sales graph"

**Success Criteria:**
- ✅ Found 3+ relevant images per search
- ✅ CC0 license confirmed (no attribution required)
- ✅ Resolution > 1920x1080
- ✅ Download time < 5 seconds per image
- ✅ Saved to `/cc0-stock/unsplash/` with metadata

**How to Run:**
```
Prompt to Claude (with Unsplash MCP configured):

"Search Unsplash for images matching these terms:
[list searches]

Download top 3 results for each to infrastructure/testing/image-generation/cc0-stock/unsplash/
Verify CC0 license and record metadata"
```

---

### **Test 3: Multi-Source Comparison**

**Objective:** Compare same concept across different sources

**Concept:** "Failed business / entrepreneurial struggle"

**Sources to Test:**
1. Replicate FLUX (AI-generated)
2. Unsplash (free stock)
3. Pexels (free stock)
4. Pixabay (free stock)

**Comparison Criteria:**

| Criteria | Weight | Replicate | Unsplash | Pexels | Pixabay |
|----------|--------|-----------|----------|--------|---------|
| Quality | 30% | TBD | TBD | TBD | TBD |
| Relevance | 25% | TBD | TBD | TBD | TBD |
| Uniqueness | 20% | TBD | TBD | TBD | TBD |
| Cost | 15% | TBD | FREE | FREE | FREE |
| Speed | 10% | TBD | TBD | TBD | TBD |
| **TOTAL** | 100% | - | - | - | - |

**How to Run:**
```
1. Generate AI image via Replicate
2. Search all 3 stock sites for similar concept
3. Download best match from each
4. Compare side-by-side
5. Score on criteria above
6. Document in test-results.md
```

---

### **Test 4: Batch Processing**

**Objective:** Test efficiency of generating 10 images for a single topic

**Scenario:** Create full image set for "Dropshipping" nano-book

**Required Images:**
1. Cover concept (warehouse/shipping theme)
2. Guru satire illustration
3. Failure statistics diagram
4. Cost breakdown infographic
5. Timeline visualization
6. Case study illustration (x3)
7. Alternative opportunities comparison chart
8. Warning/caution graphic

**Success Criteria:**
- ✅ All 10 images generated/sourced in < 10 minutes
- ✅ Total cost < $0.50
- ✅ All meet quality standards
- ✅ Metadata tracking automated
- ✅ Organized in topic-specific folder

**How to Run:**
```
Prompt to Claude:

"Create complete image set for 'Dropshipping' topic using:
- Replicate FLUX for custom illustrations
- Unsplash for stock photos
- Mix to optimize cost/quality

Save to data/web-research/images/dropshipping/
Track all metadata and costs"
```

---

## **Image Metadata Schema**

Save all metadata to: `metadata/image-registry.json`

```json
{
  "images": [
    {
      "id": "img-001",
      "filename": "dropshipping-warehouse-failure.png",
      "source": "replicate-flux",
      "prompt": "Satirical cartoon of overwhelmed entrepreneur...",
      "model": "black-forest-labs/flux-1.1-pro",
      "license": "commercial-use-allowed",
      "attribution_required": false,
      "cost": 0.04,
      "generated_date": "2025-11-10",
      "dimensions": "1920x1080",
      "file_size_mb": 2.3,
      "topic": "dropshipping",
      "use_case": "chapter-illustration",
      "quality_score": 9,
      "approved_for_print": true,
      "approved_for_web": true,
      "notes": "High quality, perfect for satirical tone"
    }
  ]
}
```

---

## **Quality Assessment Rubric**

**Scoring (1-10 scale):**

### **Technical Quality (40%)**
- Resolution (print: 300 DPI, web: 1920x1080+)
- Color accuracy and consistency
- No artifacts, watermarks, or defects
- File format appropriate (PNG/JPG/SVG)

### **Content Relevance (30%)**
- Matches intended concept
- Appropriate for target audience
- Aligns with brand voice (satirical, data-driven)
- Culturally appropriate and inclusive

### **Uniqueness (20%)**
- Not generic stock photo look
- Distinctive and memorable
- Fits Y-IT brand aesthetic
- Differentiates from competitor books

### **Commercial Viability (10%)**
- Clear commercial license
- No trademark/copyright issues
- Cost-effective
- Scalable for 50 books

**Minimum Passing Score:** 7/10

---

## **Test Results Template**

```markdown
## Test Results: [Test Name]

**Date:** YYYY-MM-DD
**Tester:** [Name]
**MCP Servers Used:** [List]

### Test Execution
- [x] Test completed successfully
- [ ] Encountered errors (describe below)

### Results

#### Images Generated/Downloaded
1. **Image 1:** [filename]
   - Quality Score: X/10
   - Cost: $X.XX
   - Time: X seconds
   - Notes: [observations]

2. **Image 2:** [filename]
   - Quality Score: X/10
   - Cost: $X.XX
   - Time: X seconds
   - Notes: [observations]

### Performance Metrics
- Total images: X
- Total cost: $X.XX
- Total time: X minutes
- Average quality score: X/10
- Success rate: X%

### Issues Encountered
- [List any problems]

### Recommendations
- [Suggested improvements]

### Verdict
- [ ] PASS - Ready for production use
- [ ] CONDITIONAL - Usable with noted limitations
- [ ] FAIL - Not suitable for production
```

---

## **Quick Start: Run All Tests**

```bash
# 1. Ensure MCP servers are configured
# Check ~/.config/Claude/claude_desktop_config.json

# 2. Navigate to testing directory
cd /home/user/Y-it-nano/infrastructure/testing/image-generation/

# 3. Run test prompts (send to Claude)
# See test-prompts/*.txt for full prompt templates

# 4. Review results
# Check ai-generated/, cc0-stock/, and test-results.md

# 5. Update image registry
# Edit metadata/image-registry.json with findings
```

---

## **Integration with Agent System**

Once testing is complete, integrate with:

1. **`/agent-web-research-orchestrator`**
   - Automate image sourcing/generation
   - Handle metadata tracking
   - Manage cost optimization

2. **`/agent-asset-generator`**
   - Receive images from orchestrator
   - Prepare for design handoff
   - Ensure quality standards

3. **`/agent-visual-spec`**
   - Define image requirements per topic
   - Create generation prompts
   - Review and approve images

---

## **Cost Tracking**

| Service | Test Budget | Production Budget (50 books) |
|---------|-------------|------------------------------|
| Replicate FLUX | $5 (100 images) | $100 (2000 images @ $0.05) |
| Unsplash | FREE | FREE |
| Pexels | FREE | FREE |
| Pixabay | FREE | FREE |
| **TOTAL** | **$5** | **$100** |

**Cost Per Book:** ~$2 for images (assuming 40 images per book)

---

## **Next Steps**

1. ✅ Create test folder structure
2. ⏳ Configure MCP servers (see `/infrastructure/mcp-integration-guide.md`)
3. ⏳ Run Test 1 (AI Image Generation)
4. ⏳ Run Test 2 (Stock Photo Search)
5. ⏳ Run Test 3 (Multi-Source Comparison)
6. ⏳ Run Test 4 (Batch Processing)
7. ⏳ Document results in `test-results.md`
8. ⏳ Update `image-registry.json` with metadata
9. ⏳ Integrate with agent system
10. ⏳ Deploy to production

---

**Status:** ✅ READY FOR TESTING
**Owner:** Infrastructure Team
**Version:** 1.0
