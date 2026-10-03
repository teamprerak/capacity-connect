# Phase 3: Database & Shared Packages Audit Report

This report contains findings from auditing the `capacity-connect` database schema, migrations, seed scripts, and shared packages (`packages/db/`, `packages/shared-types/`, `packages/ui/`).

### [CRITICAL] `seed.ts` will crash on repeated runs due to Foreign Key constraints
- **File:** `packages/db/prisma/seed.ts`
- **Issue:** The seed script cleans the database by calling `deleteMany()` on tables in reverse dependency order. However, it completely omits deletion for `KnowledgeHubItem`, `Feedback`, `Notification`, `Announcement`, `Achievement`, `LearningPath`, `Questionnaire`, and `Rating`. Since `User` is deleted at the end, Prisma will throw a Foreign Key Constraint error if any of those omitted tables contain data.
- **Suggested fix:** Add `deleteMany()` for all the missing models before deleting `User`, `TraineeProfile`, and `TrainerProfile`.

### [HIGH] Destructive Migration Without Data Migration
- **File:** `packages/db/prisma/migrations/20260926193648_course_urls_instead_of_minio/migration.sql`
- **Issue:** This migration drops the `course_resources` table entirely. Any existing resource data (like document URLs or names) was permanently lost without being migrated to the new `documentUrl` and `videoUrl` fields on `course_modules`.
- **Suggested fix:** In the future, use a multi-step migration: add new fields -> write a Prisma data migration script to move data from `course_resources` to `course_modules` -> drop the old table.

### [HIGH] Missing Cascade Deletes on `User` Relations
- **File:** `packages/db/prisma/schema.prisma`
- **Issue:** The `User` model lacks `onDelete: Cascade` on its relations to `TraineeProfile`, `TrainerProfile`, `UserRole`, and `RefreshToken`. This makes it impossible to cleanly delete a user from the system (such as for GDPR compliance or admin cleanup) without manually deleting all related records first.
- **Suggested fix:** Add `onDelete: Cascade` to the `@relation` definitions for tightly coupled identity records (e.g., profiles, roles, refresh tokens).

### [MEDIUM] Syntax Error in Smoke Test Script
- **File:** `packages/db/smoke-test.mjs`
- **Issue:** The script has a fatal syntax error at the end of the file: `main().catch(e = console.error(e); process.exit(1); }).finally(() =`. It is severely truncated and will not execute.
- **Suggested fix:** Fix the syntax: `main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());`

### [MEDIUM] Hardcoded Migration Name in `migrate.js`
- **File:** `packages/db/migrate.js`
- **Issue:** The script hardcodes `--name init`. Running this script to generate new migrations for subsequent schema changes will constantly name them `init`, creating confusion and poor migration history.
- **Suggested fix:** Read the migration name from `process.argv` and pass it to the Prisma CLI, or remove the script and rely on `package.json` scripts.

### [LOW] Missing Index on `KnowledgeHubItem.uploadedById`
- **File:** `packages/db/prisma/schema.prisma`
- **Issue:** `KnowledgeHubItem` has an `uploadedById` field linking it to a `User`, but it lacks an index. Fetching a user's uploaded items will result in a full table scan.
- **Suggested fix:** Add `@@index([uploadedById])` to the `KnowledgeHubItem` model.

### [LOW] Empty / Unused `shared-types` and `ui` Packages
- **File:** `packages/shared-types/package.json` & `packages/ui/package.json`
- **Issue:** Both the `shared-types` and `ui` packages are completely empty (no source files, no exports). The frontend and backend likely duplicate type definitions and UI components instead of sharing them.
- **Suggested fix:** Either utilize the packages to export shared interfaces (like API DTOs) and UI components (like buttons/modals), or remove them from the monorepo to reduce clutter.
