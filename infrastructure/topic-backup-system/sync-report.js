#!/usr/bin/env node

/**
 * Sync Status Report Generator
 * Generate comprehensive reports on sync status
 */

const Database = require('better-sqlite3');
const chalk = require('chalk');
const Table = require('cli-table3');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { format } = require('date-fns');

const config = require('./config.json');

const args = minimist(process.argv.slice(2), {
  string: ['format', 'output'],
  boolean: ['detailed', 'json', 'csv'],
  alias: {
    f: 'format',
    o: 'output',
    d: 'detailed'
  }
});

const db = new Database(process.env.DATABASE_PATH || config.local.databasePath);

class SyncReportGenerator {
  constructor() {
    this.reportData = {
      generated: new Date(),
      summary: {},
      topics: [],
      batches: [],
      phases: [],
      recentActivity: []
    };
  }

  /**
   * Generate complete report
   */
  async generateReport() {
    console.log(chalk.cyan('Generating sync status report...\n'));

    this.reportData.summary = this.getSummaryStats();
    this.reportData.topics = this.getTopicStats();
    this.reportData.batches = this.getBatchStats();
    this.reportData.phases = this.getPhaseStats();
    this.reportData.recentActivity = this.getRecentActivity();

    return this.reportData;
  }

  /**
   * Get overall summary statistics
   */
  getSummaryStats() {
    const stats = db.prepare(`
      SELECT
        COUNT(DISTINCT topic_id) as total_topics,
        COUNT(*) as total_files,
        SUM(CASE WHEN sync_status = 'synced' THEN 1 ELSE 0 END) as synced_files,
        SUM(CASE WHEN sync_status = 'pending' THEN 1 ELSE 0 END) as pending_files,
        SUM(CASE WHEN sync_status = 'error' THEN 1 ELSE 0 END) as error_files,
        SUM(file_size) as total_bytes,
        SUM(CASE WHEN compression_enabled THEN compressed_size ELSE file_size END) as stored_bytes
      FROM files
    `).get();

    const topicProgress = db.prepare(`
      SELECT AVG(completion_percentage) as avg_completion
      FROM topics
      WHERE total_files > 0
    `).get();

    return {
      ...stats,
      avg_completion: topicProgress.avg_completion || 0,
      compression_ratio: stats.stored_bytes / stats.total_bytes || 0
    };
  }

  /**
   * Get per-topic statistics
   */
  getTopicStats() {
    return db.prepare(`
      SELECT
        t.id,
        t.name,
        t.batch,
        t.current_phase,
        t.completion_percentage,
        t.total_files,
        t.synced_files,
        t.total_size_bytes,
        t.last_synced,
        COUNT(DISTINCT p.phase_id) as completed_phases
      FROM topics t
      LEFT JOIN phases p ON t.id = p.topic_id AND p.is_complete = 1
      GROUP BY t.id
      ORDER BY t.id
    `).all();
  }

  /**
   * Get batch-level statistics
   */
  getBatchStats() {
    const batches = [];

    for (const [batchId, batchInfo] of Object.entries(config.batches)) {
      const stats = db.prepare(`
        SELECT
          COUNT(DISTINCT t.id) as total_topics,
          SUM(t.total_files) as total_files,
          SUM(t.synced_files) as synced_files,
          AVG(t.completion_percentage) as avg_completion
        FROM topics t
        WHERE t.batch = ?
      `).get(batchId);

      batches.push({
        id: batchId,
        name: batchInfo.name,
        ...stats
      });
    }

    return batches;
  }

  /**
   * Get phase-level statistics
   */
  getPhaseStats() {
    return db.prepare(`
      SELECT
        p.phase_id,
        p.phase_name,
        COUNT(DISTINCT p.topic_id) as total_topics,
        SUM(CASE WHEN p.is_complete = 1 THEN 1 ELSE 0 END) as completed_topics,
        COUNT(f.id) as total_files,
        SUM(CASE WHEN f.sync_status = 'synced' THEN 1 ELSE 0 END) as synced_files
      FROM phases p
      LEFT JOIN files f ON p.topic_id = f.topic_id AND p.phase_id = f.phase_id
      GROUP BY p.phase_id
      ORDER BY p.phase_id
    `).all();
  }

