# Amel One
One platform. Every event. Built by Amel Events.

## Status
The foundation development site is live at https://amel-one.vercel.app. Phase 1 implements event creation, registration types, form building, branding, publishing, public free registration and organizer review. See [Phase 1 report](docs/PHASE-1-REPORT.md) for preview verification and known limits. The owner confirmed custom SMTP signup email delivery. Payments, badges and check-in are deferred.

## Layout and stack
The application is in amel-one/. Next.js App Router, strict TypeScript, React, Tailwind/shadcn, Supabase Auth/Postgres/Storage, Drizzle schema tooling, Zod, React Hook Form, dnd-kit and TanStack Table. Root AGENTS.md governs work; docs/ contains architecture and product contracts.

## Local setup
Use Node.js 24 LTS and npm. Run cd amel-one, npm ci, copy .env.example to .env.local, configure the Supabase public URL/key and APP_URL=http://localhost:3000, APP_ENV=development, then npm run dev.

Runtime uses the user's session with RLS, never service-role credentials. DATABASE_URL is optional for migration tooling only. Do not commit .env.local or test identities.

## Commands and migrations
From amel-one: npm run lint, npm run typecheck, npm test, npm run build, npm run test:e2e. Apply timestamped supabase/migrations files to an explicitly selected development project using Supabase CLI. SQL integration tests roll back their fixtures. See [Testing](docs/TESTING.md) for concurrent API verification and the guarded 50-attendee demo seed.

## Deployment
Vercel root: amel-one; Next.js preset; Node 24. Configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, APP_ENV=preview and APP_URL per environment. With APP_URL omitted, authentication uses Vercel's trusted deployment URL. Supabase Auth must allow the exact /auth/callback and recovery callback for that origin. Previews use the dedicated development database.

## Documentation
[Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE.md) · [Design](docs/DESIGN-SYSTEM.md) · [Permissions](docs/RBAC.md) · [Forms](docs/FORMS.md) · [Security](docs/SECURITY.md) · [Testing](docs/TESTING.md) · [Roadmap](docs/ROADMAP.md)
