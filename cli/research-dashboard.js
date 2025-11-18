#!/usr/bin/env node

/**
 * Y-It Research Progress Dashboard
 * Track progress across all 7 Batch A topics with detailed metrics
 */

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
};

function printHeader() {
  console.clear();
  console.log(`${colors.magenta}${colors.bright}`);
  console.log(`╔════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║              BATCH A RESEARCH PROGRESS - 7 TOPIC TRACKER                  ║`);
  console.log(`╚════════════════════════════════════════════════════════════════════════════╝`);
  console.log(`${colors.reset}\n`);
}

function createProgressBar(percent, width = 25) {
  const filled = Math.floor(percent / 100 * width);
  const empty = width - filled;

  let color = colors.red;
  if (percent === 100) color = colors.green;
  else if (percent >= 75) color = colors.yellow;
  else if (percent >= 25) color = colors.blue;

  return `${color}[${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}${color}]${colors.reset}`;
}

function printDetailedProgress() {
  const topics = [
    {
      slug: 'dropshipping',
      name: 'Dropshipping',
      progress: 100,
      phase: 'Research Complete',
      metrics: {
        research: '✓ 12,500 words',
        sources: '✓ 45+ sources',
        validation: '✓ 96%',
        cases: '✓ 11 studies',
        affiliates: '✓ 78 programs'
      }
    },
    {
      slug: 'amazon-fba',
      name: 'Amazon FBA',
      progress: 0,
      phase: 'Queued',
      metrics: {
        research: '○ Pending',
        sources: '○ Pending',
        validation: '○ Pending',
        cases: '○ Pending',
        affiliates: '○ Pending'
      }
    },
    {
      slug: 'print-on-demand',
      name: 'Print-on-Demand',
      progress: 0,
      phase: 'Queued',
      metrics: {
        research: '○ Pending',
        sources: '○ Pending',
        validation: '○ Pending',
        cases: '○ Pending',
        affiliates: '○ Pending'
      }
    },
    {
      slug: 'affiliate-marketing',
      name: 'Affiliate Marketing',
      progress: 0,
      phase: 'Queued',
      metrics: {
        research: '○ Pending',
        sources: '○ Pending',
        validation: '○ Pending',
        cases: '○ Pending',
        affiliates: '○ Pending'
      }
    },
    {
      slug: 'course-creation',
      name: 'Course Creation',
      progress: 0,
      phase: 'Queued',
      metrics: {
        research: '○ Pending',
        sources: '○ Pending',
        validation: '○ Pending',
        cases: '○ Pending',
        affiliates: '○ Pending'
      }
    },
    {
      slug: 'smma',
      name: 'SMMA',
      progress: 0,
      phase: 'Queued',
      metrics: {
        research: '○ Pending',
        sources: '○ Pending',
        validation: '○ Pending',
        cases: '○ Pending',
        affiliates: '○ Pending'
      }
    },
    {
      slug: 'youtube-monetization',
      name: 'YouTube Monetization',
      progress: 0,
      phase: 'Queued',
      metrics: {
        research: '○ Pending',
        sources: '○ Pending',
        validation: '○ Pending',
        cases: '○ Pending',
        affiliates: '○ Pending'
      }
    },
  ];

  topics.forEach((topic, idx) => {
    const color = topic.progress === 100 ? colors.green : topic.progress > 0 ? colors.yellow : colors.dim;
    const icon = topic.progress === 100 ? '✅' : topic.progress > 0 ? '🔄' : '⏸️';

    console.log(`${color}${colors.bright}${idx + 1}. ${topic.name.toUpperCase()}${colors.reset}`);
    console.log(`   Status: ${color}${topic.phase}${colors.reset}  |  Progress: ${createProgressBar(topic.progress)} ${topic.progress}%`);
    console.log(`   ${colors.dim}Metrics:${colors.reset}`);
    console.log(`     Research Brief: ${topic.metrics.research.padEnd(18)} Sources: ${topic.metrics.sources.padEnd(18)} Validation: ${topic.metrics.validation}`);
    console.log(`     Case Studies:   ${topic.metrics.cases.padEnd(18)} Affiliates: ${topic.metrics.affiliates}`);
    console.log();
  });
}

function printBatchSummary() {
  console.log(`${colors.bright}${colors.cyan}━━━ BATCH A SUMMARY ━━━${colors.reset}\n`);
  console.log(`  Overall Progress:     ${createProgressBar(14.3, 30)} 1/7 (14%)`);
  console.log(`  Completed:            ${colors.green}${colors.bright}1${colors.reset} topic (Dropshipping)`);
  console.log(`  In Progress:          ${colors.yellow}${colors.bright}0${colors.reset} topics`);
  console.log(`  Queued:               ${colors.dim}6${colors.reset} topics`);
  console.log();
  console.log(`  Target Completion:    ${colors.bright}November 16-17, 2025${colors.reset}`);
  console.log(`  Days Remaining:       ${colors.yellow}6-7 days${colors.reset}`);
  console.log();
}

