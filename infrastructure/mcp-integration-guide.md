# MCP Integration Guide: Web Scraping & Image Generation

**Purpose:** Configure Model Context Protocol (MCP) servers for automated web research and image generation
**Target:** Y-It Nano-Book Research Infrastructure
**Status:** Configuration Ready

---

## **Overview**

MCP servers extend Claude's capabilities by connecting to external tools and APIs. For Y-It research, we need:

1. **Web Scraping MCPs** - Gather current market data, competitor intelligence
2. **Image Generation MCPs** - Create/source images with commercial rights
3. **Data Storage MCPs** - Store and query research data

---

## **Available MCP Servers**

### **Category 1: Web Scraping & Research**

#### **1. Brave Search MCP**
- **Purpose**: Search the web for current information
- **Use Cases**: Find statistics, sources, competitor sites
- **Commercial Rights**: Free tier available, $5/month pro
- **Setup**: https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**Get API Key**: https://brave.com/search/api/

---

#### **2. Puppeteer MCP**
- **Purpose**: Browser automation for JavaScript-heavy sites
- **Use Cases**: Scrape dynamic content, guru course sites, pricing pages
- **Commercial Rights**: Free (open source)
- **Setup**: https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

---

#### **3. Fetch MCP**
- **Purpose**: Make HTTP requests to APIs and websites
- **Use Cases**: REST APIs, simple scraping, data endpoints
- **Commercial Rights**: Free (built-in)
- **Setup**: https://github.com/modelcontextprotocol/servers/tree/main/src/fetch

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

---

### **Category 2: Image Generation & Sourcing**

#### **4. Replicate MCP (BEST for Commercial Use)**
- **Purpose**: AI image generation (FLUX, Stable Diffusion, etc.)
- **Use Cases**: Custom book images, diagrams, illustrations
- **Commercial Rights**: ✅ YES - Paid plans grant commercial license
- **Pricing**: Pay-per-use (~$0.01-0.05 per image)
- **Models**: FLUX.1, SDXL, DALL-E alternatives
- **Setup**: https://github.com/replicate/replicate-mcp

```json
{
  "mcpServers": {
    "replicate": {
      "command": "npx",
      "args": ["-y", "replicate-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": "YOUR_REPLICATE_API_TOKEN"
      }
    }
  }
}
```

**Get API Key**: https://replicate.com/account/api-tokens

**Recommended Models for Commercial Use:**
- `black-forest-labs/flux-1.1-pro` - Best quality, $0.04/image
- `black-forest-labs/flux-schnell` - Fast, free tier available
- `stability-ai/sdxl` - Stable Diffusion XL, $0.01/image

---

#### **5. Unsplash MCP (FREE CC0 Images)**
- **Purpose**: Search and download free stock photos
- **Use Cases**: Background images, generic business photos
- **Commercial Rights**: ✅ YES - CC0 license, no attribution required
- **Pricing**: FREE
- **Setup**: Community MCP (install via npm)

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "node",
      "args": ["/path/to/unsplash-mcp/index.js"],
      "env": {
        "UNSPLASH_ACCESS_KEY": "YOUR_ACCESS_KEY"
      }
    }
  }
}
```

**Get API Key**: https://unsplash.com/developers

---

### **Category 3: Data Storage**

#### **6. PostgreSQL MCP**
- **Purpose**: Store scraped data, research findings
- **Use Cases**: Research database, competitor tracking, statistics archive
- **Commercial Rights**: Free (PostgreSQL open source)
- **Setup**: https://github.com/modelcontextprotocol/servers/tree/main/src/postgres

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/yit_research"]
    }
  }
}
```

---

#### **7. Filesystem MCP**
- **Purpose**: Read/write files for data storage
- **Use Cases**: Save scraped data, cache results, organize images
- **Commercial Rights**: Free (built-in)
- **Setup**: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/Y-it-nano/data"]
    }
  }
}
```

---

## **Complete MCP Configuration Example**

Create or update: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "replicate": {
      "command": "npx",
      "args": ["-y", "replicate-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": "YOUR_REPLICATE_TOKEN"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/yit_research"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/Y-it-nano/data"]
    }
  }
}
```

---

## **Image Generation Options Comparison**

| Service | Cost | Commercial Rights | Quality | Speed | Best For |
|---------|------|------------------|---------|-------|----------|
| **Replicate (FLUX)** | $0.04/img | ✅ YES | Excellent | Fast | Custom illustrations |
| **Unsplash** | FREE | ✅ YES (CC0) | High | Instant | Stock photos |
| **Pexels** | FREE | ✅ YES (CC0) | High | Instant | Stock photos |
| **Pixabay** | FREE | ✅ YES (CC0) | Medium | Instant | Generic images |
| **Adobe Firefly** | $4.99/mo | ✅ YES + Indemnity | Excellent | Fast | Enterprise safety |
| **Midjourney** | $10/mo | ✅ YES (paid tier) | Excellent | Medium | Artistic images |
| **DALL-E 3** | $0.04/img | ✅ YES | Excellent | Fast | OpenAI integration |

