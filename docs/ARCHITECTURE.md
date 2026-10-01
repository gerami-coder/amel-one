# Architecture
Next.js App Router, strict TypeScript, React Server Components and Tailwind provide the application. Feature contracts live beside interactive components; server services own session-scoped reads and permissions. Brand identity is centralized in src/config/brand.ts.

Supabase Auth provides verified cookie sessions. Server guards verify users and membership, and PostgreSQL RLS independently enforces tenant boundaries. Runtime uses the session-scoped Data API with a publishable key. Drizzle describes the schema for tooling; SQL migrations are authoritative for composite foreign keys, RLS, functions and triggers. No privileged database connection is used by the web runtime.

Narrow SECURITY DEFINER functions in the private schema have fixed search paths and explicit grants. They handle organization bootstrap, permission lookup, event draft/publish commands, registration submission and review. Anonymous submission is an intentional bounded entry point: it resolves tenant/event/type from the published version and never returns attendee records. Public wrappers are SECURITY INVOKER. Capacity, replay protection, status history and audits commit atomically.

Drafts have optimistic integer revisions. Publishing snapshots event basics, form and branding into immutable event_versions. Public pages only consume a bounded published projection; existing registrations keep their original version. Draft conflict SQLSTATE PT409 maps to HTTP 409 (40001 causes PostgREST retry loops).

React Hook Form handles public/create forms; Zod validates shared contracts, and SQL repeats critical checks against direct API bypass. dnd-kit provides builder drag/keyboard sorting with explicit move controls and undo/redo. TanStack Table v8's core createTable API renders server-filtered, paginated rows without its React Compiler-incompatible useReactTable hook. Storage upload validation and Supabase access are isolated in the logo action/helper.

No shared tenant cache, singleton authenticated client or browser-supplied permission list is allowed. Dashboard reads are dynamic. Logout ends the current session only, preserving other devices and concurrent test sessions.
