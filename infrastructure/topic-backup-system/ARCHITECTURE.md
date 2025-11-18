# System Architecture - Y-It Topic Backup System

Visual overview of system components and data flow.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Y-It Production Workflow                      │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Phase 0  │→ │ Phase 1  │→ │ Phase 2  │→ │ Phase 3  │→ ...   │
│  │ Research │  │ Strategy │  │  Cases   │  │ Content  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  Files Generated: *_research_engine.md, *_manuscript.md, etc.    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  File Watcher   │
                    │   (chokidar)    │
                    │  5s debounce    │
                    └─────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Sync Engine    │
                    │ - Phase detect  │
                    │ - MD5 check     │
                    │ - Compress      │
                    │ - Upload        │
                    └─────────────────┘
                              ↓
              ┌───────────────┴───────────────┐
              ↓                               ↓
    ┌─────────────────┐            ┌─────────────────┐
    │  SQLite DB      │            │  Google Drive   │
    │ - Track state   │            │  Y-It-Production│
    │ - Versions      │            │  ├── Topics/    │
    │ - History       │            │  ├── Batches/   │
    └─────────────────┘            │  └── Templates/ │
              ↓                     └─────────────────┘
    ┌─────────────────┐                     ↓
    │  Reports        │            ┌─────────────────┐
    │ - JSON/CSV/HTML │            │  Team Access    │
    │ - Dashboard     │            │ - Designers     │
    │ - Validation    │            │ - Reviewers     │
    └─────────────────┘            │ - Stakeholders  │
                                   └─────────────────┘
```

## Component Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                         │
├────────────────────────────────────────────────────────────────────┤
│  CLI Commands          Web Dashboard          Reports               │
│  ├── sync             ├── Status view        ├── JSON export       │
│  ├── watch            ├── Progress bars      ├── CSV export        │
│  ├── validate         ├── Topic list         ├── HTML export       │
│  ├── restore          └── Auto-refresh       └── Console output    │
│  └── report                                                         │
└────────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                           │
├────────────────────────────────────────────────────────────────────┤
│  TopicBackupSync      FileWatcher           Validator               │
│  ├── initDrive()      ├── start()           ├── validateTopic()    │
│  ├── syncTopic()      ├── scheduleSync()    ├── validatePhase()    │
│  ├── syncBatch()      └── checkPhase()      └── checkDeps()        │
│  ├── uploadFile()                                                   │
│  └── detectPhase()    TopicRestore          ReportGenerator        │
│                       ├── restoreTopic()     ├── generateReport()  │
│                       ├── restorePhase()     ├── exportJSON()      │
│                       └── downloadFile()     ├── exportCSV()       │
│                                              └── exportHTML()       │
└────────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                        Data Access Layer                            │
├────────────────────────────────────────────────────────────────────┤
│  Database Manager     File System           Google Drive API       │
│  ├── SQLite DB        ├── Read files        ├── OAuth/Service     │
│  ├── CRUD ops         ├── Write files       ├── Upload files      │
│  ├── Transactions     ├── MD5 hash          ├── Download files    │
│  └── Queries          └── Compression       └── Folder mgmt       │
└────────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                         Storage Layer                               │
├────────────────────────────────────────────────────────────────────┤
│  Local Production     SQLite Database       Google Drive           │
│  /production/         sync-state.db         Y-It-Production/       │
│  ├── dropshipping/    ├── files            ├── Topics/            │
│  ├── print-on-demand/ ├── topics           │   ├── 01-Drop../    │
│  └── ...              ├── phases           │   └── 02-POD../     │
│                       └── history          └── Batches/           │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Sync Flow

```
1. File Change Detected
   └─> Chokidar emits 'add' or 'change' event
       └─> Debounce timer starts (5 seconds)
           └─> Timer expires
               └─> scheduleSync(filePath)

2. Phase Detection
   └─> Read filename: "dropshipping_manuscript_full.md"
       └─> Match against patterns in file-patterns.json
           └─> Pattern matched: ".*_manuscript_full\\.md$"
               └─> Phase detected: Phase 3 (Content)

3. File Processing
   └─> Calculate MD5 hash
       └─> Query database for existing file
           └─> Compare MD5 hashes
               ├─> Same hash → Skip (already synced)
               └─> Different hash → Continue

4. Compression Decision
   └─> Check file extension: .md
       └─> Look up in compressionSettings
           └─> Match found: compress = true
               └─> gzip file (60-80% reduction)

5. Upload to Google Drive
   └─> Check file size
       ├─> Size < 5MB → Simple upload
       └─> Size > 5MB → Resumable upload
           └─> Create upload session
               └─> Upload in chunks
                   └─> Track progress
                       └─> Handle interruptions