**Recommendation for Y-It:**
1. **Unsplash MCP** - Free stock photos (warehouses, offices, people)
2. **Replicate FLUX** - Custom satirical illustrations, diagrams
3. **Fallback**: Pixabay for additional free options

---

## **API Key Setup Instructions**

### **1. Brave Search API**
1. Visit https://brave.com/search/api/
2. Sign up for developer account
3. Generate API key (free tier: 2,000 queries/month)
4. Add to config: `BRAVE_API_KEY=BSA...`

### **2. Replicate API**
1. Visit https://replicate.com/
2. Create account
3. Go to Account → API Tokens
4. Generate new token
5. Add to config: `REPLICATE_API_TOKEN=r8_...`

### **3. Unsplash API**
1. Visit https://unsplash.com/developers
2. Register as developer
3. Create new application
4. Copy Access Key
5. Add to config: `UNSPLASH_ACCESS_KEY=...`

---

## **Testing Your MCP Setup**

### **Test 1: Web Search**
```
Prompt to Claude:
"Use Brave Search to find the top 5 dropshipping gurus with courses in 2024"
```

### **Test 2: Image Generation**
```
Prompt to Claude:
"Use Replicate to generate an image: satirical cartoon of a warehouse full of unsold dropshipping products, business illustration style"
```

### **Test 3: Free Image Search**
```
Prompt to Claude:
"Use Unsplash to find 3 high-quality images of: warehouse shelves, cardboard boxes, stressed entrepreneur"
```

### **Test 4: Web Scraping**
```
Prompt to Claude:
"Use Puppeteer to scrape the pricing page of shopify.com and extract plan costs"
```

---

## **Cost Estimation**

### **Minimal Setup (FREE)**
- Brave Search: Free tier (2K queries/month)
- Puppeteer: Free (open source)
- Fetch: Free (built-in)
- Unsplash: Free (unlimited with attribution waived)
- PostgreSQL: Free (self-hosted)

**Total Cost: $0/month** ✅

### **Premium Setup (Research + Image Gen)**
- Brave Search Pro: $5/month (up to 2M queries)
- Replicate FLUX: ~$5/month (100 images @ $0.04 each)
- Unsplash: Free
- PostgreSQL: Free

**Total Cost: ~$10/month**

### **Enterprise Setup (High Volume)**
- Brave Search: $15/month (unlimited)
- Replicate: $50/month (~1000 images)
- Adobe Firefly: $50/month (indemnity protection)
- Midjourney Pro: $30/month

**Total Cost: ~$145/month**

**Recommendation for Y-It:** Start with **Minimal Setup**, add Replicate ($5/mo) for custom images

---

## **Security Best Practices**

1. **Never commit API keys to git**
   - Use `.env` files
   - Add `.env` to `.gitignore`
   - Store keys in environment variables

2. **Use environment-specific configs**
   ```bash
   # Development
   ~/.config/Claude/claude_desktop_config.json

   # Production
   Use secrets manager (AWS Secrets Manager, 1Password, etc.)
   ```

3. **Rotate API keys regularly**
   - Every 90 days minimum
   - Immediately if compromised

4. **Monitor API usage**
   - Set billing alerts
   - Track usage per project
   - Review monthly costs

---

## **Troubleshooting**

### **MCP Server Not Loading**
- Check Node.js is installed: `node --version` (need v18+)
- Verify config JSON syntax (use JSONLint.com)
- Restart Claude Desktop
- Check logs: `~/Library/Logs/Claude/mcp.log` (Mac)

### **API Key Invalid**
- Regenerate key from provider dashboard
- Check for extra spaces/newlines in config
- Verify key has required permissions

### **Rate Limiting Errors**
- Implement caching (save results to avoid repeat requests)
- Add delays between requests
- Upgrade to paid tier if needed

---

## **Next Steps**

1. ✅ Create `claude_desktop_config.json` with desired MCPs
2. ✅ Sign up for API keys (Brave, Replicate, Unsplash)
3. ✅ Test each MCP with simple prompts
4. ✅ Create test folder structure (see `/infrastructure/testing/image-generation/`)
5. ✅ Integrate with `/agent-web-research-orchestrator`
6. ✅ Set up PostgreSQL database for research data
7. ✅ Create monitoring for API costs and usage

---

**Document Version:** 1.0
**Last Updated:** November 10, 2025
**Maintained By:** Infrastructure Team
**Related Docs:**
- `/agent-web-research-orchestrator.md`
- `/infrastructure/testing/README.md`
- `/database/schema.sql`
