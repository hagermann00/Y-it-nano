#!/usr/bin/env node

/**
 * Y-It Google Drive Backup System
 *
 * This script backs up PostgreSQL database dumps and critical files to Google Drive.
 * It works alongside the existing AWS S3 backup system as a secondary backup location.
 *
 * Features:
 * - Uploads compressed database dumps to Google Drive
 * - Maintains organized folder structure by date
 * - Implements retry logic for network failures
 * - Validates backup integrity after upload
 * - Sends notifications on success/failure
 * - Manages backup retention policy
 *
 * Requirements:
 * - Google Cloud Service Account with Drive API enabled
 * - Service account credentials JSON file
 * - Node.js 14+
 *
 * Usage:
 *   node backup-to-gdrive.js [--type=<database|full|config>] [--retention-days=<days>]
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
const zlib = require('zlib');
const stream = require('stream');
const { pipeline } = require('stream/promises');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const execAsync = promisify(exec);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Google Drive settings
  gdrive: {
    serviceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
                          path.join(__dirname, 'credentials', 'service-account-key.json'),
    backupFolderId: process.env.GDRIVE_BACKUP_FOLDER_ID || null, // Root folder ID for backups
    folderName: process.env.GDRIVE_FOLDER_NAME || 'Y-It-Backups',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  },

  // Database settings
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'yit_database',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  },

  // Backup settings
  backup: {
    tempDir: process.env.BACKUP_TEMP_DIR || '/tmp/yit-backups',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    compressionLevel: parseInt(process.env.COMPRESSION_LEVEL || '9'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '5000'),
  },

  // Notification settings
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED === 'true',
    webhookUrl: process.env.SLACK_WEBHOOK_URL || null,
    emailTo: process.env.NOTIFICATION_EMAIL || null,
  },

  // Critical files to backup
  criticalFiles: [
    '.env.production',
    'package.json',
    'package-lock.json',
    'infrastructure/disaster_recovery.md',
    'infrastructure/backup.sh',
  ],
};

// ============================================================================
// GOOGLE DRIVE CLIENT
// ============================================================================

class GoogleDriveBackup {
  constructor() {
    this.drive = null;
    this.auth = null;
    this.backupFolderId = null;
    this.stats = {
      startTime: Date.now(),
      filesUploaded: 0,
      totalBytes: 0,
      errors: [],
    };
  }

  /**
   * Initialize Google Drive API client
   */
  async initialize() {
    try {
      console.log('Initializing Google Drive API...');

      // Check if service account key exists
      if (!fs.existsSync(CONFIG.gdrive.serviceAccountKeyPath)) {
        throw new Error(
          `Service account key not found at: ${CONFIG.gdrive.serviceAccountKeyPath}\n` +
          'Please follow setup instructions in setup-gdrive-backup.md'
        );
      }

      // Load service account credentials
      const credentials = JSON.parse(
        fs.readFileSync(CONFIG.gdrive.serviceAccountKeyPath, 'utf8')
      );

      // Create JWT auth client
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: CONFIG.gdrive.scopes,
      });

      // Initialize Drive API
      this.drive = google.drive({
        version: 'v3',
        auth: this.auth,
      });

      console.log('✓ Google Drive API initialized successfully');

      // Get or create backup root folder
      await this.ensureBackupFolder();

      return true;
    } catch (error) {
      console.error('✗ Failed to initialize Google Drive API:', error.message);
      throw error;
    }
  }

  /**
   * Ensure backup root folder exists, create if not
   */
  async ensureBackupFolder() {
    try {
      // If folder ID is provided in config, verify it exists
      if (CONFIG.gdrive.backupFolderId) {
        const folder = await this.drive.files.get({
          fileId: CONFIG.gdrive.backupFolderId,
          fields: 'id, name, mimeType',
        });

        if (folder.data.mimeType === 'application/vnd.google-apps.folder') {
          this.backupFolderId = CONFIG.gdrive.backupFolderId;
          console.log(`✓ Using existing backup folder: ${folder.data.name}`);
          return;
        }
      }

      // Search for existing folder by name
      const query = `name='${CONFIG.gdrive.folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files.length > 0) {
        this.backupFolderId = response.data.files[0].id;
        console.log(`✓ Found existing backup folder: ${CONFIG.gdrive.folderName}`);
      } else {
        // Create new folder
        const folder = await this.drive.files.create({
          requestBody: {
            name: CONFIG.gdrive.folderName,
            mimeType: 'application/vnd.google-apps.folder',
          },
          fields: 'id, name',
        });

        this.backupFolderId = folder.data.id;
        console.log(`✓ Created new backup folder: ${CONFIG.gdrive.folderName} (${this.backupFolderId})`);
      }
    } catch (error) {
      console.error('✗ Failed to ensure backup folder:', error.message);
      throw error;
    }
  }

  /**
   * Create or get date-based subfolder (YYYY-MM-DD)
   */
  async getDateFolder() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      // Search for today's folder
      const query = `name='${today}' and '${this.backupFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new date folder
      const folder = await this.drive.files.create({
        requestBody: {
          name: today,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [this.backupFolderId],
        },
        fields: 'id',
      });

      return folder.data.id;
    } catch (error) {
      console.error('✗ Failed to get/create date folder:', error.message);
      throw error;
    }
  }

  /**
   * Upload file to Google Drive with retry logic
   */
  async uploadFile(localPath, remoteName, folderId, retries = CONFIG.backup.maxRetries) {
    try {
      console.log(`Uploading: ${remoteName}...`);

      const fileSize = fs.statSync(localPath).size;
      const fileStream = fs.createReadStream(localPath);

      const response = await this.drive.files.create({
        requestBody: {
          name: remoteName,
          parents: [folderId],
        },
        media: {
          body: fileStream,
        },
        fields: 'id, name, size, md5Checksum, createdTime',
      });

      const uploadedFile = response.data;

      // Verify upload
      const isValid = await this.verifyUpload(localPath, uploadedFile);
      if (!isValid) {
        throw new Error('Upload verification failed: checksum mismatch');
      }

      console.log(`✓ Uploaded: ${remoteName} (${this.formatBytes(fileSize)}) - ID: ${uploadedFile.id}`);

      this.stats.filesUploaded++;
      this.stats.totalBytes += fileSize;

      return uploadedFile;
    } catch (error) {
      if (retries > 0) {
        console.warn(`⚠ Upload failed, retrying... (${retries} attempts remaining)`);
        await this.sleep(CONFIG.backup.retryDelayMs);
        return this.uploadFile(localPath, remoteName, folderId, retries - 1);
      }

      console.error(`✗ Upload failed after all retries: ${error.message}`);
      this.stats.errors.push({ file: remoteName, error: error.message });
      throw error;
    }
  }

  /**
   * Verify uploaded file integrity using MD5 checksum
   */
  async verifyUpload(localPath, uploadedFile) {
    try {
      // Calculate local file MD5
      const localMd5 = await this.calculateMd5(localPath);

      // Google Drive returns base64-encoded MD5, we need hex
      const remoteMd5 = uploadedFile.md5Checksum;

      // Convert our hex MD5 to base64 for comparison
      const localMd5Base64 = Buffer.from(localMd5, 'hex').toString('base64');

      const match = localMd5Base64 === remoteMd5;

      if (match) {
        console.log(`✓ Checksum verified: ${localMd5}`);
      } else {
        console.error(`✗ Checksum mismatch! Local: ${localMd5}, Remote: ${remoteMd5}`);
      }

      return match;
    } catch (error) {
      console.warn(`⚠ Failed to verify upload: ${error.message}`);
      return false; // Fail-safe: treat verification errors as failed verification
    }
  }

  /**
   * Calculate MD5 checksum of a file
   */
  async calculateMd5(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Delete old backups based on retention policy
   */
  async cleanupOldBackups() {
    try {
      console.log(`\nCleaning up backups older than ${CONFIG.backup.retentionDays} days...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.backup.retentionDays);
      const cutoffDateStr = cutoffDate.toISOString();

      // Find old date folders
      const query = `'${this.backupFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false and createdTime < '${cutoffDateStr}'`;
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, createdTime)',
        spaces: 'drive',
      });

      const oldFolders = response.data.files;

      if (oldFolders.length === 0) {
        console.log('✓ No old backups to clean up');
        return;
      }

      console.log(`Found ${oldFolders.length} old backup folder(s) to delete`);

      for (const folder of oldFolders) {
        try {
          await this.drive.files.delete({ fileId: folder.id });
          console.log(`✓ Deleted: ${folder.name} (created: ${folder.createdTime})`);
        } catch (error) {
          console.warn(`⚠ Failed to delete folder ${folder.name}: ${error.message}`);
        }
      }

      console.log('✓ Cleanup completed');
    } catch (error) {
      console.error('✗ Cleanup failed:', error.message);
      // Don't throw - cleanup failure shouldn't fail the backup
    }
  }

  /**
   * Helper: Format bytes to human-readable size
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Helper: Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// BACKUP OPERATIONS
// ============================================================================

class BackupManager {
  constructor(gdrive) {
    this.gdrive = gdrive;
    this.tempDir = CONFIG.backup.tempDir;
  }

  /**
   * Ensure temp directory exists
   */
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      console.log(`✓ Created temp directory: ${this.tempDir}`);
    }
  }

  /**
   * Create PostgreSQL database dump
   */
  async createDatabaseDump() {
    console.log('\n=== Creating Database Dump ===');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
    const dumpFileName = `yit_db_${timestamp}.dump`;
    const dumpFilePath = path.join(this.tempDir, dumpFileName);

    try {
      // Set PGPASSWORD environment variable for pg_dump
      const env = { ...process.env };
      if (CONFIG.database.password) {
        env.PGPASSWORD = CONFIG.database.password;
      }

      // Create database dump using pg_dump
      const command = `pg_dump \
        --host=${CONFIG.database.host} \
        --port=${CONFIG.database.port} \
        --username=${CONFIG.database.user} \
        --format=custom \
        --compress=${CONFIG.backup.compressionLevel} \
        --file="${dumpFilePath}" \
        ${CONFIG.database.name}`;

      console.log('Running pg_dump...');
      const { stdout, stderr } = await execAsync(command, { env });

      if (stderr && !stderr.includes('WARNING')) {
        console.warn('pg_dump warnings:', stderr);
      }

      if (!fs.existsSync(dumpFilePath)) {
        throw new Error('Database dump file was not created');
      }

      const fileSize = fs.statSync(dumpFilePath).size;
      console.log(`✓ Database dump created: ${dumpFileName} (${this.gdrive.formatBytes(fileSize)})`);

      return dumpFilePath;
    } catch (error) {
      console.error('✗ Database dump failed:', error.message);
      throw error;
    }
  }

  /**
   * Create compressed archive of critical files
   */
  async createConfigBackup() {
    console.log('\n=== Creating Configuration Backup ===');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
    const archiveName = `yit_config_${timestamp}.tar.gz`;
    const archivePath = path.join(this.tempDir, archiveName);

    try {
      // Find existing critical files
      const existingFiles = [];
      const projectRoot = path.join(__dirname, '../..');

      for (const file of CONFIG.criticalFiles) {
        const fullPath = path.join(projectRoot, file);
        if (fs.existsSync(fullPath)) {
          existingFiles.push(file);
        } else {
          console.warn(`⚠ Critical file not found: ${file}`);
        }
      }

      if (existingFiles.length === 0) {
        console.warn('⚠ No critical files found to backup');
        return null;
      }

      // Create tar.gz archive
      const fileList = existingFiles.join(' ');
      const command = `cd ${projectRoot} && tar -czf "${archivePath}" ${fileList}`;

      console.log(`Archiving ${existingFiles.length} critical files...`);
      await execAsync(command);

      const fileSize = fs.statSync(archivePath).size;
      console.log(`✓ Configuration backup created: ${archiveName} (${this.gdrive.formatBytes(fileSize)})`);

      return archivePath;
    } catch (error) {
      console.error('✗ Configuration backup failed:', error.message);
      return null; // Don't fail entire backup if config backup fails
    }
  }

  /**
   * Cleanup temporary files
   */
  async cleanup(files) {
    console.log('\n=== Cleaning Up Temporary Files ===');

    for (const file of files) {
      if (file && fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`✓ Deleted: ${path.basename(file)}`);
        } catch (error) {
          console.warn(`⚠ Failed to delete ${file}: ${error.message}`);
        }
      }
    }
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

