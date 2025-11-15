---
title: Dropshipping PDF Generation Guide
subtitle: Complete Guide to Generating Production-Ready KDP PDF
created: 2025-11-11
status: ready-to-execute
---

# Dropshipping PDF Generation Guide

## Overview

This guide walks through generating a production-ready KDP PDF from the Dropshipping refined manuscript. The system uses the Python PDF generator system (pdf_generator.py) configured with KDP specifications.

**Current Status:**
- ✅ Manuscript: DROPSHIPPING_LEG1_RAW_MANUSCRIPT.md (refined, ready)
- ✅ PDF Generator: scripts/pdf_generator.py (production-ready)
- ✅ CSS Template: styles/kdp-template.css (KDP-compliant)
- ✅ Configuration: templates/dropshipping-example-config.json (pre-configured)
- ⏳ Imagery: Optional (use placeholders or add generated images)
- ⏳ Output: Ready to generate DROPSHIPPING_FINAL.pdf

---

## Quick Start (3 Steps)

### Step 1: Prepare Imagery (Optional)

If you have generated imagery from Midjourney/DALL-E:

```bash
# Copy imagery files to:
/home/user/Y-it-nano/imagery/dropshipping/

# Expected files:
# - 7 portrait PNGs: sarah-martinez.png, marcus-chen.png, etc.
# - 4 SVG charts: survival-curve.svg, cost-waterfall.svg, etc.
```

**If no imagery yet:** The PDF generator will skip image placeholders and generate a text-only PDF.

### Step 2: Run PDF Generation

```bash
cd /home/user/Y-it-nano
python3 scripts/pdf_generator.py \
  --config templates/dropshipping-example-config.json \
  --output pdfs/dropshipping-final.pdf \
  --validate
```

Or use the wrapper script:

```bash
bash scripts/generate-dropshipping-pdf.sh
```

### Step 3: Verify Output

```bash
ls -lh pdfs/dropshipping-final.pdf
file pdfs/dropshipping-final.pdf
```

Expected output:
- File size: 15-40 MB
- Format: PDF (PDF-1.4 or higher)
- Pages: 24
- Color space: CMYK (print-optimized)

---

## Detailed Process

### Configuration Details

**File:** `templates/dropshipping-example-config.json`

**Key Settings:**
```json
{
  "manuscript_path": "/home/user/Y-it-nano/DROPSHIPPING_LEG1_RAW_MANUSCRIPT.md",
  "imagery_path": "/home/user/Y-it-nano/imagery/dropshipping/",
  "output_path": "/home/user/Y-it-nano/pdfs/dropshipping-final.pdf",
  "specs": {
    "width": 6,              // inches (KDP standard)
    "height": 9,             // inches (KDP standard)
    "bleed": 0.125,          // inches (KDP required)
    "dpi": 300,              // print quality
    "colorspace": "CMYK"     // print format
  }
}
```

### PDF Generator Features

**Automatic Processing:**
1. **Markdown → HTML:** Converts manuscript markdown to structured HTML
2. **CSS Styling:** Applies KDP-compliant CSS template
3. **Image Embedding:** Inserts imagery with proper DPI/format
4. **Font Embedding:** Embeds all fonts for consistency
5. **CMYK Conversion:** Converts color space for print
6. **Validation:** Verifies page count, images, DPI, metadata

**Output Validation Checklist:**
- ✓ Page count: 24 pages
- ✓ Image quality: 300 DPI minimum
- ✓ Font embedding: All fonts embedded
- ✓ Metadata: Title, author, keywords included
- ✓ Bleed: 0.125" bleed maintained
- ✓ Color space: CMYK for print

---

## Imagery Integration (Optional)

### If You Have Generated Imagery

**Portrait Files Needed:**
```
imagery/dropshipping/
├── sarah-martinez.png       (2" × 2.5", 300 DPI)
├── marcus-chen.png
├── david-thompson.png
├── jennifer-hayes.png
├── tyler-rodriguez.png
├── raj-patel.png
└── patricia-williams.png
```

**Chart Files Needed:**
```
imagery/dropshipping/
├── survival-curve.svg        (2" × 2.5")
├── cost-waterfall.svg
├── income-pyramid.svg
└── emotional-timeline.svg
```

### Image Specifications

**Portraits (7 files):**
- Format: PNG (preferred) or JPG
- Dimensions: 2" × 2.5"
- Resolution: 300 DPI minimum
- Color Space: RGB or CMYK
- File Size: <500 KB each

**Charts (4 files):**
- Format: SVG (preferred for scalability) or PNG
- Dimensions: 2" × 2.5"
- Resolution: 300 DPI (for raster exports)
- Color Space: RGB or CMYK
- File Size: <300 KB each

