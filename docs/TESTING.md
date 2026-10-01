# Verification

Run all commands from amel-one. npm run lint checks source, npm run typecheck runs generated route types and TypeScript, npm test runs Vitest, npm run build builds production. npm run test:e2e runs Playwright against a local production server.

Unit tests cover tenant-aware permission evaluation, lifecycle date boundaries and shared input validation. Browser tests cover marketing, demo, auth validation, protected-route behavior and responsive overflow. SQL integration tests run in a rollback transaction, switch to authenticated roles and assert cross-tenant read/update/delete denial plus permitted own-tenant access.

Seed/test helpers require APP_ENV=development, explicit project reference confirmation and nonproduction URLs. Fake contacts use reserved example.test addresses. No generated password or service key belongs in source or logs. Development seeds are insert-only and idempotent; no truncate operation is permitted.

Phase 0 gate additionally requires a verified Vercel preview and live Supabase connectivity. Phase 1 adds the complete signup-to-registration journey, replay/capacity checks, form version integrity and tenant isolation. A passing build alone is not acceptance.