function printResearchQualityConsistency() {
  console.log(`${colors.bright}${colors.blue}━━━ QUALITY CONSISTENCY TARGET ━━━${colors.reset}\n`);
  console.log(`  ${colors.dim}Each topic must meet these standards:${colors.reset}\n`);

  const standards = [
    { metric: 'Validation Rate', target: '≥95%', dropshipping: '96% ✓' },
    { metric: 'Sources Cited', target: '≥40', dropshipping: '45 ✓' },
    { metric: 'Research Words', target: '≥3,000', dropshipping: '12,500 ✓' },
    { metric: 'Case Studies', target: '11', dropshipping: '11 ✓' },
    { metric: 'Affiliates Cataloged', target: '≥50', dropshipping: '78 ✓' },
  ];

  console.log(`  ${'Metric'.padEnd(25)} ${'Target'.padEnd(15)} ${'Dropshipping'.padEnd(20)}`);
  console.log(`  ${colors.dim}${'─'.repeat(60)}${colors.reset}`);

  standards.forEach(s => {
    console.log(`  ${s.metric.padEnd(25)} ${colors.yellow}${s.target.padEnd(15)}${colors.reset} ${colors.green}${s.dropshipping}${colors.reset}`);
  });

  console.log();
}

function printTimeline() {
  console.log(`${colors.bright}${colors.magenta}━━━ 7-DAY RESEARCH TIMELINE (Per Topic) ━━━${colors.reset}\n`);

  const timeline = [
    { day: 'Day 0', phase: 'Setup', tasks: 'Folder structure, topic registration', agent: 'Archival Curator' },
    { day: 'Day 1-2', phase: 'Research', tasks: '7-phase framework, source validation', agent: 'Research Validator' },
    { day: 'Day 3-4', phase: 'Case Studies', tasks: '11 anonymized studies, audit', agent: 'Case Study Auditor' },
    { day: 'Day 3-6', phase: 'Affiliates', tasks: '75+ programs cataloged (parallel)', agent: 'Affiliate Scout' },
    { day: 'Day 5-6', phase: 'Validation', tasks: 'Data cross-reference, gap fill', agent: 'Fact Checker' },
    { day: 'Day 7', phase: 'Handoff', tasks: 'Content outline, final package', agent: 'Topic Architect' },
  ];

  console.log(`  ${'Day'.padEnd(12)} ${'Phase'.padEnd(18)} ${'Agent'.padEnd(22)} ${'Tasks'.padEnd(35)}`);
  console.log(`  ${colors.dim}${'─'.repeat(87)}${colors.reset}`);

  timeline.forEach(t => {
    console.log(`  ${colors.cyan}${t.day.padEnd(12)}${colors.reset} ${t.phase.padEnd(18)} ${colors.dim}${t.agent.padEnd(22)}${colors.reset} ${colors.dim}${t.tasks}${colors.reset}`);
  });

  console.log();
}

function printNextActions() {
  console.log(`${colors.bright}${colors.red}━━━ NEXT ACTIONS ━━━${colors.reset}\n`);
  console.log(`  ${colors.yellow}1.${colors.reset} ${colors.bright}Launch remaining 6 research agents${colors.reset} (amazon-fba, print-on-demand, etc.)`);
  console.log(`     ${colors.dim}Command: Execute parallel Task tool calls for all 6 topics${colors.reset}`);
  console.log();
  console.log(`  ${colors.yellow}2.${colors.reset} ${colors.bright}Review dropshipping research${colors.reset} (optional)`);
  console.log(`     ${colors.dim}Files: archives/01-RESEARCH/dropshipping/*.md${colors.reset}`);
  console.log();
  console.log(`  ${colors.yellow}3.${colors.reset} ${colors.bright}Decide on affiliate signup${colors.reset} (optional, can wait)`);
  console.log(`     ${colors.dim}File: archives/01-RESEARCH/dropshipping/AFFILIATE_CATALOG_TABLE.csv${colors.reset}`);
  console.log();
}

function printFooter() {
  const timestamp = new Date().toLocaleString();
  console.log(`${colors.dim}═══════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.dim}Last Updated: ${timestamp} | Batch: A | Strategy: Parallel Execution${colors.reset}\n`);
}

function render() {
  printHeader();
  printBatchSummary();
  printDetailedProgress();
  printResearchQualityConsistency();
  printTimeline();
  printNextActions();
  printFooter();
}

if (require.main === module) {
  render();
}

module.exports = { render };
