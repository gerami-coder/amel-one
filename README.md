# Amel One

One platform. Every event. Built by Amel Events.

## Status
Phase 0 foundation is in progress. Phase 1 registration work starts only after the foundation and a Vercel preview pass verification. No payment, badge issuance or check-in features are live.

## Layout
The Next.js application is in `amel-one/`. Architecture and product contracts are in `docs/`. Root `AGENTS.md` governs all work.

## Local setup
Use Node.js 24 LTS and npm. Run `cd amel-one`, `npm ci`, copy `.env.example` to `.env.local`, set the Supabase URL and publishable key, then `npm run dev`.

Runtime uses a user's Supabase session with RLS, never a service-role connection. APP_URL is a trusted origin for auth callbacks. DATABASE_URL is optional for Drizzle migration tooling only. Never commit .env.local.

## Commands
From amel-one: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`. SQL migrations live in amel-one/supabase/migrations. Apply with Supabase CLI to an explicitly selected development project. See docs/TESTING.md for database isolation tests and seed safety.

## Deployment
Vercel root directory: amel-one. Configure the Supabase public variables, APP_ENV=preview and a trusted APP_URL for the preview. Configure Supabase Auth allowed redirect URLs for localhost and the actual deployment callback. Never point previews at production data. No deployment is considered verified until authentication, RLS and responsive routes are checked.

## Documentation
[Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE.md) · [Design](docs/DESIGN-SYSTEM.md) · [Permissions](docs/RBAC.md) · [Security](docs/SECURITY.md) · [Testing](docs/TESTING.md) · [Roadmap](docs/ROADMAP.md)
