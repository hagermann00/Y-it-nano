#!/usr/bin/env node

/**
 * Test Script for Topic Backup System
 * Creates test data and verifies sync functionality
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const TopicBackupSync = require('./topic-backup-sync');
const TopicValidator = require('./validate-topic-structure');

const config = require('./config.json');

class BackupSystemTester {
  constructor() {
    this.testDir = path.join(__dirname, 'test-data');
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log(chalk.bold.cyan('Y-It Topic Backup System - Test Suite\n'));

    try {
      await this.test1_CreateTestData();
      await this.test2_PhaseDetection();
      await this.test3_FileValidation();
      await this.test4_DryRunSync();
      // await this.test5_RealSync(); // Uncomment to test real sync

      this.printResults();

    } catch (error) {
      console.error(chalk.red('Test suite failed:'), error);
      process.exit(1);
    }
  }

  /**
   * Test 1: Create test data structure
   */
  async test1_CreateTestData() {
    const testName = 'Create Test Data Structure';
    console.log(chalk.cyan(`\nTest 1: ${testName}`));

    try {
      // Clean up existing test data
      if (fs.existsSync(this.testDir)) {
        fs.rmSync(this.testDir, { recursive: true });
      }

      // Create test topic directory
      const topicDir = path.join(this.testDir, 'dropshipping');
      fs.mkdirSync(topicDir, { recursive: true });

      // Create test files for each phase
      const testFiles = [
        // Phase 0
        { name: 'dropshipping_research_engine.md', content: '# Research Engine\n\nMarket analysis data...', phase: 0 },

        // Phase 1
        { name: 'dropshipping_research_summary.md', content: '# Research Summary\n\nKey findings...', phase: 1 },
        { name: 'dropshipping_content_strategy.md', content: '# Content Strategy\n\nApproach...', phase: 1 },

        // Phase 2
        { name: 'dropshipping_case_studies.md', content: '# Case Studies\n\n1. Karen the Bored Mom...', phase: 2 },

        // Phase 3
        { name: 'dropshipping_manuscript_full.md', content: '# Full Manuscript\n\n10,000 words...', phase: 3 },
        { name: 'dropshipping_manuscript_compressed.md', content: '# Compressed Manuscript\n\n7,800 words...', phase: 3 },

        // Phase 4
        { name: 'dropshipping_image_specifications.md', content: '# Image Specs\n\nHero image...', phase: 4 },

        // Phase 5
        { name: 'dropshipping_manuscript_audit.md', content: '# Audit\n\nValidation results...', phase: 5 },

        // Phase 6
        { name: 'dropshipping_designer_brief.md', content: '# Designer Brief\n\nInstructions...', phase: 6 },
        { name: 'dropshipping_complete_spec_package.md', content: '# Spec Package\n\nComplete specs...', phase: 6 },

        // Phase 8
        { name: 'dropshipping_KDP_final.pdf', content: 'PDF content placeholder', phase: 8 },

        // Phase 9
        { name: 'quality_checklist.md', content: '# Quality Checklist\n\n- [ ] All checks pass', phase: 9 }
      ];

      for (const file of testFiles) {
        const filePath = path.join(topicDir, file.name);
        fs.writeFileSync(filePath, file.content);
      }

      console.log(chalk.green(`✓ Created ${testFiles.length} test files`));
      this.recordTest(testName, true);

    } catch (error) {
      console.error(chalk.red('✗ Failed:'), error.message);
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 2: Phase detection
   */
  async test2_PhaseDetection() {
    const testName = 'Phase Detection';
    console.log(chalk.cyan(`\nTest 2: ${testName}`));

    try {
      const sync = new TopicBackupSync({ dryRun: true });

      const testCases = [
        { file: 'dropshipping_research_engine.md', expectedPhase: 0 },
        { file: 'dropshipping_content_strategy.md', expectedPhase: 1 },
        { file: 'dropshipping_case_studies.md', expectedPhase: 2 },
        { file: 'dropshipping_manuscript_full.md', expectedPhase: 3 },
        { file: 'dropshipping_image_specifications.md', expectedPhase: 4 },
        { file: 'dropshipping_designer_brief.md', expectedPhase: 6 },
        { file: 'dropshipping_KDP_final.pdf', expectedPhase: 8 }
      ];

      let passed = 0;
      let failed = 0;

      for (const testCase of testCases) {
        const phase = sync.detectPhase(testCase.file);

        if (phase && phase.id === testCase.expectedPhase) {
          console.log(chalk.gray(`  ✓ ${testCase.file} → Phase ${phase.id}`));
          passed++;
        } else {
          console.log(chalk.red(`  ✗ ${testCase.file} → Expected Phase ${testCase.expectedPhase}, got ${phase?.id || 'null'}`));
          failed++;
        }
      }

      if (failed === 0) {
        console.log(chalk.green(`✓ All ${passed} phase detections correct`));
        this.recordTest(testName, true);
      } else {
        throw new Error(`${failed} phase detections failed`);
      }

    } catch (error) {
      console.error(chalk.red('✗ Failed:'), error.message);
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 3: File validation
   */
  async test3_FileValidation() {
    const testName = 'File Validation';
    console.log(chalk.cyan(`\nTest 3: ${testName}`));

    try {
      // Temporarily point to test data
      const originalRoot = config.local.productionRoot;
      config.local.productionRoot = this.testDir;

      const validator = new TopicValidator({ verbose: false });
      const topic = { id: '01', name: 'Dropshipping', slug: 'dropshipping' };

      const isValid = validator.validateTopic(topic);

      // Restore original config
      config.local.productionRoot = originalRoot;

      if (isValid) {
        console.log(chalk.green('✓ Validation passed'));
        this.recordTest(testName, true);
      } else {
        throw new Error('Validation failed - missing required files');
      }

    } catch (error) {
      console.error(chalk.red('✗ Failed:'), error.message);
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 4: Dry run sync
   */
  async test4_DryRunSync() {
    const testName = 'Dry Run Sync';
    console.log(chalk.cyan(`\nTest 4: ${testName}`));

    try {
      // Temporarily point to test data
      const originalRoot = config.local.productionRoot;
      config.local.productionRoot = this.testDir;

      const sync = new TopicBackupSync({ dryRun: true, verbose: false });

      // Mock Google Drive connection (don't actually connect in dry run)
      sync.initDrive = async () => {
        console.log(chalk.gray('  (Mocked Google Drive connection)'));
        return true;
      };

      const topic = { id: '01', name: 'Dropshipping', slug: 'dropshipping' };

      // This should not upload anything but should simulate the process
      await sync.syncTopic(topic.id);

      // Restore original config
      config.local.productionRoot = originalRoot;

      if (sync.stats.scanned > 0) {
        console.log(chalk.green(`✓ Dry run completed - scanned ${sync.stats.scanned} files`));
        this.recordTest(testName, true);
      } else {
        throw new Error('No files scanned in dry run');
      }

    } catch (error) {
      console.error(chalk.red('✗ Failed:'), error.message);
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 5: Real sync (requires Google Drive credentials)
   */
  async test5_RealSync() {
    const testName = 'Real Sync to Google Drive';
    console.log(chalk.cyan(`\nTest 5: ${testName}`));
    console.log(chalk.yellow('  Warning: This will upload to Google Drive'));

    try {
      // Check for credentials
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !process.env.GOOGLE_CLIENT_ID) {
        throw new Error('No Google Drive credentials found - skipping real sync test');
      }

      // Temporarily point to test data
      const originalRoot = config.local.productionRoot;
      config.local.productionRoot = this.testDir;

      const sync = new TopicBackupSync({ dryRun: false, verbose: true });
      await sync.initDrive();

      const topic = { id: '01', name: 'Dropshipping', slug: 'dropshipping' };
      await sync.syncTopic(topic.id);

      // Restore original config
      config.local.productionRoot = originalRoot;

      if (sync.stats.uploaded > 0) {
        console.log(chalk.green(`✓ Real sync completed - uploaded ${sync.stats.uploaded} files`));
        this.recordTest(testName, true);
      } else {
        throw new Error('No files uploaded');
      }

    } catch (error) {
      console.error(chalk.red('✗ Failed:'), error.message);
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Record test result
   */
  recordTest(name, passed, error = null) {
    this.results.tests.push({ name, passed, error });
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  /**
   * Print test results
   */
  printResults() {
    console.log(chalk.cyan('\n=== Test Results ==='));
    console.log(chalk.green(`Passed: ${this.results.passed}`));
    console.log(chalk.red(`Failed: ${this.results.failed}`));
    console.log(`Total: ${this.results.tests.length}`);

    if (this.results.failed > 0) {
      console.log(chalk.red('\nFailed Tests:'));
      this.results.tests
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(chalk.red(`  ✗ ${t.name}`));
          console.log(chalk.gray(`    ${t.error}`));
        });

      process.exit(1);
    } else {
      console.log(chalk.green('\n✓ All tests passed!'));

      // Cleanup
      console.log(chalk.gray('\nCleaning up test data...'));
      if (fs.existsSync(this.testDir)) {
        fs.rmSync(this.testDir, { recursive: true });
      }
      console.log(chalk.gray('✓ Test data removed'));
    }
  }
}

// Run tests
const tester = new BackupSystemTester();
tester.runAll();
