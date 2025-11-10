# Run Book Cover Generator - QUICK START

## **One-Time Setup (2 minutes)**

```bash
# Navigate to testing folder
cd /home/user/Y-it-nano/infrastructure/testing/

# Install dependencies
npm install

# Done! Ready to generate
```

---

## **Generate Book Covers (Run Now)**

```bash
# Generate across all platforms in parallel (headless mode)
npm run generate
```

**What happens:**
- ✅ Runs in **background** (headless)
- ✅ **3 platforms in parallel**: Gemini, ChatGPT, Copilot
- ✅ Auto-login with your credentials
- ✅ Downloads all images automatically
- ⏱️ Takes **2-3 minutes total**

---

## **Check Results**

```bash
# View generated images
ls -lh image-generation/book-covers/dropshipping/

# View detailed log
cat image-generation/book-covers/dropshipping/generation-results.json
```

---

## **Output Files**

```
image-generation/book-covers/dropshipping/
├── gemini-book-cover.png          ✅ From Google Gemini
├── chatgpt-book-cover.png         ✅ From ChatGPT (DALL-E 3)
├── copilot-book-cover.png         ✅ From Microsoft Copilot
└── generation-results.json        📄 Detailed log with timestamps
```

---

## **Troubleshooting**

### If npm install fails:
```bash
# Install Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Then retry
npm install
```

### If generation fails:
- Check `generation-results.json` for specific errors
- Run with visible browser (edit script: `headless: false`)
- Check if sites changed their UI (may need selector updates)

---

## **Credentials**

Currently configured with:
- **Email:** brihag8@gmail.com
- **Password:** (stored in script)

⚠️ **Security Note:** Change password after testing, or use saved sessions for future runs.

---

## **What's Next**

After first successful run:
1. Review all 3 generated covers
2. Pick the best one(s)
3. Script saves session cookies
4. Future runs won't need login (faster!)

---

## **Quick Commands**

```bash
# Generate book covers
npm run generate

# View results
ls image-generation/book-covers/dropshipping/

# View images (if GUI available)
xdg-open image-generation/book-covers/dropshipping/gemini-book-cover.png
```

---

**Ready?** Just run:
```bash
cd /home/user/Y-it-nano/infrastructure/testing/ && npm install && npm run generate
```

🎨 **Headless mode:** Runs in background while you use tablet!
