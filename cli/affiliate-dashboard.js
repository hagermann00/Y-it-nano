#!/usr/bin/env node

/**
 * Y-It Affiliate Opportunities Dashboard
 * Filterable view of affiliate programs by category, revenue, ethical score
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
};

function printHeader() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}`);
  console.log(`╔════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║               AFFILIATE OPPORTUNITIES DASHBOARD - DROPSHIPPING             ║`);
  console.log(`╚════════════════════════════════════════════════════════════════════════════╝`);
  console.log(`${colors.reset}\n`);
}

function printSummary() {
  console.log(`${colors.bright}${colors.blue}━━━ SUMMARY ━━━${colors.reset}\n`);
  console.log(`  Total Entities Cataloged:     ${colors.bright}78${colors.reset}`);
  console.log(`  Active Affiliate Programs:    ${colors.green}${colors.bright}62${colors.reset}`);
  console.log(`  No Affiliate Program:         ${colors.dim}8${colors.reset}`);
  console.log(`  Needs Further Research:       ${colors.yellow}16${colors.reset}`);
  console.log();
  console.log(`  ${colors.dim}Revenue Potential (per 1,000 sales):${colors.reset}`);
  console.log(`    Conservative: ${colors.green}$1,150${colors.reset}/mo | Realistic: ${colors.green}$1,800${colors.reset}/mo | Optimistic: ${colors.green}$2,350${colors.reset}/mo`);
  console.log();
}

function printTopOpportunities() {
  console.log(`${colors.bright}${colors.green}━━━ TOP 10 REVENUE OPPORTUNITIES ━━━${colors.reset}\n`);

  const top = [
    { rank: 1, name: 'Shopify Partner', commission: '$150 OR 20% rec', potential: 'Very High', ethical: '9/10', category: 'Platform' },
    { rank: 2, name: 'BigCommerce', commission: '200% (~$160-600)', potential: 'Very High', ethical: '9/10', category: 'Platform' },
    { rank: 3, name: 'Upwork', commission: '70% of $150 + 5%', potential: 'Very High', ethical: '10/10', category: 'Alternative' },
    { rank: 4, name: 'Fiverr', commission: '$15-150 CPA', potential: 'Very High', ethical: '10/10', category: 'Alternative' },
    { rank: 5, name: 'Spocket', commission: '20-30% for 15mo', potential: 'Very High', ethical: '8/10', category: 'Supplier' },
    { rank: 6, name: 'Anton Kraly', commission: '40% (~$1,600)', potential: 'High', ethical: '7/10', category: 'Guru Course' },
    { rank: 7, name: 'ThriveCart', commission: '40% lifetime', potential: 'Very High', ethical: '9/10', category: 'Tool' },
    { rank: 8, name: 'Printful', commission: '10% for 12mo', potential: 'Med-High', ethical: '9/10', category: 'Supplier' },
    { rank: 9, name: 'Semrush', commission: '$200 OR 40% rec', potential: 'High', ethical: '9/10', category: 'Tool' },
    { rank: 10, name: 'Canva Pro', commission: '15-80% rec', potential: 'Med-High', ethical: '10/10', category: 'Tool' },
  ];

  console.log(`  ${'#'.padEnd(3)} ${'Name'.padEnd(20)} ${'Commission'.padEnd(20)} ${'Potential'.padEnd(10)} ${'Ethical'.padEnd(8)} ${'Category'.padEnd(12)}`);
  console.log(`  ${colors.dim}${'─'.repeat(77)}${colors.reset}`);

  top.forEach(t => {
    const ethicalColor = parseInt(t.ethical) >= 9 ? colors.green : parseInt(t.ethical) >= 7 ? colors.yellow : colors.red;
    console.log(`  ${colors.dim}${String(t.rank).padEnd(3)}${colors.reset} ${t.name.padEnd(20)} ${t.commission.padEnd(20)} ${t.potential.padEnd(10)} ${ethicalColor}${t.ethical.padEnd(8)}${colors.reset} ${colors.dim}${t.category}${colors.reset}`);
  });

  console.log();
}

function printByCategory() {
  console.log(`${colors.bright}${colors.magenta}━━━ BREAKDOWN BY CATEGORY ━━━${colors.reset}\n`);

  const categories = [
    { name: 'Platforms', count: 6, active: 6, avgEthical: '8.8/10', revenue: '$450-900/mo' },
    { name: 'Guru Courses', count: 15, active: 8, avgEthical: '6.5/10', revenue: '$100-200/mo' },
    { name: 'Tools & Software', count: 37, active: 30, avgEthical: '8.5/10', revenue: '$150-300/mo' },
    { name: 'Suppliers', count: 10, active: 8, avgEthical: '7.8/10', revenue: '$100-250/mo' },
    { name: 'Alternatives', count: 10, active: 10, avgEthical: '10/10', revenue: '$350-700/mo' },
  ];

  console.log(`  ${'Category'.padEnd(20)} ${'Total'.padEnd(8)} ${'Active'.padEnd(8)} ${'Avg Ethical'.padEnd(12)} ${'Revenue/1K sales'.padEnd(18)}`);
  console.log(`  ${colors.dim}${'─'.repeat(70)}${colors.reset}`);

  categories.forEach(c => {
    const ethicalColor = c.avgEthical === '10/10' ? colors.green : parseFloat(c.avgEthical) >= 8 ? colors.yellow : colors.red;
    console.log(`  ${c.name.padEnd(20)} ${String(c.count).padEnd(8)} ${colors.green}${String(c.active).padEnd(8)}${colors.reset} ${ethicalColor}${c.avgEthical.padEnd(12)}${colors.reset} ${colors.bright}${c.revenue}${colors.reset}`);
  });

  console.log();
}

function printEthicalTiers() {
  console.log(`${colors.bright}${colors.cyan}━━━ BY ETHICAL SCORE ━━━${colors.reset}\n`);

  console.log(`  ${colors.green}█${colors.reset} 10/10 Ethical (Perfect Alignment): ${colors.bright}9 programs${colors.reset}`);
  console.log(`    ${colors.dim}Upwork, Fiverr, Canva, Grammarly, Notion, Udemy, Coursera, etc.${colors.reset}`);
  console.log();

  console.log(`  ${colors.yellow}█${colors.reset} 8-9/10 Ethical (Good Alignment): ${colors.bright}35 programs${colors.reset}`);
  console.log(`    ${colors.dim}Shopify, BigCommerce, Spocket, Printful, Semrush, etc.${colors.reset}`);
  console.log();

  console.log(`  ${colors.red}█${colors.reset} 6-7/10 Ethical (Acceptable): ${colors.bright}18 programs${colors.reset}`);
  console.log(`    ${colors.dim}Anton Kraly, Project Verum, Sell The Trend, etc.${colors.reset}`);
  console.log();

  console.log(`  ${colors.dim}█${colors.reset} <6/10 Ethical (Questionable): ${colors.dim}8 programs${colors.reset}`);
  console.log(`    ${colors.dim}AliExpress, discontinued/inactive courses${colors.reset}`);
  console.log();
}

function printNeedsAction() {
  console.log(`${colors.bright}${colors.yellow}━━━ NEEDS INQUIRY (16 Programs) ━━━${colors.reset}\n`);

  const needs = [
    { name: 'Project Verum', status: 'Get commission rate', priority: 'High' },
    { name: 'Jordan Welch', status: 'Check affiliate exists', priority: 'High' },
    { name: 'Dropship Breakthru', status: 'Get details', priority: 'Med' },
    { name: 'Ecomhunt', status: 'Confirm commission', priority: 'Med' },
    { name: 'DSers', status: 'Research program', priority: 'Low' },
    { name: '+ 11 more...', status: 'Various details needed', priority: 'Low' },
  ];

  needs.forEach(n => {
    const priorityColor = n.priority === 'High' ? colors.red : n.priority === 'Med' ? colors.yellow : colors.dim;
    console.log(`  ${priorityColor}●${colors.reset} ${n.name.padEnd(25)} ${colors.dim}${n.status}${colors.reset} ${priorityColor}[${n.priority}]${colors.reset}`);
  });

  console.log();
}

function printQuickFilters() {
  console.log(`${colors.bright}${colors.white}━━━ QUICK FILTERS (Use CSV) ━━━${colors.reset}\n`);
  console.log(`  ${colors.cyan}→${colors.reset} Show only active: ${colors.dim}Filter "Has Affiliate?" = Yes${colors.reset}`);
  console.log(`  ${colors.cyan}→${colors.reset} High revenue only: ${colors.dim}Filter "Revenue Potential" = Very High${colors.reset}`);
  console.log(`  ${colors.cyan}→${colors.reset} Perfect ethical: ${colors.dim}Filter "Ethical Score" = 10/10${colors.reset}`);
  console.log(`  ${colors.cyan}→${colors.reset} Ready to signup: ${colors.dim}Filter "Research Status" = COMPLETE${colors.reset}`);
  console.log();
  console.log(`  ${colors.bright}File:${colors.reset} ${colors.green}archives/01-RESEARCH/dropshipping/AFFILIATE_CATALOG_TABLE.csv${colors.reset}`);
  console.log();
}

function printFooter() {
  const timestamp = new Date().toLocaleString();
  console.log(`${colors.dim}═══════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.dim}Last Updated: ${timestamp} | Topic: Dropshipping | Total: 78 entities${colors.reset}\n`);
}

function render() {
  printHeader();
  printSummary();
  printTopOpportunities();
  printByCategory();
  printEthicalTiers();
  printNeedsAction();
  printQuickFilters();
  printFooter();
}

if (require.main === module) {
  render();
}

module.exports = { render };
