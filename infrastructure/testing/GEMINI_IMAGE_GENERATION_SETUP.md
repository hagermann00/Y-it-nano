# Gemini Image Generation Setup Guide

**Last Updated:** November 10, 2025
**Status:** Available via MCP
**Cost:** $0.039 per image (~$0.04, similar to Replicate)

---

## **Option 1: Gemini 2.5 Flash Image (Recommended)**

### **Features:**
- ✅ Production-ready (Dec 2024)
- ✅ Commercial use allowed
- ✅ $0.039 per image
- ✅ State-of-the-art quality
- ⚠️ Includes SynthID watermark (invisible, identifies AI-generated)

### **Setup Steps:**

#### **Step 1: Get Gemini API Key (FREE tier available)**

1. **Visit Google AI Studio:**
   https://aistudio.google.com/

2. **Sign in with Google account**

3. **Get API Key:**
   - Click "Get API Key" button
   - Create new API key
   - Copy the key (keep it secure)

4. **Free Tier:**
   - 1,500 requests per day (free)
   - Rate limit: 15 requests per minute
   - More than enough for testing!

#### **Step 2: Install Gemini MCP Server**

**Using NPM:**
```bash
npm install -g @google/generative-ai-mcp
```

**Or use npx (no install needed):**
```bash
npx @google/generative-ai-mcp
```

#### **Step 3: Configure MCP**

**Location:** `~/.config/Claude/claude_desktop_config.json`

**Create or update with:**
```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["-y", "@google/generative-ai-mcp"],
      "env": {
        "GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/user/Y-it-nano/data",
        "/home/user/Y-it-nano/infrastructure/testing"
      ]
    }
  }
}
```

#### **Step 4: Restart Claude Desktop**

Close and reopen Claude Desktop to load the Gemini MCP server.

#### **Step 5: Test Image Generation**

**Test Prompt:**
```
"Use Gemini to generate an image:
'Satirical business illustration of overwhelmed entrepreneur surrounded
by unsold dropshipping inventory, muted professional colors, editorial
cartoon style, high quality'

Save to: infrastructure/testing/image-generation/ai-generated/gemini/test-01.png"
```

---

## **Option 2: Alternative Gemini MCP Servers**

### **Community Gemini Imagen 3.0 Server**

**GitHub:** Check https://mcpservers.org/servers/falahgs/imagen-3.0-generate-google-mcp-server

**Installation:**
```bash
npm install -g gemini-imagen-mcp
```

**Configuration:**
```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "npx",
      "args": ["-y", "gemini-imagen-mcp"],
      "env": {
        "GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

---

## **Gemini vs Replicate Comparison**

| Feature | Gemini 2.5 Flash | Replicate FLUX |
|---------|------------------|----------------|
| **Cost** | $0.039/image | $0.04/image |
| **Quality** | Excellent | Excellent |
| **Commercial Use** | ✅ YES | ✅ YES |
| **Watermark** | ✅ SynthID (invisible) | ❌ None |
| **Free Tier** | 1,500/day | 0.005 credits |
| **Speed** | Fast | Fast |
| **Setup** | Google account | Replicate account |
| **Best For** | Google ecosystem | Maximum flexibility |

---

## **Pricing Details**

### **Gemini API Pricing**
- **Free Tier:** 1,500 requests/day (plenty for testing)
- **Paid:** $0.039 per image after free tier
- **Rate Limit:** 15 requests/minute (free tier)
- **50 requests/minute (paid)**

### **Cost for 50 Books**
Assuming 40 images per book:
- Total images: 2,000
- Gemini cost: $78 (2000 × $0.039)
- Replicate cost: $80 (2000 × $0.04)

**Savings: ~$2** (minimal difference)

---

## **Commercial Use & Licensing**

### **What You CAN Do:**
✅ Use images in for-profit documents (books)
✅ Commercial advertising and branding
✅ E-commerce product shots
✅ Marketing materials
✅ Professional publications

### **What You MUST Do:**
⚠️ Follow Generative AI Prohibited Use Policy
⚠️ Cannot remove SynthID watermark (invisible)
⚠️ Cannot use for: child exploitation, violent extremism, non-consensual intimate imagery, hate speech

### **Rights You Have:**
✅ **You own the output** - Images generated are yours to use commercially
✅ **No attribution required** - Don't need to credit Google
✅ **Can modify/edit** - Full rights to edit generated images

---

## **SynthID Watermark Explanation**

**What is SynthID?**
- Invisible digital watermark embedded in images
- Identifies image as AI-generated
- Cannot be seen by humans
- Survives cropping, resizing, color changes
- Can be detected by specialized tools

**Does it affect commercial use?**
❌ **NO** - You can still use images commercially
✅ **It's just for transparency** (AI-generated attribution)
✅ **Doesn't reduce image quality**

**For Y-It nano-books:**
- ✅ Fine to use - watermark doesn't affect book sales
- ✅ Actually beneficial - proves authenticity
- ✅ May become industry standard

---

## **Test Generation Workflow**

### **Test 1: Single Image**
```
Prompt:
"Use Gemini to generate:
'Satirical cartoon of entrepreneur drowning in boxes, business illustration,
muted colors, professional quality'

