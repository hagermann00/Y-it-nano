# Y-It PDF Assembly System — Quick Start Guide

**Get up and running in 5 minutes**

## 1. Install Dependencies (First Time Only)

```bash
pip install --upgrade pip setuptools wheel
pip install markdown weasyprint Pillow PyPDF2 reportlab
```

**macOS Users:**
```bash
brew install cairo pango gdk-pixbuf libffi
pip install markdown weasyprint Pillow PyPDF2 reportlab
```

**Linux Users:**
```bash
sudo apt-get install -y libpango-1.0-0 libpango-1.0-dev libcairo2 libcairo2-dev
pip install markdown weasyprint Pillow PyPDF2 reportlab
```

## 2. Verify Installation

```bash
python3 -c "import markdown, weasyprint, PIL; print('✓ All dependencies installed!')"
```

## 3. Create Directory Structure

```bash
cd /home/user/Y-it-nano
mkdir -p scripts styles templates pdfs imagery
chmod +x scripts/pdf_generator.py
```

## 4. For Each Topic: Create Configuration

**Step A:** Copy template
```bash
cp /home/user/Y-it-nano/templates/TEMPLATE_CONFIG.json \
   /home/user/Y-it-nano/templates/YOUR-TOPIC-config.json
```

**Step B:** Edit config (replace YOUR-TOPIC with actual topic):
```bash
nano /home/user/Y-it-nano/templates/YOUR-TOPIC-config.json
```

**Required edits:**
- `topic`: Change to your topic identifier (e.g., `dropshipping`)
- `title`: Full book title
- `manuscript_path`: Path to your LEG 2 refined manuscript
- `imagery_path`: Path to your images directory
- `output_path`: Where to save the PDF

**Step C:** Create imagery directory
```bash
mkdir -p /home/user/Y-it-nano/imagery/YOUR-TOPIC/
# Copy your images here
```

## 5. Generate PDF

```bash
python3 /home/user/Y-it-nano/scripts/pdf_generator.py \
  --config /home/user/Y-it-nano/templates/YOUR-TOPIC-config.json
```

**Expected output:**
```
============================================================
Y-It PDF GENERATOR
============================================================

[1/5] Parsing manuscript...
     ✓ Extracted metadata for: Y-It: Your Topic—Subtitle
     ✓ Converted markdown to HTML
[2/5] Processing images...
     ✓ Resolved image paths
[3/5] Generating HTML document...
     ✓ Generated complete HTML with CSS
[4/5] Generating PDF...
     ✓ PDF generated: /home/user/Y-it-nano/pdfs/your-topic-final.pdf
[5/5] Validating PDF...

============================================================
VALIDATION REPORT
============================================================

[FILE]
  ✓ File exists
  ✓ File size: 25.3 MB

[PAGES]
  ✓ Page count: 24 (expected: 24)

[METADATA]
  ✓ Title: Y-It: Your Topic—Subtitle
  ✓ Author: Y-It Guides

[FONTS]
  ✓ Fonts verified

============================================================

✓ SUCCESS: PDF generated successfully
  Output: /home/user/Y-it-nano/pdfs/your-topic-final.pdf
```

## 6. Review PDF

Open the PDF in your PDF reader:
```bash
# macOS
open /home/user/Y-it-nano/pdfs/YOUR-TOPIC-final.pdf

# Linux
xdg-open /home/user/Y-it-nano/pdfs/YOUR-TOPIC-final.pdf

# Windows (WSL)
wslview /home/user/Y-it-nano/pdfs/YOUR-TOPIC-final.pdf
```

Check:
- [ ] Page count is correct
- [ ] Images are visible
- [ ] Typography looks good
- [ ] Colors are correct
- [ ] No text is cut off

## 7. Verify with Adobe Reader (Optional)

For final KDP submission verification:
1. Open PDF in Adobe Reader
2. File → Properties → Fonts
3. Confirm all fonts show "(Embedded)"

## 8. Submit to KDP

Once validated, your PDF is ready for KDP submission!

---

## Common Tasks

### Generate PDF for Dropshipping (Example)

```bash
python3 /home/user/Y-it-nano/scripts/pdf_generator.py \
  --config /home/user/Y-it-nano/templates/dropshipping-example-config.json
```

### Generate with Custom Output Path

```bash
python3 /home/user/Y-it-nano/scripts/pdf_generator.py \
  --config /home/user/Y-it-nano/templates/YOUR-TOPIC-config.json \
  --output /path/to/custom-output.pdf
```

### Validate Existing PDF (No Regeneration)

```bash
python3 /home/user/Y-it-nano/scripts/pdf_generator.py \
  --config /home/user/Y-it-nano/templates/YOUR-TOPIC-config.json \
  --validate-only
```

### Get Detailed Debug Output

```bash
python3 /home/user/Y-it-nano/scripts/pdf_generator.py \
  --config /home/user/Y-it-nano/templates/YOUR-TOPIC-config.json \
  --verbose
```

---

## File Locations Reference

```
Main Script:        /home/user/Y-it-nano/scripts/pdf_generator.py
CSS Stylesheet:     /home/user/Y-it-nano/styles/kdp-template.css
Config Template:    /home/user/Y-it-nano/templates/TEMPLATE_CONFIG.json
Example Configs:    /home/user/Y-it-nano/templates/*-example-config.json

For Each Topic:
  Config:           /home/user/Y-it-nano/templates/TOPIC-config.json
  Manuscript:       /home/user/Y-it-nano/TOPIC_LEG2_REFINED_MANUSCRIPT.md
  Images:           /home/user/Y-it-nano/imagery/TOPIC/
  Output PDF:       /home/user/Y-it-nano/pdfs/TOPIC-final.pdf
```

---

## Troubleshooting

### "Module not found" Error

```bash
# Reinstall dependencies
pip install --force-reinstall markdown weasyprint Pillow PyPDF2
```

### "CSS file not found"

Ensure file exists:
```bash
ls /home/user/Y-it-nano/styles/kdp-template.css
```

### "Manuscript file not found"

Check path in config:
```bash
ls /path/from/config/manuscript.md
```

### Images not appearing

Verify imagery directory:
```bash
ls /home/user/Y-it-nano/imagery/YOUR-TOPIC/
```

Check image filenames match manuscript references.

### Page count wrong

Edit config and update `page_count` to match actual page count in PDF.

---

## Next Steps

1. Read full documentation: `/home/user/Y-it-nano/PDF_ASSEMBLY_DOCUMENTATION.md`
2. Review example configs: `/home/user/Y-it-nano/templates/*-example-config.json`
3. Create configs for each of your 11 topics
4. Batch generate all PDFs (see Batch Processing in main docs)
5. Submit to KDP

---

**Questions?** See the FAQ and Troubleshooting sections in the full documentation.

**Ready to batch process all topics?** See "Batch Processing" in the full documentation for a shell script to generate all PDFs at once.
