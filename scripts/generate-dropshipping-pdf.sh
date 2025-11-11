#!/bin/bash
# Dropshipping PDF Generation Script
# Generates production-ready KDP PDF from refined manuscript + imagery

set -e

PROJECT_ROOT="/home/user/Y-it-nano"
SCRIPT="${PROJECT_ROOT}/scripts/pdf_generator.py"
CONFIG="${PROJECT_ROOT}/templates/dropshipping-example-config.json"
MANUSCRIPT="${PROJECT_ROOT}/DROPSHIPPING_LEG1_RAW_MANUSCRIPT.md"
IMAGERY_DIR="${PROJECT_ROOT}/imagery/dropshipping"
OUTPUT_PDF="${PROJECT_ROOT}/pdfs/dropshipping-final.pdf"

echo "=========================================="
echo "Dropshipping PDF Generation"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  Script: $SCRIPT"
echo "  Config: $CONFIG"
echo "  Manuscript: $MANUSCRIPT"
echo "  Imagery: $IMAGERY_DIR"
echo "  Output: $OUTPUT_PDF"
echo ""

# Verify prerequisites
echo "Verifying prerequisites..."
if [ ! -f "$SCRIPT" ]; then
    echo "ERROR: PDF generator script not found: $SCRIPT"
    exit 1
fi

if [ ! -f "$CONFIG" ]; then
    echo "ERROR: Configuration file not found: $CONFIG"
    exit 1
fi

if [ ! -f "$MANUSCRIPT" ]; then
    echo "ERROR: Manuscript not found: $MANUSCRIPT"
    exit 1
fi

if [ ! -d "$IMAGERY_DIR" ]; then
    echo "WARNING: Imagery directory not found: $IMAGERY_DIR"
    echo "Creating directory..."
    mkdir -p "$IMAGERY_DIR"
    echo "NOTE: Add imagery files to $IMAGERY_DIR before running"
fi

echo "All prerequisites verified ✓"
echo ""

# Execute PDF generation
echo "Generating PDF..."
echo ""

python3 "$SCRIPT" \
    --config "$CONFIG" \
    --output "$OUTPUT_PDF" \
    --validate

echo ""
echo "=========================================="
echo "PDF Generation Complete!"
echo "=========================================="
echo "Output: $OUTPUT_PDF"
echo ""

# Verify output
if [ -f "$OUTPUT_PDF" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_PDF" | cut -f1)
    echo "File Size: $FILE_SIZE"
    echo "✓ PDF successfully generated"
else
    echo "ERROR: PDF was not generated"
    exit 1
fi