6. Database Update
   └─> Insert/Update files table
       └─> Update topic statistics
           └─> Check phase completion
               └─> Update phase status
                   └─> Trigger notification (if enabled)

7. Notification (Optional)
   └─> Check if phase complete
       └─> All required files present?
           └─> Yes → Send Slack notification
               └─> "✓ Phase 3 completed for Dropshipping"
```

### Restore Flow

```
1. Restore Command
   └─> npm run restore -- --topic=dropshipping --phase=3

2. Query Database
   └─> SELECT * FROM files WHERE topic_id='01' AND phase_id=3

3. List Files
   └─> Display available files
       └─> Interactive mode: User selects files
       └─> Auto mode: All files selected

4. Download from Google Drive
   └─> For each file:
       └─> GET /files/{fileId}?alt=media
           └─> Download file content
               └─> Decompress if needed
                   └─> Write to local filesystem

5. Verification
   └─> Calculate MD5 of downloaded file
       └─> Compare with database
           └─> Match → Success
           └─> Mismatch → Error
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         files                                    │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)              │ INTEGER                                   │
│ topic_id             │ TEXT → topics.id                          │
│ topic_name           │ TEXT                                      │
│ phase_id             │ INTEGER                                   │
│ phase_name           │ TEXT                                      │
│ file_path            │ TEXT (UNIQUE)                             │
│ file_name            │ TEXT                                      │
│ file_size            │ INTEGER                                   │
│ md5_hash             │ TEXT                                      │
│ google_drive_id      │ TEXT                                      │
│ compression_enabled  │ BOOLEAN                                   │
│ compressed_size      │ INTEGER                                   │
│ last_modified        │ INTEGER (timestamp)                       │
│ last_synced          │ INTEGER (timestamp)                       │
│ sync_status          │ TEXT (pending/synced/error)               │
│ retry_count          │ INTEGER                                   │
│ error_message        │ TEXT                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         topics                                   │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)              │ TEXT                                      │
│ name                 │ TEXT                                      │
│ slug                 │ TEXT (UNIQUE)                             │
│ batch                │ TEXT                                      │
│ current_phase        │ INTEGER                                   │
│ completion_pct       │ REAL                                      │
│ total_files          │ INTEGER                                   │
│ synced_files         │ INTEGER                                   │
│ total_size_bytes     │ INTEGER                                   │
│ google_drive_folder  │ TEXT                                      │
│ last_synced          │ INTEGER                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         phases                                   │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)              │ INTEGER                                   │
│ topic_id             │ TEXT → topics.id                          │
│ phase_id             │ INTEGER                                   │
│ phase_name           │ TEXT                                      │
│ is_complete          │ BOOLEAN                                   │
│ required_files_count │ INTEGER                                   │
│ found_files_count    │ INTEGER                                   │
│ google_drive_folder  │ TEXT                                      │
│ completed_at         │ INTEGER                                   │
└─────────────────────────────────────────────────────────────────┘

Relationships:
- files.topic_id → topics.id (many-to-one)
- phases.topic_id → topics.id (many-to-one)
- file_versions.file_id → files.id (many-to-one)
```

## Google Drive Structure

```
Y-It-Production/
│
├── Topics/
│   ├── 01-Dropshipping/
│   │   ├── Phase-0-Research/
│   │   │   ├── dropshipping_research_engine.md
│   │   │   └── market_analysis.pdf
│   │   ├── Phase-1-Strategy/
│   │   │   ├── dropshipping_research_summary.md
│   │   │   └── dropshipping_content_strategy.md
│   │   ├── Phase-2-Case-Studies/
│   │   │   └── dropshipping_case_studies.md
│   │   ├── Phase-3-Content/
│   │   │   ├── dropshipping_manuscript_full.md
│   │   │   ├── dropshipping_manuscript_compressed.md
│   │   │   └── dropshipping_content_extraction.md
│   │   ├── Phase-4-Design-Specs/
│   │   │   ├── dropshipping_image_specifications.md
│   │   │   ├── dropshipping_hero_brief.md
│   │   │   └── dropshipping_comic_strip_brief.md
│   │   ├── Phase-5-Audit/
│   │   │   └── dropshipping_manuscript_audit.md
│   │   ├── Phase-6-Designer-Handoff/
│   │   │   ├── dropshipping_designer_brief.md
│   │   │   └── dropshipping_complete_spec_package.md
│   │   ├── Phase-7-Design-Production/
│   │   │   ├── dropshipping.indd
│   │   │   ├── dropshipping_proof_v1.pdf
│   │   │   └── dropshipping_proof_v2.pdf
│   │   ├── Phase-8-Final-Assets/
│   │   │   ├── dropshipping_KDP_final.pdf
│   │   │   ├── dropshipping_gumroad.pdf
│   │   │   └── dropshipping_web_version/
│   │   └── Phase-9-Quality/
│   │       ├── quality_checklist.md
│   │       └── approval_sign_off.md
│   │
│   ├── 02-Print-On-Demand/
│   │   └── [Same structure]
│   │
│   └── ... (48 more topics)
│
├── Templates/
│   ├── UNIVERSAL_RESEARCH_ENGINE.md
│   ├── Y-It_STYLE_GUIDE.md
│   └── UNIVERSAL_PRIMER.md
│
├── Batches/
│   ├── Batch-A/
│   │   └── (Shortcuts to Topics 01-05)
│   ├── Batch-B/
│   │   └── (Shortcuts to Topics 06-10)
│   └── ...
│
└── Archive/
    └── Old-Versions/
        └── (Older file versions)
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Authentication
├── Google Service Account
│   ├── Private key stored in .env (gitignored)
│   ├── Limited scope (Drive API only)
│   └── No password required
└── OR OAuth 2.0
    ├── Tokens stored in .tokens.json (gitignored)
    ├── User consent required
    └── Refresh token for long-term access

