# Backend Integration & Implementation Plan: Admin Panel

This document outlines the strategy for connecting the newly developed React UI components of the Administrative Panel to the existing NestJS backend and Prisma database. 

## 1. Executive Summary
We have successfully implemented the structural UI for six new administrative modules. Currently, these pages rely on empty array fallbacks to safely render `"N/A"` states. The backend, built on NestJS and Prisma, already contains a rich schema with models like `TrainerProfile`, `KnowledgeHubItem`, `TraineeCompetency`, and `Announcement`.

The goal of this phase is to fetch real data via our `apps/web/lib/api-client.ts` by leveraging existing NestJS endpoints, while constructing new aggregate endpoints where the UI requires specialized dashboards (e.g., the Operational Readiness Index).

---

## 2. Global Strategy
*   **API Client:** We will use the existing `api.get()` / `api.post()` wrappers provided in `apps/web/lib/api-client.ts`. 
*   **State Management:** We will implement `useEffect` / `useState` (or React Query/SWR if preferred) in the client-side page components to fetch and bind this data.
*   **Authorization:** The `api-client` already attaches the JWT Bearer token. All admin endpoints must be secured with the existing `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('admin')` decorators in NestJS.

---

## 3. Module-by-Module Implementation Plan

### A. Admin Dashboard (`/admin/dashboard`)
*   **UI Requirements:** Org-wide KPI metrics, competency improvement trends, department participation, and an activity feed.
*   **Existing Methods:** 
    *   `AnalyticsService.getAdminDashboard()` (already calculates `totalTrainees`, `totalTrainers`, `courses`, `enrollments`, etc.).
    *   `AdminService.getAuditLogs()` (can be used for the "Recent Activity" feed).
*   **New Methods to Develop:** 
    *   `getDashboardCharts()`: Need a new endpoint to aggregate time-series data for the "Competency improvement" (line chart) and "Department participation" (bar chart).
    *   `getPendingActions()`: Need a quick aggregate endpoint returning counts of pending registrations, course proposals, and unverified trainers.

### B. Readiness Command Center (`/admin/readiness`)
*   **UI Requirements:** Operational Readiness Index (ORI), personnel readiness radar, and department-by-competency ORI heatmap.
*   **Current State:** We have a generic `AnalyticsService.getHeatmap()`, but it tracks skill gaps, not the holistic ORI score.
*   **New Methods to Develop:**
    *   **ORI Calculation Engine:** Create a new NestJS service `ReadinessService`. It needs to calculate the ORI score out of 100 based on the 5 gates: Competency (C), Learning (L), Assessment (A), Evidence (E), and Scenario (S).
    *   `GET /api/v1/readiness/personnel`: Fetch `TraineeProfile` joined with enrollments, assessments, and competency scores to populate the "Personnel readiness radar".
    *   `GET /api/v1/readiness/departments`: Aggregate the ORI scores grouped by `Department` to populate the department-level heatmap.

### C. Knowledge Continuity Vault (`/admin/knowledge`)
*   **UI Requirements:** Library of critical institutional assets (Expert Debriefs, Playbooks, Case Archives) tagged by Succession Risk.
*   **Existing Methods:** The Prisma schema contains the `KnowledgeHubItem` model, which tracks `title`, `type`, `storageKey`, `category`, and `tags`.
*   **New Methods to Develop:**
    *   *Schema Update (Optional but Recommended):* Add `criticality` (Enum: Mission Critical, Important) and `successionRisk` (Enum: High, Medium, Low) to the `KnowledgeHubItem` model, or strictly enforce these as JSON values in the existing `tags` array.
    *   `GET /api/v1/knowledge-vault/metrics`: Returns counts for the top KPI cards (Captured Assets, Mission Critical, etc.).
    *   `GET /api/v1/knowledge-vault/assets`: Fetches the array of `KnowledgeHubItem`s including the relation to `uploadedBy` (User) to populate the vault grid.

### D. Trainer Management (`/admin/trainers`)
*   **UI Requirements:** Grid of trainers with their verification status, ratings, years of experience, and expertise tags.
*   **Existing Methods:** 
    *   `AdminController.getPendingTrainers()` exists.
    *   `AdminController.updateTrainerVerification()` exists to approve/remove verification.
*   **New Methods to Develop:**
    *   `GET /api/v1/admin/trainers`: We need to expand the existing user-fetch to specifically return `TrainerProfile` joined with `expertise` (from `TrainerExpertise` linking to `Skill`) and their `trainerRatingAvg`. This will populate the main grid.

### E. Media Governance (`/admin/media`)
*   **UI Requirements:** Table of all uploaded media assets (Video, PDF, Presentations) to verify they are mapped to the correct module/lesson.
*   **Current State:** The database tracks media URLs inside `CourseModule` (`videoUrl`, `documentUrl`), and standalone assets in `KnowledgeHubItem`. 
*   **New Methods to Develop:**
    *   `GET /api/v1/admin/media`: Create a union query that fetches all distinct media assets from `CourseModule` (mapped to courses) and `KnowledgeHubItem` (shared library) into a unified DTO for the frontend table. Includes the uploader (Trainer) and publication status.

### F. Content & Notifications (`/admin/content-notifications`)
*   **UI Requirements:** Publish announcements (Courses, Deadlines, Achievements) and view the feed.
*   **Existing Methods:** Prisma has an `Announcement` model (`title`, `body`, `audience`, `publishedAt`).
*   **New Methods to Develop:**
    *   *Schema Update:* Add a `type` string/enum to the `Announcement` model to differentiate between "Course", "Deadline", "Achievement", and "Resource".
    *   `POST /api/v1/admin/announcements`: Endpoint to handle the "Publish update" form submission.
    *   `GET /api/v1/admin/announcements`: Endpoint to fetch the feed of announcements ordered by `publishedAt` descending.

---

## 4. Summary of Data Not Currently Applicable
*   **Dummy Data on the Frontend:** We have successfully stripped all hardcoded dummy data arrays from the React UI. If an API returns an empty array, the UI will safely display standard `N/A` or "No Data" indicators.
*   **Direct S3/Object Storage Uploads in UI:** For Media Governance and Knowledge Vault, the actual *upload* mechanism to an S3/Supabase bucket is not yet wired to the frontend forms; this will need to be developed in a subsequent sprint. Currently, we will focus purely on *fetching and displaying* the metadata stored in Prisma.

## 5. Next Steps
1.  **Acknowledge Plan:** Review this strategy.
2.  **Schema Tweaks:** Push the minor schema updates (e.g., adding `type` to `Announcement`).
3.  **NestJS Controllers:** Scaffold the missing endpoints in the backend (Readiness, Knowledge Vault, Annoucements).
4.  **Frontend Binding:** Update the `useEffect` hooks in the React pages to call these new endpoints using the `api` client.