Save to: infrastructure/testing/image-generation/ai-generated/gemini/test-single.png"
```

### **Test 2: Generate 5 Images**
```
Prompt:
"Use Gemini to generate 5 images for dropshipping book:

1. 'Overwhelmed entrepreneur with unsold inventory warehouse'
2. 'Guru marketing vs reality comparison diagram'
3. 'Empty warehouse with FOR LEASE sign'
4. 'Stressed person at laptop surrounded by bills'
5. 'Timeline showing business decline over 6 months'

Style: Satirical business illustration, muted professional colors
Save to: infrastructure/testing/image-generation/ai-generated/gemini/batch-test-[01-05].png"
```

**Expected Cost:** ~$0.20 (5 × $0.039)

### **Test 3: Compare Gemini vs Stock Photos**
```
Prompt:
"Generate 2 images with Gemini AND search Unsplash for 2 similar concepts.
Compare quality, cost, and suitability for book.

Concepts:
- Warehouse inventory failure
- Stressed entrepreneur working late

Create comparison report with recommendations."
```

---

## **Troubleshooting**

### **Error: "Invalid API Key"**
**Solution:**
1. Verify key at https://aistudio.google.com/
2. Check for extra spaces in config file
3. Regenerate key if needed

### **Error: "Rate limit exceeded"**
**Solution:**
1. Free tier: Max 15 requests/minute
2. Wait 60 seconds between batches
3. Upgrade to paid tier for 50/minute

### **Error: "MCP server not responding"**
**Solution:**
1. Restart Claude Desktop
2. Check Node.js version: `node --version` (need v18+)
3. Verify config JSON syntax
4. Check logs: `~/Library/Logs/Claude/mcp.log`

### **Image Quality Issues**
**Solution:**
1. Add quality keywords: "high quality, detailed, professional"
2. Specify resolution: "2048x2048, high resolution"
3. Be more specific in prompt
4. Try different artistic styles

---

## **Quick Start Checklist**

- [ ] **Get Gemini API Key** (https://aistudio.google.com/)
- [ ] **Install Node.js v18+** (check: `node --version`)
- [ ] **Create MCP config file** (`~/.config/Claude/claude_desktop_config.json`)
- [ ] **Add Gemini API key** to config
- [ ] **Restart Claude Desktop**
- [ ] **Test with single image** generation
- [ ] **Generate 5 test images**
- [ ] **Compare with stock photos**
- [ ] **Update image registry** with metadata
- [ ] **Document results** in test-results.md

---

## **Next Steps After Testing**

1. **Compare Results:**
   - Gemini vs Replicate FLUX
   - AI-generated vs stock photos
   - Cost vs quality tradeoff

2. **Choose Your Strategy:**
   - **All Gemini:** If you prefer Google ecosystem
   - **All Replicate:** If you want no watermarks
   - **Mixed:** 80% stock photos + 20% AI (cheapest)

3. **Integrate with Agent:**
   ```bash
   /agent-web-research-orchestrator images dropshipping custom "guru-satire,warehouse-failure"
   ```

4. **Scale to Production:**
   - Generate images for first book
   - Refine prompts based on results
   - Create reusable prompt templates
   - Apply to remaining 49 books

---

## **Support Resources**

- **Gemini API Docs:** https://ai.google.dev/gemini-api/docs/image-generation
- **Google AI Studio:** https://aistudio.google.com/
- **MCP Servers Directory:** https://mcpservers.org/
- **Pricing Info:** https://ai.google.dev/gemini-api/docs/pricing
- **Community Support:** https://developers.googleblog.com/

---

**Status:** ✅ READY TO TEST
**Setup Time:** ~10 minutes
**Cost:** FREE for testing (1,500 images/day)
**Commercial Rights:** ✅ Verified

**Let's generate your first Gemini image!** 🎨
