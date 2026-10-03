# Phase 1: Frontend Audit Report

This report contains findings from auditing the frontend of the `capacity-connect` repository (`apps/web/`).

### [MEDIUM] Empty 204 Responses Return as Empty Object
- **File:** apps/web/lib/api-client.ts
- **Issue:** The `apiRequest` function returns `{} as T` when the response is a 204 No Content. Callers might assume they received a valid JSON object.
- **Backend ref:** Any backend endpoint returning a 204 status (typically DELETE operations).
- **Suggested fix:** Return `undefined` or add a specific `apiDelete()` method that returns `void`.

### [MEDIUM] Silent Swallowing of JSON Parse Errors
- **File:** apps/web/lib/api-client.ts
- **Issue:** Uses a `catch {}` block around `response.json()` and returns `{} as T` silently, hiding malformed API responses.
- **Backend ref:** Any backend route.
- **Suggested fix:** Log the parsing error in development mode or throw a custom error for non-204 responses.

### [LOW] Context `isPortal` Inconsistency
- **File:** apps/web/lib/theme-context.tsx
- **Issue:** The variable `isPortal` is hardcoded to `false`, but the `<ThemeContext.Provider>` value prop passes `isPortal: true`. 
- **Backend ref:** N/A
- **Suggested fix:** Remove `isPortal` from context entirely if it's unused, or implement it consistently.

### [MEDIUM] SSE Token Exposed in Query Parameter
- **File:** apps/web/lib/use-notifications.ts
- **Issue:** The JWT access token is passed as a `?token=` query param in the SSE URL, making it visible in server logs and network history.
- **Backend ref:** `GET /notifications/stream?token=<jwt>`
- **Suggested fix:** Use a short-lived one-time ticket/token endpoint for SSE, or use cookie-based auth for stream endpoints.

### [LOW] Dismiss Action Mismatch with Read Status
- **File:** apps/web/lib/use-notifications.ts
- **Issue:** Calling `dismiss()` removes the notification from local UI state immediately but triggers a server call to mark it as read, making it impossible for users to see a "read" state.
- **Backend ref:** `PATCH /notifications/${id}/read`
- **Suggested fix:** Decouple "mark as read" from the "dismiss/remove" UI logic.

### [MEDIUM] `alert()` Used for Error Handling
- **File:** apps/web/components/OnboardingGuard.tsx
- **Issue:** Uses a native browser `alert()` on onboarding submission failure, which breaks UX and accessibility.
- **Backend ref:** `POST /onboarding/submit`
- **Suggested fix:** Replace `alert()` with a toast notification or inline error message.

### [LOW] Skip Onboarding Session Persistence
- **File:** apps/web/components/OnboardingGuard.tsx
- **Issue:** Skipping onboarding sets a session storage flag (`skip_onboarding_session`), bypassing the server check for the entire session even if the user changes roles or needs onboarding.
- **Backend ref:** `GET /onboarding/status`
- **Suggested fix:** Consider clearing this flag on logout or re-evaluating it periodically.

### [MEDIUM] Role-Gated Link Visible to All
- **File:** apps/web/components/Navbar.tsx
- **Issue:** The `/trainee/courses` navigation link is visible to all users regardless of their role or auth status.
- **Backend ref:** N/A
- **Suggested fix:** Conditionally render the link based on the user's role and auth status.

### [MEDIUM] Dead Auth Modal State
- **File:** apps/web/components/Navbar.tsx
- **Issue:** Contains an unused `isAuthOpen` state manipulated via a `?auth=true` search param, which was meant for a removed auth modal.
- **Backend ref:** N/A
- **Suggested fix:** Remove `isAuthOpen` state and related URL parameter effects.

### [LOW] Unverified Route Link
- **File:** apps/web/components/Sidebar.tsx
- **Issue:** Contains a link to `/trainer/assessments/new` which assumes this route exists.
- **Backend ref:** N/A
- **Suggested fix:** Verify if the route `app/trainer/assessments/new/page.tsx` exists and implement it if missing.

### [LOW] Duration Formatting Rounds Down Aggressively
- **File:** apps/web/components/CourseCard.tsx
- **Issue:** `Math.round(durationMinutes / 60)` displays `0 hrs` for courses under 30 minutes.
- **Backend ref:** N/A
- **Suggested fix:** Use `Math.ceil()` or display the duration as `X hr Y min`.

