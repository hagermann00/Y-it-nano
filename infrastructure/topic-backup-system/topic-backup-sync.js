#!/usr/bin/env node

/**
 * Y-It Topic Backup Sync Engine
 * Progressive, intelligent sync to Google Drive
 */

const { google } = require('googleapis');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const chalk = require('chalk');
const ora = require('ora');
const minimist = require('minimist');
require('dotenv').config();

// Parse command line arguments
const args = minimist(process.argv.slice(2), {
  string: ['topic', 'batch', 'phase'],
  boolean: ['dry-run', 'verbose', 'force'],
  alias: {
    t: 'topic',
    b: 'batch',
    p: 'phase',
    d: 'dry-run',
    v: 'verbose',
    f: 'force'
  }
});

// Load configuration
const config = require('./config.json');
const filePatterns = require('./file-patterns.json');

// Initialize database
const db = new Database(process.env.DATABASE_PATH || config.local.databasePath);

// Initialize Google Drive API
let drive;

class TopicBackupSync {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.force = options.force || false;
    this.stats = {
      scanned: 0,
      uploaded: 0,
      skipped: 0,
      errors: 0,
      bytesTransferred: 0,
      startTime: Date.now()
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
        // Service account authentication
        auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
          },
          scopes: ['https://www.googleapis.com/auth/drive.file']
        });
      } else if (process.env.GOOGLE_CLIENT_ID) {
        // OAuth 2.0 authentication
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

        // Load saved tokens (implementation depends on your auth flow)
        const tokens = JSON.parse(fs.readFileSync('./.tokens.json', 'utf8'));
        oauth2Client.setCredentials(tokens);
        auth = oauth2Client;
      } else {
        throw new Error('No Google Drive credentials found in .env');
      }

      drive = google.drive({ version: 'v3', auth });

      // Test connection
      await drive.files.list({ pageSize: 1 });

      spinner.succeed('Connected to Google Drive');
      return true;
    } catch (error) {
      spinner.fail('Failed to connect to Google Drive');
      throw error;
    }
  }

  /**
   * Get or create folder in Google Drive
   */
  async getOrCreateFolder(folderName, parentId = null) {
    try {
      // Search for existing folder
      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create folder if it doesn't exist
      if (this.dryRun) {
        console.log(chalk.yellow(`[DRY RUN] Would create folder: ${folderName}`));
        return 'dry-run-folder-id';
      }

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };

      if (parentId) {
        fileMetadata.parents = [parentId];
      }

      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      this.log(`Created folder: ${folderName}`);
      return folder.data.id;
    } catch (error) {
      console.error(`Error creating folder ${folderName}:`, error.message);
      throw error;
    }
  }

  /**
   * Setup folder structure for a topic
   */
  async setupTopicFolders(topic) {
    const rootId = await this.getOrCreateFolder(config.googleDrive.rootFolderName);
    const topicsId = await this.getOrCreateFolder('Topics', rootId);
    const topicFolderId = await this.getOrCreateFolder(`${topic.id}-${topic.name}`, topicsId);

    // Create phase folders
    const phaseFolders = {};
    for (const phase of config.phases) {
      phaseFolders[phase.id] = await this.getOrCreateFolder(phase.name, topicFolderId);
    }

    // Update database
    db.prepare(`
      UPDATE topics
      SET google_drive_folder_id = ?
      WHERE id = ?
    `).run(topicFolderId, topic.id);

    for (const [phaseId, folderId] of Object.entries(phaseFolders)) {
      db.prepare(`
        INSERT OR REPLACE INTO phases (topic_id, phase_id, phase_name, google_drive_folder_id)
        VALUES (?, ?, ?, ?)
      `).run(topic.id, phaseId, config.phases[phaseId].name, folderId);
    }

    return { topicFolderId, phaseFolders };
  }

  /**
   * Detect phase from file path and name
   */
  detectPhase(filePath) {
    const fileName = path.basename(filePath);

    // Check each phase pattern
    for (const [phaseName, phaseConfig] of Object.entries(filePatterns.phaseDetection)) {
      for (const pattern of phaseConfig.patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(fileName) || regex.test(filePath)) {
          const phaseId = config.phases.find(p => p.name === phaseName)?.id;
          return { id: phaseId, name: phaseName };
        }
      }
    }

    // Default to phase based on directory structure
    const match = filePath.match(/Phase-(\d+)-/);
    if (match) {
      const phaseId = parseInt(match[1]);
      return {
        id: phaseId,
        name: config.phases.find(p => p.id === phaseId)?.name || 'Unknown'
      };
    }

    return null;
  }

  /**
   * Calculate MD5 hash of file
   */
  calculateMD5(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  }

  /**
   * Check if file should be compressed
   */
  shouldCompress(fileName) {
    if (!config.googleDrive.compressionEnabled) return false;

    return filePatterns.compressionSettings.compress.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(fileName);
    });
  }

  /**
   * Upload file to Google Drive with resumable upload for large files
   */
  async uploadFile(filePath, fileName, parentFolderId, shouldCompress = false) {
    try {
      const fileSize = fs.statSync(filePath).size;
      let fileBuffer = fs.readFileSync(filePath);
      let mimeType = this.getMimeType(fileName);
      let uploadFileName = fileName;

      // Compress if applicable
      if (shouldCompress) {
        fileBuffer = zlib.gzipSync(fileBuffer);
        uploadFileName += '.gz';
        mimeType = 'application/gzip';
      }

      if (this.dryRun) {
        console.log(chalk.yellow(`[DRY RUN] Would upload: ${fileName} (${this.formatBytes(fileSize)})`));
        return { id: 'dry-run-file-id', size: fileBuffer.length };
      }

      const fileMetadata = {
        name: uploadFileName,
        parents: [parentFolderId]
      };

      // Use resumable upload for large files
      if (fileSize > config.googleDrive.resumableUploadThreshold) {
        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: {
            mimeType: mimeType,
            body: fileBuffer
          },
          fields: 'id, size'
        }, {
          uploadType: 'resumable',
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileBuffer.length) * 100;
            if (this.verbose) {
              process.stdout.write(`\r${fileName}: ${progress.toFixed(1)}%`);
            }
          }
        });

        if (this.verbose) process.stdout.write('\n');
        return response.data;
      } else {
        // Simple upload for small files
        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: {
            mimeType: mimeType,
            body: fileBuffer
          },
          fields: 'id, size'
        });

        return response.data;
      }
    } catch (error) {
      console.error(`Error uploading ${fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get MIME type for file
   */
  getMimeType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.md': 'text/markdown',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.indd': 'application/x-indesign',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Scan topic directory for files
   */
  scanTopicDirectory(topicSlug) {
    const topicPath = path.join(config.local.productionRoot, topicSlug);

    if (!fs.existsSync(topicPath)) {
      this.log(`Topic directory not found: ${topicPath}`, 'warn');
      return [];
    }

    const files = [];
    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded patterns
        if (this.shouldExclude(entry.name)) continue;

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    };

    scanDir(topicPath);
    return files;
  }

  /**
   * Check if file should be excluded
   */
  shouldExclude(fileName) {
    return config.exclude.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(fileName);
      }
      return fileName === pattern;
    });
  }

  /**
   * Sync a single file
   */
  async syncFile(filePath, topic) {
    this.stats.scanned++;

    try {
      const fileName = path.basename(filePath);
      const fileSize = fs.statSync(filePath).size;
      const md5Hash = this.calculateMD5(filePath);
      const phase = this.detectPhase(filePath);

      if (!phase) {
        this.log(`Could not detect phase for: ${fileName}`, 'warn');
        this.stats.skipped++;
        return;
      }

      // Check if file already synced with same hash
      const existing = db.prepare(`
        SELECT * FROM files
        WHERE topic_id = ? AND file_path = ?
      `).get(topic.id, filePath);

      if (existing && existing.md5_hash === md5Hash && !this.force) {
        this.log(`Skipping (unchanged): ${fileName}`, 'debug');
        this.stats.skipped++;
        return;
      }

      // Get phase folder
      const phaseFolder = db.prepare(`
        SELECT google_drive_folder_id
        FROM phases
        WHERE topic_id = ? AND phase_id = ?
      `).get(topic.id, phase.id);

      if (!phaseFolder || !phaseFolder.google_drive_folder_id) {
        throw new Error(`Phase folder not found for ${phase.name}`);
      }

      // Upload file
      const shouldCompress = this.shouldCompress(fileName);
      const uploadResult = await this.uploadFile(
        filePath,
        fileName,
        phaseFolder.google_drive_folder_id,
        shouldCompress
      );

      // Record in database
      const now = Math.floor(Date.now() / 1000);

      if (existing) {
        // Update existing record
        db.prepare(`
          UPDATE files
          SET md5_hash = ?,
              google_drive_id = ?,
              file_size = ?,
              compressed_size = ?,
              compression_enabled = ?,
              last_modified = ?,
              last_synced = ?,
              sync_status = 'synced',
              updated_at = ?
          WHERE id = ?
        `).run(
          md5Hash,
          uploadResult.id,
          fileSize,
          shouldCompress ? uploadResult.size : null,
          shouldCompress ? 1 : 0,
          now,
          now,
          now,
          existing.id
        );

        // Add to version history
        db.prepare(`
          INSERT INTO file_versions (file_id, version_number, md5_hash, google_drive_id, file_size)
          VALUES (?,
                  (SELECT COALESCE(MAX(version_number), 0) + 1 FROM file_versions WHERE file_id = ?),
                  ?, ?, ?)
        `).run(existing.id, existing.id, md5Hash, uploadResult.id, fileSize);

      } else {
        // Insert new record
        db.prepare(`
          INSERT INTO files (
            topic_id, topic_name, phase_id, phase_name,
            file_path, file_name, file_size, md5_hash,
            google_drive_id, compression_enabled, compressed_size,
            last_modified, last_synced, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
        `).run(
          topic.id, topic.name, phase.id, phase.name,
          filePath, fileName, fileSize, md5Hash,
          uploadResult.id, shouldCompress ? 1 : 0,
          shouldCompress ? uploadResult.size : null,
          now, now
        );
      }

      this.stats.uploaded++;
      this.stats.bytesTransferred += fileSize;
      this.log(`✓ Uploaded: ${fileName} (${this.formatBytes(fileSize)})`, 'success');

    } catch (error) {
      this.stats.errors++;
      this.log(`✗ Error syncing ${path.basename(filePath)}: ${error.message}`, 'error');

      // Record error in database
      db.prepare(`
        UPDATE files
        SET sync_status = 'error',
            error_message = ?,
            retry_count = retry_count + 1
        WHERE file_path = ?
      `).run(error.message, filePath);
    }
  }

  /**
   * Sync entire topic
   */
  async syncTopic(topicId) {
    const topic = config.topics.find(t => t.id === topicId || t.slug === topicId);

    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }

    console.log(chalk.cyan(`\n=== Syncing Topic: ${topic.name} (${topic.id}) ===\n`));

    // Setup folders
    await this.setupTopicFolders(topic);

    // Scan and sync files
    const files = this.scanTopicDirectory(topic.slug);
    console.log(`Found ${files.length} files to process\n`);

    for (const file of files) {
      await this.syncFile(file, topic);
    }

    // Update topic statistics
    this.updateTopicStats(topic.id);

    console.log(chalk.green(`\n✓ Topic sync complete: ${topic.name}`));
  }

  /**
   * Sync entire batch
   */
  async syncBatch(batchId) {
    const batch = config.batches[batchId.toUpperCase()];

    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    console.log(chalk.cyan(`\n=== Syncing Batch ${batchId}: ${batch.name} ===\n`));

    for (const topicId of batch.topics) {
      await this.syncTopic(topicId);
    }

    console.log(chalk.green(`\n✓ Batch sync complete: ${batch.name}`));
  }

  /**
   * Sync specific phase across all topics or specific topic
   */
  async syncPhase(phaseId, topicId = null) {
    const topics = topicId
      ? [config.topics.find(t => t.id === topicId || t.slug === topicId)]
      : config.topics;

    console.log(chalk.cyan(`\n=== Syncing Phase ${phaseId} ===\n`));

    for (const topic of topics) {
      if (!topic) continue;

      const files = this.scanTopicDirectory(topic.slug);
      const phaseFiles = files.filter(file => {
        const phase = this.detectPhase(file);
        return phase && phase.id === parseInt(phaseId);
      });

      if (phaseFiles.length === 0) continue;

      console.log(`${topic.name}: ${phaseFiles.length} files`);
      await this.setupTopicFolders(topic);

      for (const file of phaseFiles) {
        await this.syncFile(file, topic);
      }
    }

    console.log(chalk.green(`\n✓ Phase sync complete`));
  }

  /**
   * Update topic statistics
   */
  updateTopicStats(topicId) {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_files,
        SUM(CASE WHEN sync_status = 'synced' THEN 1 ELSE 0 END) as synced_files,
        SUM(file_size) as total_size
      FROM files
      WHERE topic_id = ?
    `).get(topicId);

    const phaseCompletion = db.prepare(`
      SELECT COUNT(*) as completed_phases
      FROM phases
      WHERE topic_id = ? AND is_complete = 1
    `).get(topicId);

    const completionPercentage = (stats.synced_files / stats.total_files) * 100 || 0;
    const currentPhase = phaseCompletion.completed_phases;

    db.prepare(`
      UPDATE topics
      SET total_files = ?,
          synced_files = ?,
          total_size_bytes = ?,
          completion_percentage = ?,
          current_phase = ?,
          last_synced = ?
      WHERE id = ?
    `).run(
      stats.total_files,
      stats.synced_files,
      stats.total_size,
      completionPercentage,
      currentPhase,
      Math.floor(Date.now() / 1000),
      topicId
    );
  }

  /**
   * Utility: Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Utility: Log with color
   */
  log(message, level = 'info') {
    if (level === 'debug' && !this.verbose) return;

    const colors = {
      info: chalk.white,
      success: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
      debug: chalk.gray
    };

    console.log(colors[level](message));
  }

  /**
   * Print final statistics
   */
  printStats() {
    const duration = ((Date.now() - this.stats.startTime) / 1000).toFixed(2);

    console.log(chalk.cyan('\n=== Sync Statistics ==='));
    console.log(`Files scanned: ${this.stats.scanned}`);
    console.log(chalk.green(`Files uploaded: ${this.stats.uploaded}`));
    console.log(chalk.yellow(`Files skipped: ${this.stats.skipped}`));
    console.log(chalk.red(`Errors: ${this.stats.errors}`));
    console.log(`Data transferred: ${this.formatBytes(this.stats.bytesTransferred)}`);
    console.log(`Duration: ${duration}s`);
  }
}

// Main execution
async function main() {
  console.log(chalk.bold.cyan('Y-It Topic Backup Sync\n'));

  const sync = new TopicBackupSync({
    dryRun: args['dry-run'],
    verbose: args.verbose,
    force: args.force
  });

  try {
    await sync.initDrive();

    if (args.topic) {
      await sync.syncTopic(args.topic);
    } else if (args.batch) {
      await sync.syncBatch(args.batch);
    } else if (args.phase) {
      await sync.syncPhase(args.phase, args.topic);
    } else {
      // Sync all topics
      console.log(chalk.yellow('No specific topic/batch/phase specified. Use --help for options.'));
      console.log('\nExamples:');
      console.log('  npm run sync -- --topic=dropshipping');
      console.log('  npm run sync -- --batch=A');
      console.log('  npm run sync -- --phase=3');
      console.log('  npm run sync -- --dry-run');
      process.exit(0);
    }

    sync.printStats();
    process.exit(0);

  } catch (error) {
    console.error(chalk.red('\nSync failed:'), error.message);
    if (sync.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TopicBackupSync;