  /**
   * Get recent sync activity
   */
  getRecentActivity(limit = 20) {
    return db.prepare(`
      SELECT
        operation_type,
        topic_id,
        phase_id,
        status,
        duration_ms,
        bytes_transferred,
        created_at
      FROM sync_history
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * Print console report
   */
  printConsoleReport() {
    const data = this.reportData;

    // Summary
    console.log(chalk.bold.cyan('=== SYNC STATUS REPORT ===\n'));
    console.log(chalk.gray(`Generated: ${data.generated.toLocaleString()}\n`));

    console.log(chalk.cyan('Summary Statistics:'));
    console.log(`  Total Topics: ${data.summary.total_topics}`);
    console.log(`  Total Files: ${data.summary.total_files}`);
    console.log(chalk.green(`  Synced: ${data.summary.synced_files}`));
    console.log(chalk.yellow(`  Pending: ${data.summary.pending_files}`));
    console.log(chalk.red(`  Errors: ${data.summary.error_files}`));
    console.log(`  Total Size: ${this.formatBytes(data.summary.total_bytes)}`);
    console.log(`  Stored Size: ${this.formatBytes(data.summary.stored_bytes)} (${(data.summary.compression_ratio * 100).toFixed(1)}%)`);
    console.log(`  Avg Completion: ${data.summary.avg_completion.toFixed(1)}%\n`);

    // Batch progress
    console.log(chalk.cyan('Batch Progress:\n'));
    const batchTable = new Table({
      head: ['Batch', 'Topics', 'Files', 'Synced', 'Completion'],
      colWidths: [40, 10, 10, 10, 15],
      style: { head: ['cyan'] }
    });

    data.batches.forEach(batch => {
      const completion = batch.total_files > 0
        ? (batch.synced_files / batch.total_files * 100).toFixed(1)
        : '0.0';

      batchTable.push([
        batch.name,
        batch.total_topics || 0,
        batch.total_files || 0,
        batch.synced_files || 0,
        `${completion}%`
      ]);
    });

    console.log(batchTable.toString() + '\n');

    // Phase progress
    console.log(chalk.cyan('Phase Progress:\n'));
    const phaseTable = new Table({
      head: ['Phase', 'Name', 'Completed Topics', 'Files', 'Synced'],
      colWidths: [8, 30, 18, 10, 10],
      style: { head: ['cyan'] }
    });

    data.phases.forEach(phase => {
      phaseTable.push([
        phase.phase_id,
        phase.phase_name,
        `${phase.completed_topics}/${phase.total_topics}`,
        phase.total_files || 0,
        phase.synced_files || 0
      ]);
    });

    console.log(phaseTable.toString() + '\n');

    // Detailed topic view
    if (args.detailed) {
      console.log(chalk.cyan('Topic Details:\n'));
      const topicTable = new Table({
        head: ['ID', 'Topic', 'Batch', 'Phase', 'Files', 'Complete'],
        colWidths: [6, 25, 8, 8, 10, 12],
        style: { head: ['cyan'] }
      });

      data.topics.forEach(topic => {
        const completion = topic.completion_percentage.toFixed(1) + '%';
        topicTable.push([
          topic.id,
          topic.name,
          topic.batch,
          topic.current_phase,
          `${topic.synced_files}/${topic.total_files}`,
          completion
        ]);
      });

      console.log(topicTable.toString() + '\n');
    }

    // Recent activity
    if (data.recentActivity.length > 0) {
      console.log(chalk.cyan('Recent Activity (Last 10):\n'));
      const activityTable = new Table({
        head: ['Time', 'Operation', 'Topic', 'Status'],
        colWidths: [20, 15, 10, 15],
        style: { head: ['cyan'] }
      });

      data.recentActivity.slice(0, 10).forEach(activity => {
        const time = format(new Date(activity.created_at * 1000), 'yyyy-MM-dd HH:mm');
        activityTable.push([
          time,
          activity.operation_type,
          activity.topic_id || 'N/A',
          activity.status
        ]);
      });

      console.log(activityTable.toString() + '\n');
    }
  }

  /**
   * Export report as JSON
   */
  exportJSON(outputPath) {
    const json = JSON.stringify(this.reportData, null, 2);
    fs.writeFileSync(outputPath, json);
    console.log(chalk.green(`✓ JSON report saved: ${outputPath}`));
  }

  /**
   * Export report as CSV
   */
  exportCSV(outputPath) {
    const rows = [
      ['ID', 'Topic', 'Batch', 'Current Phase', 'Completed Phases', 'Total Files', 'Synced Files', 'Completion %', 'Total Size', 'Last Synced']
    ];

    this.reportData.topics.forEach(topic => {
      rows.push([
        topic.id,
        topic.name,
        topic.batch,
        topic.current_phase,
        topic.completed_phases,
        topic.total_files,
        topic.synced_files,
        topic.completion_percentage.toFixed(2),
        topic.total_size_bytes || 0,
        topic.last_synced ? format(new Date(topic.last_synced * 1000), 'yyyy-MM-dd HH:mm:ss') : 'Never'
      ]);
    });

    const csv = rows.map(row => row.join(',')).join('\n');
    fs.writeFileSync(outputPath, csv);
    console.log(chalk.green(`✓ CSV report saved: ${outputPath}`));
  }

  /**
   * Export report as HTML
   */
  exportHTML(outputPath) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Y-It Sync Status Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: #ecf0f1; padding: 20px; border-radius: 5px; border-left: 4px solid #3498db; }
    .stat-card h3 { margin: 0; color: #7f8c8d; font-size: 14px; }
    .stat-card p { margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #2c3e50; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #3498db; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f8f9fa; }
    .progress-bar { background: #ecf0f1; height: 20px; border-radius: 10px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #3498db, #2ecc71); height: 100%; transition: width 0.3s; }
    .status-synced { color: #27ae60; font-weight: bold; }
    .status-pending { color: #f39c12; font-weight: bold; }
    .status-error { color: #e74c3c; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Y-It Sync Status Report</h1>
    <p style="color: #7f8c8d;">Generated: ${this.reportData.generated.toLocaleString()}</p>

    <h2>Summary</h2>
    <div class="summary">
      <div class="stat-card">
        <h3>Total Topics</h3>
        <p>${this.reportData.summary.total_topics}</p>
      </div>
      <div class="stat-card">
        <h3>Total Files</h3>
        <p>${this.reportData.summary.total_files}</p>
      </div>
      <div class="stat-card">
        <h3>Synced Files</h3>
        <p class="status-synced">${this.reportData.summary.synced_files}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Files</h3>
        <p class="status-pending">${this.reportData.summary.pending_files}</p>
      </div>
      <div class="stat-card">
        <h3>Total Size</h3>
        <p>${this.formatBytes(this.reportData.summary.total_bytes)}</p>
      </div>
      <div class="stat-card">
        <h3>Avg Completion</h3>
        <p>${this.reportData.summary.avg_completion.toFixed(1)}%</p>
      </div>
    </div>

    <h2>Batch Progress</h2>
    <table>
      <thead>
        <tr>
          <th>Batch</th>
          <th>Topics</th>
          <th>Files</th>
          <th>Synced</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        ${this.reportData.batches.map(batch => {
          const completion = batch.total_files > 0 ? (batch.synced_files / batch.total_files * 100) : 0;
          return `
          <tr>
            <td>${batch.name}</td>
            <td>${batch.total_topics || 0}</td>
            <td>${batch.total_files || 0}</td>
            <td>${batch.synced_files || 0}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${completion}%"></div>
              </div>
              ${completion.toFixed(1)}%
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <h2>Topic Details</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Topic</th>
          <th>Batch</th>
          <th>Phase</th>
          <th>Files</th>
          <th>Completion</th>
        </tr>
      </thead>
      <tbody>
        ${this.reportData.topics.map(topic => `
        <tr>
          <td>${topic.id}</td>
          <td>${topic.name}</td>
          <td>${topic.batch}</td>
          <td>${topic.current_phase}</td>
          <td>${topic.synced_files}/${topic.total_files}</td>
          <td>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${topic.completion_percentage}%"></div>
            </div>
            ${topic.completion_percentage.toFixed(1)}%
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    fs.writeFileSync(outputPath, html);
    console.log(chalk.green(`✓ HTML report saved: ${outputPath}`));
  }

  /**
   * Utility: Format bytes
   */
  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Main execution
async function main() {
  const generator = new SyncReportGenerator();

  try {
    await generator.generateReport();

    // Console output (default)
    generator.printConsoleReport();

    // Export to file if requested
    if (args.output) {
      const ext = path.extname(args.output).toLowerCase();

      if (ext === '.json' || args.json) {
        generator.exportJSON(args.output || './sync-report.json');
      } else if (ext === '.csv' || args.csv) {
        generator.exportCSV(args.output || './sync-report.csv');
      } else if (ext === '.html') {
        generator.exportHTML(args.output || './sync-report.html');
      } else {
        // Default to HTML
        generator.exportHTML(args.output);
      }
    }

  } catch (error) {
    console.error(chalk.red('Error generating report:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SyncReportGenerator;
