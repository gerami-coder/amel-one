# Foundation deployment verification — 1 October 2026

## Current result

The public development site is live at https://amel-one.vercel.app. Source: main commit 0324f5e72b2ed7daa833e2cfb7065da99b7e8513, merged through PR #1 after explicit owner approval. Vercel deployment AoKKxz9GGtdr1591xaZJfBkySozP is Ready and serves the application successfully.

This uses Vercel's Production target as the stable development URL, APP_ENV=preview, and the dedicated amel-one-dev Supabase project. It is not a production launch or completed Phase 1. Branch Preview environment variables and a separate production database are not configured yet.

## Configuration performed

- Vercel project amel-one in Index: root directory amel-one, Next.js preset, Node 24.
- Public Supabase URL and publishable key configured in Vercel. No service-role key is used by the web runtime.
- APP_URL=https://amel-one.vercel.app and APP_ENV=preview.
- Supabase Site URL set to the hosted URL.
- Exact /auth/callback and /auth/callback?flow=recovery redirect URLs allowed for the hosted origin, localhost:3000 and 127.0.0.1:3000.
- The initial default static deployment returned 404; correcting the root/preset and redeploying resolved it.

## Executed checks

- Local lint, TypeScript, nine unit tests and production build passed.
- GitHub Verify CI passed for the foundation PR.
- Local browser suite: 12 responsive/navigation/validation checks passed, plus the authenticated development-identity journey.
- Hosted desktop: five checks passed.
- Hosted mobile and tablet: ten checks passed.
- The authenticated journey signs in, creates an organization if needed, verifies dashboard persistence after reload, logs out and verifies the protected route redirects to login.
- Cross-tenant SQL tests passed inside a rolled-back transaction, including read/update/delete denial and denied publishing/membership escalation.
- Supabase security advisors returned no findings after the foundation migration.

## Email verification and next phase

The owner confirmed signup email delivery through the configured SMTP provider, and the account is confirmed. Password recovery remains unverified. The owner explicitly requested Phase 1; its implementation and verification are recorded in PHASE-1-REPORT.md. No Phase 2 features have started.

## Test identity

Authenticated tests use an explicitly provisioned disposable development identity. Local .test-fixture.json and artifacts are ignored; never upload credentials or session traces. Ordinary CI without the fixture skips those journeys and does not prove hosted authentication.