class NotificationService {
  /**
   * Send backup completion notification
   */
  static async sendNotification(success, stats, errors = []) {
    if (!CONFIG.notifications.enabled) {
      return;
    }

    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    const status = success ? '✅ SUCCESS' : '❌ FAILED';

    const message = {
      text: `Y-It Backup ${status}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Y-It Google Drive Backup ${status}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:*\n${success ? 'Completed successfully' : 'Failed'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${duration}s`,
            },
            {
              type: 'mrkdwn',
              text: `*Files Uploaded:*\n${stats.filesUploaded}`,
            },
            {
              type: 'mrkdwn',
              text: `*Total Size:*\n${this.formatBytes(stats.totalBytes)}`,
            },
          ],
        },
      ],
    };

    if (errors.length > 0) {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Errors:*\n${errors.map(e => `• ${e.file}: ${e.error}`).join('\n')}`,
        },
      });
    }

    // Send to Slack webhook if configured
    if (CONFIG.notifications.webhookUrl) {
      try {
        const fetch = (await import('node-fetch')).default;
        await fetch(CONFIG.notifications.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        console.log('✓ Slack notification sent');
      } catch (error) {
        console.warn('⚠ Failed to send Slack notification:', error.message);
      }
    }
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Y-It Google Drive Backup System v1.0              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  let success = false;
  const tempFiles = [];

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const backupType = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'full';
    const retentionDays = args.find(arg => arg.startsWith('--retention-days='))?.split('=')[1];

    if (retentionDays) {
      CONFIG.backup.retentionDays = parseInt(retentionDays);
    }

    console.log(`Backup Type: ${backupType}`);
    console.log(`Retention Policy: ${CONFIG.backup.retentionDays} days\n`);

    // Initialize Google Drive
    const gdrive = new GoogleDriveBackup();
    await gdrive.initialize();

    // Initialize Backup Manager
    const backupManager = new BackupManager(gdrive);
    backupManager.ensureTempDir();

    // Get date-based folder for today
    const dateFolderId = await gdrive.getDateFolder();

    // Create database dump
    if (backupType === 'database' || backupType === 'full') {
      const dumpPath = await backupManager.createDatabaseDump();
      tempFiles.push(dumpPath);

      await gdrive.uploadFile(
        dumpPath,
        path.basename(dumpPath),
        dateFolderId
      );
    }

    // Create configuration backup
    if (backupType === 'config' || backupType === 'full') {
      const configPath = await backupManager.createConfigBackup();
      if (configPath) {
        tempFiles.push(configPath);

        await gdrive.uploadFile(
          configPath,
          path.basename(configPath),
          dateFolderId
        );
      }
    }

    // Cleanup old backups
    await gdrive.cleanupOldBackups();

    // Cleanup temp files
    await backupManager.cleanup(tempFiles);

    success = true;

    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    BACKUP SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`Status:         ✅ SUCCESS`);
    console.log(`Duration:       ${duration}s`);
    console.log(`Files Uploaded: ${gdrive.stats.filesUploaded}`);
    console.log(`Total Size:     ${gdrive.formatBytes(gdrive.stats.totalBytes)}`);
    console.log(`Errors:         ${gdrive.stats.errors.length}`);
    console.log('');

    // Send notification
    await NotificationService.sendNotification(success, gdrive.stats, gdrive.stats.errors);

    process.exit(0);
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║                   BACKUP FAILED                            ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error(`Error: ${error.message}`);
    console.error('');

    // Send failure notification
    const stats = {
      startTime,
      filesUploaded: 0,
      totalBytes: 0,
      errors: [{ file: 'Backup Process', error: error.message }],
    };
    await NotificationService.sendNotification(false, stats, stats.errors);

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { GoogleDriveBackup, BackupManager, NotificationService };
