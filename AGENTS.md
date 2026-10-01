# Amel One engineering rules

Read README.md, docs/ARCHITECTURE.md and the relevant feature documentation before editing. Inspect existing components, services and validators before adding new ones. The application currently lives in `amel-one/`; run commands there.

- Deliver verified vertical slices. Phase 0 must pass local and preview verification before Phase 1. Stop after Phase 1 for review; never start payments, badge design or check-in automatically.
- Use strict TypeScript, no casual `any`, no suppressed errors. Validate all server inputs with shared Zod contracts.
- Enforce authentication, granular permissions and organization membership on the server and RLS in Postgres. Never trust a browser organization ID or user-editable JWT metadata. Never casually bypass RLS.
- Keep business rules and database access outside presentation. Prefer Server Components. Reuse components, services, validators and semantic design tokens.
- Implement loading, empty, error and success states, accessible keyboard controls, visible focus, mobile layouts and reduced motion.
- Use migrations, constraints, transactions, idempotency where required and atomic audit records for important operations.
- Keep providers behind adapters. Never commit secrets or expose server secrets to clients. Log structured metadata, never passwords, tokens or attendee answers.
- Before installing packages, inspect dependencies, evaluate native alternatives, current maintenance, bundle size and server/client compatibility. Pin versions and commit the lockfile.
- Write meaningful tests for critical rules, authorization and cross-tenant read/update/delete denial. Run lint, typecheck, tests and production build. Never silence failures to pass CI.
- Seed only explicitly selected development projects. Never alter unrelated or production infrastructure casually.
- Update documentation with architecture changes. State verification limits honestly.
