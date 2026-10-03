# Phase 2: Backend Audit Report

This report contains findings from auditing the backend of the `capacity-connect` repository (`apps/api/`).

### [CRITICAL] Broken Access Control on Certificate Issuance
- **File:** `apps/api/src/modules/certificate/certificate.controller.ts` (line 49)
- **Issue:** `issueCertificate` uses `@UseGuards(JwtAuthGuard)` but lacks `@RolesGuard` and does not check ownership in the service. Any authenticated user can issue a certificate for any completed enrollment.
- **Backend ref:** `POST /api/v1/certificates/issue`
- **Suggested fix:** Add `@UseGuards(JwtAuthGuard, RolesGuard)` and verify that the user is an admin or the trainee who owns the enrollment.

### [HIGH] Broken Access Control on Assessment Management
- **File:** `apps/api/src/modules/assessment/assessment.service.ts` (line 583)
- **Issue:** `_assertAssessmentOwner` checks if the user is an admin using `userRoles?.some(...)`, but the caller does not pass `userRoles` to this function, causing admins to be denied access to manage assessments they didn't create.
- **Backend ref:** `POST /api/v1/assessments/:id/questions` and `DELETE /api/v1/assessments/:id/questions/:questionId`
- **Suggested fix:** Ensure `userRoles` is correctly passed to `_assertAssessmentOwner` or use an `isAdmin` flag derived in the controller.

### [HIGH] Arbitrary Data Storage (DoS / Schema Bypass) via Onboarding
- **File:** `apps/api/src/modules/onboarding/onboarding.controller.ts` (line 22)
- **Issue:** `onboardingData` uses `any` type with no DTO validation. The service stores this arbitrary JSON blob directly into the database, which could allow malicious users to upload massive payloads.
- **Backend ref:** `POST /api/v1/onboarding/submit`
- **Suggested fix:** Define a concrete DTO for `onboardingData` or enforce a strict payload size limit and schema validation.

### [MEDIUM] API Base Prefix Mismatch & CORS Misconfiguration
- **File:** `apps/api/src/main.ts` (lines 13-35)
- **Issue:** `app.setGlobalPrefix('api/v1')` is missing in `main.ts` (though controllers hardcode it). More importantly, the CORS policy allows `!origin`, meaning requests from non-browser clients or misconfigured environments bypass CORS entirely.
- **Backend ref:** `main.ts`
- **Suggested fix:** Block requests with no origin if they are not explicitly whitelisted, and use `app.setGlobalPrefix` consistently.

### [MEDIUM] Floating Promise in Onboarding Service
- **File:** `apps/api/src/modules/onboarding/onboarding.service.ts` (line 25)
- **Issue:** `this._processQuizEvidence` is called asynchronously without `await`. The transaction commit proceeds, but if processing fails, errors are only logged to console, leading to inconsistent DB state.
- **Backend ref:** `POST /api/v1/onboarding/submit`
- **Suggested fix:** Await the promise if it's fast enough, or use a proper background job queue for async processing.

### [MEDIUM] E2E Test Mismatch for Certificate Issuance
- **File:** `apps/api/test/certificate.e2e-spec.ts` (line 158) vs `apps/api/src/modules/certificate/certificate.controller.ts` (line 49)
- **Issue:** The E2E test sends a POST request to `/api/v1/certificates/issue/:enrollmentId` but the controller expects `@Post('issue')` with `enrollmentId` in the request body (`IssueCertificateDto`).
- **Backend ref:** E2E Tests
- **Suggested fix:** Update the E2E test to send the `enrollmentId` in the body, matching the controller's DTO.

### [MEDIUM] Inconsistent Password Strength Validation
- **File:** `apps/api/src/modules/auth/dto/change-password.dto.ts`
- **Issue:** Unlike `RegisterDto`, `ChangePasswordDto` only checks for `@MinLength(8)` and does not enforce complexity rules (uppercase, lowercase, number, special char).
- **Backend ref:** `POST /api/v1/auth/change-password`
- **Suggested fix:** Add the same `@Matches` validator for `newPassword` as used in `RegisterDto`.

### [LOW] Hardcoded DEMO_MASTER_KEY Backdoor
- **File:** `apps/api/src/modules/auth/auth.service.ts` (line 132, 296)
- **Issue:** The MVP backdoor using `DEMO_MASTER_KEY` allows bypassing password checks. This is highly risky if the environment variable is accidentally set in production.
- **Backend ref:** `POST /api/v1/auth/login`, `POST /api/v1/auth/change-password`
- **Suggested fix:** Conditionally wrap this block with an explicit `process.env.NODE_ENV !== 'production'` check, or remove it entirely.

### [LOW] Missing Delete Endpoint for Media Governance
- **File:** `apps/api/src/modules/admin/admin.controller.ts`
- **Issue:** The frontend has a Delete button for media items, but the backend lacks a `DELETE /api/v1/admin/media-governance/:id` endpoint.
- **Backend ref:** `GET /api/v1/admin/media-governance`
- **Suggested fix:** Implement the missing delete endpoint in `admin.controller.ts`.