### [HIGH] Dead API Error Message Check
- **File:** apps/web/components/ChangePasswordModal.tsx
- **Issue:** Checks `err.response?.data?.message`, which is an Axios convention. The `api-client.ts` uses fetch and wraps errors in an `ApiError` class, making this property undefined.
- **Backend ref:** `POST /auth/change-password`
- **Suggested fix:** Check `err.message` provided by the custom `ApiError` instance instead.

### [HIGH] Axios Error Check on Course Enrollment
- **File:** apps/web/app/trainee/courses/[id]/page.tsx
- **Issue:** Uses `err.data?.message` (Axios convention) for displaying enrollment errors. Since `api-client` uses `fetch`, this will be undefined.
- **Backend ref:** `POST /enrollments`
- **Suggested fix:** Check `err.message` instead of `err.data?.message`.

### [HIGH] Missing Backend Module for AI Draft
- **File:** apps/web/components/EditCourseModal.tsx
- **Issue:** Makes a request to `/ai/draft-course-outline`, but no corresponding AI module appears to exist in the backend. 
- **Backend ref:** `POST /ai/draft-course-outline`
- **Suggested fix:** Verify backend implementation or remove the "AI Enhance" button.

### [MEDIUM] Exhaustive Deps Issue in `useEffect`
- **File:** apps/web/components/EditCourseModal.tsx
- **Issue:** The `useEffect` calls `fetchFullCourse` but omits it from the dependency array, risking stale closures.
- **Backend ref:** `GET /courses/:id`
- **Suggested fix:** Wrap `fetchFullCourse` in `useCallback` and add it to the dependency array.

### [LOW] Duplicate CSS Classes
- **File:** apps/web/components/DataTable.tsx
- **Issue:** Contains duplicate `border border-border` classes.
- **Backend ref:** N/A
- **Suggested fix:** Remove the duplicated classes for cleaner code.

### [MEDIUM] Invalid HTML ID Duplication
- **File:** apps/web/components/QRScannerModal.tsx
- **Issue:** Renders two elements with `id="reader"` when not in camera mode, leading to invalid HTML and potential bugs with `Html5Qrcode`.
- **Backend ref:** N/A
- **Suggested fix:** Conditionally render the element or use React `ref` instead of `document.getElementById`.

### [MEDIUM] Token Extraction Strips Valid Query Params
- **File:** apps/web/components/QRScannerModal.tsx
- **Issue:** The token URL parsing logic strips query params before getting the token UUID, which might cause silent failure if the token contains unexpected characters.
- **Backend ref:** `GET /certificates/verify/:token`
- **Suggested fix:** Validate token structure more robustly instead of naive string splitting.

### [LOW] Hardcoded Google Translate Reload
- **File:** apps/web/components/AccessibilityWidget.tsx
- **Issue:** Triggers `window.location.reload()` when the language is toggled, which causes a jarring user experience.
- **Backend ref:** N/A
- **Suggested fix:** Allow the Google Translate script to update the DOM without a full page reload if possible.

### [LOW] Unused Component Props
- **File:** apps/web/components/StatCard.tsx
- **Issue:** The `color` prop is passed in but unused in the underlying JSX, retained only for API compatibility.
- **Backend ref:** N/A
- **Suggested fix:** Remove the prop if completely deprecated, or apply the intended styling.

### [MEDIUM] Hardcoded Data in Admin Reports
- **File:** apps/web/app/admin/reports/page.tsx & apps/web/app/admin/competencies/page.tsx
- **Issue:** Displays placeholder/hardcoded arrays for charts and metrics (e.g., `participationData`, `competencyData`, `fetchFrameworkData()`) due to missing backend implementation.
- **Backend ref:** Analytics/Reporting endpoints (Missing)
- **Suggested fix:** Hook these components up to actual backend endpoints.

### [MEDIUM] Unimplemented Delete Action in Media Governance
- **File:** apps/web/app/admin/media/page.tsx
- **Issue:** The "Delete" button in the media list has no `onClick` handler and performs no action.
- **Backend ref:** `DELETE /admin/media-governance/:id` (Assumed)
- **Suggested fix:** Implement a deletion handler that communicates with the API.
