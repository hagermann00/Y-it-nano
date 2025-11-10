#!/usr/bin/env node

/**
 * Parallel Book Cover Generator
 * Generates book covers across multiple AI platforms simultaneously
 *
 * Usage: node parallel-book-cover-generator.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  headless: true, // Run in background
  outputDir: '/home/user/Y-it-nano/infrastructure/testing/image-generation/book-covers/dropshipping',

  // Book details
  book: {
    title: "Y-It: WHY YOUR DROP SHIPPING STORE PROBABLY WILL FAIL",
    prompt: `Book cover design for "Y-It: WHY YOUR DROP SHIPPING STORE PROBABLY WILL FAIL"

Visual concept: Satirical editorial illustration showing a stressed entrepreneur sitting in an empty warehouse surrounded by mountains of unopened cardboard boxes with shipping labels, a laptop showing "$0 Sales", scattered unpaid bills, and a small "Going Out of Business" sign in the background.

Style: Bold editorial cartoon style like The Economist magazine covers, dramatic lighting with a spotlight on the entrepreneur creating long shadows from the box mountains, muted professional color palette (deep navy, charcoal grey, burnt orange accent), slightly exaggerated proportions for satirical effect.

Format: Trade paperback book cover, 6x9 inches, vertical composition, space at top for title "Y-It" in bold sans-serif, subtitle below, clean modern design with ironic contrast between motivational business book aesthetic and failure reality.

Mood: Darkly humorous, cautionary, professional but cynical, anti-guru energy.

Technical: High resolution, print-ready quality, book cover dimensions.`
  },

  // Login credentials
  credentials: {
    google: {
      email: 'brihag8@gmail.com',
      password: 'Bmh60707!'
    }
  }
};

// Helper: Save results
async function saveResult(service, success, imagePath, error = null) {
  const result = {
    service,
    success,
    imagePath,
    error,
    timestamp: new Date().toISOString()
  };

  const resultsFile = path.join(CONFIG.outputDir, 'generation-results.json');
  let results = [];

  try {
    const existing = await fs.readFile(resultsFile, 'utf8');
    results = JSON.parse(existing);
  } catch (e) {
    // File doesn't exist yet
  }

  results.push(result);
  await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));

  return result;
}

// Generator: Gemini (Google)
async function generateGemini() {
  console.log('🎨 Starting Gemini generation...');
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to Gemini
    console.log('📍 Navigating to Gemini...');
    await page.goto('https://gemini.google.com/', { waitUntil: 'networkidle2' });

    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector('a[href*="accounts.google.com"]');
    });

    if (!isLoggedIn) {
      console.log('🔐 Logging into Google...');

      // Click sign in
      await page.click('a[href*="accounts.google.com"]');
      await page.waitForNavigation();

      // Enter email
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', CONFIG.credentials.google.email);
      await page.click('#identifierNext');

      // Wait for password field
      await page.waitForSelector('input[type="password"]', { visible: true });
      await page.type('input[type="password"]', CONFIG.credentials.google.password);
      await page.click('#passwordNext');

      // Wait for redirect back to Gemini
      await page.waitForNavigation({ timeout: 30000 });
      console.log('✅ Logged in successfully');
    } else {
      console.log('✅ Already logged in');
    }

    // Wait for input field
    await page.waitForSelector('div[contenteditable="true"]', { timeout: 10000 });

    // Type the prompt
    console.log('⌨️  Typing prompt...');
    await page.click('div[contenteditable="true"]');
    await page.keyboard.type('Generate an image: ' + CONFIG.book.prompt);

    // Find and click send button
    const sendButton = await page.$('button[aria-label="Send message"], button[aria-label="Send"]');
    if (sendButton) {
      await sendButton.click();
    } else {
      // Fallback: press Enter
      await page.keyboard.press('Enter');
    }

    console.log('⏳ Waiting for image generation...');

    // Wait for generated image (adjust selector as needed)
    await page.waitForSelector('img[alt*="Generated"], img[src*="googleusercontent"]', {
      timeout: 120000 // 2 minutes
    });

    console.log('📸 Image generated! Downloading...');

    // Get image URL
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="Generated"], img[src*="googleusercontent"]');
      return img ? img.src : null;
    });

    if (imageUrl) {
      // Download image
      const viewSource = await page.goto(imageUrl);
      const buffer = await viewSource.buffer();

      const outputPath = path.join(CONFIG.outputDir, 'gemini-book-cover.png');
      await fs.writeFile(outputPath, buffer);

      console.log('✅ Gemini: Image saved to', outputPath);
      await saveResult('gemini', true, outputPath);

      return { success: true, path: outputPath };
    } else {
      throw new Error('Could not find generated image');
    }

  } catch (error) {
    console.error('❌ Gemini failed:', error.message);
    await saveResult('gemini', false, null, error.message);
    return { success: false, error: error.message };

  } finally {
    await browser.close();
  }
}

// Generator: ChatGPT
async function generateChatGPT() {
  console.log('🎨 Starting ChatGPT generation...');
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📍 Navigating to ChatGPT...');
    await page.goto('https://chat.openai.com/', { waitUntil: 'networkidle2' });

    // Check if login needed
    const loginNeeded = await page.evaluate(() => {
      return !!document.querySelector('button:has-text("Log in"), a[href*="login"]');
    });

    if (loginNeeded) {
      console.log('🔐 Logging into ChatGPT...');
      // Try to use Google OAuth
      await page.click('button:has-text("Continue with Google")');
      await page.waitForNavigation();

      // Google login (same as Gemini)
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', CONFIG.credentials.google.email);
      await page.click('#identifierNext');
      await page.waitForSelector('input[type="password"]', { visible: true });
      await page.type('input[type="password"]', CONFIG.credentials.google.password);
      await page.click('#passwordNext');
      await page.waitForNavigation({ timeout: 30000 });

      console.log('✅ Logged in successfully');
    }

    // Wait for chat input
    await page.waitForSelector('textarea[data-id="root"]', { timeout: 10000 });

    console.log('⌨️  Typing prompt...');
    await page.click('textarea[data-id="root"]');
    await page.keyboard.type('Generate an image: ' + CONFIG.book.prompt);

    // Send message
    await page.click('button[data-testid="send-button"]');

    console.log('⏳ Waiting for image generation...');

    // Wait for image (DALL-E 3)
    await page.waitForSelector('img[alt*="User uploaded image"], img[alt*="DALL"], img[src*="oaidalleapiprodscus"]', {
      timeout: 120000 // 2 minutes
    });

    console.log('📸 Image generated! Downloading...');

    // Download image
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="User uploaded image"], img[alt*="DALL"], img[src*="oaidalleapiprodscus"]');
      return img ? img.src : null;
    });

    if (imageUrl) {
      const viewSource = await page.goto(imageUrl);
      const buffer = await viewSource.buffer();

      const outputPath = path.join(CONFIG.outputDir, 'chatgpt-book-cover.png');
      await fs.writeFile(outputPath, buffer);

      console.log('✅ ChatGPT: Image saved to', outputPath);
      await saveResult('chatgpt', true, outputPath);

      return { success: true, path: outputPath };
    } else {
      throw new Error('Could not find generated image');
    }

  } catch (error) {
    console.error('❌ ChatGPT failed:', error.message);
    await saveResult('chatgpt', false, null, error.message);
    return { success: false, error: error.message };

  } finally {
    await browser.close();
  }
}

// Generator: Microsoft Copilot
async function generateCopilot() {
  console.log('🎨 Starting Copilot generation...');
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📍 Navigating to Copilot...');
    await page.goto('https://copilot.microsoft.com/', { waitUntil: 'networkidle2' });

    // Copilot might work without login (try first)
    console.log('⌨️  Typing prompt...');
    await page.waitForSelector('textarea', { timeout: 10000 });
    await page.click('textarea');

    // Switch to Creative mode if available
    try {
      await page.click('button:has-text("Creative"), button:has-text("More Creative")');
    } catch (e) {
      console.log('Note: Could not switch to Creative mode');
    }

    await page.keyboard.type('Generate an image: ' + CONFIG.book.prompt);
    await page.keyboard.press('Enter');

    console.log('⏳ Waiting for image generation...');

    // Wait for image
    await page.waitForSelector('img.generated-image, img[alt*="Generated"]', {
      timeout: 120000
    });

    console.log('📸 Image generated! Downloading...');

    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('img.generated-image, img[alt*="Generated"]');
      return img ? img.src : null;
    });

    if (imageUrl) {
      const viewSource = await page.goto(imageUrl);
      const buffer = await viewSource.buffer();

      const outputPath = path.join(CONFIG.outputDir, 'copilot-book-cover.png');
      await fs.writeFile(outputPath, buffer);

      console.log('✅ Copilot: Image saved to', outputPath);
      await saveResult('copilot', true, outputPath);

      return { success: true, path: outputPath };
    } else {
      throw new Error('Could not find generated image');
    }

  } catch (error) {
    console.error('❌ Copilot failed:', error.message);
    await saveResult('copilot', false, null, error.message);
    return { success: false, error: error.message };

  } finally {
    await browser.close();
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting parallel book cover generation...');
  console.log('📖 Book:', CONFIG.book.title);
  console.log('🔧 Mode: Headless');
  console.log('');

  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  // Run all generators in parallel
  const results = await Promise.allSettled([
    generateGemini(),
    generateChatGPT(),
    generateCopilot()
  ]);

  console.log('');
  console.log('=' .repeat(60));
  console.log('📊 GENERATION COMPLETE');
  console.log('=' .repeat(60));

  results.forEach((result, index) => {
    const services = ['Gemini', 'ChatGPT', 'Copilot'];
    const service = services[index];

    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`✅ ${service}: SUCCESS - ${result.value.path}`);
    } else {
      const error = result.status === 'rejected' ? result.reason : result.value.error;
      console.log(`❌ ${service}: FAILED - ${error}`);
    }
  });

  console.log('');
  console.log(`📁 All results saved to: ${CONFIG.outputDir}`);
  console.log(`📄 Detailed log: ${path.join(CONFIG.outputDir, 'generation-results.json')}`);
}

// Run
main().catch(console.error);
