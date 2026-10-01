# Phase 1 review report — 1 October 2026

## 1. Implemented
Organizer login/onboarding and event dashboard; event basics and schedule; free registration types with capacity and optional approval; six custom field types, validation, sorting and undo/redo; draft autosave; themes, logo and copy; draft preview; immutable publication; anonymous attendee registration; on-screen receipt; paginated search/filter list; historical answers and approve/reject review. Responsive desktop, tablet and mobile layouts.

## 2. Architecture
Server Components for reads, small interactive editors, shared Zod contracts, session-scoped Supabase API and explicit permission guards. SQL owns atomic commands and repeats critical validation. Published snapshots separate the live event from drafts. See ARCHITECTURE.md.

## 3. Tables
event_versions, registration_types, attendees, registrations, registration_answers, registration_status_history and private.registration_limits; existing events gains draft/revision/active version.

## 4. Migrations
Six Phase 1 forward migrations after the foundation: registration workflow, validation hardening, submission parameter fix, branding storage, concurrency/asset validation and storage policy/version index. See DATABASE.md for filenames.

## 5. RLS
Permission-scoped organization reads; runtime direct writes revoked for events and registration records. Immutable published versions and audits. Branding uploads enforce organization/event paths; assets are public by design and immutable.

## 6. Permissions
event.create/update/read; registration.read/approve/reject enforced in server guards and database commands. Tenant membership is resolved from the authenticated user. Anonymous access is limited to published metadata and validated submission.

## 7. Tests created
Seven registration contract unit tests; a complete responsive browser journey; rollback SQL authorization/invariant suite; true parallel API capacity/conflict checks. Browser tests also cover logo upload and keyboard tabs.

## 8. Results
Lint, TypeScript, 16 unit tests and production build passed. SQL tenant, version, capacity, replay, validation and audit tests passed. Four simultaneous requests for one place allocate exactly one; conflicting saves yield one HTTP 409. Local responsive checks and the hosted browser journey passed as recorded below. The guarded seed successfully created 50 fictional attendees.

## 9. Repository
amel-one/src/app routes; features/events and features/registration contracts/actions/editor; components/shared primitives; server/services authorized reads; server/db generated types/schema; supabase/migrations; tests/unit, tests/e2e, tests/database; scripts seed/concurrency; docs architecture and reports.

## 10. Environment
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, APP_ENV and trusted APP_URL (or Vercel deployment origin). Optional DATABASE_URL is tooling-only. SEED_PROJECT_REF and ignored fixture credentials are local development-only.

## 11. Supabase
Dedicated amel-one-dev database, Auth, custom SMTP and constrained branding Storage bucket. Migrations and rollback tests applied. Signup email received and confirmed. Security advisor: leaked-password protection is disabled; see https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Performance advisor's missing active-version index was added; unused indexes are retained because this is a new development dataset.

## 12. Vercel
Next.js preset, root amel-one, Node 24. Production target serves the stable development URL and deploys main after merge. Preview variables now use the same dedicated development project with APP_ENV=preview; no production attendee data or service-role credentials.

## 13. Preview
Review preview: https://amel-one-git-codex-registration-index-f3d7.vercel.app . Verified deployment F23VZxJiWdPGpaFXrFXZCRmNoAfV, source ee2f44a6a53dccae68a4820890ddd4872b8b1ca1. Vercel login is required by preview protection. Stable development URL: https://amel-one.vercel.app.

## 14. Known limits
Development release. Password recovery not verified. No attendee email receipt; on-screen reference only. Durable event/email limits and honeypot need stronger production abuse controls. Draft recovery is in-memory with unload warning, not offline persistence. One active organization per user interface; no team invitation UI. Event list is capped at 100; registration list paginates 25 rows. UTC schedule entry with selected display timezone. No data deletion/export flow or retention automation yet. Runtime npm audit: zero vulnerabilities. Hosted preview protection prevents independent anonymous browsers from entering; this protection remains enabled.

## 15. Deferred
Conditional fields, richer branding, sections/templates, CSV export, attendee communications, payments, badge designer, QR credentials and check-in. No Phase 2 features started.

## 16. Recommended next phase
After owner review, deliver one secure badge → opaque revocable QR → checkpoint check-in journey, with tenant, replay, revoked-credential and duplicate-scan tests. Do not begin without explicit instruction.

## Final local verification
All 18 browser checks passed across desktop/mobile/tablet: 15 foundation/auth checks plus 3 full registration journeys rerun after the storage policy fix. Logo upload, keyboard setup tabs and organization-scoped storage insertion are verified. Rollback SQL tests include denied membership escalation and cross-tenant logo upload.


## Hosted verification
GitHub Verify CI passed on the feature commit. Vercel preview built successfully. Through the signed-in Vercel browser, verified organizer login, dashboard, event creation, autosave, types, required custom field, branding, draft preview, publish, Amel One logout, guest validation/submission/receipt, organizer login, search, historical answer detail and approval. Approval persisted after reload. Browser error/warning logs were empty; Vercel runtime log view reported zero warnings/errors/fatals during the journey.

The external Playwright hosted run was blocked by Vercel authentication, not counted as passed. Local desktop/mobile/tablet checks passed; the hosted manual journey used the default desktop viewport. Preview APP_URL is scoped to codex/registration and points to its stable alias; exact callback/recovery URLs were added to Supabase. No wildcard redirects or protection bypass were enabled.

The owner reported that the main site still displayed the old Foundation preview without create/edit controls. PR #3 promotes this tested workflow to main; deployment status and final public-site checks are reported in the delivery response. Phase 2 remains stopped for review.
