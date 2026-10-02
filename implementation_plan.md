# Capacity Connect - Finalized Implementation & Assessment Plan (V5)

Based on a meticulous final architectural and security review, this implementation plan (V5) has been hardened to guarantee deterministic demo behavior, secure data endpoints, and correct mathematical aggregation for the Living Profile engine.

## 1. The Core Idea: One Profile, Multiple Sources of Evidence

`TraineeCompetency` acts as a living record fed by an immutable ledger of signals (`CompetencyEvidence`). A central `recomputeCompetency()` function folds these signals to update the trainee's `currentLevel` and overall `confidence`.

### The Math Spec & Rules (Standardized 1-5 Scale)
*   **Confidence Formula:** `confidence = min(1.0, SUM(effective_weights))`
    *   *Behavioral Cap:* Applied dynamically during `recomputeCompetency`. Effective weight for behavioral signals is `min(0.3, SUM(behavioral_weights))`, distributed proportionally across rows.
*   **Level Formula (The "Assessed Supersedes" Rule):** 
    *   If *any* `ASSESSED` evidence exists for a skill, `currentLevel` is determined **solely** by the *latest* `ASSESSED` level. (Latest is determined by an `updatedAt` timestamp, ensuring upserts are evaluated correctly).
    *   If no `ASSESSED` evidence exists, `currentLevel` is a rounded weighted average: `Round(SUM(level * weight) / SUM(weight))`.
*   **Initial Weights & Server-Side Security:** Level and Weight are NEVER accepted from the client.
    *   `ASSESSED`: **Weight 1.0**. Level mapped via server-scored assessment (e.g. 3 of 4 correct = 75% = Level 4).
    *   `SELF_REPORTED` (Wizard): **Weight 0.5**. Client requests domain; server writes `level = 1`. (UI displays this as "Learning Goal", hiding the level 1 value).
    *   `QUIZ_INFERRED`: **Weight 0.4**. Mapped via static server code.
    *   `BEHAVIORAL`: **Weight 0.1**. Level inherits from `Course.difficulty` enum.
*   **Idempotency & Retakes:** Evidence uses `@@unique([traineeId, skillId, type, sourceRefId])`. `recordEvidence()` acts as an upsert, updating `level`, `weight`, and `updatedAt`. (A retake cooldown will be implemented for production, but bypassed if `DEMO_MODE` is active).
*   **Stable Reference IDs & Deletions:** The wizard and quiz use stable `sourceRefId` strings (e.g., `wizard:<skillId>` or `quiz:onboarding`). If the wizard is re-submitted with fewer domains, the handler explicitly deletes the missing `SELF_REPORTED` rows and recomputes those skills.
*   **The Matcher Gap Calculation (`requiredLevel`):** `requiredLevel` already lives on `TraineeCompetency`. When the Wizard sets a domain, it sets `requiredLevel = 5` and writes `level = 1` evidence. `recomputeCompetency` will **never** modify `requiredLevel`, guaranteeing the gap calculation logic remains stable.

---

## 2. Technical Execution Plan (The Roadmap)

### Phase 1: Schema and Evidence Layer (The Engine First)
- **Action:** Pre-flight: Report duplicates on `TraineeCompetency` and merge deliberately. Create a Neon DB branch for safe rollback.
- **Action:** Update `schema.prisma`:
  - `TraineeCompetency`: Ensure `currentLevel Int` and `requiredLevel Int` exist. Add `confidence Float @default(0)`, `lastEvidenceAt DateTime @default(now())`, and `@@unique([traineeId, skillId])`.
  - Create `CompetencyEvidence` (`traineeId`, `skillId`, `type`, `level Float`, `weight Float`, `sourceRefId String`, `createdAt DateTime`, `updatedAt DateTime @updatedAt`). Add `@@unique([traineeId, skillId, type, sourceRefId])`.
  - Add `textContent String? @db.Text` and `assessmentJson Json?` to `CourseModule`.
- **Action:** Push schema to Neon DB (`npx prisma db push`).
- **Action:** Build `recordEvidence()` and `recomputeCompetency()`. (Use batching: upsert all evidence, then recompute each distinct skill in a single `prisma.$transaction`. Execute the matcher API call *after* the transaction commits to prevent timeout freezes).

### Phase 2: Cold Start & Target Testing
- **Action:** Define static quiz-to-skill constant mapping. Wire Onboarding to `recordEvidence(..., type: 'QUIZ_INFERRED')`.
- **Action:** Build "Match Your Trainer" dashboard wizard (handles inserts, stable IDs, and deletes for `SELF_REPORTED`).
- **Action:** Update Course Builder UI/API for Hybrid modules (Video/Text). Fix Admin "N/A" placeholders explicitly.
- **Action (CRITICAL TEST):** Write `test-matching-reorder.ts`. The matcher's behavior (valuing a gap of 4 vs a gap of 1) means we must carefully tune our seed trainers. This test will mathematically assert that taking a trainee from Level 1 to Level 4 in Seismology guarantees a specific advanced trainer rises to rank #1.

### Phase 3: Seed Data & The Demo Assets
- **Action:** Generate 20+ specialized MoES courses and 100+ modules (Video, Text, Hybrid). Generate Earth Science `CourseSkill` mappings.
- **Action:** Seed 8-10 case-study modules. Questions and correct answers stay on the server. The Seismology case study will be explicitly designed with 4 questions so a 3/4 score perfectly yields Level 4.
- **Action:** Seed the "Demo Trainee" account with backdated `createdAt` and synced `updatedAt` evidence for visual timelines.

### Phase 4: Pre-Assessment Flow & Synchronous Rematch
- **Action:** Build the Pre-Assessment UI.
- **Action:** When submitted, score server-side (1-5), call `recordEvidence`, run `recomputeCompetency`, and **synchronously** call the matching algorithm. 
- **Action:** Return the reordered matches in the same request to trigger the UI reorder animation without Vercel freezing.

### Phase 5: Dashboard, Admin Polish & Secure Reset
- **Action:** Build Trainee "Profile Strength" widget (with "Learning Goal" badge logic). Build "Why this trainer?" panel. Wire Admin analytics.
- **Action:** Build `/api/admin/reset-demo` script. **Security:** Must be POST-only, admin-guarded, restricted to specific demo IDs, and gated securely behind a server-only `DEMO_MODE=true` environment variable.