**Placement in Manuscript:**
Images are referenced in the manuscript using markers:
```markdown
[IMAGE:portrait:sarah-martinez]
[IMAGE:chart:survival-curve]
```

The PDF generator automatically locates and embeds images from the imagery directory.

---

## Troubleshooting

### Common Issues

**Issue: "Image not found"**
```
Solution: Place images in /home/user/Y-it-nano/imagery/dropshipping/
with exact filenames matching manuscript references
```

**Issue: "DPI mismatch"**
```
Solution: Ensure images are 300 DPI minimum
Use imagemagick: convert image.png -density 300 image-300dpi.png
```

**Issue: "Font embedding failed"**
```
Solution: PDF generator includes fallback fonts (Liberation, DejaVu)
Check system fonts: fc-list | grep -i "bebas\|lato"
```

**Issue: "PDF file size too large (>40MB)"**
```
Solution: Compress images or reduce image quality
Use: gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q input.pdf -o output.pdf
```

**Issue: "CMYK conversion issues"**
```
Solution: Pre-convert images to CMYK before adding to imagery directory
Use: convert image.png -colorspace CMYK image-cmyk.png
```

---

## Output Files & Next Steps

### Generated Files
- **DROPSHIPPING_FINAL.pdf** (24 pages, CMYK, 300 DPI, KDP-ready)

### Next Steps After PDF Generation

1. **Review PDF**
   - Check page count (24 pages)
   - Verify all images embedded correctly
   - Review typography and layout
   - Check color accuracy

2. **Validate for KDP**
   - Confirm 6" × 9" dimensions
   - Confirm 0.125" bleed on all sides
   - Verify CMYK color space
   - Check file size (15-40 MB range)

3. **Submit to KDP**
   - Upload DROPSHIPPING_FINAL.pdf to KDP
   - Set metadata (ISBN, title, keywords)
   - Configure print options and pricing
   - Submit for review

4. **Iterate (if needed)**
   - Update manuscript in DROPSHIPPING_LEG1_RAW_MANUSCRIPT.md
   - Update imagery in imagery/dropshipping/
   - Re-run PDF generation
   - Repeat validation

---

## Advanced: Custom Configuration

To modify PDF output (fonts, colors, margins, etc.):

1. Edit `templates/dropshipping-example-config.json`
2. Modify relevant sections:
   - `color_scheme` - Change primary/secondary colors
   - `fonts` - Change font families
   - `specs` - Adjust margins, DPI, dimensions
   - `metadata` - Update title, keywords, subject
3. Re-run PDF generation with updated config

Example custom config:
```json
{
  "topic": "dropshipping",
  "color_scheme": {
    "primary": "#FF5733",      // Custom primary color
    "secondary": "#FFD700"      // Custom secondary color
  },
  "specs": {
    "margin_top": 0.75,         // Increased top margin
    "margin_bottom": 0.75"
  }
}
```

---

## System Architecture

### PDF Generation Pipeline

```
DROPSHIPPING_LEG1_RAW_MANUSCRIPT.md
           ↓
     MarkdownParser (parse YAML metadata)
           ↓
     ImageLocator (find [IMAGE:...] markers)
           ↓
     HTMLConverter (markdown → HTML)
           ↓
     CSSApplier (apply kdp-template.css)
           ↓
     ImageProcessor (embed 300 DPI images)
           ↓
     FontEmbedder (embed Bebas Neue, Lato, Open Sans)
           ↓
     WeasyPrint (HTML → PDF via Chromium)
           ↓
     CMYKConverter (RGB → CMYK for print)
           ↓
     Validator (verify pages, DPI, metadata, bleed)
           ↓
     DROPSHIPPING_FINAL.pdf ✓
```

### Tools & Dependencies

- **Python 3.7+** - Script engine
- **WeasyPrint** - HTML-to-PDF conversion
- **Pillow** - Image processing
- **reportlab** - PDF manipulation
- **Chromium/Chrome** - Rendering engine (weasyprint dependency)

---

## Conclusion

The Dropshipping PDF generation is now ready to execute. You have two options:

### Option A: Generate PDF Now (Text-Only)
```bash
bash scripts/generate-dropshipping-pdf.sh
```
This creates a complete 24-page PDF without imagery. Images can be added later.

### Option B: Generate Imagery First, Then PDF
1. Use DROPSHIPPING_IMAGERY_SPECS.md to generate images via Midjourney/DALL-E
2. Place images in imagery/dropshipping/
3. Run PDF generation script

### Recommended: Option A First
Generate the PDF now to verify the manuscript structure and layout are correct. Then add imagery and regenerate if needed.

---

**Status:** ✅ Ready to generate
**Command:** `bash scripts/generate-dropshipping-pdf.sh`
**Expected Output:** `/home/user/Y-it-nano/pdfs/dropshipping-final.pdf`
