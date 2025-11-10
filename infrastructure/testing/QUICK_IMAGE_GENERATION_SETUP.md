# Image Generation Testing Setup Guide

## Quick Start: Test Image Generation in 5 Minutes

### Step 1: Get API Keys (FREE tier available)

#### Replicate (Recommended - Best Quality)
1. Go to: https://replicate.com/
2. Sign up (free account)
3. Go to Account → API Tokens: https://replicate.com/account/api-tokens
4. Click "Create Token"
5. Copy the token (starts with `r8_...`)
6. **Free credit:** $0.005 on signup (enough for 1-2 test images)
7. **Pricing:** $0.04 per image after free credit

### Step 2: Create MCP Configuration File

**Location:** `~/.config/Claude/claude_desktop_config.json`

**On Linux:**
```bash
mkdir -p ~/.config/Claude
nano ~/.config/Claude/claude_desktop_config.json
```

**Paste this configuration:**
```json
{
  "mcpServers": {
    "replicate": {
      "command": "npx",
      "args": ["-y", "replicate-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": "r8_YOUR_TOKEN_HERE"
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

Replace `r8_YOUR_TOKEN_HERE` with your actual Replicate token.

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP servers.

### Step 4: Test Image Generation

**Test Prompt:**
```
"Use Replicate to generate an image:
'Satirical business illustration of overwhelmed entrepreneur surrounded
by unsold dropshipping inventory, muted professional colors, editorial
cartoon style'

Save to: infrastructure/testing/image-generation/ai-generated/replicate-flux/test-01.png"
```

---

## Alternative: Test WITHOUT API Key (Free Stock Photos)

If you want to test immediately without setup:

**Option: Use Unsplash (FREE, no API key needed for basic use)**

Search and describe what you want, I can help you find CC0 images:
- "warehouse inventory"
- "stressed entrepreneur"
- "empty office space"
- "business failure concept"
- "shipping boxes"

---

## Google Gemini Status Update

**Why Gemini isn't available yet:**

1. **No Official MCP Server** - Google hasn't released a Gemini MCP integration yet
2. **Imagen Access** - Imagen 3 requires Vertex AI or AI Studio (no direct API like Replicate)
3. **Integration Complexity** - Would require custom MCP server development

**Workaround Options:**

**A) Use Replicate Instead**
- FLUX model quality equals/exceeds Imagen
- Simple API integration
- $0.04 per image

**B) Direct Google AI Studio** (Manual)
- Visit: https://aistudio.google.com/
- Use Imagen playground directly
- Download images manually
- No automation/MCP integration

**C) Wait for Community MCP**
- Community may build Gemini MCP server
- Check: https://github.com/modelcontextprotocol/servers
- Not available as of Nov 2025

---

## Recommended Path Forward

### For Testing Image Generation NOW:

**Use Replicate FLUX** (5-minute setup)
1. Get free Replicate account
2. Copy API token
3. Update config file
4. Restart Claude
5. Generate 5 test images

**Cost:** ~$0.20 for 5 images (or free with signup credit)
**Quality:** Excellent (Midjourney-level)
**Commercial Rights:** ✅ Verified

### For Google Gemini (Future):

**Monitor for MCP release:**
- Watch: https://github.com/modelcontextprotocol/servers
- Check Google AI updates
- I can add Gemini support when available

---

## What Would You Like To Do?

**Option A: Set up Replicate now** (5 min)
- I'll walk you through step-by-step
- Generate 5 test images
- Cost: ~$0.20

**Option B: Test with free stock photos** (immediate)
- No setup needed
- I'll search Unsplash/Pexels
- Cost: $0 (CC0 license)

**Option C: Research Gemini alternatives**
- I'll search for latest Gemini API options
- Check if MCP servers exist
- Explore direct integration

**Which option would you prefer?**