Layer 2: Authorization
├── Service Account has access to specific folder only
├── Not full Drive access
└── Can be revoked anytime from Google Console

Layer 3: Data Protection
├── Files encrypted in transit (HTTPS)
├── Files encrypted at rest (Google Drive encryption)
├── Local database can be encrypted
└── Version history prevents accidental deletion

Layer 4: Code Security
├── .env excluded from git (.gitignore)
├── No hardcoded credentials
├── Input validation on all file paths
└── SQL injection prevention (prepared statements)

Layer 5: Access Control
├── Google Drive sharing controls
├── Only authorized users can access
├── Audit log in sync_history table
└── Team collaboration via shared folders
```

## Scalability Considerations

### Horizontal Scaling

```
Not needed (single-user system)
```

### Vertical Scaling

```
Performance Bottlenecks:
1. Network bandwidth (upload/download)
   → Solution: Compression, parallel uploads

2. Google Drive API rate limits (1000 req/100s)
   → Solution: Exponential backoff, request batching

3. SQLite concurrent writes
   → Solution: WAL mode enabled, single writer pattern

4. File system I/O
   → Solution: Async operations, streaming for large files

Capacity Limits:
- Topics: Unlimited (config-based)
- Files: Unlimited (SQLite supports billions)
- Storage: Up to Google Drive limit (2TB max in practice)
- Concurrent syncs: 3 (configurable, rate limit aware)
```

## Error Handling & Recovery

```
┌─────────────────────────────────────────────────────────────────┐
│                     Error Handling Flow                          │
└─────────────────────────────────────────────────────────────────┘

1. Network Errors
   └─> Exponential backoff retry (3 attempts)
       └─> Retry 1: Wait 1 second
       └─> Retry 2: Wait 2 seconds
       └─> Retry 3: Wait 4 seconds
       └─> Still failing? Log error, update database, notify user

2. API Rate Limits
   └─> Detect 429 Too Many Requests
       └─> Wait for Retry-After header duration
           └─> Resume operations

3. File System Errors
   └─> File not found / Permission denied
       └─> Log error
           └─> Skip file
               └─> Continue with next file

4. Database Errors
   └─> Lock timeout / Corruption
       └─> Close connection
           └─> Reopen with retry
               └─> If persistent: Alert user to backup DB

5. Interrupted Uploads
   └─> Large file upload stopped mid-way
       └─> Next sync detects incomplete upload
           └─> Resume from last checkpoint
               └─> Or restart upload if <5MB
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────┐
│                    Monitoring Points                             │
└─────────────────────────────────────────────────────────────────┘

Logs:
├── sync.log (all sync operations)
├── error.log (errors only)
└── debug.log (verbose mode)

Database Metrics:
├── Total files synced
├── Pending files
├── Error files
├── Sync success rate
└── Average upload time

Real-time Dashboard:
├── Current sync status
├── Progress percentages
├── Recent activity
└── Error alerts

Notifications:
├── Slack webhooks (phase completion)
├── Error alerts (optional email)
└── Daily summary reports (optional)

Audit Trail:
└── sync_history table
    ├── What was synced
    ├── When it was synced
    ├── How long it took
    └── Success/failure status
```

---

**This architecture supports:**
- ✅ 50+ topics with 20-30 files each
- ✅ Real-time sync (<5 seconds)
- ✅ Batch operations
- ✅ Version history
- ✅ Disaster recovery
- ✅ Team collaboration
- ✅ Production-grade reliability
