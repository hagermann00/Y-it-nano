#!/usr/bin/env node

/**
 * File Watcher for Real-time Sync
 * Monitors production directory and auto-syncs changes to Google Drive
 */

const chokidar = require('chokidar');
const path = require('path');
const chalk = require('chalk');
const Database = require('better-sqlite3');
const TopicBackupSync = require('./topic-backup-sync');
require('dotenv').config();

const config = require('./config.json');

class ProductionWatcher {
  constructor() {
    this.sync = new TopicBackupSync({ verbose: false });
    this.db = new Database(process.env.DATABASE_PATH || config.local.databasePath);
    this.pendingSync = new Map(); // File path -> timeout
    this.debounceMs = config.sync.watchDebounceMs || 5000;
    this.isInitialized = false;
  }

  /**
   * Extract topic info from file path
   */
  getTopicFromPath(filePath) {
    const relativePath = path.relative(config.local.productionRoot, filePath);
    const parts = relativePath.split(path.sep);

    if (parts.length === 0) return null;

    const topicSlug = parts[0];
    return config.topics.find(t => t.slug === topicSlug);
  }

  /**
   * Debounced file sync
   */
  scheduleSync(filePath) {
    // Clear existing timeout
    if (this.pendingSync.has(filePath)) {
      clearTimeout(this.pendingSync.get(filePath));
    }

    // Schedule new sync
    const timeout = setTimeout(async () => {
      await this.syncFile(filePath);
      this.pendingSync.delete(filePath);
    }, this.debounceMs);

    this.pendingSync.set(filePath, timeout);

    console.log(chalk.gray(`Scheduled sync: ${path.basename(filePath)} (in ${this.debounceMs}ms)`));
  }

  /**
   * Sync individual file
   */
  async syncFile(filePath) {
    try {
      const topic = this.getTopicFromPath(filePath);

      if (!topic) {
        console.log(chalk.yellow(`Cannot determine topic for: ${filePath}`));
        return;
      }

      console.log(chalk.cyan(`\n→ Syncing: ${path.basename(filePath)} [${topic.name}]`));

      // Ensure topic folders exist
      await this.sync.setupTopicFolders(topic);

      // Sync the file
      await this.sync.syncFile(filePath, topic);

      // Update topic stats
      this.sync.updateTopicStats(topic.id);

      // Check if phase completed
      this.checkPhaseCompletion(topic);

    } catch (error) {
      console.error(chalk.red(`Error syncing ${filePath}:`), error.message);
    }
  }

  /**
   * Check if a phase has been completed for a topic
   */
  checkPhaseCompletion(topic) {
    const phase = this.sync.detectPhase(topic.slug);
    if (!phase) return;

    const requiredFiles = config.phases[phase.id].requiredFiles;
    const topicPath = path.join(config.local.productionRoot, topic.slug);

    // Check if all required files exist
    const allPresent = requiredFiles.every(pattern => {
      // Simple glob matching
      const fs = require('fs');
      const files = fs.readdirSync(topicPath).filter(f => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(f);
      });
      return files.length > 0;
    });

    if (allPresent) {
      // Mark phase as complete
      this.db.prepare(`
        UPDATE phases
        SET is_complete = 1,
            completed_at = ?
        WHERE topic_id = ? AND phase_id = ?
      `).run(Math.floor(Date.now() / 1000), topic.id, phase.id);

      console.log(chalk.green.bold(`\n✓ Phase ${phase.id} completed for ${topic.name}!`));

      // Send notification if enabled
      this.sendNotification(topic, phase);
    }
  }

  /**
   * Send notification (Slack webhook)
   */
  async sendNotification(topic, phase) {
    if (!config.notifications.enabled || !config.notifications.notifyOnPhaseComplete) {
      return;
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      const fetch = require('node-fetch');
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `✓ Phase ${phase.id} (${phase.name}) completed for *${topic.name}*`,
          attachments: [{
            color: 'good',
            fields: [
              { title: 'Topic', value: topic.name, short: true },
              { title: 'Phase', value: `${phase.id} - ${phase.name}`, short: true },
              { title: 'Batch', value: topic.batch, short: true }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Error sending notification:', error.message);
    }
  }

  /**
   * Start watching production directory
   */
  async start() {
    console.log(chalk.bold.cyan('Y-IT Production Folder Watcher\n'));

    // Initialize Google Drive connection
    await this.sync.initDrive();

    const watchPath = config.local.productionRoot;

    console.log(chalk.cyan(`Watching: ${watchPath}`));
    console.log(chalk.gray(`Debounce: ${this.debounceMs}ms\n`));

    // Create watcher
    const watcher = chokidar.watch(watchPath, {
      persistent: true,
      ignoreInitial: true,
      ignored: [
        ...config.exclude.map(pattern => {
          if (pattern.includes('*')) {
            return new RegExp(pattern.replace('*', '.*'));
          }
          return pattern;
        }),
        /(^|[\/\\])\../  // hidden files
      ],
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    // Handle events
    watcher
      .on('add', filePath => {
        console.log(chalk.green(`[+] ${path.relative(watchPath, filePath)}`));
        this.scheduleSync(filePath);
      })
      .on('change', filePath => {
        console.log(chalk.yellow(`[~] ${path.relative(watchPath, filePath)}`));
        this.scheduleSync(filePath);
      })
      .on('unlink', filePath => {
        console.log(chalk.red(`[-] ${path.relative(watchPath, filePath)}`));
        // Note: We don't delete from Google Drive, just log it
      })
      .on('error', error => {
        console.error(chalk.red('Watcher error:'), error);
      })
      .on('ready', () => {
        this.isInitialized = true;
        console.log(chalk.green.bold('\n✓ Watcher ready. Monitoring for changes...\n'));
        this.printInstructions();
      });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\nShutting down watcher...'));
      watcher.close();
      this.db.close();
      process.exit(0);
    });
  }

  /**
   * Print usage instructions
   */
  printInstructions() {
    console.log(chalk.cyan('How it works:'));
    console.log('  • File changes detected within 5 seconds');
    console.log('  • Auto-sync to appropriate Google Drive folder');
    console.log('  • Phase completion tracking');
    console.log('  • Notifications on milestones (if enabled)');
    console.log('\n' + chalk.gray('Press Ctrl+C to stop watching\n'));
  }

  /**
   * Get current watch statistics
   */
  getStats() {
    const stats = this.db.prepare(`
      SELECT
        COUNT(DISTINCT topic_id) as topics_with_files,
        COUNT(*) as total_files,
        SUM(CASE WHEN sync_status = 'synced' THEN 1 ELSE 0 END) as synced_files,
        SUM(CASE WHEN sync_status = 'pending' THEN 1 ELSE 0 END) as pending_files
      FROM files
    `).get();

    return stats;
  }
}

// Main execution
async function main() {
  const watcher = new ProductionWatcher();

  try {
    await watcher.start();
  } catch (error) {
    console.error(chalk.red('Failed to start watcher:'), error.message);
    process.exit(1);
  }

  // Print stats every 5 minutes
  setInterval(() => {
    if (watcher.isInitialized) {
      const stats = watcher.getStats();
      console.log(chalk.gray(`\n[Stats] Topics: ${stats.topics_with_files} | Files: ${stats.total_files} | Synced: ${stats.synced_files} | Pending: ${stats.pending_files}\n`));
    }
  }, 300000);
}

if (require.main === module) {
  main();
}

module.exports = ProductionWatcher;
