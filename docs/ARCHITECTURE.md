# Architecture

Next.js App Router, strict TypeScript, React Server Components and Tailwind provide the application. Small interactive components own forms and navigation. Brand identity is centralized in src/config/brand.ts. Features own their contracts and rules; server modules own authorization, services and database access.

Supabase Auth provides verified cookie sessions. Proxy refreshes sessions, server guards verify users and membership, and PostgreSQL RLS enforces organization boundaries independently. Runtime queries use the session-scoped Supabase Data API. Drizzle describes the SQL schema and supports tooling; direct privileged database connections are intentionally excluded from runtime because they would bypass session RLS. This is a documented choice, not a second ORM runtime.

SQL migrations are authoritative for constraints, RLS, transactional functions and audit triggers. Narrow SECURITY DEFINER helpers live in the private schema, have fixed search paths, explicit grants and identity checks. Public wrappers remain SECURITY INVOKER. These exceptions allow atomic owner bootstrapping and membership lookup without recursive RLS.

No global singleton user client, shared tenant cache, service-role web client or browser-supplied permission list is permitted. The demo uses explicitly fake local data without writes. Future storage and email providers are adapted at the integration boundary.
