#!/usr/bin/env node

/**
 * Topic Restore Tool
 * Restore specific topics from Google Drive to local filesystem
 */

const { google } = require('googleapis');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const chalk = require('chalk');
const ora = require('ora');
const minimist = require('minimist');
const inquirer = require('inquirer');
require('dotenv').config();

const config = require('./config.json');

const args = minimist(process.argv.slice(2), {
  string: ['topic', 'phase', 'to'],
  boolean: ['interactive', 'overwrite'],
  alias: {
    t: 'topic',
    p: 'phase',
    i: 'interactive',
    o: 'overwrite'
  }
});

let drive;
const db = new Database(process.env.DATABASE_PATH || config.local.databasePath);

class TopicRestore {
  constructor(options = {}) {
    this.interactive = options.interactive || false;
    this.overwrite = options.overwrite || false;
    this.stats = {
      downloaded: 0,
      skipped: 0,
      errors: 0,
      bytesDownloaded: 0
    };
  }

  /**
   * Initialize Google Drive connection
   */
  async initDrive() {
    const spinner = ora('Connecting to Google Drive...').start();

    try {
      let auth;

      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
          },
          scopes: ['https://www.googleapis.com/auth/drive.readonly']
        });
      } else if (process.env.GOOGLE_CLIENT_ID) {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

        const tokens = JSON.parse(fs.readFileSync('./.tokens.json', 'utf8'));
        oauth2Client.setCredentials(tokens);
        auth = oauth2Client;
      } else {
        throw new Error('No Google Drive credentials found');
      }

      drive = google.drive({ version: 'v3', auth });
      await drive.files.list({ pageSize: 1 });

      spinner.succeed('Connected to Google Drive');
      return true;
    } catch (error) {
      spinner.fail('Failed to connect to Google Drive');
      throw error;
    }
  }

  /**
   * Get files for a topic from database
   */
  getTopicFiles(topicId, phaseId = null) {
    let query = `
      SELECT * FROM files
      WHERE topic_id = ? AND sync_status = 'synced'
    `;

    const params = [topicId];

    if (phaseId !== null) {
      query += ' AND phase_id = ?';
      params.push(phaseId);
    }

    query += ' ORDER BY phase_id, file_name';

    return db.prepare(query).all(...params);
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(file, destinationPath) {
    try {
      const spinner = ora(`Downloading: ${file.file_name}`).start();

      // Check if file exists and overwrite settings
      if (fs.existsSync(destinationPath) && !this.overwrite) {
        spinner.warn(`Skipped (exists): ${file.file_name}`);
        this.stats.skipped++;
        return;
      }

      // Ensure directory exists
      const dir = path.dirname(destinationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Download from Google Drive
      const response = await drive.files.get(
        { fileId: file.google_drive_id, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      let fileBuffer = Buffer.from(response.data);

      // Decompress if file was compressed
      if (file.compression_enabled) {
        fileBuffer = zlib.gunzipSync(fileBuffer);
      }

      // Write to disk
      fs.writeFileSync(destinationPath, fileBuffer);

      this.stats.downloaded++;
      this.stats.bytesDownloaded += file.file_size;

      spinner.succeed(`Downloaded: ${file.file_name} (${this.formatBytes(file.file_size)})`);

    } catch (error) {
      this.stats.errors++;
      console.error(chalk.red(`Error downloading ${file.file_name}:`), error.message);
    }
  }

  /**
   * Restore entire topic
   */
  async restoreTopic(topicId, destinationRoot) {
    const topic = config.topics.find(t => t.id === topicId || t.slug === topicId);

    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }

    console.log(chalk.cyan(`\n=== Restoring Topic: ${topic.name} ===\n`));

    // Get all files for topic
    const files = this.getTopicFiles(topic.id);

    if (files.length === 0) {
      console.log(chalk.yellow('No files found in database. Has this topic been synced?'));
      return;
    }

    console.log(`Found ${files.length} files to restore\n`);

    // Interactive mode: let user select files
    if (this.interactive) {
      const selected = await this.selectFiles(files);
      if (selected.length === 0) {
        console.log(chalk.yellow('No files selected'));
        return;
      }
      files.length = 0;
      files.push(...selected);
    }

    // Download each file
    for (const file of files) {
      const relativePath = path.relative(config.local.productionRoot, file.file_path);
      const destinationPath = path.join(destinationRoot, relativePath);

      await this.downloadFile(file, destinationPath);
    }

    console.log(chalk.green(`\n✓ Restore complete: ${topic.name}`));
  }

  /**
   * Restore specific phase
   */
  async restorePhase(topicId, phaseId, destinationRoot) {
    const topic = config.topics.find(t => t.id === topicId || t.slug === topicId);
    const phase = config.phases[parseInt(phaseId)];

    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }

    if (!phase) {
      throw new Error(`Phase not found: ${phaseId}`);
    }

    console.log(chalk.cyan(`\n=== Restoring: ${topic.name} - ${phase.name} ===\n`));

    const files = this.getTopicFiles(topic.id, parseInt(phaseId));

    if (files.length === 0) {
      console.log(chalk.yellow('No files found for this phase'));
      return;
    }

    console.log(`Found ${files.length} files to restore\n`);

    for (const file of files) {
      const relativePath = path.relative(config.local.productionRoot, file.file_path);
      const destinationPath = path.join(destinationRoot, relativePath);

      await this.downloadFile(file, destinationPath);
    }

    console.log(chalk.green(`\n✓ Phase restore complete`));
  }

  /**
   * Interactive file selection
   */
  async selectFiles(files) {
    const choices = files.map(file => ({
      name: `${file.phase_name} - ${file.file_name} (${this.formatBytes(file.file_size)})`,
      value: file,
      checked: false
    }));

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Select files to restore:',
        choices,
        pageSize: 15
      }
    ]);

    return selected;
  }

  /**
   * List available topics for restore
   */
  listAvailableTopics() {
    const topics = db.prepare(`
      SELECT
        t.id,
        t.name,
        t.batch,
        COUNT(f.id) as file_count,
        SUM(f.file_size) as total_size,
        MAX(f.last_synced) as last_sync
      FROM topics t
      LEFT JOIN files f ON t.id = f.topic_id AND f.sync_status = 'synced'
      GROUP BY t.id
      HAVING file_count > 0
      ORDER BY t.id
    `).all();

    console.log(chalk.cyan('\n=== Available Topics for Restore ===\n'));

    const Table = require('cli-table3');
    const table = new Table({
      head: ['ID', 'Topic', 'Batch', 'Files', 'Size', 'Last Sync'],
      colWidths: [6, 25, 8, 8, 12, 20],
      style: { head: ['cyan'] }
    });

    topics.forEach(topic => {
      const lastSync = topic.last_sync
        ? new Date(topic.last_sync * 1000).toLocaleString()
        : 'Never';

      table.push([
        topic.id,
        topic.name,
        topic.batch,
        topic.file_count,
        this.formatBytes(topic.total_size || 0),
        lastSync
      ]);
    });

    console.log(table.toString());
    console.log();
  }

  /**
   * Print statistics
   */
  printStats() {
    console.log(chalk.cyan('\n=== Restore Statistics ==='));
    console.log(chalk.green(`Downloaded: ${this.stats.downloaded}`));
    console.log(chalk.yellow(`Skipped: ${this.stats.skipped}`));
    console.log(chalk.red(`Errors: ${this.stats.errors}`));
    console.log(`Total size: ${this.formatBytes(this.stats.bytesDownloaded)}`);
  }

  /**
   * Utility: Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Main execution
async function main() {
  console.log(chalk.bold.cyan('Y-It Topic Restore Tool\n'));

  const restore = new TopicRestore({
    interactive: args.interactive,
    overwrite: args.overwrite
  });

  try {
    await restore.initDrive();

    // If no arguments, list available topics
    if (!args.topic) {
      restore.listAvailableTopics();
      console.log(chalk.yellow('Usage examples:'));
      console.log('  npm run restore -- --topic=dropshipping --to=/path/to/restore');
      console.log('  npm run restore -- --topic=dropshipping --phase=3 --to=/path');
      console.log('  npm run restore -- --topic=dropshipping --interactive');
      return;
    }

    const destinationRoot = args.to || config.local.productionRoot;

    if (args.phase) {
      await restore.restorePhase(args.topic, args.phase, destinationRoot);
    } else {
      await restore.restoreTopic(args.topic, destinationRoot);
    }

    restore.printStats();

  } catch (error) {
    console.error(chalk.red('\nRestore failed:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TopicRestore;
