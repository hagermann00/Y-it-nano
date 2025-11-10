#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates SQLite database for tracking sync state
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const DB_PATH = process.env.DATABASE_PATH || './sync-state.db';

console.log(chalk.blue('Setting up sync state database...'));

// Create database
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create schema
const schema = `
-- Files table: tracks every file synced
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  phase_id INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  md5_hash TEXT NOT NULL,
  google_drive_id TEXT,
  google_drive_path TEXT,
  compression_enabled BOOLEAN DEFAULT 0,
  compressed_size INTEGER,
  last_modified INTEGER NOT NULL,
  last_synced INTEGER,
  sync_status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Topics table: tracks topic-level progress
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  batch TEXT NOT NULL,
  current_phase INTEGER DEFAULT 0,
  completion_percentage REAL DEFAULT 0.0,
  total_files INTEGER DEFAULT 0,
  synced_files INTEGER DEFAULT 0,
  total_size_bytes INTEGER DEFAULT 0,
  google_drive_folder_id TEXT,
  last_synced INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Phases table: tracks phase-level progress per topic
CREATE TABLE IF NOT EXISTS phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id TEXT NOT NULL,
  phase_id INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT 0,
  required_files_count INTEGER DEFAULT 0,
  found_files_count INTEGER DEFAULT 0,
  google_drive_folder_id TEXT,
  completed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(topic_id, phase_id)
);

-- Sync history: audit log of all sync operations
CREATE TABLE IF NOT EXISTS sync_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation_type TEXT NOT NULL,
  topic_id TEXT,
  phase_id INTEGER,
  file_id INTEGER,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  bytes_transferred INTEGER,
  error_message TEXT,
  metadata TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- File versions: track version history (keep last 3 versions)
CREATE TABLE IF NOT EXISTS file_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL,
  version_number INTEGER NOT NULL,
  md5_hash TEXT NOT NULL,
  google_drive_id TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Batch tracking
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  total_topics INTEGER DEFAULT 0,
  completed_topics INTEGER DEFAULT 0,
  total_files INTEGER DEFAULT 0,
  synced_files INTEGER DEFAULT 0,
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_topic ON files(topic_id);
CREATE INDEX IF NOT EXISTS idx_files_phase ON files(phase_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(sync_status);
CREATE INDEX IF NOT EXISTS idx_files_hash ON files(md5_hash);
CREATE INDEX IF NOT EXISTS idx_topics_batch ON topics(batch);
CREATE INDEX IF NOT EXISTS idx_phases_topic ON phases(topic_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_topic ON sync_history(topic_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_created ON sync_history(created_at);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_files_timestamp
  AFTER UPDATE ON files
  BEGIN
    UPDATE files SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_topics_timestamp
  AFTER UPDATE ON topics
  BEGIN
    UPDATE topics SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_phases_timestamp
  AFTER UPDATE ON phases
  BEGIN
    UPDATE phases SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
  END;

-- Create view for comprehensive sync status
CREATE VIEW IF NOT EXISTS v_sync_status AS
SELECT
  t.id AS topic_id,
  t.name AS topic_name,
  t.batch,
  t.current_phase,
  t.completion_percentage,
  COUNT(DISTINCT f.id) AS total_files,
  SUM(CASE WHEN f.sync_status = 'synced' THEN 1 ELSE 0 END) AS synced_files,
  SUM(CASE WHEN f.sync_status = 'pending' THEN 1 ELSE 0 END) AS pending_files,
  SUM(CASE WHEN f.sync_status = 'error' THEN 1 ELSE 0 END) AS error_files,
  SUM(f.file_size) AS total_bytes,
  MAX(f.last_synced) AS last_sync_time
FROM topics t
LEFT JOIN files f ON t.id = f.topic_id
GROUP BY t.id;
`;

try {
  // Execute schema
  db.exec(schema);

  console.log(chalk.green('✓ Database schema created'));

  // Insert initial batch data
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  const insertBatch = db.prepare(`
    INSERT OR IGNORE INTO batches (id, name, total_topics)
    VALUES (?, ?, ?)
  `);

  Object.entries(config.batches).forEach(([batchId, batchData]) => {
    insertBatch.run(batchId, batchData.name, batchData.topics.length);
  });

  console.log(chalk.green('✓ Batch data initialized'));

  // Insert topic data
  const insertTopic = db.prepare(`
    INSERT OR IGNORE INTO topics (id, name, slug, batch)
    VALUES (?, ?, ?, ?)
  `);

  config.topics.forEach(topic => {
    insertTopic.run(topic.id, topic.name, topic.slug, topic.batch);
  });

  console.log(chalk.green(`✓ ${config.topics.length} topics initialized`));

  // Show database stats
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM topics) AS topics,
      (SELECT COUNT(*) FROM batches) AS batches,
      (SELECT COUNT(*) FROM files) AS files
  `).get();

  console.log(chalk.cyan('\nDatabase Statistics:'));
  console.log(`  Topics: ${stats.topics}`);
  console.log(`  Batches: ${stats.batches}`);
  console.log(`  Files: ${stats.files}`);

  db.close();

  console.log(chalk.green(`\n✓ Database setup complete: ${DB_PATH}`));

} catch (error) {
  console.error(chalk.red('Error setting up database:'), error);
  process.exit(1);
}
