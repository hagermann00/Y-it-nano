#!/usr/bin/env node

/**
 * Y-It Project Dashboard
 * Main overview of entire book production pipeline
 */

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Backgrounds
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
};

// Box drawing characters
const box = {
  tl: '┌', tr: '┐', bl: '└', br: '┿',
  h: '─', v: '│',
  cross: '┼', vr: '├', vl: '┤',
  ht: '┬', hb: '┴'
};

function printHeader() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}`);
  console.log(`╔════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║                      Y-It BOOK PRODUCTION DASHBOARD                        ║`);
  console.log(`║                   "You've Invested Too Much" Series                        ║`);
  console.log(`╚════════════════════════════════════════════════════════════════════════════╝`);
  console.log(`${colors.reset}\n`);
}

function printBatchAProgress() {
  console.log(`${colors.bright}${colors.blue}━━━ BATCH A: E-COMMERCE TRIO + HIGH-DEMAND (7 Books) ━━━${colors.reset}\n`);

  const topics = [
    { name: 'Dropshipping', status: 'COMPLETE', phase: 'Research', progress: 100, color: colors.green },
    { name: 'Amazon FBA', status: 'QUEUED', phase: 'Research', progress: 0, color: colors.dim },
    { name: 'Print-on-Demand', status: 'QUEUED', phase: 'Research', progress: 0, color: colors.dim },
    { name: 'Affiliate Marketing', status: 'QUEUED', phase: 'Research', progress: 0, color: colors.dim },
    { name: 'Course Creation', status: 'QUEUED', phase: 'Research', progress: 0, color: colors.dim },
    { name: 'SMMA', status: 'QUEUED', phase: 'Research', progress: 0, color: colors.dim },
    { name: 'YouTube Monetization', status: 'QUEUED', phase: 'Research', progress: 0, color: colors.dim },
  ];

  topics.forEach(topic => {
    const progressBar = createProgressBar(topic.progress, 30);
    const statusIcon = topic.progress === 100 ? '✅' : topic.progress > 0 ? '🔄' : '⏸️';

    console.log(`${statusIcon} ${topic.color}${topic.name.padEnd(25)}${colors.reset} ${progressBar} ${topic.progress}%`);
  });

  console.log(`\n${colors.dim}Overall Batch Progress: 1/7 complete (14%)${colors.reset}\n`);
}

function createProgressBar(percent, width = 20) {
  const filled = Math.floor(percent / 100 * width);
  const empty = width - filled;

  let color = colors.red;
  if (percent >= 75) color = colors.green;
  else if (percent >= 50) color = colors.yellow;
  else if (percent >= 25) color = colors.blue;

  return `${color}[${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}${color}]${colors.reset}`;
}

function printResearchQuality() {
  console.log(`${colors.bright}${colors.magenta}━━━ RESEARCH QUALITY METRICS (Dropshipping) ━━━${colors.reset}\n`);

  const metrics = [
    { label: 'Validation Rate', value: '96%', target: '95%', status: 'pass' },
    { label: 'Sources Documented', value: '45+', target: '40+', status: 'pass' },
    { label: 'Word Count', value: '12,500', target: '3,000+', status: 'pass' },
    { label: 'Case Studies', value: '11', target: '11', status: 'pass' },
    { label: 'Affiliate Programs', value: '78', target: '50+', status: 'pass' },
  ];

  metrics.forEach(m => {
    const icon = m.status === 'pass' ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`  ${icon} ${m.label.padEnd(25)} ${colors.bright}${m.value}${colors.reset} ${colors.dim}(target: ${m.target})${colors.reset}`);
  });

  console.log();
}

function printAffiliateRevenue() {
  console.log(`${colors.bright}${colors.yellow}━━━ AFFILIATE REVENUE PROJECTIONS ━━━${colors.reset}\n`);

  console.log(`  ${colors.dim}Per 1,000 book sales:${colors.reset}`);
  console.log(`    Conservative: ${colors.green}$1,150${colors.reset}/month`);
  console.log(`    Realistic:    ${colors.green}$1,800${colors.reset}/month`);
  console.log(`    Optimistic:   ${colors.green}$2,350${colors.reset}/month`);
  console.log();
  console.log(`  ${colors.dim}At 10,000 sales:${colors.reset} ${colors.bright}${colors.green}$11,500-23,500${colors.reset}/month`);
  console.log(`  ${colors.dim}At 50,000 sales:${colors.reset} ${colors.bright}${colors.green}$57,500-117,500${colors.reset}/month`);
  console.log();
}

function printPipelineStatus() {
  console.log(`${colors.bright}${colors.cyan}━━━ PRODUCTION PIPELINE STATUS ━━━${colors.reset}\n`);

  const stages = [
    { name: 'Research (Phase 0)', complete: 1, total: 7, status: 'active' },
    { name: 'Content (Phase 1)', complete: 0, total: 7, status: 'pending' },
    { name: 'Design (Phase 2)', complete: 0, total: 7, status: 'pending' },
    { name: 'Production (Phase 3)', complete: 0, total: 7, status: 'pending' },
    { name: 'Marketing (Phase 4)', complete: 0, total: 7, status: 'pending' },
  ];

  stages.forEach(stage => {
    const percent = Math.round((stage.complete / stage.total) * 100);
    const bar = createProgressBar(percent, 20);
    const statusIcon = stage.status === 'active' ? '🔄' : stage.status === 'complete' ? '✅' : '⏸️';

    console.log(`  ${statusIcon} ${stage.name.padEnd(25)} ${bar} ${stage.complete}/${stage.total}`);
  });

  console.log();
}

function printRecentActivity() {
  console.log(`${colors.bright}${colors.white}━━━ RECENT ACTIVITY ━━━${colors.reset}\n`);

  const activities = [
    { time: '2m ago', action: 'Marketing messaging framework created', color: colors.green },
    { time: '5m ago', action: 'Affiliate catalog table (78 entities) archived', color: colors.green },
    { time: '8m ago', action: 'Affiliate Opportunity Scout completed', color: colors.green },
    { time: '1h ago', action: 'Dropshipping case studies validated (11/11)', color: colors.green },
    { time: '2h ago', action: 'Research brief completed (12,500 words)', color: colors.green },
  ];

  activities.forEach(a => {
    console.log(`  ${colors.dim}${a.time.padEnd(10)}${colors.reset} ${a.color}●${colors.reset} ${a.action}`);
  });

  console.log();
}

function printActionItems() {
  console.log(`${colors.bright}${colors.red}━━━ NEXT ACTIONS REQUIRED ━━━${colors.reset}\n`);

  console.log(`  ${colors.yellow}⚠${colors.reset}  Launch remaining 6 research agents (Amazon FBA, POD, etc.)`);
  console.log(`  ${colors.yellow}⚠${colors.reset}  Review dropshipping research for content phase approval`);
  console.log(`  ${colors.yellow}⚠${colors.reset}  Sign up for top 10 affiliate programs (Shopify, Upwork, etc.)`);
  console.log();
}

function printFooter() {
  const timestamp = new Date().toLocaleString();
  console.log(`${colors.dim}═══════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.dim}Last Updated: ${timestamp} | Press Ctrl+C to exit | Run: node dashboard.js${colors.reset}\n`);
}

// Main execution
function render() {
  printHeader();
  printBatchAProgress();
  printResearchQuality();
  printAffiliateRevenue();
  printPipelineStatus();
  printRecentActivity();
  printActionItems();
  printFooter();
}

// Auto-refresh every 5 seconds
function startDashboard() {
  render();
  // Uncomment for auto-refresh:
  // setInterval(render, 5000);
}

if (require.main === module) {
  startDashboard();
}

module.exports = { render };
