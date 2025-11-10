#!/usr/bin/env node

/**
 * Topic Structure Validator
 * Validates phase completeness and file requirements
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table3');
const minimist = require('minimist');

const config = require('./config.json');
const filePatterns = require('./file-patterns.json');

const args = minimist(process.argv.slice(2), {
  string: ['topic', 'batch'],
  boolean: ['verbose', 'strict'],
  alias: {
    t: 'topic',
    b: 'batch',
    v: 'verbose',
    s: 'strict'
  }
});

class TopicValidator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.strict = options.strict || false;
    this.results = {
      topics: 0,
      valid: 0,
      invalid: 0,
      warnings: 0,
      errors: []
    };
  }

  /**
   * Validate a single topic
   */
  validateTopic(topic) {
    console.log(chalk.cyan(`\n=== Validating: ${topic.name} (${topic.id}) ===\n`));

    const topicPath = path.join(config.local.productionRoot, topic.slug);

    // Check if topic directory exists
    if (!fs.existsSync(topicPath)) {
      console.log(chalk.red(`✗ Topic directory not found: ${topicPath}`));
      this.results.errors.push({
        topic: topic.name,
        error: 'Directory not found'
      });
      return false;
    }

    const phaseResults = [];
    let topicValid = true;

    // Validate each phase
    for (const phase of config.phases) {
      const phaseResult = this.validatePhase(topicPath, phase, topic);
      phaseResults.push(phaseResult);

      if (!phaseResult.valid) {
        topicValid = false;
      }
    }

    // Print phase summary table
    this.printPhaseTable(phaseResults);

    // Overall topic validation
    if (topicValid) {
      console.log(chalk.green(`\n✓ Topic structure valid`));
      this.results.valid++;
    } else {
      console.log(chalk.red(`\n✗ Topic structure has issues`));
      this.results.invalid++;
    }

    return topicValid;
  }

  /**
   * Validate a single phase for a topic
   */
  validatePhase(topicPath, phase, topic) {
    const result = {
      phase: `Phase ${phase.id}`,
      name: phase.name,
      requiredFiles: [],
      optionalFiles: [],
      missingRequired: [],
      valid: true,
      warnings: []
    };

    // Check required files
    for (const pattern of phase.requiredFiles) {
      const found = this.findMatchingFiles(topicPath, pattern, topic.slug);

      if (found.length === 0) {
        result.missingRequired.push(pattern);
        result.valid = false;
      } else {
        result.requiredFiles.push(...found);
      }
    }

    // Check optional files
    for (const pattern of phase.optionalFiles) {
      const found = this.findMatchingFiles(topicPath, pattern, topic.slug);
      result.optionalFiles.push(...found);
    }

    // File size validation
    const allFiles = [...result.requiredFiles, ...result.optionalFiles];
    for (const file of allFiles) {
      const validation = this.validateFileSize(file);
      if (!validation.valid) {
        result.warnings.push(validation.warning);
        this.results.warnings++;
      }
    }

    return result;
  }

  /**
   * Find files matching a pattern
   */
  findMatchingFiles(directory, pattern, topicSlug) {
    if (!fs.existsSync(directory)) return [];

    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, topicSlug || '.*')
      .replace(/\./g, '\\.');

    const regex = new RegExp(regexPattern);
    const matches = [];

    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          if (regex.test(entry.name)) {
            matches.push(fullPath);
          }
        }
      }
    };

    scanDir(directory);
    return matches;
  }

  /**
   * Validate file size
   */
  validateFileSize(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileSize = fs.statSync(filePath).size;
    const fileName = path.basename(filePath);

    let validation = null;

    // Check against validation rules
    if (ext === '.md' && filePatterns.fileValidation.markdown) {
      validation = filePatterns.fileValidation.markdown;
    } else if (ext === '.pdf' && filePatterns.fileValidation.pdf) {
      validation = filePatterns.fileValidation.pdf;
    } else if (ext === '.indd' && filePatterns.fileValidation.indesign) {
      validation = filePatterns.fileValidation.indesign;
    }

    if (!validation) {
      return { valid: true };
    }

    if (fileSize < validation.minSize) {
      return {
        valid: false,
        warning: `${fileName}: File too small (${this.formatBytes(fileSize)} < ${this.formatBytes(validation.minSize)})`
      };
    }

    if (fileSize > validation.maxSize) {
      return {
        valid: false,
        warning: `${fileName}: File too large (${this.formatBytes(fileSize)} > ${this.formatBytes(validation.maxSize)})`
      };
    }

    return { valid: true };
  }

  /**
   * Print phase validation table
   */
  printPhaseTable(phaseResults) {
    const table = new Table({
      head: ['Phase', 'Name', 'Required', 'Optional', 'Status'],
      colWidths: [10, 30, 12, 12, 15],
      style: {
        head: ['cyan']
      }
    });

    for (const result of phaseResults) {
      const status = result.valid
        ? chalk.green('✓ Valid')
        : chalk.red('✗ Missing files');

      table.push([
        result.phase,
        result.name,
        result.requiredFiles.length.toString(),
        result.optionalFiles.length.toString(),
        status
      ]);
    }

    console.log(table.toString());

    // Print missing files details
    const missing = phaseResults.filter(r => r.missingRequired.length > 0);
    if (missing.length > 0) {
      console.log(chalk.yellow('\nMissing Required Files:'));
      for (const result of missing) {
        console.log(chalk.yellow(`  ${result.name}:`));
        for (const pattern of result.missingRequired) {
          console.log(chalk.red(`    - ${pattern}`));
        }
      }
    }

    // Print warnings
    const warnings = phaseResults.filter(r => r.warnings.length > 0);
    if (warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'));
      for (const result of warnings) {
        for (const warning of result.warnings) {
          console.log(chalk.yellow(`  ⚠ ${warning}`));
        }
      }
    }
  }

  /**
   * Validate entire batch
   */
  validateBatch(batchId) {
    const batch = config.batches[batchId.toUpperCase()];

    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    console.log(chalk.cyan(`\n=== Validating Batch ${batchId}: ${batch.name} ===`));

    for (const topicId of batch.topics) {
      const topic = config.topics.find(t => t.id === topicId);
      this.results.topics++;
      this.validateTopic(topic);
    }
  }

  /**
   * Validate all topics
   */
  validateAll() {
    console.log(chalk.cyan('\n=== Validating All Topics ==='));

    for (const topic of config.topics) {
      this.results.topics++;
      this.validateTopic(topic);
    }
  }

  /**
   * Check phase dependencies
   */
  checkPhaseDependencies(topic) {
    console.log(chalk.cyan(`\nChecking phase dependencies for ${topic.name}...`));

    const topicPath = path.join(config.local.productionRoot, topic.slug);
    const completedPhases = [];

    // Determine which phases are complete
    for (const phase of config.phases) {
      const result = this.validatePhase(topicPath, phase, topic);
      if (result.valid) {
        completedPhases.push(phase.id);
      }
    }

    // Check for gaps (e.g., Phase 3 complete but Phase 2 not)
    const warnings = [];
    for (let i = 0; i < completedPhases.length; i++) {
      const currentPhase = completedPhases[i];
      const previousPhase = currentPhase - 1;

      if (previousPhase >= 0 && !completedPhases.includes(previousPhase)) {
        warnings.push(
          `Phase ${currentPhase} is complete, but Phase ${previousPhase} is not. Consider completing phases sequentially.`
        );
      }
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow('\nPhase Dependency Warnings:'));
      warnings.forEach(w => console.log(chalk.yellow(`  ⚠ ${w}`)));
    } else {
      console.log(chalk.green('✓ No phase dependency issues'));
    }
  }

  /**
   * Print validation summary
   */
  printSummary() {
    console.log(chalk.cyan('\n=== Validation Summary ==='));
    console.log(`Topics validated: ${this.results.topics}`);
    console.log(chalk.green(`Valid: ${this.results.valid}`));
    console.log(chalk.red(`Invalid: ${this.results.invalid}`));
    console.log(chalk.yellow(`Warnings: ${this.results.warnings}`));

    if (this.results.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      this.results.errors.forEach(e => {
        console.log(chalk.red(`  ${e.topic}: ${e.error}`));
      });
    }

    const successRate = (this.results.valid / this.results.topics * 100).toFixed(1);
    console.log(`\nSuccess rate: ${successRate}%`);
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
  console.log(chalk.bold.cyan('Y-IT Topic Structure Validator\n'));

  const validator = new TopicValidator({
    verbose: args.verbose,
    strict: args.strict
  });

  try {
    if (args.topic) {
      const topic = config.topics.find(t => t.id === args.topic || t.slug === args.topic);
      if (!topic) {
        throw new Error(`Topic not found: ${args.topic}`);
      }
      validator.results.topics++;
      validator.validateTopic(topic);

      // Check dependencies if verbose
      if (args.verbose) {
        validator.checkPhaseDependencies(topic);
      }

    } else if (args.batch) {
      validator.validateBatch(args.batch);
    } else {
      validator.validateAll();
    }

    validator.printSummary();

    // Exit with error code if validation failed
    if (validator.results.invalid > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('\nValidation failed:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TopicValidator;
